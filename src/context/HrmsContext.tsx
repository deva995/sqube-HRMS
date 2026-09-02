import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  Organization,
  Role,
  ModuleId,
  Employee,
  Department,
  Designation,
  WorkShift,
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
  CandidateStage,
  Interview,
  NotificationItem,
  AuditLogEntry,
  UserPersona,
  GeofenceLocation,
  LifecycleEvent,
  ToastItem,
  ToastType,
} from '../types';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_USER_PERSONAS,
  INITIAL_DEPARTMENTS,
  INITIAL_DESIGNATIONS,
  INITIAL_SHIFTS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_REGULARIZATIONS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_SALARY_STRUCTURE,
  INITIAL_PAYROLL_RUNS,
  INITIAL_PAYSLIPS,
  INITIAL_GOALS,
  INITIAL_REVIEWS,
  INITIAL_JOBS,
  INITIAL_CANDIDATES,
  INITIAL_INTERVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../mock/demoData';
import { calculateHaversineDistance } from '../utils/geo';
import { calculateIllustrativeSalaryBreakdown } from '../utils/payrollCalc';

interface HrmsContextType {
  // Tenancy
  organizations: Organization[];
  currentOrgId: string;
  currentOrg: Organization;
  switchOrganization: (orgId: string) => void;
  createOrganization: (org: Partial<Organization>) => void;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => void;
  toggleModuleAssignment: (orgId: string, moduleId: ModuleId) => void;

  // Authentication & Session
  isAuthenticated: boolean;
  login: (params: { email?: string; password?: string; role?: Role; orgId?: string; personaId?: string }) => void;
  logout: () => void;

  // Personas & Active Role
  currentUserRole: Role;
  currentUserPersona: UserPersona;
  allPersonas: UserPersona[];
  switchRole: (role: Role) => void;

  // HR Module
  employees: Employee[];
  allEmployees: Employee[];
  departments: Department[];
  designations: Designation[];
  shifts: WorkShift[];
  addEmployee: (empData: Partial<Employee>) => void;
  updateEmployee: (empId: string, updates: Partial<Employee>) => void;
  recordLifecycleEvent: (empId: string, event: Omit<LifecycleEvent, 'id' | 'employeeId'>) => void;
  addDepartment: (dept: Partial<Department>) => void;

  // Payroll Module
  salaryStructure: SalaryStructure;
  updateSalaryStructure: (updates: Partial<SalaryStructure>) => void;
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
  advancePayrollStep: (runId: string) => void;
  approvePayrollRun: (runId: string) => void;
  disbursePayrollRun: (runId: string) => void;

  // Attendance & Geofencing
  attendanceRecords: AttendanceRecord[];
  regularizationRequests: RegularizationRequest[];
  todayUserRecord: AttendanceRecord | undefined;
  clockIn: (params: { latitude: number; longitude: number; accuracy: number; isBiometricSimulated?: boolean }) => { success: boolean; message: string; geofenceStatus: string };
  clockOut: () => void;
  submitRegularization: (req: Omit<RegularizationRequest, 'id' | 'orgId' | 'status'>) => void;
  approveRegularization: (id: string, approverName: string) => void;
  rejectRegularization: (id: string, approverName: string) => void;
  updateGeofence: (geofenceId: string, updates: Partial<GeofenceLocation>) => void;
  addGeofence: (geofence: Omit<GeofenceLocation, 'id' | 'orgId'>) => void;

  // Leave Management
  leaveRequests: LeaveRequest[];
  allLeaveRequests: LeaveRequest[];
  approveLeaveRequest: (id: string, approverName?: string) => void;
  rejectLeaveRequest: (id: string, approverName?: string) => void;
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'orgId' | 'status' | 'appliedDate'>) => void;

  // Tenancy Details
  isAllOrgsSelected: boolean;

  // Performance Module
  goals: PerformanceGoal[];
  addGoal: (goal: Omit<PerformanceGoal, 'id' | 'orgId'>) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  reviews: PerformanceReview[];
  addReview: (review: Omit<PerformanceReview, 'id' | 'orgId' | 'updatedAt'>) => void;
  submitReviewFeedback: (reviewId: string, updates: Partial<PerformanceReview>) => void;

  // Recruitment Module
  jobs: JobPosting[];
  addJob: (job: Omit<JobPosting, 'id' | 'orgId' | 'appliedCount' | 'createdDate'>) => void;
  updateJobStatus: (jobId: string, status: 'Published' | 'Draft' | 'Closed') => void;
  candidates: Candidate[];
  moveCandidateStage: (candidateId: string, newStage: CandidateStage) => void;
  addCandidate: (cand: Omit<Candidate, 'id' | 'orgId' | 'appliedDate'>) => void;
  interviews: Interview[];
  scheduleInterview: (interview: Omit<Interview, 'id' | 'orgId'>) => void;
  submitInterviewFeedback: (interviewId: string, score: number, feedback: string) => void;

  // Notifications & Audit
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress'>) => void;

  // Global Toast Notifications
  toasts: ToastItem[];
  showToast: (
    messageOrOptions:
      | string
      | {
          message: string;
          title?: string;
          type?: ToastType;
          duration?: number;
          action?: { label: string; onClick: () => void };
        },
    type?: ToastType
  ) => void;
  dismissToast: (id: string) => void;

  // Offline Simulator & Mobile Field Mode
  isOfflineMode: boolean;
  offlineSyncQueue: any[];
  toggleOfflineMode: () => void;
  syncOfflineQueue: () => void;
  isFieldStaffModalOpen: boolean;
  setIsFieldStaffModalOpen: (open: boolean) => void;

  // Selected Employee for Direct Drawer Opening
  selectedEmployeeForDetail: Employee | null;
  setSelectedEmployeeForDetail: (emp: Employee | null) => void;
  openEmployeeProfile: (employeeId: string) => void;

  // Navigation State
  activeModule: string;
  setActiveModule: (mod: string) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  isModuleLoading: boolean;
  setIsModuleLoading: (loading: boolean) => void;
  navigateTo: (mod: string, subTab?: string) => void;
  simulateDataRefresh: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isExecutiveReportModalOpen: boolean;
  setIsExecutiveReportModalOpen: (open: boolean) => void;
}

const HrmsContext = createContext<HrmsContextType | null>(null);

export const HrmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activePersonaId, setActivePersonaId] = useState<string>('user-super');

  // Multi-Tenancy State
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [currentOrgId, setCurrentOrgId] = useState<string>('org-apex');
  const [currentUserRole, setCurrentUserRole] = useState<Role>('Super Admin');

  // Navigation & View State
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [isModuleLoading, setIsModuleLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFieldStaffModalOpen, setIsFieldStaffModalOpen] = useState<boolean>(false);
  const [isExecutiveReportModalOpen, setIsExecutiveReportModalOpen] = useState<boolean>(false);

  // Smooth Navigation with Content Skeleton transition
  const navigateTo = useCallback((moduleId: string, subTab?: string) => {
    setIsModuleLoading(true);
    setActiveModule(moduleId);
    if (subTab) {
      setActiveSubTab(subTab);
    }
    const timer = setTimeout(() => {
      setIsModuleLoading(false);
    }, 380);
    return () => clearTimeout(timer);
  }, []);

  const simulateDataRefresh = useCallback(() => {
    setIsModuleLoading(true);
    const timer = setTimeout(() => {
      setIsModuleLoading(false);
    }, 380);
    return () => clearTimeout(timer);
  }, []);

  // Offline Mode Simulator State
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<any[]>([]);

  // Entities In-Memory State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [designations, setDesignations] = useState<Designation[]>(INITIAL_DESIGNATIONS);
  const [shifts, setShifts] = useState<WorkShift[]>(INITIAL_SHIFTS);
  const [salaryStructure, setSalaryStructure] = useState<SalaryStructure>(INITIAL_SALARY_STRUCTURE);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(INITIAL_PAYROLL_RUNS);
  const [payslips, setPayslips] = useState<Payslip[]>(INITIAL_PAYSLIPS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [regularizationRequests, setRegularizationRequests] = useState<RegularizationRequest[]>(INITIAL_REGULARIZATIONS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [goals, setGoals] = useState<PerformanceGoal[]>(INITIAL_GOALS);
  const [reviews, setReviews] = useState<PerformanceReview[]>(INITIAL_REVIEWS);
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [interviews, setInterviews] = useState<Interview[]>(INITIAL_INTERVIEWS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);

  // Global Toast Notifications Helper
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      messageOrOptions:
        | string
        | {
            message: string;
            title?: string;
            type?: ToastType;
            duration?: number;
            action?: { label: string; onClick: () => void };
          },
      type: ToastType = 'success'
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      let toastItem: ToastItem;

      if (typeof messageOrOptions === 'string') {
        toastItem = {
          id,
          message: messageOrOptions,
          type,
          duration: 4000,
        };
      } else {
        toastItem = {
          id,
          title: messageOrOptions.title,
          message: messageOrOptions.message,
          type: messageOrOptions.type || type || 'success',
          duration: messageOrOptions.duration ?? 4000,
          action: messageOrOptions.action,
        };
      }

      setToasts((prev) => [...prev, toastItem]);

      if (toastItem.duration && toastItem.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, toastItem.duration);
      }
    },
    []
  );

  // Open Employee Profile Directly
  const openEmployeeProfile = useCallback((employeeId: string) => {
    const target = employees.find((e) => e.id === employeeId || e.employeeCode === employeeId);
    if (target) {
      if (currentOrgId !== 'all' && target.orgId !== currentOrgId) {
        setCurrentOrgId(target.orgId);
      }
      setSelectedEmployeeForDetail(target);
      navigateTo('hr', 'employees');
      showToast({
        title: 'Employee Profile',
        message: `Opened profile for ${target.firstName} ${target.lastName} (${target.employeeCode})`,
        type: 'info',
      });
    } else {
      navigateTo('hr', 'employees');
    }
  }, [employees, currentOrgId, navigateTo, showToast]);

  // Tenancy derivations
  const isAllOrgsSelected = currentOrgId === 'all';

  const currentOrg = useMemo(() => {
    if (currentOrgId === 'all') {
      const allEnabledModules = Array.from(
        new Set(organizations.flatMap((o) => o.enabledModules))
      ) as ModuleId[];
      const totalEmployees = organizations.reduce((acc, o) => acc + (o.employeeCount || 0), 0);
      const totalActiveUsers = organizations.reduce((acc, o) => acc + (o.activeUsers || 0), 0);
      const allGeofences = organizations.flatMap((o) => o.geofences || []);

      return {
        id: 'all',
        name: 'All Organizations (Consolidated)',
        slug: 'all-organizations',
        industry: 'Enterprise Multi-Tenant Group (All 3 Entities)',
        employeeCount: totalEmployees,
        activeUsers: totalActiveUsers,
        status: 'Active' as const,
        joinedDate: '2024-01-01',
        contactEmail: 'group-superadmin@squbehrms.com',
        billingPlan: 'Enterprise' as const,
        enabledModules: allEnabledModules.length > 0 ? allEnabledModules : ['hr', 'payroll', 'attendance', 'performance', 'recruitment', 'leave', 'ess', 'engagement', 'marketplace', 'expense'],
        geofences: allGeofences,
      };
    }
    return organizations.find((o) => o.id === currentOrgId) || organizations[0];
  }, [organizations, currentOrgId]);

  // Current Persona derivation
  const currentUserPersona = useMemo(() => {
    if (activePersonaId) {
      const p = INITIAL_USER_PERSONAS.find((item) => item.id === activePersonaId);
      if (p) return p;
    }
    return (
      INITIAL_USER_PERSONAS.find((p) => p.role === currentUserRole) ||
      INITIAL_USER_PERSONAS[0]
    );
  }, [activePersonaId, currentUserRole]);

  // Add audit log helper
  const addAuditLog = useCallback(
    (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress'>) => {
      const now = new Date();
      const timeStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('en-IN')}`;
      const newEntry: AuditLogEntry = {
        ...entry,
        id: `audit-${Date.now()}`,
        timestamp: timeStr,
        ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 80),
      };
      setAuditLogs((prev) => [newEntry, ...prev]);
    },
    []
  );

  // Login handler
  const login = useCallback(
    (params: { email?: string; password?: string; role?: Role; orgId?: string; personaId?: string }) => {
      let targetPersona = INITIAL_USER_PERSONAS[0];
      if (params.personaId) {
        targetPersona = INITIAL_USER_PERSONAS.find((p) => p.id === params.personaId) || targetPersona;
      } else if (params.email) {
        targetPersona = INITIAL_USER_PERSONAS.find((p) => p.email.toLowerCase() === params.email?.toLowerCase()) || targetPersona;
      } else if (params.role) {
        targetPersona = INITIAL_USER_PERSONAS.find((p) => p.role === params.role) || targetPersona;
      }

      setActivePersonaId(targetPersona.id);
      setCurrentUserRole(targetPersona.role);
      if (params.orgId) {
        setCurrentOrgId(params.orgId);
      } else if (targetPersona.orgId) {
        setCurrentOrgId(targetPersona.orgId);
      }

      setIsAuthenticated(true);
      setActiveModule('dashboard');
      setActiveSubTab('overview');

      addAuditLog({
        orgId: params.orgId || targetPersona.orgId || currentOrgId,
        userName: targetPersona.name,
        userRole: targetPersona.role,
        action: 'User Authentication Successful',
        module: 'auth',
        recordName: targetPersona.email,
        newValue: `Interactive Session Started • Role: ${targetPersona.role}`,
      });

      showToast({
        title: `Welcome back, ${targetPersona.name.split(' ')[0]}`,
        message: `Signed in successfully as ${targetPersona.role}.`,
        type: 'success',
        duration: 3000,
      });
    },
    [currentOrgId, addAuditLog, showToast]
  );

  // Logout handler
  const logout = useCallback(() => {
    addAuditLog({
      orgId: currentOrgId,
      userName: currentUserPersona.name,
      userRole: currentUserRole,
      action: 'User Signed Out',
      module: 'auth',
      recordName: currentUserPersona.email,
      newValue: 'Session Terminated • Redirected to Login',
    });
    setIsAuthenticated(false);
    showToast({
      title: 'Signed Out',
      message: 'You have been safely signed out.',
      type: 'info',
      duration: 2500,
    });
  }, [currentOrgId, currentUserPersona, currentUserRole, addAuditLog, showToast]);

  // Filtered employees for active tenant
  const currentOrgEmployees = useMemo(() => {
    if (currentOrgId === 'all') return employees;
    return employees.filter((e) => e.orgId === currentOrgId);
  }, [employees, currentOrgId]);

  // Switch Org
  const switchOrganization = useCallback(
    (orgId: string) => {
      setIsModuleLoading(true);
      setCurrentOrgId(orgId);
      const targetOrg = orgId === 'all' 
        ? { name: 'All Organizations (Consolidated View)' } 
        : organizations.find((o) => o.id === orgId);
      addAuditLog({
        orgId: orgId,
        userName: currentUserPersona.name,
        userRole: currentUserRole,
        action: 'Switched Active Organization',
        module: 'admin',
        recordName: targetOrg?.name || orgId,
        newValue: `Tenant Context: ${targetOrg?.name}`,
      });
      showToast({
        title: 'Active Organization Switched',
        message: targetOrg?.name || orgId,
        type: 'info',
        duration: 2500,
      });
      const timer = setTimeout(() => {
        setIsModuleLoading(false);
      }, 350);
      return () => clearTimeout(timer);
    },
    [organizations, currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  // Switch Role
  const switchRole = useCallback(
    (role: Role) => {
      setCurrentUserRole(role);
      const matchingPersona = INITIAL_USER_PERSONAS.find((p) => p.role === role);
      if (matchingPersona) {
        setActivePersonaId(matchingPersona.id);
      }
      addAuditLog({
        orgId: currentOrgId,
        userName: matchingPersona?.name || currentUserPersona.name,
        userRole: role,
        action: 'Persona / Role Switched',
        module: 'auth',
        recordName: role,
        newValue: `Simulated UI gating active as: ${role}`,
      });
      showToast({
        title: 'Persona Role Switched',
        message: `Now viewing as ${matchingPersona?.name || role} (${role})`,
        type: 'info',
        duration: 2500,
      });
    },
    [currentOrgId, currentUserPersona, addAuditLog, showToast]
  );

  // Toggle Module Assignment (Centerpiece feature!)
  const toggleModuleAssignment = useCallback(
    (orgId: string, moduleId: ModuleId) => {
      setOrganizations((prev) =>
        prev.map((org) => {
          if (org.id !== orgId) return org;
          const isEnabled = org.enabledModules.includes(moduleId);
          const updatedModules = isEnabled
            ? org.enabledModules.filter((m) => m !== moduleId)
            : [...org.enabledModules, moduleId];

          addAuditLog({
            orgId,
            userName: currentUserPersona.name,
            userRole: currentUserRole,
            action: `Module ${isEnabled ? 'Disabled' : 'Enabled'}`,
            module: 'admin',
            recordName: `${org.name} - Module Matrix`,
            previousValue: `${org.enabledModules.length} Modules`,
            newValue: `${updatedModules.length} Modules (${moduleId.toUpperCase()} ${isEnabled ? 'Removed' : 'Added'})`,
          });

          showToast({
            title: `Module ${isEnabled ? 'Disabled' : 'Enabled'}`,
            message: `${moduleId.toUpperCase()} access updated for ${org.name}.`,
            type: isEnabled ? 'warning' : 'success',
          });

          return { ...org, enabledModules: updatedModules };
        })
      );
    },
    [currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  const createOrganization = useCallback(
    (newOrgData: Partial<Organization>) => {
      const id = `org-${Date.now()}`;
      const newOrg: Organization = {
        id,
        name: newOrgData.name || 'New Organization',
        slug: newOrgData.slug || 'new-org',
        industry: newOrgData.industry || 'Technology & Services',
        employeeCount: 0,
        activeUsers: 1,
        status: 'Active',
        joinedDate: new Date().toISOString().slice(0, 10),
        contactEmail: newOrgData.contactEmail || 'admin@neworg.in',
        billingPlan: newOrgData.billingPlan || 'Professional',
        enabledModules: newOrgData.enabledModules || ['hr', 'attendance'],
        geofences: [
          {
            id: `geo-${Date.now()}`,
            orgId: id,
            name: `${newOrgData.name || 'Office'} Main HQ`,
            address: 'Central Business District',
            latitude: 12.9716,
            longitude: 77.5946,
            radiusMeters: 300,
            policy: 'Allow with Warning',
            isRemoteAllowed: true,
          },
        ],
      };

      setOrganizations((prev) => [...prev, newOrg]);
      addAuditLog({
        orgId: id,
        userName: currentUserPersona.name,
        userRole: currentUserRole,
        action: 'Created New Organization',
        module: 'admin',
        recordName: newOrg.name,
        newValue: `Created with ${newOrg.enabledModules.length} enabled modules`,
      });
      showToast({
        title: 'Organization Created',
        message: `${newOrg.name} registered with ${newOrg.enabledModules.length} active modules.`,
        type: 'success',
      });
    },
    [currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  const updateOrganization = useCallback(
    (orgId: string, updates: Partial<Organization>) => {
      setOrganizations((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, ...updates } : o))
      );
      addAuditLog({
        orgId,
        userName: currentUserPersona.name,
        userRole: currentUserRole,
        action: 'Updated Organization Details',
        module: 'admin',
        recordName: updates.name || orgId,
      });
      showToast({
        title: 'Organization Updated',
        message: 'Tenant settings saved successfully.',
        type: 'success',
      });
    },
    [currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  // HR Add/Update
  const addEmployee = useCallback(
    (empData: Partial<Employee>) => {
      const id = `emp-${Date.now()}`;
      const code = `SQ-${1000 + employees.length + 1}`;
      const gross = empData.monthlyGross || 80000;
      const newEmp: Employee = {
        id,
        orgId: currentOrgId,
        employeeCode: code,
        firstName: empData.firstName || 'New',
        lastName: empData.lastName || 'Employee',
        avatar:
          empData.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        email: empData.email || 'emp@squbehrms.in',
        phone: empData.phone || '+91 98000 00000',
        dob: empData.dob || '1996-01-01',
        gender: empData.gender || 'Prefer not to say',
        address: empData.address || 'Bengaluru, Karnataka',
        emergencyContact: empData.emergencyContact || {
          name: 'Contact Person',
          relationship: 'Family',
          phone: '+91 98000 11111',
        },
        department: empData.department || 'Engineering & Technology',
        designation: empData.designation || 'Software Engineer',
        employmentType: empData.employmentType || 'Full-Time',
        joiningDate: empData.joiningDate || new Date().toISOString().slice(0, 10),
        workLocation: empData.workLocation || currentOrg.geofences[0]?.name || 'HQ',
        status: empData.status || 'Active',
        annualCtc: gross * 12,
        monthlyGross: gross,
        bankDetails: {
          bankName: empData.bankDetails?.bankName || 'HDFC Bank Ltd',
          maskedAccountNumber: '•••• ' + Math.floor(1000 + Math.random() * 9000),
          ifscCode: 'HDFC0001099',
        },
        documents: [
          {
            id: `doc-${Date.now()}`,
            title: 'Signed Employment Agreement',
            type: 'Offer Letter',
            fileName: `Offer_Letter_${code}.pdf`,
            uploadDate: new Date().toISOString().slice(0, 10),
            size: '1.2 MB',
            verified: true,
          },
        ],
        lifecycleHistory: [
          {
            id: `lc-${Date.now()}`,
            employeeId: id,
            type: 'Onboarding',
            date: new Date().toISOString().slice(0, 10),
            title: 'Employee Onboarding Completed',
            description: `Onboarded as ${empData.designation} in ${empData.department}.`,
            approvedBy: currentUserPersona.name,
          },
        ],
        shiftId: shifts[0]?.id || 'shift-gen',
        performanceRating: 4.5,
      };

      setEmployees((prev) => [newEmp, ...prev]);
      // update org headcount
      setOrganizations((prev) =>
        prev.map((o) =>
          o.id === currentOrgId ? { ...o, employeeCount: o.employeeCount + 1 } : o
        )
      );

      addAuditLog({
        orgId: currentOrgId,
        userName: currentUserPersona.name,
        userRole: currentUserRole,
        action: 'Onboarded New Employee',
        module: 'hr',
        recordName: `${newEmp.firstName} ${newEmp.lastName} (${code})`,
        newValue: `${newEmp.designation} - ${newEmp.department}`,
      });

      // Notification
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          orgId: currentOrgId,
          title: 'New Employee Onboarded',
          message: `${newEmp.firstName} ${newEmp.lastName} successfully added to ${newEmp.department}.`,
          type: 'system',
          timestamp: 'Just now',
          isRead: false,
        },
        ...prev,
      ]);

      showToast({
        title: 'Employee Onboarded',
        message: `${newEmp.firstName} ${newEmp.lastName} (${code}) onboarded successfully.`,
        type: 'success',
      });
    },
    [currentOrgId, employees, currentOrg, shifts, currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  const updateEmployee = useCallback(
    (empId: string, updates: Partial<Employee>) => {
      setEmployees((prev) =>
        prev.map((e) => (e.id === empId ? { ...e, ...updates } : e))
      );
      addAuditLog({
        orgId: currentOrgId,
        userName: currentUserPersona.name,
        userRole: currentUserRole,
        action: 'Employee Record Updated',
        module: 'hr',
        recordName: empId,
      });
      showToast({
        title: 'Employee Record Updated',
        message: 'Changes saved successfully.',
        type: 'success',
      });
    },
    [currentOrgId, currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  const recordLifecycleEvent = useCallback(
    (empId: string, event: Omit<LifecycleEvent, 'id' | 'employeeId'>) => {
      const newEvent: LifecycleEvent = {
        ...event,
        id: `lc-${Date.now()}`,
        employeeId: empId,
      };

      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id !== empId) return e;
          const updatedHistory = [newEvent, ...e.lifecycleHistory];
          let updatedDesignation = e.designation;
          let updatedDepartment = e.department;
          let updatedStatus = e.status;

          if (event.type === 'Promotion' || event.type === 'Role Change') {
            if (event.newValue) updatedDesignation = event.newValue;
          }
          if (event.type === 'Department Change') {
            if (event.newValue) updatedDepartment = event.newValue;
          }
          if (event.type === 'Resignation' || event.type === 'Exit') {
            updatedStatus = event.type === 'Resignation' ? 'Notice Period' : 'Terminated';
          }

          return {
            ...e,
            designation: updatedDesignation,
            department: updatedDepartment,
            status: updatedStatus,
            lifecycleHistory: updatedHistory,
          };
        })
      );

      addAuditLog({
        orgId: currentOrgId,
        userName: currentUserPersona.name,
        userRole: currentUserRole,
        action: `Lifecycle: ${event.type}`,
        module: 'hr',
        recordName: event.title,
        previousValue: event.previousValue,
        newValue: event.newValue,
      });

      showToast({
        title: `Lifecycle: ${event.type}`,
        message: `${event.title} recorded in employment profile.`,
        type: 'info',
      });
    },
    [currentOrgId, currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  const addDepartment = useCallback(
    (dept: Partial<Department>) => {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        orgId: currentOrgId,
        name: dept.name || 'New Department',
        code: dept.code || 'DEPT',
        headEmployeeId: dept.headEmployeeId || '',
        headName: dept.headName || 'TBD',
        employeeCount: 0,
        budgetInr: dept.budgetInr || 10000000,
      };
      const numericBudget = typeof newDept.budgetInr === 'number' ? newDept.budgetInr : Number(newDept.budgetInr) || 0;
      setDepartments((prev) => [...prev, newDept]);
      showToast({
        title: 'Department Created',
        message: `${newDept.name} added with budget ₹${(numericBudget / 100000).toFixed(0)} Lakhs.`,
        type: 'success',
      });
    },
    [currentOrgId, showToast]
  );

  // Payroll Actions
  const advancePayrollStep = useCallback(
    (runId: string) => {
      setPayrollRuns((prev) =>
        prev.map((run) => {
          if (run.id !== runId) return run;
          const nextStep = Math.min(6, run.currentStep + 1);
          let newStatus = run.status;
          if (nextStep === 2) newStatus = 'Attendance Verified';
          if (nextStep === 3 || nextStep === 4) newStatus = 'Calculated';
          if (nextStep === 5) newStatus = 'Pending Approval';
          if (nextStep === 6) newStatus = 'Approved';

          addAuditLog({
            orgId: currentOrgId,
            userName: currentUserPersona.name,
            userRole: currentUserRole,
            action: 'Payroll Wizard Step Advanced',
            module: 'payroll',
            recordName: run.monthYear,
            newValue: `Step ${nextStep}/6 (${newStatus})`,
          });

          showToast({
            title: `Payroll Step ${nextStep}/6 Advanced`,
            message: `Stage: ${newStatus}`,
            type: 'info',
          });

          return { ...run, currentStep: nextStep, status: newStatus };
        })
      );
    },
    [currentOrgId, currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  const approvePayrollRun = useCallback(
    (runId: string) => {
      setPayrollRuns((prev) =>
        prev.map((run) => {
          if (run.id !== runId) return run;
          return {
            ...run,
            status: 'Approved',
            approvedBy: currentUserPersona.name,
            currentStep: 6,
          };
        })
      );

      addAuditLog({
        orgId: currentOrgId,
        userName: currentUserPersona.name,
        userRole: currentUserRole,
        action: 'Payroll Run Approved',
        module: 'payroll',
        recordName: runId,
        newValue: 'Approved by ' + currentUserPersona.name,
      });

      showToast({
        title: 'Payroll Run Approved',
        message: 'Batch is approved and queued for disburse.',
        type: 'success',
      });
    },
    [currentOrgId, currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  const disbursePayrollRun = useCallback(
    (runId: string) => {
      setPayrollRuns((prev) =>
        prev.map((run) => {
          if (run.id !== runId) return run;
          return {
            ...run,
            status: 'Disbursed',
            processedDate: new Date().toISOString().slice(0, 10),
          };
        })
      );

      // Generate payslips for active employees
      const activeEmps = employees.filter((e) => e.orgId === currentOrgId && e.status === 'Active');
      const targetRun = payrollRuns.find((r) => r.id === runId);
      const mYear = targetRun?.monthYear || 'Current Month';

      const newSlips: Payslip[] = activeEmps.map((emp) => {
        const breakdown = calculateIllustrativeSalaryBreakdown(emp.monthlyGross);
        return {
          id: `slip-${emp.id}-${Date.now()}`,
          payrollRunId: runId,
          orgId: currentOrgId,
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeCode: emp.employeeCode,
          designation: emp.designation,
          department: emp.department,
          bankName: emp.bankDetails.bankName,
          maskedAccount: emp.bankDetails.maskedAccountNumber,
          monthYear: mYear,
          workingDays: 22,
          daysPresent: 22,
          paidLeaves: 0,
          lossOfPayDays: 0,
          basicSalary: breakdown.basic,
          hra: breakdown.hra,
          specialAllowance: breakdown.specialAllowance,
          bonusOrIncentive: 0,
          grossEarnings: breakdown.grossSalary,
          providentFund: breakdown.pf,
          esi: breakdown.esi,
          professionalTax: breakdown.professionalTax,
          tdsIncomeTax: breakdown.tds,
          totalDeductions: breakdown.totalDeductions,
          netSalary: breakdown.netSalary,
          generatedDate: new Date().toISOString().slice(0, 10),
        };
      });

      setPayslips((prev) => [...newSlips, ...prev]);

      addAuditLog({
        orgId: currentOrgId,
        userName: currentUserPersona.name,
        userRole: currentUserRole,
        action: 'Payroll Run Disbursed',
        module: 'payroll',
        recordName: mYear,
        newValue: `Generated ${newSlips.length} Payslips`,
      });

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          orgId: currentOrgId,
          title: `Payslips Generated for ${mYear}`,
          message: `Direct salary advice dispatched for ${newSlips.length} employees.`,
          type: 'payroll',
          timestamp: 'Just now',
          isRead: false,
        },
        ...prev,
      ]);

      showToast({
        title: 'Payroll Disbursed Successfully',
        message: `Dispatched direct salary advice and generated ${newSlips.length} payslips for ${mYear}.`,
        type: 'success',
      });
    },
    [currentOrgId, employees, payrollRuns, currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  const updateSalaryStructure = useCallback((updates: Partial<SalaryStructure>) => {
    setSalaryStructure((prev) => ({ ...prev, ...updates }));
  }, []);

  // Attendance Actions
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayUserRecord = useMemo(() => {
    return attendanceRecords.find(
      (r) => r.orgId === currentOrgId && r.date === todayStr && r.employeeName.includes('Aarav')
    );
  }, [attendanceRecords, currentOrgId, todayStr]);

  const clockIn = useCallback(
    (params: { latitude: number; longitude: number; accuracy: number; isBiometricSimulated?: boolean }) => {
      // Find nearest office geofence
      const geofences = currentOrg.geofences || [];
      let nearestGeofence = geofences[0];
      let minDistance = 9999999;

      geofences.forEach((geo) => {
        const dist = calculateHaversineDistance(
          { latitude: params.latitude, longitude: params.longitude },
          { latitude: geo.latitude, longitude: geo.longitude }
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestGeofence = geo;
        }
      });

      const isInside = nearestGeofence ? minDistance <= nearestGeofence.radiusMeters : false;
      const geofenceStatus = isInside ? 'Inside Allowed Location' : 'Outside Authorized Location';

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        orgId: currentOrgId,
        employeeId: 'emp-104',
        employeeName: 'Aarav Patel',
        department: 'Engineering & Technology',
        date: todayStr,
        clockInTime: timeStr,
        status: isInside ? 'Present' : 'Present',
        breakMinutes: 0,
        punchLocation: {
          latitude: params.latitude,
          longitude: params.longitude,
          accuracyMeters: params.accuracy,
          distanceFromOfficeMeters: minDistance,
          officeGeofenceName: nearestGeofence?.name || 'Office Geofence',
          geofenceStatus: geofenceStatus as any,
          deviceInfo: navigator.userAgent.slice(0, 45),
          isBiometricSimulated: params.isBiometricSimulated,
          isOfflineSync: isOfflineMode,
        },
      };

      if (isOfflineMode) {
        setOfflineSyncQueue((prev) => [...prev, { type: 'PUNCH_IN', data: newRecord }]);
      }

      setAttendanceRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);

      addAuditLog({
        orgId: currentOrgId,
        userName: 'Aarav Patel',
        userRole: currentUserRole,
        action: 'Clocked In',
        module: 'attendance',
        recordName: `${todayStr} Punch`,
        newValue: `${timeStr} (${geofenceStatus}, Dist: ${minDistance}m)`,
      });

      showToast({
        title: 'Attendance Clocked',
        message: `Clock-in recorded at ${timeStr} (${geofenceStatus}).`,
        type: isInside ? 'success' : 'warning',
      });

      return {
        success: true,
        message: `Clock-in recorded at ${timeStr}. Distance: ${minDistance}m from ${nearestGeofence?.name || 'HQ'}`,
        geofenceStatus,
      };
    },
    [currentOrg, currentOrgId, todayStr, isOfflineMode, currentUserRole, addAuditLog, showToast]
  );

  const clockOut = useCallback(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.orgId === currentOrgId && r.date === todayStr && r.employeeName.includes('Aarav')) {
          return {
            ...r,
            clockOutTime: timeStr,
            totalWorkingHours: 8.5,
          };
        }
        return r;
      })
    );

    addAuditLog({
      orgId: currentOrgId,
      userName: 'Aarav Patel',
      userRole: currentUserRole,
      action: 'Clocked Out',
      module: 'attendance',
      recordName: `${todayStr} Punch Out`,
      newValue: timeStr,
    });

    showToast({
      title: 'Clock-Out Recorded',
      message: `Punch recorded at ${timeStr}. Shift completed (8.5 hrs logged).`,
      type: 'info',
    });
  }, [currentOrgId, todayStr, currentUserRole, addAuditLog, showToast]);

  const submitRegularization = useCallback(
    (req: Omit<RegularizationRequest, 'id' | 'orgId' | 'status'>) => {
      const newReq: RegularizationRequest = {
        ...req,
        id: `reg-${Date.now()}`,
        orgId: currentOrgId,
        status: 'Pending',
      };
      setRegularizationRequests((prev) => [newReq, ...prev]);
      showToast({
        title: 'Regularization Submitted',
        message: `Request submitted for ${req.date} (${req.reason}).`,
        type: 'info',
      });
    },
    [currentOrgId, showToast]
  );

  const approveRegularization = useCallback(
    (id: string, approverName: string) => {
      setRegularizationRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'Approved', approverName } : r
        )
      );
      showToast({
        title: 'Regularization Approved',
        message: 'Attendance record updated and regularized.',
        type: 'success',
      });
    },
    [showToast]
  );

  const rejectRegularization = useCallback(
    (id: string, approverName: string) => {
      setRegularizationRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'Rejected', approverName } : r
        )
      );
      showToast({
        title: 'Regularization Rejected',
        message: 'Regularization request was declined.',
        type: 'warning',
      });
    },
    [showToast]
  );

  const updateGeofence = useCallback(
    (geofenceId: string, updates: Partial<GeofenceLocation>) => {
      setOrganizations((prev) =>
        prev.map((o) => {
          if (o.id !== currentOrgId) return o;
          return {
            ...o,
            geofences: o.geofences.map((g) =>
              g.id === geofenceId ? { ...g, ...updates } : g
            ),
          };
        })
      );
      showToast({
        title: 'Geofence Updated',
        message: 'Location perimeter and policies updated.',
        type: 'success',
      });
    },
    [currentOrgId, showToast]
  );

  const addGeofence = useCallback(
    (geofence: Omit<GeofenceLocation, 'id' | 'orgId'>) => {
      const newGeo: GeofenceLocation = {
        ...geofence,
        id: `geo-${Date.now()}`,
        orgId: currentOrgId,
      };
      setOrganizations((prev) =>
        prev.map((o) =>
          o.id === currentOrgId ? { ...o, geofences: [...o.geofences, newGeo] } : o
        )
      );
      showToast({
        title: 'Geofence Added',
        message: `${newGeo.name} perimeter (${newGeo.radiusMeters}m) created.`,
        type: 'success',
      });
    },
    [currentOrgId, showToast]
  );

  // Performance Actions
  const addGoal = useCallback(
    (goal: Omit<PerformanceGoal, 'id' | 'orgId'>) => {
      const newGoal: PerformanceGoal = {
        ...goal,
        id: `goal-${Date.now()}`,
        orgId: currentOrgId,
      };
      setGoals((prev) => [newGoal, ...prev]);
      showToast({
        title: 'OKR Created Successfully',
        message: `Objective "${goal.title}" created.`,
        type: 'success',
      });
    },
    [currentOrgId, showToast]
  );

  const updateGoalProgress = useCallback((goalId: string, progress: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const status = progress >= 100 ? 'Completed' : progress < 40 ? 'At Risk' : 'On Track';
        return { ...g, currentProgress: progress, status };
      })
    );
    showToast({
      title: 'OKR Updated Successfully',
      message: `Goal progress set to ${progress}%.`,
      type: 'success',
    });
  }, [showToast]);

  const addReview = useCallback(
    (review: Omit<PerformanceReview, 'id' | 'orgId' | 'updatedAt'>) => {
      const newRev: PerformanceReview = {
        ...review,
        id: `rev-${Date.now()}`,
        orgId: currentOrgId === 'all' ? 'org-apex' : currentOrgId,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setReviews((prev) => [newRev, ...prev]);
      showToast({
        title: '360 Review Initiated',
        message: `Appraisal cycle started for ${review.employeeName}.`,
        type: 'success',
      });
    },
    [currentOrgId, showToast]
  );

  const submitReviewFeedback = useCallback(
    (reviewId: string, updates: Partial<PerformanceReview>) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
            : r
        )
      );
      showToast({
        title: 'Review Feedback Saved',
        message: 'Evaluation ratings and notes saved successfully.',
        type: 'success',
      });
    },
    [showToast]
  );

  // Recruitment Actions
  const addJob = useCallback(
    (job: Omit<JobPosting, 'id' | 'orgId' | 'appliedCount' | 'createdDate'>) => {
      const newJob: JobPosting = {
        ...job,
        id: `job-${Date.now()}`,
        orgId: currentOrgId,
        appliedCount: 0,
        createdDate: new Date().toISOString().slice(0, 10),
      };
      setJobs((prev) => [newJob, ...prev]);
      showToast({
        title: 'Job Posting Created',
        message: `Requisition for "${job.title}" opened.`,
        type: 'success',
      });
    },
    [currentOrgId, showToast]
  );

  const updateJobStatus = useCallback(
    (jobId: string, status: 'Published' | 'Draft' | 'Closed') => {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status } : j))
      );
      showToast({
        title: 'Job Status Updated',
        message: `Posting status changed to ${status}.`,
        type: 'info',
      });
    },
    [showToast]
  );

  const moveCandidateStage = useCallback(
    (candidateId: string, newStage: CandidateStage) => {
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
      );
      addAuditLog({
        orgId: currentOrgId,
        userName: currentUserPersona.name,
        userRole: currentUserRole,
        action: 'Candidate Stage Transition',
        module: 'recruitment',
        recordName: candidateId,
        newValue: `Moved to ${newStage}`,
      });
      showToast({
        title: 'Candidate Stage Updated',
        message: `Applicant transitioned to ${newStage}.`,
        type: 'info',
      });
    },
    [currentOrgId, currentUserPersona, currentUserRole, addAuditLog, showToast]
  );

  const addCandidate = useCallback(
    (cand: Omit<Candidate, 'id' | 'orgId' | 'appliedDate'>) => {
      const newCand: Candidate = {
        ...cand,
        id: `cand-${Date.now()}`,
        orgId: currentOrgId,
        appliedDate: new Date().toISOString().slice(0, 10),
      };
      setCandidates((prev) => [newCand, ...prev]);
      // increment job count
      setJobs((prev) =>
        prev.map((j) =>
          j.id === cand.jobId ? { ...j, appliedCount: j.appliedCount + 1 } : j
        )
      );
      showToast({
        title: 'Candidate Profile Added',
        message: `${cand.name} added to applicant talent pool.`,
        type: 'success',
      });
    },
    [currentOrgId, showToast]
  );

  const scheduleInterview = useCallback(
    (interview: Omit<Interview, 'id' | 'orgId'>) => {
      const newInt: Interview = {
        ...interview,
        id: `int-${Date.now()}`,
        orgId: currentOrgId,
      };
      setInterviews((prev) => [newInt, ...prev]);
      const roundLabel = interview.round || interview.roundType || 'Interview';
      const timeLabel = interview.scheduledAt || interview.scheduledDateTime || 'Scheduled date';
      showToast({
        title: 'Interview Scheduled',
        message: `${roundLabel} scheduled for ${interview.candidateName} (${timeLabel}).`,
        type: 'success',
      });
    },
    [currentOrgId, showToast]
  );

  const submitInterviewFeedback = useCallback(
    (interviewId: string, score: number, feedback: string) => {
      setInterviews((prev) =>
        prev.map((i) =>
          i.id === interviewId
            ? { ...i, score, feedback, status: 'Completed' }
            : i
        )
      );
      showToast({
        title: 'Interview Feedback Logged',
        message: `Evaluation score ${score}/5 saved.`,
        type: 'success',
      });
    },
    [showToast]
  );

  // Leave Management Handlers
  const approveLeaveRequest = useCallback(
    (id: string, approverName?: string) => {
      const approver = approverName || currentUserPersona.name;
      setLeaveRequests((prev) =>
        prev.map((req) => {
          if (req.id === id) {
            addAuditLog({
              orgId: req.orgId,
              userName: approver,
              userRole: currentUserRole,
              action: 'Leave Request Approved',
              module: 'leave',
              recordName: `${req.employeeName} (${req.leaveType})`,
              previousValue: 'Pending',
              newValue: `Approved (${req.days} days: ${req.startDate} to ${req.endDate})`,
            });
            return {
              ...req,
              status: 'Approved' as const,
              approverName: approver,
              approverRole: currentUserRole,
              approvedOrRejectedDate: new Date().toISOString().slice(0, 10),
            };
          }
          return req;
        })
      );
      showToast({
        title: 'Leave Request Approved',
        message: 'Leave application approved and balance adjusted.',
        type: 'success',
      });
    },
    [currentUserPersona.name, currentUserRole, addAuditLog, showToast]
  );

  const rejectLeaveRequest = useCallback(
    (id: string, approverName?: string) => {
      const approver = approverName || currentUserPersona.name;
      setLeaveRequests((prev) =>
        prev.map((req) => {
          if (req.id === id) {
            addAuditLog({
              orgId: req.orgId,
              userName: approver,
              userRole: currentUserRole,
              action: 'Leave Request Rejected',
              module: 'leave',
              recordName: `${req.employeeName} (${req.leaveType})`,
              previousValue: 'Pending',
              newValue: 'Rejected',
            });
            return {
              ...req,
              status: 'Rejected' as const,
              approverName: approver,
              approverRole: currentUserRole,
              approvedOrRejectedDate: new Date().toISOString().slice(0, 10),
            };
          }
          return req;
        })
      );
      showToast({
        title: 'Leave Request Rejected',
        message: 'Leave application was rejected.',
        type: 'warning',
      });
    },
    [currentUserPersona.name, currentUserRole, addAuditLog, showToast]
  );

  const submitLeaveRequest = useCallback(
    (req: Omit<LeaveRequest, 'id' | 'orgId' | 'status' | 'appliedDate'>) => {
      const newLeave: LeaveRequest = {
        ...req,
        id: `leave-${Date.now()}`,
        orgId: currentOrgId === 'all' ? 'org-apex' : currentOrgId,
        status: 'Pending',
        appliedDate: new Date().toISOString().slice(0, 10),
      };
      setLeaveRequests((prev) => [newLeave, ...prev]);
      addAuditLog({
        orgId: newLeave.orgId,
        userName: newLeave.employeeName,
        userRole: 'Employee',
        action: 'Leave Request Submitted',
        module: 'leave',
        recordName: `${newLeave.employeeName} (${newLeave.leaveType})`,
        newValue: `Submitted for ${newLeave.days} days (${newLeave.startDate} to ${newLeave.endDate})`,
      });
      showToast({
        title: 'Leave Application Submitted',
        message: `Applied for ${newLeave.days} days of ${newLeave.leaveType}.`,
        type: 'success',
      });
    },
    [currentOrgId, addAuditLog, showToast]
  );

  // Notification actions
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    showToast({
      title: 'Notifications Cleared',
      message: 'All notifications marked as cleared.',
      type: 'info',
    });
  }, [showToast]);

  // Offline Sync Actions
  const toggleOfflineMode = useCallback(() => {
    setIsOfflineMode((prev) => {
      const next = !prev;
      showToast({
        title: next ? 'Field Offline Mode Activated' : 'Online Mode Restored',
        message: next ? 'Local storage caching active for GPS & attendance punches.' : 'Direct server synchronization re-enabled.',
        type: next ? 'warning' : 'success',
      });
      return next;
    });
  }, [showToast]);

  const syncOfflineQueue = useCallback(() => {
    const count = offlineSyncQueue.length;
    setOfflineSyncQueue([]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        orgId: currentOrgId,
        title: 'Offline Sync Completed',
        message: 'All cached field punches and offline records have been synchronized.',
        type: 'system',
        timestamp: 'Just now',
        isRead: false,
      },
      ...prev,
    ]);
    showToast({
      title: 'Sync Complete',
      message: `Successfully synchronized ${count} offline records with server.`,
      type: 'success',
    });
  }, [currentOrgId, offlineSyncQueue.length, showToast]);

  return (
    <HrmsContext.Provider
      value={{
        organizations,
        currentOrgId,
        currentOrg,
        switchOrganization,
        createOrganization,
        updateOrganization,
        toggleModuleAssignment,

        currentUserRole,
        currentUserPersona,
        allPersonas: INITIAL_USER_PERSONAS,
        switchRole,

        // Authentication & Session
        isAuthenticated,
        login,
        logout,

        employees: currentOrgEmployees,
        allEmployees: employees,
        departments: currentOrgId === 'all' ? departments : departments.filter((d) => d.orgId === currentOrgId),
        designations: currentOrgId === 'all' ? designations : designations.filter((d) => d.orgId === currentOrgId),
        shifts: currentOrgId === 'all' ? shifts : shifts.filter((s) => s.orgId === currentOrgId),
        addEmployee,
        updateEmployee,
        recordLifecycleEvent,
        addDepartment,

        salaryStructure,
        updateSalaryStructure,
        payrollRuns: currentOrgId === 'all' ? payrollRuns : payrollRuns.filter((r) => r.orgId === currentOrgId),
        payslips: currentOrgId === 'all' ? payslips : payslips.filter((p) => p.orgId === currentOrgId),
        advancePayrollStep,
        approvePayrollRun,
        disbursePayrollRun,

        attendanceRecords: currentOrgId === 'all' ? attendanceRecords : attendanceRecords.filter((a) => a.orgId === currentOrgId),
        regularizationRequests: currentOrgId === 'all' ? regularizationRequests : regularizationRequests.filter((r) => r.orgId === currentOrgId),
        todayUserRecord,
        clockIn,
        clockOut,
        submitRegularization,
        approveRegularization,
        rejectRegularization,
        updateGeofence,
        addGeofence,

        leaveRequests: currentOrgId === 'all' ? leaveRequests : leaveRequests.filter((l) => l.orgId === currentOrgId),
        allLeaveRequests: leaveRequests,
        approveLeaveRequest,
        rejectLeaveRequest,
        submitLeaveRequest,

        isAllOrgsSelected,

        goals: currentOrgId === 'all' ? goals : goals.filter((g) => g.orgId === currentOrgId),
        addGoal,
        updateGoalProgress,
        reviews: currentOrgId === 'all' ? reviews : reviews.filter((r) => r.orgId === currentOrgId),
        addReview,
        submitReviewFeedback,

        jobs: currentOrgId === 'all' ? jobs : jobs.filter((j) => j.orgId === currentOrgId),
        addJob,
        updateJobStatus,
        candidates: currentOrgId === 'all' ? candidates : candidates.filter((c) => c.orgId === currentOrgId),
        moveCandidateStage,
        addCandidate,
        interviews: currentOrgId === 'all' ? interviews : interviews.filter((i) => i.orgId === currentOrgId),
        scheduleInterview,
        submitInterviewFeedback,

        notifications: currentOrgId === 'all' ? notifications : notifications.filter((n) => n.orgId === currentOrgId),
        markNotificationRead,
        clearAllNotifications,
        auditLogs: currentOrgId === 'all' ? auditLogs : auditLogs.filter((a) => a.orgId === currentOrgId),
        addAuditLog,

        isOfflineMode,
        offlineSyncQueue,
        toggleOfflineMode,
        syncOfflineQueue,
        isFieldStaffModalOpen,
        setIsFieldStaffModalOpen,

        toasts,
        showToast,
        dismissToast,
        selectedEmployeeForDetail,
        setSelectedEmployeeForDetail,
        openEmployeeProfile,

        activeModule,
        setActiveModule,
        activeSubTab,
        setActiveSubTab,
        isModuleLoading,
        setIsModuleLoading,
        navigateTo,
        simulateDataRefresh,
        searchQuery,
        setSearchQuery,
        isExecutiveReportModalOpen,
        setIsExecutiveReportModalOpen,
      }}
    >
      {children}
    </HrmsContext.Provider>
  );
};

export const useHrms = () => {
  const context = useContext(HrmsContext);
  if (!context) {
    throw new Error('useHrms must be used within an HrmsProvider');
  }
  return context;
};
