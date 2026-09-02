import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
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
  Role,
} from '../../src/types';
import { TenantIsolationError, NotFoundError } from '../types';

export interface FileRecord {
  id: string;
  orgId: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category: 'resume' | 'payslip' | 'document' | 'policy';
  uploadedById?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface OrganizationModuleAssignment {
  id: string;
  orgId: string;
  moduleId: ModuleId;
  enabled: boolean;
  updatedAt: string;
}

/**
 * TenantScopedRepository: Enforces strict database-level isolation.
 * Automatically injects `WHERE orgId = :currentOrgId` across all tenant-scoped PostgreSQL entities.
 */
export class TenantScopedRepository {
  public currentOrgId: string;
  public isSuperAdmin: boolean;

  constructor(currentOrgId: string = 'org-acro', isSuperAdmin: boolean = false) {
    this.currentOrgId = currentOrgId;
    this.isSuperAdmin = isSuperAdmin || currentOrgId === 'all';
  }

  // --- Helper to verify tenant boundary ---
  private assertTenantAccess(entityOrgId?: string | null): void {
    if (this.isSuperAdmin) return;
    if (!entityOrgId || entityOrgId !== this.currentOrgId) {
      throw new TenantIsolationError(
        `Unauthorized cross-tenant access attempt. Authenticated tenant: ${this.currentOrgId}, target record tenant: ${entityOrgId}`
      );
    }
  }

  private getOrgFilter(): { orgId?: string } {
    if (this.isSuperAdmin && this.currentOrgId === 'all') {
      return {};
    }
    return { orgId: this.currentOrgId };
  }

  // -------------------------------------------------------------
  // ORGANIZATIONS & MODULES
  // -------------------------------------------------------------
  async getOrganizations(): Promise<Organization[]> {
    const orgs = await prisma.organization.findMany({
      where: this.isSuperAdmin && this.currentOrgId === 'all' ? {} : { id: this.currentOrgId },
      include: {
        modules: true,
        geofences: true,
      },
      orderBy: { name: 'asc' },
    });

    return orgs.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      industry: o.industry,
      employeeCount: o.employeeCount,
      activeUsers: o.activeUsers,
      status: o.status as any,
      joinedDate: o.joinedDate.toISOString().split('T')[0],
      contactEmail: o.contactEmail,
      billingPlan: o.billingPlan as any,
      logoUrl: o.logoUrl || undefined,
      enabledModules: o.modules.filter((m) => m.enabled).map((m) => m.moduleId as ModuleId),
      geofences: o.geofences.map((g) => ({
        id: g.id,
        orgId: g.orgId,
        name: g.name,
        address: g.address || undefined,
        latitude: g.latitude,
        longitude: g.longitude,
        radiusMeters: g.radiusMeters,
        policy: g.policy as any,
        isRemoteAllowed: g.isRemoteAllowed,
      })),
    }));
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    this.assertTenantAccess(id);
    const o = await prisma.organization.findUnique({
      where: { id },
      include: {
        modules: true,
        geofences: true,
      },
    });

    if (!o) return null;

    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      industry: o.industry,
      employeeCount: o.employeeCount,
      activeUsers: o.activeUsers,
      status: o.status as any,
      joinedDate: o.joinedDate.toISOString().split('T')[0],
      contactEmail: o.contactEmail,
      billingPlan: o.billingPlan as any,
      logoUrl: o.logoUrl || undefined,
      enabledModules: o.modules.filter((m) => m.enabled).map((m) => m.moduleId as ModuleId),
      geofences: o.geofences.map((g) => ({
        id: g.id,
        orgId: g.orgId,
        name: g.name,
        address: g.address || undefined,
        latitude: g.latitude,
        longitude: g.longitude,
        radiusMeters: g.radiusMeters,
        policy: g.policy as any,
        isRemoteAllowed: g.isRemoteAllowed,
      })),
    };
  }

  async createOrganization(data: {
    name: string;
    slug: string;
    industry?: string;
    contactEmail: string;
    billingPlan?: 'Enterprise' | 'Professional' | 'Growth';
    logoUrl?: string;
    enabledModules?: ModuleId[];
  }): Promise<Organization> {
    const orgId = `org-${data.slug.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    const allModules: ModuleId[] = [
      'hr',
      'payroll',
      'attendance',
      'performance',
      'recruitment',
      'leave',
      'ess',
      'engagement',
      'marketplace',
      'expense',
    ];
    const activeMods = data.enabledModules || allModules;

    const created = await prisma.organization.create({
      data: {
        id: orgId,
        name: data.name,
        slug: data.slug,
        industry: data.industry || 'Technology',
        contactEmail: data.contactEmail,
        billingPlan: data.billingPlan || 'Enterprise',
        logoUrl: data.logoUrl,
        modules: {
          create: allModules.map((m) => ({
            moduleId: m,
            enabled: activeMods.includes(m),
          })),
        },
        geofences: {
          create: {
            name: `${data.name} HQ`,
            address: 'Main Campus',
            latitude: 12.9716,
            longitude: 77.5946,
            radiusMeters: 200,
            policy: 'Block',
            isRemoteAllowed: false,
          },
        },
      },
    });

    return (await this.getOrganizationById(created.id))!;
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
    role: Role;
    orgId?: string;
    employeeId?: string;
    department?: string;
    designation?: string;
    avatar?: string;
  }): Promise<{ id: string; email: string; name: string; role: Role; orgId: string }> {
    const targetOrgId = data.orgId || this.currentOrgId;
    this.assertTenantAccess(targetOrgId);

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        orgId: targetOrgId,
        email: data.email.toLowerCase().trim(),
        name: data.name,
        passwordHash,
        role: data.role as any,
        employeeId: data.employeeId,
        department: data.department,
        designation: data.designation,
        avatar: data.avatar,
        isActive: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      orgId: user.orgId || targetOrgId,
    };
  }

  async updateOrganizationModules(orgId: string, enabledModuleIds: ModuleId[]): Promise<Organization> {
    this.assertTenantAccess(orgId);

    const allModules: ModuleId[] = [
      'hr',
      'payroll',
      'attendance',
      'performance',
      'recruitment',
      'leave',
      'ess',
      'engagement',
      'marketplace',
      'expense',
    ];

    await prisma.$transaction(
      allModules.map((modId) =>
        prisma.organizationModule.upsert({
          where: {
            orgId_moduleId: {
              orgId,
              moduleId: modId,
            },
          },
          update: {
            enabled: enabledModuleIds.includes(modId),
            updatedAt: new Date(),
          },
          create: {
            orgId,
            moduleId: modId,
            enabled: enabledModuleIds.includes(modId),
          },
        })
      )
    );

    const org = await this.getOrganizationById(orgId);
    if (!org) throw new NotFoundError('Organization');
    return org;
  }

  async getOrganizationModules(orgId: string): Promise<OrganizationModuleAssignment[]> {
    this.assertTenantAccess(orgId);
    const modules = await prisma.organizationModule.findMany({
      where: { orgId },
    });

    return modules.map((m) => ({
      id: m.id,
      orgId: m.orgId,
      moduleId: m.moduleId as ModuleId,
      enabled: m.enabled,
      updatedAt: m.updatedAt.toISOString(),
    }));
  }

  async isModuleEnabled(moduleId: ModuleId): Promise<boolean> {
    if (this.isSuperAdmin) return true;
    const assignment = await prisma.organizationModule.findUnique({
      where: {
        orgId_moduleId: {
          orgId: this.currentOrgId,
          moduleId,
        },
      },
    });
    return assignment ? assignment.enabled : false;
  }

  // -------------------------------------------------------------
  // EMPLOYEES
  // -------------------------------------------------------------
  async getEmployees(): Promise<Employee[]> {
    const list = await prisma.employee.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return list.map((e) => ({
      id: e.id,
      orgId: e.orgId,
      employeeCode: e.employeeCode,
      name: `${e.firstName} ${e.lastName}`.trim(),
      firstName: e.firstName,
      lastName: e.lastName,
      avatar: e.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: e.email,
      phone: e.phone,
      dob: e.dob || undefined,
      gender: e.gender as any,
      address: e.address || undefined,
      emergencyContact: (e.emergencyContact as any) || undefined,
      department: e.department,
      designation: e.designation,
      managerId: e.managerId || undefined,
      managerName: e.managerName || undefined,
      reportingManager: e.reportingManager || undefined,
      employmentType: e.employmentType,
      joiningDate: e.joiningDate,
      workLocation: e.workLocation || undefined,
      location: e.location || e.workLocation || 'Bengaluru HQ',
      status: e.status,
      annualCtc: e.annualCtc,
      monthlyGross: e.monthlyGross || Math.round(e.annualCtc / 12),
      bankDetails: (e.bankDetails as any) || undefined,
      documents: (e.documents as any) || [],
      history: (e.lifecycleHistory as any) || [],
      lifecycleHistory: (e.lifecycleHistory as any) || [],
      shiftId: e.shiftId || undefined,
      performanceRating: e.performanceRating || 4.0,
    }));
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    const e = await prisma.employee.findUnique({
      where: { id },
    });

    if (!e) return null;
    this.assertTenantAccess(e.orgId);

    return {
      id: e.id,
      orgId: e.orgId,
      employeeCode: e.employeeCode,
      name: `${e.firstName} ${e.lastName}`.trim(),
      firstName: e.firstName,
      lastName: e.lastName,
      avatar: e.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: e.email,
      phone: e.phone,
      dob: e.dob || undefined,
      gender: e.gender as any,
      address: e.address || undefined,
      emergencyContact: (e.emergencyContact as any) || undefined,
      department: e.department,
      designation: e.designation,
      managerId: e.managerId || undefined,
      managerName: e.managerName || undefined,
      reportingManager: e.reportingManager || undefined,
      employmentType: e.employmentType,
      joiningDate: e.joiningDate,
      workLocation: e.workLocation || undefined,
      location: e.location || e.workLocation || 'Bengaluru HQ',
      status: e.status,
      annualCtc: e.annualCtc,
      monthlyGross: e.monthlyGross || Math.round(e.annualCtc / 12),
      bankDetails: (e.bankDetails as any) || undefined,
      documents: (e.documents as any) || [],
      history: (e.lifecycleHistory as any) || [],
      lifecycleHistory: (e.lifecycleHistory as any) || [],
      shiftId: e.shiftId || undefined,
      performanceRating: e.performanceRating || 4.0,
    };
  }

  async createEmployee(data: Omit<Employee, 'id' | 'orgId'> & { id?: string }): Promise<Employee> {
    const orgId = this.currentOrgId;

    const created = await prisma.employee.create({
      data: {
        id: data.id || `emp-${orgId}-${Date.now().toString(36)}`,
        orgId,
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        gender: data.gender,
        address: data.address,
        emergencyContact: (data.emergencyContact as any) || undefined,
        department: data.department,
        designation: data.designation,
        managerId: data.managerId,
        managerName: data.managerName,
        reportingManager: data.reportingManager,
        employmentType: data.employmentType || 'Full-Time',
        joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
        workLocation: data.workLocation || data.location,
        location: data.location || data.workLocation,
        status: data.status || 'Active',
        annualCtc: data.annualCtc || 0,
        monthlyGross: data.monthlyGross || Math.round((data.annualCtc || 0) / 12),
        bankDetails: (data.bankDetails as any) || undefined,
        documents: (data.documents as any) || [],
        lifecycleHistory: (data.history as any) || (data.lifecycleHistory as any) || [],
        shiftId: data.shiftId,
        performanceRating: data.performanceRating || 4.0,
      },
    });

    await prisma.organization.update({
      where: { id: orgId },
      data: { employeeCount: { increment: 1 } },
    });

    return (await this.getEmployeeById(created.id))!;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const existing = await this.getEmployeeById(id);
    if (!existing) throw new NotFoundError('Employee');
    this.assertTenantAccess(existing.orgId);

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        employeeCode: updates.employeeCode !== undefined ? updates.employeeCode : undefined,
        firstName: updates.firstName !== undefined ? updates.firstName : undefined,
        lastName: updates.lastName !== undefined ? updates.lastName : undefined,
        avatar: updates.avatar !== undefined ? updates.avatar : undefined,
        email: updates.email !== undefined ? updates.email : undefined,
        phone: updates.phone !== undefined ? updates.phone : undefined,
        dob: updates.dob !== undefined ? updates.dob : undefined,
        gender: updates.gender !== undefined ? updates.gender : undefined,
        address: updates.address !== undefined ? updates.address : undefined,
        emergencyContact: updates.emergencyContact !== undefined ? (updates.emergencyContact as any) : undefined,
        department: updates.department !== undefined ? updates.department : undefined,
        designation: updates.designation !== undefined ? updates.designation : undefined,
        managerId: updates.managerId !== undefined ? updates.managerId : undefined,
        managerName: updates.managerName !== undefined ? updates.managerName : undefined,
        reportingManager: updates.reportingManager !== undefined ? updates.reportingManager : undefined,
        employmentType: updates.employmentType !== undefined ? updates.employmentType : undefined,
        joiningDate: updates.joiningDate !== undefined ? updates.joiningDate : undefined,
        workLocation: updates.workLocation !== undefined ? updates.workLocation : updates.location !== undefined ? updates.location : undefined,
        location: updates.location !== undefined ? updates.location : updates.workLocation !== undefined ? updates.workLocation : undefined,
        status: updates.status !== undefined ? updates.status : undefined,
        annualCtc: updates.annualCtc !== undefined ? updates.annualCtc : undefined,
        monthlyGross: updates.monthlyGross !== undefined ? updates.monthlyGross : undefined,
        bankDetails: updates.bankDetails !== undefined ? (updates.bankDetails as any) : undefined,
        documents: updates.documents !== undefined ? (updates.documents as any) : undefined,
        lifecycleHistory: updates.lifecycleHistory !== undefined ? (updates.lifecycleHistory as any) : updates.history !== undefined ? (updates.history as any) : undefined,
        shiftId: updates.shiftId !== undefined ? updates.shiftId : undefined,
        performanceRating: updates.performanceRating !== undefined ? updates.performanceRating : undefined,
      },
    });

    return (await this.getEmployeeById(updated.id))!;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const existing = await this.getEmployeeById(id);
    if (!existing) throw new NotFoundError('Employee');
    this.assertTenantAccess(existing.orgId);

    await prisma.employee.delete({
      where: { id },
    });

    await prisma.organization.update({
      where: { id: existing.orgId },
      data: { employeeCount: { decrement: 1 } },
    });

    return true;
  }

  // -------------------------------------------------------------
  // DEPARTMENTS & DESIGNATIONS & SHIFTS
  // -------------------------------------------------------------
  async getDepartments(): Promise<Department[]> {
    const depts = await prisma.department.findMany({
      where: this.getOrgFilter(),
      orderBy: { name: 'asc' },
    });

    return depts.map((d) => ({
      id: d.id,
      orgId: d.orgId,
      name: d.name,
      code: d.code,
      headEmployeeId: d.headEmployeeId || '',
      headName: d.headName || '',
      employeeCount: d.employeeCount,
      budgetInr: d.budgetInr,
    }));
  }

  async createDepartment(data: { name: string; code: string; headEmployeeId?: string; headName?: string; budgetInr?: number }): Promise<Department> {
    const orgId = this.currentOrgId;
    const created = await prisma.department.create({
      data: {
        id: `dept-${orgId}-${data.code.toLowerCase()}`,
        orgId,
        name: data.name,
        code: data.code,
        headEmployeeId: data.headEmployeeId,
        headName: data.headName,
        budgetInr: data.budgetInr || 5000000,
        employeeCount: 0,
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      name: created.name,
      code: created.code,
      headEmployeeId: created.headEmployeeId || '',
      headName: created.headName || '',
      employeeCount: created.employeeCount,
      budgetInr: created.budgetInr,
    };
  }

  async getDesignations(): Promise<Designation[]> {
    const desigs = await prisma.designation.findMany({
      where: this.getOrgFilter(),
      orderBy: { title: 'asc' },
    });

    return desigs.map((d) => ({
      id: d.id,
      orgId: d.orgId,
      title: d.title,
      department: d.department,
      level: d.level,
      minExperienceYears: d.minExperienceYears,
    }));
  }

  async createDesignation(data: { title: string; department: string; level: number | string; minExperienceYears?: number }): Promise<Designation> {
    const orgId = this.currentOrgId;
    const created = await prisma.designation.create({
      data: {
        id: `desig-${orgId}-${Date.now().toString(36)}`,
        orgId,
        title: data.title,
        department: data.department,
        level: String(data.level),
        minExperienceYears: data.minExperienceYears || 1,
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      title: created.title,
      department: created.department,
      level: created.level,
      minExperienceYears: created.minExperienceYears,
    };
  }

  async getShifts(): Promise<WorkShift[]> {
    const shifts = await prisma.workShift.findMany({
      where: this.getOrgFilter(),
      orderBy: { name: 'asc' },
    });

    return shifts.map((s) => ({
      id: s.id,
      orgId: s.orgId,
      name: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      graceMinutes: s.graceMinutes,
      breakDurationMinutes: s.breakDurationMinutes,
      workingDays: (s.workingDays as any) || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    }));
  }

  async createShift(data: { name: string; startTime: string; endTime: string; graceMinutes?: number; breakDurationMinutes?: number; workingDays?: string[] }): Promise<WorkShift> {
    const orgId = this.currentOrgId;
    const created = await prisma.workShift.create({
      data: {
        id: `shift-${orgId}-${Date.now().toString(36)}`,
        orgId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        graceMinutes: data.graceMinutes || 15,
        breakDurationMinutes: data.breakDurationMinutes || 60,
        workingDays: data.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      name: created.name,
      startTime: created.startTime,
      endTime: created.endTime,
      graceMinutes: created.graceMinutes,
      breakDurationMinutes: created.breakDurationMinutes,
      workingDays: (created.workingDays as any) || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    };
  }

  // -------------------------------------------------------------
  // ATTENDANCE & GEOFENCING
  // -------------------------------------------------------------
  async getGeofences(): Promise<GeofenceLocation[]> {
    const list = await prisma.geofenceLocation.findMany({
      where: this.getOrgFilter(),
      orderBy: { name: 'asc' },
    });

    return list.map((g) => ({
      id: g.id,
      orgId: g.orgId,
      name: g.name,
      address: g.address || undefined,
      latitude: g.latitude,
      longitude: g.longitude,
      radiusMeters: g.radiusMeters,
      policy: g.policy as any,
      isRemoteAllowed: g.isRemoteAllowed,
    }));
  }

  async createGeofence(data: { name: string; address?: string; latitude: number; longitude: number; radiusMeters: number; policy?: string; isRemoteAllowed?: boolean }): Promise<GeofenceLocation> {
    const orgId = this.currentOrgId;
    const created = await prisma.geofenceLocation.create({
      data: {
        id: `geo-${orgId}-${Date.now().toString(36)}`,
        orgId,
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        radiusMeters: data.radiusMeters,
        policy: (data.policy as any) || 'Block',
        isRemoteAllowed: data.isRemoteAllowed ?? false,
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      name: created.name,
      address: created.address || undefined,
      latitude: created.latitude,
      longitude: created.longitude,
      radiusMeters: created.radiusMeters,
      policy: created.policy as any,
      isRemoteAllowed: created.isRemoteAllowed,
    };
  }

  async getAttendanceRecords(date?: string): Promise<AttendanceRecord[]> {
    const where: any = this.getOrgFilter();
    if (date) {
      where.date = date;
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      orgId: r.orgId,
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      department: r.department,
      date: r.date,
      clockInTime: r.clockInTime || undefined,
      clockOutTime: r.clockOutTime || undefined,
      workHours: r.workHours || 0,
      totalWorkingHours: r.totalWorkingHours || 0,
      overtimeHours: r.overtimeHours || 0,
      status: r.status,
      geofenceStatus: r.geofenceStatus || undefined,
      breakMinutes: r.breakMinutes || 0,
      punchLocation: (r.punchLocation as any) || undefined,
      withinGeofence: r.withinGeofence ?? true,
      distanceMeters: r.distanceMeters || 0,
      verifiedAt: r.verifiedAt ? r.verifiedAt.toISOString() : undefined,
    }));
  }

  async recordAttendancePunch(record: AttendanceRecord): Promise<AttendanceRecord> {
    this.assertTenantAccess(record.orgId);

    const upserted = await prisma.attendanceRecord.upsert({
      where: {
        orgId_employeeId_date: {
          orgId: record.orgId,
          employeeId: record.employeeId,
          date: record.date,
        },
      },
      update: {
        clockInTime: record.clockInTime,
        clockOutTime: record.clockOutTime,
        workHours: record.workHours,
        totalWorkingHours: record.totalWorkingHours,
        overtimeHours: record.overtimeHours,
        status: record.status,
        geofenceStatus: record.geofenceStatus,
        breakMinutes: record.breakMinutes,
        punchLocation: (record.punchLocation as any) || undefined,
        withinGeofence: record.withinGeofence,
        distanceMeters: record.distanceMeters,
        verifiedAt: record.verifiedAt ? new Date(record.verifiedAt) : new Date(),
        updatedAt: new Date(),
      },
      create: {
        id: record.id || `att-${record.employeeId}-${record.date}`,
        orgId: record.orgId,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        department: record.department,
        date: record.date,
        clockInTime: record.clockInTime,
        clockOutTime: record.clockOutTime,
        workHours: record.workHours,
        totalWorkingHours: record.totalWorkingHours,
        overtimeHours: record.overtimeHours,
        status: record.status || 'Present',
        geofenceStatus: record.geofenceStatus,
        breakMinutes: record.breakMinutes || 0,
        punchLocation: (record.punchLocation as any) || undefined,
        withinGeofence: record.withinGeofence ?? true,
        distanceMeters: record.distanceMeters || 0,
        verifiedAt: record.verifiedAt ? new Date(record.verifiedAt) : new Date(),
      },
    });

    return {
      id: upserted.id,
      orgId: upserted.orgId,
      employeeId: upserted.employeeId,
      employeeName: upserted.employeeName,
      department: upserted.department,
      date: upserted.date,
      clockInTime: upserted.clockInTime || undefined,
      clockOutTime: upserted.clockOutTime || undefined,
      workHours: upserted.workHours || 0,
      totalWorkingHours: upserted.totalWorkingHours || 0,
      overtimeHours: upserted.overtimeHours || 0,
      status: upserted.status,
      geofenceStatus: upserted.geofenceStatus || undefined,
      breakMinutes: upserted.breakMinutes || 0,
      punchLocation: (upserted.punchLocation as any) || undefined,
      withinGeofence: upserted.withinGeofence ?? true,
      distanceMeters: upserted.distanceMeters || 0,
      verifiedAt: upserted.verifiedAt ? upserted.verifiedAt.toISOString() : undefined,
    };
  }

  async getRegularizations(): Promise<RegularizationRequest[]> {
    const list = await prisma.regularizationRequest.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return list.map((r) => ({
      id: r.id,
      orgId: r.orgId,
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      date: r.date,
      reason: r.reason,
      requestedClockIn: r.requestedClockIn || undefined,
      requestedClockOut: r.requestedClockOut || undefined,
      status: r.status as any,
      approverRole: r.approverRole as any,
      approverName: r.approverName || undefined,
      comment: r.comment || undefined,
    }));
  }

  async createRegularization(req: Omit<RegularizationRequest, 'id' | 'orgId'>): Promise<RegularizationRequest> {
    const orgId = this.currentOrgId;

    const created = await prisma.regularizationRequest.create({
      data: {
        id: `reg-${Date.now().toString(36)}`,
        orgId,
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        date: req.date,
        reason: req.reason,
        requestedClockIn: req.requestedClockIn,
        requestedClockOut: req.requestedClockOut,
        status: req.status || 'Pending',
        approverRole: req.approverRole,
        approverName: req.approverName,
        comment: req.comment,
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      employeeId: created.employeeId,
      employeeName: created.employeeName,
      date: created.date,
      reason: created.reason,
      requestedClockIn: created.requestedClockIn || undefined,
      requestedClockOut: created.requestedClockOut || undefined,
      status: created.status as any,
      approverRole: created.approverRole as any,
      approverName: created.approverName || undefined,
      comment: created.comment || undefined,
    };
  }

  async updateRegularizationStatus(
    id: string,
    status: 'Approved' | 'Rejected',
    approverName: string
  ): Promise<RegularizationRequest> {
    const item = await prisma.regularizationRequest.findUnique({
      where: { id },
    });

    if (!item) throw new NotFoundError('Regularization Request');
    this.assertTenantAccess(item.orgId);

    const updated = await prisma.regularizationRequest.update({
      where: { id },
      data: {
        status,
        approverName,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      orgId: updated.orgId,
      employeeId: updated.employeeId,
      employeeName: updated.employeeName,
      date: updated.date,
      reason: updated.reason,
      requestedClockIn: updated.requestedClockIn || undefined,
      requestedClockOut: updated.requestedClockOut || undefined,
      status: updated.status as any,
      approverRole: updated.approverRole as any,
      approverName: updated.approverName || undefined,
      comment: updated.comment || undefined,
    };
  }

  // -------------------------------------------------------------
  // LEAVE REQUESTS
  // -------------------------------------------------------------
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    const list = await prisma.leaveRequest.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return list.map((l) => ({
      id: l.id,
      orgId: l.orgId,
      employeeId: l.employeeId,
      employeeName: l.employeeName,
      employeeAvatar: l.employeeAvatar || undefined,
      department: l.department,
      leaveType: l.leaveType as any,
      startDate: l.startDate,
      endDate: l.endDate,
      days: l.days,
      reason: l.reason,
      appliedDate: l.appliedDate,
      status: l.status as any,
      approverName: l.approverName || undefined,
      approverRole: l.approverRole as any,
      approvedOrRejectedDate: l.approvedOrRejectedDate || undefined,
    }));
  }

  async createLeaveRequest(req: Omit<LeaveRequest, 'id' | 'orgId' | 'status'>): Promise<LeaveRequest> {
    const orgId = this.currentOrgId;

    const created = await prisma.leaveRequest.create({
      data: {
        id: `leave-${Date.now().toString(36)}`,
        orgId,
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        employeeAvatar: req.employeeAvatar,
        department: req.department,
        leaveType: req.leaveType,
        startDate: req.startDate,
        endDate: req.endDate,
        days: req.days,
        reason: req.reason,
        appliedDate: req.appliedDate || new Date().toISOString().split('T')[0],
        status: 'Pending',
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      employeeId: created.employeeId,
      employeeName: created.employeeName,
      employeeAvatar: created.employeeAvatar || undefined,
      department: created.department,
      leaveType: created.leaveType as any,
      startDate: created.startDate,
      endDate: created.endDate,
      days: created.days,
      reason: created.reason,
      appliedDate: created.appliedDate,
      status: created.status as any,
      approverName: created.approverName || undefined,
      approverRole: created.approverRole as any,
      approvedOrRejectedDate: created.approvedOrRejectedDate || undefined,
    };
  }

  async updateLeaveRequestStatus(
    id: string,
    status: 'Approved' | 'Rejected',
    approverName: string
  ): Promise<LeaveRequest> {
    const item = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!item) throw new NotFoundError('Leave Request');
    this.assertTenantAccess(item.orgId);

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approverName,
        approvedOrRejectedDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      orgId: updated.orgId,
      employeeId: updated.employeeId,
      employeeName: updated.employeeName,
      employeeAvatar: updated.employeeAvatar || undefined,
      department: updated.department,
      leaveType: updated.leaveType as any,
      startDate: updated.startDate,
      endDate: updated.endDate,
      days: updated.days,
      reason: updated.reason,
      appliedDate: updated.appliedDate,
      status: updated.status as any,
      approverName: updated.approverName || undefined,
      approverRole: updated.approverRole as any,
      approvedOrRejectedDate: updated.approvedOrRejectedDate || undefined,
    };
  }

  // -------------------------------------------------------------
  // PAYROLL & COMPENSATION (with Versioning)
  // -------------------------------------------------------------
  async getSalaryStructures(): Promise<(SalaryStructure & { effectiveFrom: string })[]> {
    const list = await prisma.salaryStructure.findMany({
      where: this.getOrgFilter(),
      orderBy: { effectiveFrom: 'desc' },
    });

    return list.map((s) => ({
      id: s.id,
      orgId: s.orgId,
      name: s.name,
      description: s.description,
      basicPercentage: s.basicPercentage,
      hraPercentage: s.hraPercentage,
      specialAllowancePercentage: s.specialAllowancePercentage,
      conveyanceFixed: s.conveyanceFixed,
      medicalAllowanceFixed: s.medicalAllowanceFixed,
      pfRate: s.pfRate,
      esiRate: s.esiRate,
      professionalTaxFixed: s.professionalTaxFixed,
      isDefault: s.isDefault,
      effectiveFrom: s.effectiveFrom.toISOString(),
    }));
  }

  async getActiveSalaryStructure(asOfDate: Date = new Date()): Promise<SalaryStructure & { effectiveFrom: string }> {
    const structures = await prisma.salaryStructure.findMany({
      where: {
        ...(this.isSuperAdmin && this.currentOrgId === 'all' ? {} : { orgId: this.currentOrgId }),
        effectiveFrom: { lte: asOfDate },
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });

    if (structures.length > 0) {
      const s = structures[0];
      return {
        id: s.id,
        orgId: s.orgId,
        name: s.name,
        description: s.description,
        basicPercentage: s.basicPercentage,
        hraPercentage: s.hraPercentage,
        specialAllowancePercentage: s.specialAllowancePercentage,
        conveyanceFixed: s.conveyanceFixed,
        medicalAllowanceFixed: s.medicalAllowanceFixed,
        pfRate: s.pfRate,
        esiRate: s.esiRate,
        professionalTaxFixed: s.professionalTaxFixed,
        isDefault: s.isDefault,
        effectiveFrom: s.effectiveFrom.toISOString(),
      };
    }

    // Fallback default structure
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

  async getPayrollRuns(): Promise<(PayrollRun & { disclaimer?: string })[]> {
    const runs = await prisma.payrollRun.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return runs.map((r) => ({
      id: r.id,
      orgId: r.orgId,
      monthYear: r.monthYear,
      status: r.status as any,
      totalEmployees: r.totalEmployees,
      processedEmployees: r.processedEmployees,
      totalGrossPay: r.totalGrossPay,
      totalDeductions: r.totalDeductions,
      totalTaxes: r.totalTaxes,
      totalNetPay: r.totalNetPay,
      processedDate: r.processedDate || undefined,
      approvedBy: r.approvedBy || undefined,
      currentStep: r.currentStep,
      disclaimer: r.disclaimer || undefined,
    }));
  }

  async getPayslips(payrollRunId?: string, employeeId?: string): Promise<Payslip[]> {
    const where: any = this.getOrgFilter();
    if (payrollRunId) {
      where.payrollRunId = payrollRunId;
    }
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const slips = await prisma.payslip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return slips.map((p) => ({
      id: p.id,
      payrollRunId: p.payrollRunId,
      orgId: p.orgId,
      employeeId: p.employeeId,
      employeeName: p.employeeName,
      employeeCode: p.employeeCode,
      designation: p.designation,
      department: p.department,
      bankName: p.bankName,
      maskedAccount: p.maskedAccount,
      monthYear: p.monthYear,
      workingDays: p.workingDays,
      daysPresent: p.daysPresent,
      paidLeaves: p.paidLeaves,
      lossOfPayDays: p.lossOfPayDays,
      basicSalary: p.basicSalary,
      hra: p.hra,
      specialAllowance: p.specialAllowance,
      bonusOrIncentive: p.bonusOrIncentive,
      grossEarnings: p.grossEarnings,
      providentFund: p.providentFund,
      esi: p.esi,
      professionalTax: p.professionalTax,
      tdsIncomeTax: p.tdsIncomeTax,
      totalDeductions: p.totalDeductions,
      netSalary: p.netSalary,
      generatedDate: p.generatedDate,
    }));
  }

  async getPayslipById(id: string): Promise<Payslip | null> {
    const p = await prisma.payslip.findUnique({
      where: { id },
    });

    if (!p) return null;
    this.assertTenantAccess(p.orgId);

    return {
      id: p.id,
      payrollRunId: p.payrollRunId,
      orgId: p.orgId,
      employeeId: p.employeeId,
      employeeName: p.employeeName,
      employeeCode: p.employeeCode,
      designation: p.designation,
      department: p.department,
      bankName: p.bankName,
      maskedAccount: p.maskedAccount,
      monthYear: p.monthYear,
      workingDays: p.workingDays,
      daysPresent: p.daysPresent,
      paidLeaves: p.paidLeaves,
      lossOfPayDays: p.lossOfPayDays,
      basicSalary: p.basicSalary,
      hra: p.hra,
      specialAllowance: p.specialAllowance,
      bonusOrIncentive: p.bonusOrIncentive,
      grossEarnings: p.grossEarnings,
      providentFund: p.providentFund,
      esi: p.esi,
      professionalTax: p.professionalTax,
      tdsIncomeTax: p.tdsIncomeTax,
      totalDeductions: p.totalDeductions,
      netSalary: p.netSalary,
      generatedDate: p.generatedDate,
    };
  }

  async savePayrollRun(run: PayrollRun & { disclaimer?: string }, payslips: Payslip[]): Promise<void> {
    this.assertTenantAccess(run.orgId);

    await prisma.$transaction(async (tx) => {
      await tx.payrollRun.upsert({
        where: {
          orgId_monthYear: {
            orgId: run.orgId,
            monthYear: run.monthYear,
          },
        },
        update: {
          status: run.status,
          totalEmployees: run.totalEmployees || payslips.length,
          processedEmployees: run.processedEmployees || payslips.length,
          totalGrossPay: run.totalGrossPay,
          totalDeductions: run.totalDeductions,
          totalTaxes: run.totalTaxes,
          totalNetPay: run.totalNetPay,
          processedDate: run.processedDate,
          approvedBy: run.approvedBy,
          currentStep: run.currentStep,
          disclaimer: run.disclaimer,
          updatedAt: new Date(),
        },
        create: {
          id: run.id,
          orgId: run.orgId,
          monthYear: run.monthYear,
          status: run.status,
          totalEmployees: run.totalEmployees || payslips.length,
          processedEmployees: run.processedEmployees || payslips.length,
          totalGrossPay: run.totalGrossPay,
          totalDeductions: run.totalDeductions,
          totalTaxes: run.totalTaxes,
          totalNetPay: run.totalNetPay,
          processedDate: run.processedDate,
          approvedBy: run.approvedBy,
          currentStep: run.currentStep || 1,
          disclaimer: run.disclaimer,
        },
      });

      // Delete previous payslips for this run and insert new ones
      await tx.payslip.deleteMany({
        where: { payrollRunId: run.id },
      });

      if (payslips.length > 0) {
        await tx.payslip.createMany({
          data: payslips.map((p) => ({
            id: p.id,
            payrollRunId: run.id,
            orgId: p.orgId,
            employeeId: p.employeeId,
            employeeName: p.employeeName,
            employeeCode: p.employeeCode,
            designation: p.designation,
            department: p.department,
            bankName: p.bankName,
            maskedAccount: p.maskedAccount,
            monthYear: p.monthYear,
            workingDays: p.workingDays || 30,
            daysPresent: p.daysPresent || 30,
            paidLeaves: p.paidLeaves || 0,
            lossOfPayDays: p.lossOfPayDays || 0,
            basicSalary: p.basicSalary,
            hra: p.hra,
            specialAllowance: p.specialAllowance,
            bonusOrIncentive: p.bonusOrIncentive || 0,
            grossEarnings: p.grossEarnings,
            providentFund: p.providentFund,
            esi: p.esi,
            professionalTax: p.professionalTax,
            tdsIncomeTax: p.tdsIncomeTax,
            totalDeductions: p.totalDeductions,
            netSalary: p.netSalary,
            pdfFileKey: (p as any).pdfFileKey || null,
            generatedDate: p.generatedDate || new Date().toISOString().split('T')[0],
          })),
        });
      }
    });
  }

  async updatePayrollRunStatus(
    id: string,
    status: string,
    approvedBy?: string,
    processedDate?: string,
    currentStep?: number
  ): Promise<PayrollRun> {
    const run = await prisma.payrollRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundError('Payroll Run');
    this.assertTenantAccess(run.orgId);

    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        status,
        approvedBy: approvedBy || run.approvedBy,
        processedDate: processedDate || run.processedDate,
        currentStep: currentStep !== undefined ? currentStep : run.currentStep,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      orgId: updated.orgId,
      monthYear: updated.monthYear,
      status: updated.status as any,
      totalEmployees: updated.totalEmployees,
      processedEmployees: updated.processedEmployees,
      totalGrossPay: updated.totalGrossPay,
      totalDeductions: updated.totalDeductions,
      totalTaxes: updated.totalTaxes,
      totalNetPay: updated.totalNetPay,
      processedDate: updated.processedDate || undefined,
      approvedBy: updated.approvedBy || undefined,
      currentStep: updated.currentStep,
      disclaimer: updated.disclaimer || undefined,
    };
  }

  // -------------------------------------------------------------
  // PERFORMANCE & OKRS
  // -------------------------------------------------------------
  async getGoals(): Promise<PerformanceGoal[]> {
    const goals = await prisma.performanceGoal.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((g) => ({
      id: g.id,
      orgId: g.orgId,
      employeeId: g.employeeId || undefined,
      employeeName: g.employeeName,
      department: g.department || undefined,
      title: g.title,
      description: g.description || undefined,
      category: g.category as any,
      targetMetric: g.targetMetric,
      currentProgress: g.currentProgress,
      weightage: g.weightage,
      startDate: g.startDate || undefined,
      dueDate: g.dueDate,
      priority: g.priority as any,
      status: g.status as any,
      score: g.score || undefined,
    }));
  }

  async createGoal(goal: Omit<PerformanceGoal, 'id' | 'orgId'>): Promise<PerformanceGoal> {
    const orgId = this.currentOrgId;

    const created = await prisma.performanceGoal.create({
      data: {
        id: `goal-${Date.now().toString(36)}`,
        orgId,
        employeeId: goal.employeeId,
        employeeName: goal.employeeName,
        department: goal.department,
        title: goal.title,
        description: goal.description,
        category: goal.category || 'OKR',
        targetMetric: goal.targetMetric,
        currentProgress: goal.currentProgress || 0,
        weightage: goal.weightage || 25,
        startDate: goal.startDate,
        dueDate: goal.dueDate,
        priority: goal.priority || 'Medium',
        status: goal.status || 'On Track',
        score: goal.score,
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      employeeId: created.employeeId || undefined,
      employeeName: created.employeeName,
      department: created.department || undefined,
      title: created.title,
      description: created.description || undefined,
      category: created.category as any,
      targetMetric: created.targetMetric,
      currentProgress: created.currentProgress,
      weightage: created.weightage,
      startDate: created.startDate || undefined,
      dueDate: created.dueDate,
      priority: created.priority as any,
      status: created.status as any,
      score: created.score || undefined,
    };
  }

  async updateGoalProgress(id: string, progress: number): Promise<PerformanceGoal> {
    const existing = await prisma.performanceGoal.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Goal');
    this.assertTenantAccess(existing.orgId);

    const status = progress >= 100 ? 'Completed' : progress >= 70 ? 'On Track' : 'At Risk';

    const updated = await prisma.performanceGoal.update({
      where: { id },
      data: {
        currentProgress: progress,
        status,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      orgId: updated.orgId,
      employeeId: updated.employeeId || undefined,
      employeeName: updated.employeeName,
      department: updated.department || undefined,
      title: updated.title,
      description: updated.description || undefined,
      category: updated.category as any,
      targetMetric: updated.targetMetric,
      currentProgress: updated.currentProgress,
      weightage: updated.weightage,
      startDate: updated.startDate || undefined,
      dueDate: updated.dueDate,
      priority: updated.priority as any,
      status: updated.status as any,
      score: updated.score || undefined,
    };
  }

  async getReviews(): Promise<PerformanceReview[]> {
    const reviews = await prisma.performanceReview.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => ({
      id: r.id,
      orgId: r.orgId,
      employeeId: r.employeeId || undefined,
      employeeName: r.employeeName,
      reviewerName: r.reviewerName || undefined,
      cycle: r.cycle || r.reviewCycle || 'Q3 2026',
      reviewCycle: r.reviewCycle || r.cycle || 'Q3 2026',
      rating: r.rating || 0,
      feedback: r.feedback || undefined,
      department: r.department || undefined,
      currentStage: r.currentStage,
      isCompleted: r.isCompleted,
      selfRating: r.selfRating || 0,
      selfComments: r.selfComments || undefined,
      managerRating: r.managerRating || 0,
      managerComments: r.managerComments || undefined,
      managerStrengths: r.managerStrengths || undefined,
      managerImprovements: r.managerImprovements || undefined,
      peerRating: r.peerRating || 0,
      peerComments: r.peerComments || undefined,
      hrRating: r.hrRating || 0,
      hrComments: r.hrComments || undefined,
      finalScore: r.finalScore || 0,
      finalRecommendation: r.finalRecommendation || undefined,
    }));
  }

  async createReview(data: {
    employeeId?: string;
    employeeName: string;
    reviewerName?: string;
    cycle?: string;
    rating?: number;
    feedback?: string;
    department?: string;
    currentStage?: number;
    selfRating?: number;
    selfComments?: string;
    managerRating?: number;
    managerComments?: string;
  }): Promise<PerformanceReview> {
    const orgId = this.currentOrgId;
    const created = await prisma.performanceReview.create({
      data: {
        id: `rev-${Date.now().toString(36)}`,
        orgId,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        reviewerName: data.reviewerName,
        cycle: data.cycle || 'Q3 2026',
        reviewCycle: data.cycle || 'Q3 2026',
        rating: data.rating || 0,
        feedback: data.feedback,
        department: data.department,
        currentStage: typeof data.currentStage === 'number' ? (['Self', 'Manager', 'Peer', 'HR', 'Final'][data.currentStage - 1] || 'Self') : (data.currentStage ? String(data.currentStage) : 'Self'),
        selfRating: data.selfRating || 0,
        selfComments: data.selfComments,
        managerRating: data.managerRating || 0,
        managerComments: data.managerComments,
        isCompleted: false,
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      employeeId: created.employeeId || undefined,
      employeeName: created.employeeName,
      reviewerName: created.reviewerName || undefined,
      cycle: created.cycle || 'Q3 2026',
      reviewCycle: created.reviewCycle || 'Q3 2026',
      rating: created.rating || 0,
      feedback: created.feedback || undefined,
      department: created.department || undefined,
      currentStage: created.currentStage,
      isCompleted: created.isCompleted,
      selfRating: created.selfRating || 0,
      selfComments: created.selfComments || undefined,
      managerRating: created.managerRating || 0,
      managerComments: created.managerComments || undefined,
      peerRating: 0,
      hrRating: 0,
      finalScore: created.finalScore || 0,
    };
  }

  async updateReview(id: string, updates: Partial<PerformanceReview>): Promise<PerformanceReview> {
    const existing = await prisma.performanceReview.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Performance Review');
    this.assertTenantAccess(existing.orgId);

    const updated = await prisma.performanceReview.update({
      where: { id },
      data: {
        currentStage: updates.currentStage !== undefined ? updates.currentStage : undefined,
        rating: updates.rating !== undefined ? updates.rating : undefined,
        feedback: updates.feedback !== undefined ? updates.feedback : undefined,
        managerRating: updates.managerRating !== undefined ? updates.managerRating : undefined,
        managerComments: updates.managerComments !== undefined ? updates.managerComments : undefined,
        isCompleted: updates.isCompleted !== undefined ? updates.isCompleted : undefined,
        finalScore: updates.finalScore !== undefined ? updates.finalScore : undefined,
        finalRecommendation: updates.finalRecommendation !== undefined ? updates.finalRecommendation : undefined,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      orgId: updated.orgId,
      employeeId: updated.employeeId || undefined,
      employeeName: updated.employeeName,
      reviewerName: updated.reviewerName || undefined,
      cycle: updated.cycle || 'Q3 2026',
      reviewCycle: updated.reviewCycle || 'Q3 2026',
      rating: updated.rating || 0,
      feedback: updated.feedback || undefined,
      department: updated.department || undefined,
      currentStage: updated.currentStage,
      isCompleted: updated.isCompleted,
      selfRating: updated.selfRating || 0,
      selfComments: updated.selfComments || undefined,
      managerRating: updated.managerRating || 0,
      managerComments: updated.managerComments || undefined,
      peerRating: updated.peerRating || 0,
      hrRating: updated.hrRating || 0,
      finalScore: updated.finalScore || 0,
      finalRecommendation: updated.finalRecommendation || undefined,
    };
  }

  // -------------------------------------------------------------
  // RECRUITMENT & ATS
  // -------------------------------------------------------------
  async getJobs(): Promise<JobPosting[]> {
    const jobs = await prisma.jobPosting.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((j) => ({
      id: j.id,
      orgId: j.orgId,
      title: j.title,
      department: j.department,
      location: j.location,
      employmentType: j.employmentType as any,
      experience: j.experience || undefined,
      salaryRange: j.salaryRange || undefined,
      description: j.description || undefined,
      skillsRequired: (j.skillsRequired as any) || [],
      qualifications: j.qualifications || undefined,
      hiringManager: j.hiringManager || undefined,
      status: j.status as any,
      openings: j.openings,
      appliedCount: j.appliedCount,
      postedDate: j.postedDate,
    }));
  }

  async createJob(data: {
    title: string;
    department: string;
    location: string;
    employmentType?: string;
    experience?: string;
    salaryRange?: string;
    description?: string;
    skillsRequired?: string[];
    openings?: number;
  }): Promise<JobPosting> {
    const orgId = this.currentOrgId;
    const created = await prisma.jobPosting.create({
      data: {
        id: `job-${orgId}-${Date.now().toString(36)}`,
        orgId,
        title: data.title,
        department: data.department,
        location: data.location,
        employmentType: data.employmentType || 'Full-Time',
        experience: data.experience,
        salaryRange: data.salaryRange,
        description: data.description,
        skillsRequired: data.skillsRequired || [],
        openings: data.openings || 1,
        appliedCount: 0,
        status: 'Active',
        postedDate: new Date().toISOString().split('T')[0],
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      title: created.title,
      department: created.department,
      location: created.location,
      employmentType: created.employmentType as any,
      experience: created.experience || undefined,
      salaryRange: created.salaryRange || undefined,
      description: created.description || undefined,
      skillsRequired: (created.skillsRequired as any) || [],
      status: created.status as any,
      openings: created.openings,
      appliedCount: created.appliedCount,
      postedDate: created.postedDate,
    };
  }

  async getCandidates(): Promise<Candidate[]> {
    const list = await prisma.candidate.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return list.map((c) => ({
      id: c.id,
      orgId: c.orgId,
      jobId: c.jobId || undefined,
      jobTitle: c.jobTitle,
      name: c.name,
      email: c.email,
      phone: c.phone,
      currentCompany: c.currentCompany,
      experienceYears: c.experienceYears,
      skills: (c.skills as any) || [],
      expectedSalaryInr: c.expectedSalary || undefined,
      noticePeriodDays: c.noticePeriodDays,
      location: c.location || undefined,
      source: c.source as any,
      stage: c.stage as any,
      resumeFileName: c.resumeFileName || undefined,
      appliedDate: c.appliedDate,
      rating: c.rating,
      notes: c.notes || undefined,
    }));
  }

  async createCandidate(data: {
    jobId?: string;
    jobTitle: string;
    name: string;
    email: string;
    phone: string;
    currentCompany?: string;
    experienceYears?: number;
    skills?: string[];
    expectedSalary?: number;
    noticePeriodDays?: number;
    location?: string;
    source?: string;
  }): Promise<Candidate> {
    const orgId = this.currentOrgId;
    const created = await prisma.candidate.create({
      data: {
        id: `cand-${orgId}-${Date.now().toString(36)}`,
        orgId,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        name: data.name,
        email: data.email,
        phone: data.phone,
        currentCompany: data.currentCompany || 'N/A',
        experienceYears: data.experienceYears || 2,
        skills: data.skills || [],
        expectedSalary: data.expectedSalary !== undefined ? String(data.expectedSalary) : undefined,
        noticePeriodDays: data.noticePeriodDays || 30,
        location: data.location || 'Bengaluru',
        source: data.source || 'Direct Applied',
        stage: 'Applied',
        appliedDate: new Date().toISOString().split('T')[0],
        rating: 4.0,
      },
    });

    if (data.jobId) {
      await prisma.jobPosting.update({
        where: { id: data.jobId },
        data: { appliedCount: { increment: 1 } },
      }).catch(() => {});
    }

    return {
      id: created.id,
      orgId: created.orgId,
      jobId: created.jobId || undefined,
      jobTitle: created.jobTitle,
      name: created.name,
      email: created.email,
      phone: created.phone,
      currentCompany: created.currentCompany,
      experienceYears: created.experienceYears,
      skills: (created.skills as any) || [],
      expectedSalaryInr: created.expectedSalary || undefined,
      noticePeriodDays: created.noticePeriodDays,
      location: created.location || undefined,
      source: created.source as any,
      stage: created.stage as any,
      appliedDate: created.appliedDate,
      rating: created.rating,
    };
  }

  async updateCandidateStage(id: string, stage: Candidate['stage']): Promise<Candidate> {
    const existing = await prisma.candidate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Candidate');
    this.assertTenantAccess(existing.orgId);

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        stage,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      orgId: updated.orgId,
      jobId: updated.jobId || undefined,
      jobTitle: updated.jobTitle,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      currentCompany: updated.currentCompany,
      experienceYears: updated.experienceYears,
      skills: (updated.skills as any) || [],
      expectedSalaryInr: updated.expectedSalary || undefined,
      noticePeriodDays: updated.noticePeriodDays,
      location: updated.location || undefined,
      source: updated.source as any,
      stage: updated.stage as any,
      resumeFileName: updated.resumeFileName || undefined,
      appliedDate: updated.appliedDate,
      rating: updated.rating,
      notes: updated.notes || undefined,
    };
  }

  async getInterviews(): Promise<Interview[]> {
    const list = await prisma.interview.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return list.map((i) => ({
      id: i.id,
      orgId: i.orgId,
      candidateId: i.candidateId || undefined,
      candidateName: i.candidateName,
      jobTitle: i.jobTitle || undefined,
      round: i.round || undefined,
      roundType: i.roundType as any,
      interviewerName: i.interviewerName,
      scheduledAt: i.scheduledAt || undefined,
      durationMinutes: i.durationMinutes,
      meetingLink: i.meetingLink || undefined,
      feedback: i.feedback || undefined,
      score: i.score || undefined,
      status: i.status as any,
    }));
  }

  async scheduleInterview(data: {
    candidateId?: string;
    candidateName: string;
    jobTitle?: string;
    round?: string;
    roundType?: string;
    interviewerName: string;
    scheduledAt?: string;
    durationMinutes?: number;
    meetingLink?: string;
  }): Promise<Interview> {
    const orgId = this.currentOrgId;
    const created = await prisma.interview.create({
      data: {
        id: `int-${orgId}-${Date.now().toString(36)}`,
        orgId,
        candidateId: data.candidateId,
        candidateName: data.candidateName,
        jobTitle: data.jobTitle,
        round: data.round || 'Technical Round 1',
        roundType: data.roundType || 'Technical',
        interviewerName: data.interviewerName,
        scheduledAt: data.scheduledAt || new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: data.durationMinutes || 45,
        meetingLink: data.meetingLink || 'https://meet.google.com/xyz-sqbe-int',
        status: 'Scheduled',
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      candidateId: created.candidateId || undefined,
      candidateName: created.candidateName,
      jobTitle: created.jobTitle || undefined,
      round: created.round || undefined,
      roundType: created.roundType as any,
      interviewerName: created.interviewerName,
      scheduledAt: created.scheduledAt || undefined,
      durationMinutes: created.durationMinutes,
      meetingLink: created.meetingLink || undefined,
      status: created.status as any,
    };
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS & AUDIT LOGS
  // -------------------------------------------------------------
  async getNotifications(): Promise<NotificationItem[]> {
    const notifs = await prisma.notificationItem.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return notifs.map((n) => ({
      id: n.id,
      orgId: n.orgId,
      title: n.title,
      message: n.message,
      type: n.type as any,
      timestamp: n.timestamp,
      isRead: n.isRead,
      actionUrl: n.actionUrl || undefined,
    }));
  }

  async markNotificationRead(id: string): Promise<NotificationItem | null> {
    const existing = await prisma.notificationItem.findUnique({ where: { id } });
    if (!existing) return null;
    this.assertTenantAccess(existing.orgId);

    const updated = await prisma.notificationItem.update({
      where: { id },
      data: { isRead: true, updatedAt: new Date() },
    });

    return {
      id: updated.id,
      orgId: updated.orgId,
      title: updated.title,
      message: updated.message,
      type: updated.type as any,
      timestamp: updated.timestamp,
      isRead: updated.isRead,
      actionUrl: updated.actionUrl || undefined,
    };
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const logs = await prisma.auditLogEntry.findMany({
      where: this.getOrgFilter(),
      orderBy: { timestamp: 'desc' },
      take: 200,
    });

    return logs.map((a) => ({
      id: a.id,
      orgId: a.orgId,
      timestamp: a.timestamp.toISOString(),
      userName: a.userName,
      userRole: a.userRole as Role,
      action: a.action,
      module: a.module,
      recordName: a.recordName,
      previousValue: a.previousValue || undefined,
      newValue: a.newValue || undefined,
      ipAddress: a.ipAddress,
    }));
  }

  async createAuditLog(log: Omit<AuditLogEntry, 'id'> & { id?: string }): Promise<AuditLogEntry> {
    const created = await prisma.auditLogEntry.create({
      data: {
        id: log.id || `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        orgId: log.orgId || this.currentOrgId,
        timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
        userName: log.userName,
        userRole: log.userRole,
        action: log.action,
        module: log.module,
        recordName: log.recordName,
        previousValue: log.previousValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress || '127.0.0.1',
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      timestamp: created.timestamp.toISOString(),
      userName: created.userName,
      userRole: created.userRole as Role,
      action: created.action,
      module: created.module,
      recordName: created.recordName,
      previousValue: created.previousValue || undefined,
      newValue: created.newValue || undefined,
      ipAddress: created.ipAddress,
    };
  }

  // -------------------------------------------------------------
  // FILE STORAGE METADATA
  // -------------------------------------------------------------
  async saveFileMetadata(file: FileRecord): Promise<void> {
    this.assertTenantAccess(file.orgId);

    await prisma.fileMetadata.upsert({
      where: { fileKey: file.fileKey },
      update: {
        fileName: file.fileName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        category: file.category,
        uploadedById: file.uploadedById,
        isVerified: file.isVerified,
        updatedAt: new Date(),
      },
      create: {
        id: file.id || `file-${Date.now().toString(36)}`,
        orgId: file.orgId,
        fileKey: file.fileKey,
        fileName: file.fileName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        category: file.category,
        uploadedById: file.uploadedById,
        isVerified: file.isVerified,
      },
    });
  }

  async getFileMetadataByKey(fileKey: string): Promise<FileRecord | null> {
    const file = await prisma.fileMetadata.findUnique({
      where: { fileKey },
    });

    if (!file) return null;
    this.assertTenantAccess(file.orgId);

    return {
      id: file.id,
      orgId: file.orgId,
      fileKey: file.fileKey,
      fileName: file.fileName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      category: file.category as any,
      uploadedById: file.uploadedById || undefined,
      isVerified: file.isVerified,
      createdAt: file.createdAt.toISOString(),
    };
  }

  // -------------------------------------------------------------
  // EXPENSE MANAGEMENT
  // -------------------------------------------------------------
  async getExpenses(): Promise<any[]> {
    const list = await prisma.expenseClaim.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return list.map((e) => ({
      id: e.id,
      orgId: e.orgId,
      employeeId: e.employeeId,
      employeeName: e.employeeName,
      category: e.category,
      amount: e.amount,
      currency: e.currency,
      date: e.date,
      merchant: e.merchant,
      description: e.description,
      receiptUrl: e.receiptUrl || undefined,
      receiptFileKey: e.receiptFileKey || undefined,
      status: e.status,
      approvedBy: e.approvedBy || undefined,
      approvedDate: e.approvedDate || undefined,
      rejectionReason: e.rejectionReason || undefined,
      createdAt: e.createdAt.toISOString(),
    }));
  }

  async createExpense(data: {
    employeeId: string;
    employeeName: string;
    category: string;
    amount: number;
    currency?: string;
    date: string;
    merchant: string;
    description: string;
    receiptUrl?: string;
    receiptFileKey?: string;
  }): Promise<any> {
    const orgId = this.currentOrgId;

    const created = await prisma.expenseClaim.create({
      data: {
        id: `exp-${Date.now().toString(36)}`,
        orgId,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        category: data.category,
        amount: data.amount,
        currency: data.currency || 'INR',
        date: data.date,
        merchant: data.merchant,
        description: data.description,
        receiptUrl: data.receiptUrl,
        receiptFileKey: data.receiptFileKey,
        status: 'Pending',
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      employeeId: created.employeeId,
      employeeName: created.employeeName,
      category: created.category,
      amount: created.amount,
      currency: created.currency,
      date: created.date,
      merchant: created.merchant,
      description: created.description,
      receiptUrl: created.receiptUrl || undefined,
      receiptFileKey: created.receiptFileKey || undefined,
      status: created.status,
      approvedBy: created.approvedBy || undefined,
      approvedDate: created.approvedDate || undefined,
      rejectionReason: created.rejectionReason || undefined,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async updateExpenseStatus(
    id: string,
    status: 'Approved' | 'Rejected' | 'Reimbursed',
    approvedBy: string,
    rejectionReason?: string
  ): Promise<any> {
    const existing = await prisma.expenseClaim.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Expense Claim');
    this.assertTenantAccess(existing.orgId);

    const updated = await prisma.expenseClaim.update({
      where: { id },
      data: {
        status,
        approvedBy,
        approvedDate: new Date().toISOString().split('T')[0],
        rejectionReason: rejectionReason || null,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      orgId: updated.orgId,
      employeeId: updated.employeeId,
      employeeName: updated.employeeName,
      category: updated.category,
      amount: updated.amount,
      currency: updated.currency,
      date: updated.date,
      merchant: updated.merchant,
      description: updated.description,
      receiptUrl: updated.receiptUrl || undefined,
      receiptFileKey: updated.receiptFileKey || undefined,
      status: updated.status,
      approvedBy: updated.approvedBy || undefined,
      approvedDate: updated.approvedDate || undefined,
      rejectionReason: updated.rejectionReason || undefined,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteExpense(id: string): Promise<boolean> {
    const existing = await prisma.expenseClaim.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Expense Claim');
    this.assertTenantAccess(existing.orgId);

    await prisma.expenseClaim.delete({ where: { id } });
    return true;
  }

  // -------------------------------------------------------------
  // EMPLOYEE ENGAGEMENT
  // -------------------------------------------------------------
  async getAnnouncements(): Promise<any[]> {
    const list = await prisma.engagementAnnouncement.findMany({
      where: this.getOrgFilter(),
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
    });

    return list.map((a) => ({
      id: a.id,
      orgId: a.orgId,
      title: a.title,
      content: a.content,
      category: a.category,
      authorName: a.authorName,
      authorAvatar: a.authorAvatar || undefined,
      pinned: a.pinned,
      likesCount: a.likesCount,
      publishedAt: a.publishedAt.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));
  }

  async createAnnouncement(data: {
    title: string;
    content: string;
    category?: string;
    authorName: string;
    authorAvatar?: string;
    pinned?: boolean;
  }): Promise<any> {
    const orgId = this.currentOrgId;

    const created = await prisma.engagementAnnouncement.create({
      data: {
        id: `ann-${Date.now().toString(36)}`,
        orgId,
        title: data.title,
        content: data.content,
        category: data.category || 'General',
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        pinned: data.pinned || false,
        likesCount: 0,
        publishedAt: new Date(),
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      title: created.title,
      content: created.content,
      category: created.category,
      authorName: created.authorName,
      authorAvatar: created.authorAvatar || undefined,
      pinned: created.pinned,
      likesCount: created.likesCount,
      publishedAt: created.publishedAt.toISOString(),
      createdAt: created.createdAt.toISOString(),
    };
  }

  async toggleAnnouncementLike(id: string): Promise<any> {
    const existing = await prisma.engagementAnnouncement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Announcement');
    this.assertTenantAccess(existing.orgId);

    const updated = await prisma.engagementAnnouncement.update({
      where: { id },
      data: {
        likesCount: { increment: 1 },
      },
    });

    return {
      id: updated.id,
      likesCount: updated.likesCount,
    };
  }

  async getRecognitions(): Promise<any[]> {
    const list = await prisma.engagementRecognition.findMany({
      where: this.getOrgFilter(),
      orderBy: { createdAt: 'desc' },
    });

    return list.map((r) => ({
      id: r.id,
      orgId: r.orgId,
      senderId: r.senderId,
      senderName: r.senderName,
      senderAvatar: r.senderAvatar || undefined,
      recipientId: r.recipientId,
      recipientName: r.recipientName,
      recipientAvatar: r.recipientAvatar || undefined,
      badge: r.badge,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createRecognition(data: {
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
    badge: string;
    message: string;
  }): Promise<any> {
    const orgId = this.currentOrgId;

    const created = await prisma.engagementRecognition.create({
      data: {
        id: `recog-${Date.now().toString(36)}`,
        orgId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        recipientId: data.recipientId,
        recipientName: data.recipientName,
        recipientAvatar: data.recipientAvatar,
        badge: data.badge,
        message: data.message,
      },
    });

    return {
      id: created.id,
      orgId: created.orgId,
      senderId: created.senderId,
      senderName: created.senderName,
      senderAvatar: created.senderAvatar || undefined,
      recipientId: created.recipientId,
      recipientName: created.recipientName,
      recipientAvatar: created.recipientAvatar || undefined,
      badge: created.badge,
      message: created.message,
      createdAt: created.createdAt.toISOString(),
    };
  }

  // -------------------------------------------------------------
  // MARKETPLACE
  // -------------------------------------------------------------
  async getMarketplaceApps(): Promise<any[]> {
    const allApps = await prisma.marketplaceApp.findMany({
      orderBy: { name: 'asc' },
      include: {
        installations: {
          where: this.isSuperAdmin && this.currentOrgId === 'all' ? {} : { orgId: this.currentOrgId },
        },
      },
    });

    return allApps.map((app) => ({
      id: app.id,
      name: app.name,
      slug: app.slug,
      category: app.category,
      description: app.description,
      developer: app.developer,
      icon: app.icon,
      badge: app.badge || undefined,
      rating: app.rating,
      reviewsCount: app.reviewsCount,
      pricing: app.pricing,
      isPopular: app.isPopular,
      installed: app.installations.length > 0 && app.installations[0].installed,
    }));
  }

  async toggleInstallMarketplaceApp(appId: string, installed: boolean, configuredBy?: string): Promise<any> {
    const orgId = this.currentOrgId;

    const installation = await prisma.organizationMarketplaceApp.upsert({
      where: {
        orgId_appId: {
          orgId,
          appId,
        },
      },
      update: {
        installed,
        configuredBy: configuredBy || null,
      },
      create: {
        orgId,
        appId,
        installed,
        configuredBy: configuredBy || null,
      },
    });

    return installation;
  }
}

/**
 * Factory helper to get repository instance for an authenticated user request
 */
export function getRepository(orgId: string = 'org-acro', role: string = 'Admin'): TenantScopedRepository {
  const isSuperAdmin = role === 'Super Admin' || orgId === 'all';
  return new TenantScopedRepository(orgId, isSuperAdmin);
}
