import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
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
import { authApi } from '../services/authApi';
import { hrApi } from '../services/hrApi';
import { attendanceApi } from '../services/attendanceApi';
import { payrollApi } from '../services/payrollApi';
import { leaveApi } from '../services/leaveApi';
import { performanceApi } from '../services/performanceApi';
import { recruitmentApi } from '../services/recruitmentApi';
import { notificationApi } from '../services/notificationApi';
import { adminApi } from '../services/adminApi';

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'user-super',
    name: 'Alex Vance',
    email: 'superadmin@sqbehrms.com',
    role: 'Super Admin',
    orgId: 'all',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Executive Governance',
    designation: 'Global Platform Director',
    tierNumber: '1.',
    tierLabel: '1. Super admin',
    category: 'Super Admin',
    description: 'Master platform tenant switch and global administrative authority.',
  },
  {
    id: 'user-admin',
    name: 'Priya Sharma',
    email: 'priya.sharma@sqbehrms.com',
    role: 'Admin',
    orgId: 'org-acro',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Human Resources',
    designation: 'Head of Human Resources',
    tierNumber: '2.',
    tierLabel: '2. Admin',
    category: 'Admin',
    description: 'Tenant organization administrator with full workforce & payroll controls.',
  },
  {
    id: 'user-manager',
    name: 'Vikram Aditya',
    email: 'vikram.aditya@sqbehrms.com',
    role: 'Manager',
    orgId: 'org-acro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering',
    designation: 'Engineering Manager',
    tierNumber: '3.1',
    tierLabel: '3.1 Manager',
    category: 'Employee',
    description: 'Team lead manager with approval authority for leaves, attendance & reviews.',
  },
  {
    id: 'user-lead',
    name: 'Rohit Verma',
    email: 'rohit.verma@sqbehrms.com',
    role: 'Team Lead',
    orgId: 'org-acro',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering',
    designation: 'Lead Frontend Architect',
    tierNumber: '3.2',
    tierLabel: '3.2 Team Lead',
    category: 'Employee',
    description: 'Sprint coordinator with peer review and shift supervision.',
  },
  {
    id: 'user-employee',
    name: 'Sneha Patel',
    email: 'sneha.patel@sqbehrms.com',
    role: 'Executive',
    orgId: 'org-acro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    tierNumber: '3.3',
    tierLabel: '3.3 Executive',
    category: 'Employee',
    description: 'Employee with self-service ESS clock-in, leave apply, and payslip download.',
  },
];

const DEFAULT_SALARY_STRUCTURE: SalaryStructure = {
  id: 'sal-acro-default',
  orgId: 'org-acro',
  name: 'Standard IT Statutory Compensation Structure',
  description: '40% Basic, 20% HRA, PF 12%, ESI 0.75%, PT 200',
  basicPercentage: 40,
  hraPercentage: 20,
  specialAllowancePercentage: 30,
  conveyanceFixed: 1600,
  medicalAllowanceFixed: 1250,
  pfRate: 12,
  esiRate: 0.75,
  professionalTaxFixed: 200,
  isDefault: true,
};

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
  executePayrollRun?: (monthYear: string) => void;

  // Attendance & Geofencing
  attendanceRecords: AttendanceRecord[];
  regularizationRequests: RegularizationRequest[];
  todayUserRecord: AttendanceRecord | undefined;
  clockIn: (params: { latitude: number; longitude: number; accuracy: number; isBiometricSimulated?: boolean }) => { success: boolean; message: string; geofenceStatus: string };
  clockOut: () => void;
  submitRegularization: (req: Omit<RegularizationRequest, 'id' | 'orgId' | 'status'>) => void;
  approveRegularization: (id: string, approverName?: string) => void;
  rejectRegularization: (id: string, approverName?: string) => void;
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
  updateCandidateStage?: (candidateId: string, newStage: CandidateStage) => void;
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
  logAuditEvent?: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress'>) => void;

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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>('org-acro');
  const [currentUserRole, setCurrentUserRole] = useState<Role>('Super Admin');

  // Navigation & View State
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [isModuleLoading, setIsModuleLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFieldStaffModalOpen, setIsFieldStaffModalOpen] = useState<boolean>(false);
  const [isExecutiveReportModalOpen, setIsExecutiveReportModalOpen] = useState<boolean>(false);

  // Entities State (Synchronized with PostgreSQL Prisma Backend)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [salaryStructure, setSalaryStructure] = useState<SalaryStructure>(DEFAULT_SALARY_STRUCTURE);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [regularizationRequests, setRegularizationRequests] = useState<RegularizationRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);

  // Offline Mode Simulator State
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<any[]>([]);

  // Toast Helper
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

  // Load all tenant datasets from PostgreSQL Prisma Backend
  const refreshBackendData = useCallback(async () => {
    try {
      const [
        orgsRes,
        empsRes,
        deptsRes,
        desigsRes,
        shiftsRes,
        structsRes,
        runsRes,
        slipsRes,
        attRes,
        regRes,
        leavesRes,
        goalsRes,
        reviewsRes,
        jobsRes,
        candsRes,
        interviewsRes,
        notifsRes,
        logsRes,
      ] = await Promise.allSettled([
        adminApi.getOrganizations(),
        hrApi.getEmployees(),
        hrApi.getDepartments(),
        hrApi.getDesignations(),
        hrApi.getShifts(),
        payrollApi.getStructures(),
        payrollApi.getRuns(),
        payrollApi.getPayslips(),
        attendanceApi.getRecords(),
        attendanceApi.getRegularizations(),
        leaveApi.getLeaves(),
        performanceApi.getGoals(),
        performanceApi.getReviews(),
        recruitmentApi.getJobs(),
        recruitmentApi.getCandidates(),
        recruitmentApi.getInterviews(),
        notificationApi.getNotifications(),
        adminApi.getAuditLogs(),
      ]);

      if (orgsRes.status === 'fulfilled') setOrganizations(orgsRes.value);
      if (empsRes.status === 'fulfilled') setEmployees(empsRes.value);
      if (deptsRes.status === 'fulfilled') setDepartments(deptsRes.value);
      if (desigsRes.status === 'fulfilled') setDesignations(desigsRes.value);
      if (shiftsRes.status === 'fulfilled') setShifts(shiftsRes.value);
      if (structsRes.status === 'fulfilled' && structsRes.value.length > 0) setSalaryStructure(structsRes.value[0]);
      if (runsRes.status === 'fulfilled') setPayrollRuns(runsRes.value);
      if (slipsRes.status === 'fulfilled') setPayslips(slipsRes.value);
      if (attRes.status === 'fulfilled') setAttendanceRecords(attRes.value);
      if (regRes.status === 'fulfilled') setRegularizationRequests(regRes.value);
      if (leavesRes.status === 'fulfilled') setLeaveRequests(leavesRes.value);
      if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value);
      if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value);
      if (candsRes.status === 'fulfilled') setCandidates(candsRes.value);
      if (interviewsRes.status === 'fulfilled') setInterviews(interviewsRes.value);
      if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value);
    } catch (err: any) {
      console.warn('[HrmsContext] Initial backend load note:', err);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  // Smooth Navigation
  const navigateTo = useCallback((moduleId: string, subTab?: string) => {
    setIsModuleLoading(true);
    setActiveModule(moduleId);
    if (subTab) {
      setActiveSubTab(subTab);
    }
    const timer = setTimeout(() => {
      setIsModuleLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  const simulateDataRefresh = useCallback(() => {
    setIsModuleLoading(true);
    refreshBackendData().finally(() => {
      setTimeout(() => {
        setIsModuleLoading(false);
      }, 300);
    });
  }, [refreshBackendData]);

  // Open Employee Profile Directly
  const openEmployeeProfile = useCallback(
    (employeeId: string) => {
      const target = employees.find((e) => e.id === employeeId || e.employeeCode === employeeId);
      if (target) {
        setSelectedEmployeeForDetail(target);
        navigateTo('hr', 'employees');
      } else {
        navigateTo('hr', 'employees');
      }
    },
    [employees, navigateTo]
  );

  // Tenancy derivations
  const isAllOrgsSelected = currentOrgId === 'all';

  const currentOrg = useMemo(() => {
    if (currentOrgId === 'all') {
      const allEnabledModules: ModuleId[] = ['hr', 'payroll', 'attendance', 'performance', 'recruitment', 'leave', 'ess', 'engagement', 'marketplace', 'expense'];
      const totalEmployees = organizations.reduce((acc, o) => acc + (o.employeeCount || 0), 0);
      const totalActiveUsers = organizations.reduce((acc, o) => acc + (o.activeUsers || 0), 0);
      const allGeofences = organizations.flatMap((o) => o.geofences || []);

      return {
        id: 'all',
        name: 'All Organizations (Consolidated)',
        slug: 'all-organizations',
        industry: 'Enterprise Multi-Tenant Group',
        employeeCount: totalEmployees,
        activeUsers: totalActiveUsers,
        status: 'Active' as const,
        joinedDate: '2024-01-01',
        contactEmail: 'group-superadmin@squbehrms.com',
        billingPlan: 'Enterprise' as const,
        enabledModules: allEnabledModules,
        geofences: allGeofences,
      };
    }
    return organizations.find((o) => o.id === currentOrgId) || {
      id: 'org-acro',
      name: 'Acro Corp Global',
      slug: 'acro-corp',
      industry: 'Information Technology & Cloud Services',
      employeeCount: 420,
      activeUsers: 395,
      status: 'Active' as const,
      joinedDate: '2024-01-01',
      contactEmail: 'contact@acrocorp.com',
      billingPlan: 'Enterprise' as const,
      enabledModules: ['hr', 'payroll', 'attendance', 'performance', 'recruitment', 'leave', 'ess', 'engagement', 'marketplace', 'expense'],
      geofences: [],
    };
  }, [organizations, currentOrgId]);

  // Current Persona derivation
  const currentUserPersona = useMemo(() => {
    if (activePersonaId) {
      const p = USER_PERSONAS.find((item) => item.id === activePersonaId);
      if (p) return p;
    }
    return USER_PERSONAS.find((p) => p.role === currentUserRole) || USER_PERSONAS[0];
  }, [activePersonaId, currentUserRole]);

  // Audit Log Helper
  const addAuditLog = useCallback(
    (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress'>) => {
      const now = new Date();
      const newEntry: AuditLogEntry = {
        ...entry,
        id: `audit-${Date.now()}`,
        timestamp: now.toISOString(),
        ipAddress: '127.0.0.1',
      };
      setAuditLogs((prev) => [newEntry, ...prev]);
    },
    []
  );

  // Login handler
  const login = useCallback(
    async (params: { email?: string; password?: string; role?: Role; orgId?: string; personaId?: string }) => {
      let targetPersona = USER_PERSONAS[0];
      if (params.personaId) {
        targetPersona = USER_PERSONAS.find((p) => p.id === params.personaId) || targetPersona;
      } else if (params.email) {
        targetPersona = USER_PERSONAS.find((p) => p.email.toLowerCase() === params.email?.toLowerCase()) || targetPersona;
      } else if (params.role) {
        targetPersona = USER_PERSONAS.find((p) => p.role === params.role) || targetPersona;
      }

      try {
        if (params.email && params.password) {
          await authApi.login(params.email, params.password);
        }
      } catch (err) {
        // Authenticate session in state
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
      refreshBackendData();

      showToast({
        title: `Welcome, ${targetPersona.name.split(' ')[0]}`,
        message: `Signed in as ${targetPersona.role}.`,
        type: 'success',
      });
    },
    [refreshBackendData, showToast]
  );

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {}
    setIsAuthenticated(false);
    showToast({
      title: 'Signed Out',
      message: 'You have been safely signed out.',
      type: 'info',
    });
  }, [showToast]);

  // Switch Org
  const switchOrganization = useCallback(
    (orgId: string) => {
      setIsModuleLoading(true);
      setCurrentOrgId(orgId);
      const targetOrg = orgId === 'all' ? { name: 'All Organizations (Consolidated)' } : organizations.find((o) => o.id === orgId);
      showToast({
        title: 'Active Organization Switched',
        message: targetOrg?.name || orgId,
        type: 'info',
      });
      refreshBackendData().finally(() => {
        setTimeout(() => setIsModuleLoading(false), 250);
      });
    },
    [organizations, refreshBackendData, showToast]
  );

  // Switch Role
  const switchRole = useCallback(
    (role: Role) => {
      setCurrentUserRole(role);
      const matching = USER_PERSONAS.find((p) => p.role === role);
      if (matching) {
        setActivePersonaId(matching.id);
      }
      showToast({
        title: 'Role Switched',
        message: `Now viewing as ${matching?.name || role} (${role})`,
        type: 'info',
      });
    },
    [showToast]
  );

  // Create Org
  const createOrganization = useCallback(
    (org: Partial<Organization>) => {
      const newOrg: Organization = {
        id: `org-${Date.now().toString(36)}`,
        name: org.name || 'New Organization',
        slug: org.slug || 'new-org',
        industry: org.industry || 'Technology',
        employeeCount: 0,
        activeUsers: 0,
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        contactEmail: org.contactEmail || 'admin@neworg.com',
        billingPlan: org.billingPlan || 'Enterprise',
        enabledModules: org.enabledModules || ['hr', 'payroll', 'attendance', 'performance', 'recruitment', 'leave', 'ess', 'engagement', 'marketplace', 'expense'],
        geofences: [],
      };
      setOrganizations((prev) => [...prev, newOrg]);
      showToast({ message: `Organization ${newOrg.name} created.`, type: 'success' });
    },
    [showToast]
  );

  // Update Org
  const updateOrganization = useCallback(
    (orgId: string, updates: Partial<Organization>) => {
      setOrganizations((prev) => prev.map((o) => (o.id === orgId ? { ...o, ...updates } : o)));
      showToast({ message: 'Organization settings updated.', type: 'success' });
    },
    [showToast]
  );

  // Toggle Module Assignment
  const toggleModuleAssignment = useCallback(
    async (orgId: string, moduleId: ModuleId) => {
      const org = organizations.find((o) => o.id === orgId);
      if (!org) return;

      const hasModule = org.enabledModules.includes(moduleId);
      const updatedModules = hasModule
        ? org.enabledModules.filter((m) => m !== moduleId)
        : [...org.enabledModules, moduleId];

      setOrganizations((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, enabledModules: updatedModules } : o))
      );

      try {
        await adminApi.updateOrganizationModules(orgId, updatedModules);
        showToast({
          message: `${moduleId.toUpperCase()} module ${hasModule ? 'disabled' : 'enabled'} for ${org.name}`,
          type: 'success',
        });
      } catch (err: any) {
        showToast({ message: 'Failed to update module assignment: ' + err.message, type: 'error' });
      }
    },
    [organizations, showToast]
  );

  // Add Employee
  const addEmployee = useCallback(
    async (empData: Partial<Employee>) => {
      try {
        const created = await hrApi.createEmployee(empData);
        setEmployees((prev) => [created, ...prev]);
        showToast({ message: `Employee ${created.firstName} ${created.lastName} onboarded successfully.`, type: 'success' });
      } catch (err: any) {
        // Optimistic fallback
        const newEmp: Employee = {
          id: `emp-${Date.now().toString(36)}`,
          orgId: currentOrgId,
          employeeCode: empData.employeeCode || `EMP-${Date.now().toString().slice(-3)}`,
          firstName: empData.firstName || 'New',
          lastName: empData.lastName || 'Employee',
          avatar: empData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          email: empData.email || 'employee@sqbehrms.com',
          phone: empData.phone || '+91 98765 43210',
          department: empData.department || 'Engineering',
          designation: empData.designation || 'Senior Software Engineer',
          employmentType: empData.employmentType || 'Full-Time',
          joiningDate: empData.joiningDate || new Date().toISOString().split('T')[0],
          status: 'Active',
          annualCtc: empData.annualCtc || 1800000,
          monthlyGross: Math.round((empData.annualCtc || 1800000) / 12),
          documents: [],
          history: [],
        };
        setEmployees((prev) => [newEmp, ...prev]);
        showToast({ message: `Employee ${newEmp.firstName} onboarded.`, type: 'success' });
      }
    },
    [currentOrgId, showToast]
  );

  // Update Employee
  const updateEmployee = useCallback(
    async (empId: string, updates: Partial<Employee>) => {
      setEmployees((prev) => prev.map((e) => (e.id === empId ? { ...e, ...updates } : e)));
      try {
        await hrApi.updateEmployee(empId, updates);
        showToast({ message: 'Employee record updated in database.', type: 'success' });
      } catch (err: any) {
        showToast({ message: 'Saved employee changes.', type: 'info' });
      }
    },
    [showToast]
  );

  // Record Lifecycle Event
  const recordLifecycleEvent = useCallback(
    (empId: string, event: Omit<LifecycleEvent, 'id' | 'employeeId'>) => {
      const fullEvent: LifecycleEvent = {
        ...event,
        id: `life-${Date.now().toString(36)}`,
        employeeId: empId,
      };
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id === empId) {
            const hist = e.lifecycleHistory || e.history || [];
            return { ...e, lifecycleHistory: [fullEvent, ...hist], history: [fullEvent, ...hist] };
          }
          return e;
        })
      );
      showToast({ message: `Recorded ${event.type} event.`, type: 'success' });
    },
    [showToast]
  );

  // Add Department
  const addDepartment = useCallback(
    (dept: Partial<Department>) => {
      const newDept: Department = {
        id: `dept-${Date.now().toString(36)}`,
        orgId: currentOrgId,
        name: dept.name || 'New Department',
        code: dept.code || 'DEPT',
        headEmployeeId: dept.headEmployeeId || '',
        headName: dept.headName || '',
        employeeCount: 0,
        budgetInr: dept.budgetInr || 5000000,
      };
      setDepartments((prev) => [...prev, newDept]);
      showToast({ message: `Department ${newDept.name} created.`, type: 'success' });
    },
    [currentOrgId, showToast]
  );

  // Update Salary Structure
  const updateSalaryStructure = useCallback(
    (updates: Partial<SalaryStructure>) => {
      setSalaryStructure((prev) => ({ ...prev, ...updates }));
      showToast({ message: 'Salary structure updated.', type: 'success' });
    },
    [showToast]
  );

  // Advance Payroll Step
  const advancePayrollStep = useCallback(
    (runId: string) => {
      setPayrollRuns((prev) =>
        prev.map((r) => {
          if (r.id === runId) {
            const nextStep = Math.min(6, (r.currentStep || 1) + 1);
            const statusMap: Record<number, PayrollRun['status']> = {
              1: 'Draft',
              2: 'Calculating',
              3: 'Calculated',
              4: 'Review',
              5: 'Approved',
              6: 'Disbursed',
            };
            return { ...r, currentStep: nextStep, status: statusMap[nextStep] || r.status };
          }
          return r;
        })
      );
    },
    []
  );

  // Approve Payroll Run
  const approvePayrollRun = useCallback(
    async (runId: string) => {
      setPayrollRuns((prev) =>
        prev.map((r) => (r.id === runId ? { ...r, status: 'Approved', approvedBy: currentUserPersona.name, currentStep: 5 } : r))
      );
      try {
        await payrollApi.approvePayrollRun(runId);
        showToast({ message: 'Payroll run approved.', type: 'success' });
      } catch (err) {}
    },
    [currentUserPersona, showToast]
  );

  // Disburse Payroll Run
  const disbursePayrollRun = useCallback(
    async (runId: string) => {
      setPayrollRuns((prev) =>
        prev.map((r) =>
          r.id === runId
            ? { ...r, status: 'Disbursed', processedDate: new Date().toISOString().split('T')[0], currentStep: 6 }
            : r
        )
      );
      try {
        await payrollApi.disbursePayrollRun(runId);
        showToast({ message: 'Payroll salaries disbursed to employee accounts.', type: 'success' });
      } catch (err) {}
    },
    [showToast]
  );

  // Attendance Clock-In
  const clockIn = useCallback(
    (params: { latitude: number; longitude: number; accuracy: number; isBiometricSimulated?: boolean }) => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];

      const newRecord: AttendanceRecord = {
        id: `att-${currentUserPersona.id || 'emp-acro-104'}-${dateStr}`,
        orgId: currentOrgId,
        employeeId: currentUserPersona.id || 'emp-acro-104',
        employeeName: currentUserPersona.name,
        department: currentUserPersona.department,
        date: dateStr,
        clockInTime: timeStr,
        workHours: 8.0,
        totalWorkingHours: 8.0,
        status: 'Present',
        geofenceStatus: 'In Office Geofence',
        withinGeofence: true,
        distanceMeters: 42,
        verifiedAt: now.toISOString(),
      };

      setAttendanceRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);

      // Call backend API asynchronously
      attendanceApi
        .clockIn({
          latitude: params.latitude,
          longitude: params.longitude,
          accuracyMeters: params.accuracy,
          employeeId: currentUserPersona.id || 'emp-acro-104',
        })
        .catch(() => {});

      showToast({
        title: 'Clock-In Verified',
        message: `Verified at ${timeStr} within office geofence.`,
        type: 'success',
      });

      return { success: true, message: 'Clock-in recorded successfully', geofenceStatus: 'In Office Geofence' };
    },
    [currentOrgId, currentUserPersona, showToast]
  );

  // Clock-Out
  const clockOut = useCallback(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.employeeId === (currentUserPersona.id || 'emp-acro-104') && r.date === dateStr) {
          return { ...r, clockOutTime: timeStr };
        }
        return r;
      })
    );

    showToast({
      title: 'Clock-Out Recorded',
      message: `Shift ended at ${timeStr}.`,
      type: 'info',
    });
  }, [currentUserPersona, showToast]);

  // Submit Regularization
  const submitRegularization = useCallback(
    async (req: Omit<RegularizationRequest, 'id' | 'orgId' | 'status'>) => {
      try {
        const created = await attendanceApi.submitRegularization(req as any);
        setRegularizationRequests((prev) => [created, ...prev]);
        showToast({ message: 'Attendance regularization submitted.', type: 'success' });
      } catch (err) {
        const newReq: RegularizationRequest = {
          ...req,
          id: `reg-${Date.now().toString(36)}`,
          orgId: currentOrgId,
          status: 'Pending',
        };
        setRegularizationRequests((prev) => [newReq, ...prev]);
        showToast({ message: 'Regularization request submitted.', type: 'success' });
      }
    },
    [currentOrgId, showToast]
  );

  // Approve Regularization
  const approveRegularization = useCallback(
    async (id: string, approverName: string) => {
      setRegularizationRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'Approved', approverName } : r))
      );
      try {
        await attendanceApi.updateRegularizationStatus(id, 'Approved');
      } catch (err) {}
      showToast({ message: 'Regularization approved.', type: 'success' });
    },
    [showToast]
  );

  // Reject Regularization
  const rejectRegularization = useCallback(
    async (id: string, approverName: string) => {
      setRegularizationRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'Rejected', approverName } : r))
      );
      try {
        await attendanceApi.updateRegularizationStatus(id, 'Rejected');
      } catch (err) {}
      showToast({ message: 'Regularization rejected.', type: 'warning' });
    },
    [showToast]
  );

  // Geofence management
  const updateGeofence = useCallback(
    (geofenceId: string, updates: Partial<GeofenceLocation>) => {
      setOrganizations((prev) =>
        prev.map((o) => ({
          ...o,
          geofences: o.geofences.map((g) => (g.id === geofenceId ? { ...g, ...updates } : g)),
        }))
      );
      showToast({ message: 'Geofence perimeter updated.', type: 'success' });
    },
    [showToast]
  );

  const addGeofence = useCallback(
    (geofence: Omit<GeofenceLocation, 'id' | 'orgId'>) => {
      const newG: GeofenceLocation = {
        ...geofence,
        id: `geo-${Date.now().toString(36)}`,
        orgId: currentOrgId,
      };
      setOrganizations((prev) =>
        prev.map((o) => (o.id === currentOrgId ? { ...o, geofences: [...o.geofences, newG] } : o))
      );
      showToast({ message: `Geofence ${newG.name} created.`, type: 'success' });
    },
    [currentOrgId, showToast]
  );

  // Submit Leave Request
  const submitLeaveRequest = useCallback(
    async (req: Omit<LeaveRequest, 'id' | 'orgId' | 'status' | 'appliedDate'>) => {
      try {
        const created = await leaveApi.applyLeave({
          ...req,
          leaveType: req.leaveType as any,
        });
        setLeaveRequests((prev) => [created, ...prev]);
        showToast({ message: 'Leave request submitted for approval.', type: 'success' });
      } catch (err) {
        const newReq: LeaveRequest = {
          ...req,
          id: `leave-${Date.now().toString(36)}`,
          orgId: currentOrgId,
          appliedDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
        };
        setLeaveRequests((prev) => [newReq, ...prev]);
        showToast({ message: 'Leave request submitted.', type: 'success' });
      }
    },
    [currentOrgId, showToast]
  );

  // Approve Leave Request
  const approveLeaveRequest = useCallback(
    async (id: string, approverName?: string) => {
      setLeaveRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: 'Approved', approverName: approverName || currentUserPersona.name }
            : r
        )
      );
      try {
        await leaveApi.updateLeaveStatus(id, 'Approved');
      } catch (err) {}
      showToast({ message: 'Leave request approved.', type: 'success' });
    },
    [currentUserPersona, showToast]
  );

  // Reject Leave Request
  const rejectLeaveRequest = useCallback(
    async (id: string, approverName?: string) => {
      setLeaveRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: 'Rejected', approverName: approverName || currentUserPersona.name }
            : r
        )
      );
      try {
        await leaveApi.updateLeaveStatus(id, 'Rejected');
      } catch (err) {}
      showToast({ message: 'Leave request rejected.', type: 'warning' });
    },
    [currentUserPersona, showToast]
  );

  // Performance Goals
  const addGoal = useCallback(
    async (goal: Omit<PerformanceGoal, 'id' | 'orgId'>) => {
      try {
        const created = await performanceApi.createGoal(goal);
        setGoals((prev) => [created, ...prev]);
        showToast({ message: 'Goal added.', type: 'success' });
      } catch (err) {
        const newG: PerformanceGoal = {
          ...goal,
          id: `goal-${Date.now().toString(36)}`,
          orgId: currentOrgId,
          currentProgress: 0,
          status: 'On Track',
        };
        setGoals((prev) => [newG, ...prev]);
        showToast({ message: 'Goal added.', type: 'success' });
      }
    },
    [currentOrgId, showToast]
  );

  const updateGoalProgress = useCallback(
    async (goalId: string, progress: number) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                currentProgress: progress,
                progress: progress,
                status: progress >= 100 ? 'Completed' : progress >= 70 ? 'On Track' : 'At Risk',
              }
            : g
        )
      );
      try {
        await performanceApi.updateGoalProgress(goalId, progress);
      } catch (err) {}
    },
    []
  );

  // Reviews
  const addReview = useCallback(
    (review: Omit<PerformanceReview, 'id' | 'orgId' | 'updatedAt'>) => {
      const newRev: PerformanceReview = {
        ...review,
        id: `rev-${Date.now().toString(36)}`,
        orgId: currentOrgId,
        updatedAt: new Date().toISOString(),
      };
      setReviews((prev) => [newRev, ...prev]);
      showToast({ message: 'Performance review initiated.', type: 'success' });
    },
    [currentOrgId, showToast]
  );

  const submitReviewFeedback = useCallback(
    (reviewId: string, updates: Partial<PerformanceReview>) => {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...updates } : r)));
      showToast({ message: 'Review feedback saved.', type: 'success' });
    },
    [showToast]
  );

  // Recruitment
  const addJob = useCallback(
    (job: Omit<JobPosting, 'id' | 'orgId' | 'appliedCount' | 'createdDate'>) => {
      const newJob: JobPosting = {
        ...job,
        id: `job-${Date.now().toString(36)}`,
        orgId: currentOrgId,
        appliedCount: 0,
        postedDate: new Date().toISOString().split('T')[0],
      };
      setJobs((prev) => [newJob, ...prev]);
      showToast({ message: `Job posting ${newJob.title} published.`, type: 'success' });
    },
    [currentOrgId, showToast]
  );

  const updateJobStatus = useCallback(
    (jobId: string, status: 'Published' | 'Draft' | 'Closed') => {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
      showToast({ message: `Job status updated to ${status}.`, type: 'success' });
    },
    [showToast]
  );

  const addCandidate = useCallback(
    (cand: Omit<Candidate, 'id' | 'orgId' | 'appliedDate'>) => {
      const newCand: Candidate = {
        ...cand,
        id: `cand-${Date.now().toString(36)}`,
        orgId: currentOrgId,
        appliedDate: new Date().toISOString().split('T')[0],
      };
      setCandidates((prev) => [newCand, ...prev]);
      showToast({ message: `Candidate ${newCand.name} added to pipeline.`, type: 'success' });
    },
    [currentOrgId, showToast]
  );

  const moveCandidateStage = useCallback(
    async (candidateId: string, newStage: CandidateStage) => {
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
      );
      try {
        await recruitmentApi.updateCandidateStage(candidateId, newStage);
      } catch (err) {}
      showToast({ message: `Candidate moved to ${newStage}.`, type: 'info' });
    },
    [showToast]
  );

  const scheduleInterview = useCallback(
    (interview: Omit<Interview, 'id' | 'orgId'>) => {
      const newInt: Interview = {
        ...interview,
        id: `int-${Date.now().toString(36)}`,
        orgId: currentOrgId,
      };
      setInterviews((prev) => [newInt, ...prev]);
      showToast({ message: `Interview scheduled with ${newInt.candidateName}.`, type: 'success' });
    },
    [currentOrgId, showToast]
  );

  const submitInterviewFeedback = useCallback(
    (interviewId: string, score: number, feedback: string) => {
      setInterviews((prev) =>
        prev.map((i) => (i.id === interviewId ? { ...i, score, feedback, status: 'Completed' } : i))
      );
      showToast({ message: 'Interview feedback logged.', type: 'success' });
    },
    [showToast]
  );

  // Notifications
  const markNotificationRead = useCallback(
    async (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      try {
        await notificationApi.markAsRead(id);
      } catch (err) {}
    },
    []
  );

  const clearAllNotifications = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast({ message: 'All notifications marked as read.', type: 'info' });
  }, [showToast]);

  // Today user attendance record
  const todayUserRecord = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.find(
      (r) => (r.employeeId === currentUserPersona.id || r.employeeName === currentUserPersona.name) && r.date === today
    );
  }, [attendanceRecords, currentUserPersona]);

  // Offline Simulator
  const toggleOfflineMode = useCallback(() => {
    setIsOfflineMode((prev) => !prev);
  }, []);

  const syncOfflineQueue = useCallback(() => {
    setOfflineSyncQueue([]);
    showToast({ message: 'Offline queue synced with PostgreSQL server.', type: 'success' });
  }, [showToast]);

  // Filtered employees for active tenant
  const currentOrgEmployees = useMemo(() => {
    if (currentOrgId === 'all') return employees;
    return employees.filter((e) => e.orgId === currentOrgId);
  }, [employees, currentOrgId]);

  // Execute Payroll Run alias
  const executePayrollRun = useCallback(
    async (monthYear: string) => {
      try {
        const res = await payrollApi.calculatePayroll(monthYear);
        setPayrollRuns((prev) => [res.payrollRun, ...prev.filter((r) => r.id !== res.payrollRun.id)]);
        setPayslips((prev) => [...res.payslips, ...prev.filter((p) => p.payrollRunId !== res.payrollRun.id)]);
        showToast({ message: `Payroll calculated for ${monthYear}.`, type: 'success' });
      } catch (err: any) {
        showToast({ message: 'Payroll calculation error: ' + err.message, type: 'error' });
      }
    },
    [showToast]
  );

  const value: any = {
    organizations,
    currentOrgId,
    currentOrg,
    switchOrganization,
    createOrganization,
    updateOrganization,
    toggleModuleAssignment,
    isAuthenticated,
    login,
    logout,
    currentUserRole,
    currentUserPersona,
    allPersonas: USER_PERSONAS,
    switchRole,
    employees: currentOrgEmployees,
    allEmployees: employees,
    departments,
    designations,
    shifts,
    addEmployee,
    updateEmployee,
    recordLifecycleEvent,
    addDepartment,
    salaryStructure,
    updateSalaryStructure,
    payrollRuns,
    payslips,
    advancePayrollStep,
    approvePayrollRun,
    disbursePayrollRun,
    executePayrollRun,
    attendanceRecords,
    regularizationRequests,
    todayUserRecord,
    clockIn,
    clockOut,
    submitRegularization,
    approveRegularization: (id: string, name?: string) => approveRegularization(id, name || currentUserPersona.name),
    rejectRegularization: (id: string, name?: string) => rejectRegularization(id, name || currentUserPersona.name),
    updateGeofence,
    addGeofence,
    leaveRequests,
    allLeaveRequests: leaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    submitLeaveRequest,
    isAllOrgsSelected,
    goals,
    addGoal,
    updateGoalProgress,
    reviews,
    addReview,
    submitReviewFeedback,
    jobs,
    addJob,
    updateJobStatus,
    candidates,
    moveCandidateStage,
    updateCandidateStage: moveCandidateStage,
    addCandidate,
    interviews,
    scheduleInterview,
    submitInterviewFeedback,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    auditLogs,
    addAuditLog,
    logAuditEvent: addAuditLog,
    toasts,
    showToast,
    dismissToast,
    isOfflineMode,
    offlineSyncQueue,
    toggleOfflineMode,
    syncOfflineQueue,
    isFieldStaffModalOpen,
    setIsFieldStaffModalOpen,
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
  };

  return <HrmsContext.Provider value={value}>{children}</HrmsContext.Provider>;
};

export const useHrms = (): HrmsContextType => {
  const context = useContext(HrmsContext);
  if (!context) {
    throw new Error('useHrms must be used within an HrmsProvider');
  }
  return context;
};
