import { db, DatabaseStore, UserAccount, OrganizationModuleAssignment, FileRecord } from './store';
import {
  Organization,
  Employee,
  Department,
  Designation,
  WorkShift,
  GeofenceLocation,
  AttendanceRecord,
  RegularizationRequest,
  LeaveRequest,
  SalaryStructure,
  PayrollRun,
  Payslip,
  PerformanceGoal,
  PerformanceReview,
  JobPosting,
  Candidate,
  Interview,
  NotificationItem,
  AuditLogEntry,
  ModuleId,
} from '../../src/types';
import { TenantIsolationError, NotFoundError } from '../types';

/**
 * TenantScopedRepository: Enforces strict application-layer isolation.
 * Automatically injects `WHERE orgId = :currentOrgId` across all tenant-scoped entities.
 */
export class TenantScopedRepository {
  private currentOrgId: string;
  private isSuperAdmin: boolean;
  private store: DatabaseStore;

  constructor(currentOrgId: string, isSuperAdmin: boolean = false, store: DatabaseStore = db) {
    this.currentOrgId = currentOrgId;
    this.isSuperAdmin = isSuperAdmin;
    this.store = store;
  }

  // --- Helper to verify tenant boundary ---
  private assertTenantAccess(entityOrgId?: string): void {
    if (this.isSuperAdmin) return;
    if (!entityOrgId || entityOrgId !== this.currentOrgId) {
      throw new TenantIsolationError(
        `Unauthorized cross-tenant access attempt. Authenticated tenant: ${this.currentOrgId}, target record tenant: ${entityOrgId}`
      );
    }
  }

  // -------------------------------------------------------------
  // ORGANIZATIONS & MODULES
  // -------------------------------------------------------------
  getOrganizations(): Organization[] {
    if (this.isSuperAdmin) {
      return this.store.organizations;
    }
    return this.store.organizations.filter((o) => o.id === this.currentOrgId);
  }

  getOrganizationById(id: string): Organization | undefined {
    this.assertTenantAccess(id);
    return this.store.organizations.find((o) => o.id === id);
  }

  updateOrganizationModules(orgId: string, enabledModuleIds: ModuleId[]): Organization {
    this.assertTenantAccess(orgId);
    const org = this.store.organizations.find((o) => o.id === orgId);
    if (!org) throw new NotFoundError('Organization');

    org.enabledModules = enabledModuleIds;

    // Update assignment records
    for (const mod of this.store.orgModules.filter((m) => m.orgId === orgId)) {
      mod.enabled = enabledModuleIds.includes(mod.moduleId);
      mod.updatedAt = new Date().toISOString();
    }

    return org;
  }

  getOrganizationModules(orgId: string): OrganizationModuleAssignment[] {
    this.assertTenantAccess(orgId);
    return this.store.orgModules.filter((m) => m.orgId === orgId);
  }

  isModuleEnabled(moduleId: ModuleId): boolean {
    if (this.isSuperAdmin) return true;
    const assignment = this.store.orgModules.find(
      (m) => m.orgId === this.currentOrgId && m.moduleId === moduleId
    );
    return assignment ? assignment.enabled : false;
  }

  // -------------------------------------------------------------
  // EMPLOYEES
  // -------------------------------------------------------------
  getEmployees(): Employee[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') {
      return this.store.employees;
    }
    return this.store.employees.filter((e) => e.orgId === this.currentOrgId);
  }

  getEmployeeById(id: string): Employee | undefined {
    const emp = this.store.employees.find((e) => e.id === id);
    if (!emp) return undefined;
    this.assertTenantAccess(emp.orgId);
    return emp;
  }

  createEmployee(data: Omit<Employee, 'id' | 'orgId'>): Employee {
    const newEmp: Employee = {
      ...data,
      id: `emp-${this.currentOrgId}-${Date.now().toString(36)}`,
      orgId: this.currentOrgId,
    };
    this.store.employees.push(newEmp);

    // Update organization employee count
    const org = this.store.organizations.find((o) => o.id === this.currentOrgId);
    if (org) org.employeeCount += 1;

    return newEmp;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee {
    const emp = this.getEmployeeById(id);
    if (!emp) throw new NotFoundError('Employee');
    this.assertTenantAccess(emp.orgId);

    Object.assign(emp, updates, { id: emp.id, orgId: emp.orgId }); // prevent mutating orgId
    return emp;
  }

  deleteEmployee(id: string): boolean {
    const emp = this.getEmployeeById(id);
    if (!emp) throw new NotFoundError('Employee');
    this.assertTenantAccess(emp.orgId);

    this.store.employees = this.store.employees.filter((e) => e.id !== id);
    const org = this.store.organizations.find((o) => o.id === this.currentOrgId);
    if (org && org.employeeCount > 0) org.employeeCount -= 1;
    return true;
  }

  // -------------------------------------------------------------
  // DEPARTMENTS & DESIGNATIONS & SHIFTS
  // -------------------------------------------------------------
  getDepartments(): Department[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.departments;
    return this.store.departments.filter((d) => d.orgId === this.currentOrgId);
  }

  getDesignations(): Designation[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.designations;
    return this.store.designations.filter((d) => d.orgId === this.currentOrgId);
  }

  getShifts(): WorkShift[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.shifts;
    return this.store.shifts.filter((s) => s.orgId === this.currentOrgId);
  }

  // -------------------------------------------------------------
  // ATTENDANCE & GEOFENCING
  // -------------------------------------------------------------
  getGeofences(): GeofenceLocation[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.geofences;
    return this.store.geofences.filter((g) => g.orgId === this.currentOrgId);
  }

  getAttendanceRecords(date?: string): AttendanceRecord[] {
    let records = this.isSuperAdmin && this.currentOrgId === 'all'
      ? this.store.attendanceRecords
      : this.store.attendanceRecords.filter((a) => a.orgId === this.currentOrgId);

    if (date) {
      records = records.filter((a) => a.date === date);
    }
    return records;
  }

  recordAttendancePunch(record: AttendanceRecord): AttendanceRecord {
    this.assertTenantAccess(record.orgId);
    const existingIdx = this.store.attendanceRecords.findIndex(
      (a) => a.orgId === record.orgId && a.employeeId === record.employeeId && a.date === record.date
    );

    if (existingIdx >= 0) {
      this.store.attendanceRecords[existingIdx] = record;
    } else {
      this.store.attendanceRecords.push(record);
    }
    return record;
  }

  getRegularizations(): RegularizationRequest[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.regularizations;
    return this.store.regularizations.filter((r) => r.orgId === this.currentOrgId);
  }

  createRegularization(req: Omit<RegularizationRequest, 'id' | 'orgId'>): RegularizationRequest {
    const item: RegularizationRequest = {
      ...req,
      id: `reg-${Date.now().toString(36)}`,
      orgId: this.currentOrgId,
    };
    this.store.regularizations.unshift(item);
    return item;
  }

  updateRegularizationStatus(id: string, status: 'Approved' | 'Rejected', approverName: string): RegularizationRequest {
    const item = this.store.regularizations.find((r) => r.id === id);
    if (!item) throw new NotFoundError('Regularization Request');
    this.assertTenantAccess(item.orgId);

    item.status = status;
    item.approverName = approverName;
    return item;
  }

  // -------------------------------------------------------------
  // LEAVE REQUESTS
  // -------------------------------------------------------------
  getLeaveRequests(): LeaveRequest[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.leaveRequests;
    return this.store.leaveRequests.filter((l) => l.orgId === this.currentOrgId);
  }

  createLeaveRequest(req: Omit<LeaveRequest, 'id' | 'orgId' | 'status'>): LeaveRequest {
    const item: LeaveRequest = {
      ...req,
      id: `leave-${Date.now().toString(36)}`,
      orgId: this.currentOrgId,
      status: 'Pending',
    };
    this.store.leaveRequests.unshift(item);
    return item;
  }

  updateLeaveRequestStatus(id: string, status: 'Approved' | 'Rejected', approverName: string): LeaveRequest {
    const item = this.store.leaveRequests.find((l) => l.id === id);
    if (!item) throw new NotFoundError('Leave Request');
    this.assertTenantAccess(item.orgId);

    item.status = status;
    item.approverName = approverName;
    item.approvedOrRejectedDate = new Date().toISOString().split('T')[0];
    return item;
  }

  // -------------------------------------------------------------
  // PAYROLL & COMPENSATION (with Versioning)
  // -------------------------------------------------------------
  getSalaryStructures(): (SalaryStructure & { effectiveFrom: string })[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.salaryStructures;
    return this.store.salaryStructures.filter((s) => s.orgId === this.currentOrgId);
  }

  getActiveSalaryStructure(asOfDate: Date = new Date()): (SalaryStructure & { effectiveFrom: string }) {
    const structures = this.getSalaryStructures()
      .filter((s) => new Date(s.effectiveFrom) <= asOfDate)
      .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime());

    if (structures.length > 0) return structures[0];
    if (this.store.salaryStructures.length > 0) return this.store.salaryStructures[0];

    // Fallback default
    return {
      id: `sal-def-${this.currentOrgId}`,
      orgId: this.currentOrgId,
      name: 'Default Statutory Compensation Structure',
      description: 'Standard 40% Basic with PF, ESI, and PT',
      basicPercentage: 40,
      hraPercentage: 20,
      specialAllowancePercentage: 30,
      conveyanceFixed: 1600,
      medicalAllowanceFixed: 1250,
      pfRate: 12,
      esiRate: 0.75,
      professionalTaxFixed: 200,
      isDefault: true,
      effectiveFrom: '2025-01-01T00:00:00.000Z',
    };
  }

  getPayrollRuns(): (PayrollRun & { disclaimer?: string })[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.payrollRuns;
    return this.store.payrollRuns.filter((p) => p.orgId === this.currentOrgId);
  }

  getPayslips(payrollRunId?: string): Payslip[] {
    let slips = this.isSuperAdmin && this.currentOrgId === 'all'
      ? this.store.payslips
      : this.store.payslips.filter((p) => p.orgId === this.currentOrgId);

    if (payrollRunId) {
      slips = slips.filter((p) => p.payrollRunId === payrollRunId);
    }
    return slips;
  }

  savePayrollRun(run: PayrollRun & { disclaimer?: string }, payslips: Payslip[]): void {
    this.assertTenantAccess(run.orgId);
    const existingRunIdx = this.store.payrollRuns.findIndex((r) => r.id === run.id);
    if (existingRunIdx >= 0) {
      this.store.payrollRuns[existingRunIdx] = run;
    } else {
      this.store.payrollRuns.unshift(run);
    }

    // Replace payslips for this run
    this.store.payslips = this.store.payslips.filter((p) => p.payrollRunId !== run.id);
    this.store.payslips.push(...payslips);
  }

  // -------------------------------------------------------------
  // PERFORMANCE & OKRS
  // -------------------------------------------------------------
  getGoals(): PerformanceGoal[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.goals;
    return this.store.goals.filter((g) => g.orgId === this.currentOrgId);
  }

  createGoal(goal: Omit<PerformanceGoal, 'id' | 'orgId'>): PerformanceGoal {
    const newGoal: PerformanceGoal = {
      ...goal,
      id: `goal-${Date.now().toString(36)}`,
      orgId: this.currentOrgId,
    };
    this.store.goals.push(newGoal);
    return newGoal;
  }

  updateGoalProgress(id: string, progress: number): PerformanceGoal {
    const goal = this.store.goals.find((g) => g.id === id);
    if (!goal) throw new NotFoundError('Goal');
    this.assertTenantAccess(goal.orgId);

    goal.currentProgress = progress;
    goal.status = progress >= 100 ? 'Completed' : progress >= 70 ? 'On Track' : 'At Risk';
    return goal;
  }

  getReviews(): PerformanceReview[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.reviews;
    return this.store.reviews.filter((r) => r.orgId === this.currentOrgId);
  }

  // -------------------------------------------------------------
  // RECRUITMENT & ATS
  // -------------------------------------------------------------
  getJobs(): JobPosting[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.jobs;
    return this.store.jobs.filter((j) => j.orgId === this.currentOrgId);
  }

  getCandidates(): Candidate[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.candidates;
    return this.store.candidates.filter((c) => c.orgId === this.currentOrgId);
  }

  updateCandidateStage(id: string, stage: Candidate['stage']): Candidate {
    const cand = this.store.candidates.find((c) => c.id === id);
    if (!cand) throw new NotFoundError('Candidate');
    this.assertTenantAccess(cand.orgId);

    cand.stage = stage;
    return cand;
  }

  getInterviews(): Interview[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.interviews;
    return this.store.interviews.filter((i) => i.orgId === this.currentOrgId);
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS & AUDIT LOGS
  // -------------------------------------------------------------
  getNotifications(): NotificationItem[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.notifications;
    return this.store.notifications.filter((n) => n.orgId === this.currentOrgId);
  }

  getAuditLogs(): AuditLogEntry[] {
    if (this.isSuperAdmin && this.currentOrgId === 'all') return this.store.auditLogs;
    return this.store.auditLogs.filter((a) => a.orgId === this.currentOrgId);
  }

  // -------------------------------------------------------------
  // FILE STORAGE METADATA
  // -------------------------------------------------------------
  saveFileMetadata(file: FileRecord): void {
    this.assertTenantAccess(file.orgId);
    this.store.files.push(file);
  }

  getFileMetadataByKey(fileKey: string): FileRecord | undefined {
    const file = this.store.files.find((f) => f.fileKey === fileKey);
    if (!file) return undefined;
    this.assertTenantAccess(file.orgId);
    return file;
  }
}

/**
 * Factory helper to get repository instance for an authenticated user request
 */
export function getRepository(orgId: string = 'org-acro', role: string = 'Admin'): TenantScopedRepository {
  const isSuperAdmin = role === 'Super Admin' || orgId === 'all';
  return new TenantScopedRepository(orgId, isSuperAdmin, db);
}
