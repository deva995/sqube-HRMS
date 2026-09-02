import bcrypt from 'bcryptjs';
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
  Role,
  ModuleId,
} from '../../src/types';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  orgId: string;
  employeeId?: string;
  avatar?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationModuleAssignment {
  id: string;
  orgId: string;
  moduleId: ModuleId;
  enabled: boolean;
  updatedAt: string;
}

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

// In-Memory Data Store (Provides real DB semantics, relational scoping, and persistence)
export class DatabaseStore {
  organizations: Organization[] = [];
  orgModules: OrganizationModuleAssignment[] = [];
  users: UserAccount[] = [];
  employees: Employee[] = [];
  departments: Department[] = [];
  designations: Designation[] = [];
  shifts: WorkShift[] = [];
  geofences: GeofenceLocation[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  regularizations: RegularizationRequest[] = [];
  leaveRequests: LeaveRequest[] = [];
  salaryStructures: (SalaryStructure & { effectiveFrom: string })[] = [];
  payrollRuns: (PayrollRun & { disclaimer?: string })[] = [];
  payslips: Payslip[] = [];
  goals: PerformanceGoal[] = [];
  reviews: PerformanceReview[] = [];
  jobs: JobPosting[] = [];
  candidates: Candidate[] = [];
  interviews: Interview[] = [];
  notifications: NotificationItem[] = [];
  auditLogs: AuditLogEntry[] = [];
  files: FileRecord[] = [];
  refreshTokens: Map<string, { userId: string; expiresAt: Date; isRevoked: boolean }> = new Map();
  passwordResetTokens: Map<string, { userId: string; expiresAt: Date; isUsed: boolean }> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const defaultPasswordHash = bcrypt.hashSync('demo123', 10);

    // 1. Organizations
    this.organizations = [
      {
        id: 'org-acro',
        name: 'Acro Corp Global',
        slug: 'acro-corp',
        industry: 'Information Technology & Cloud Services',
        employeeCount: 420,
        activeUsers: 395,
        status: 'Active',
        joinedDate: '2023-01-15',
        contactEmail: 'contact@acrocorp.com',
        billingPlan: 'Enterprise',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        enabledModules: ['hr', 'payroll', 'attendance', 'performance', 'recruitment'],
        geofences: [],
      },
      {
        id: 'org-zenith',
        name: 'Zenith Tech Labs',
        slug: 'zenith-tech',
        industry: 'FinTech & AI Research',
        employeeCount: 180,
        activeUsers: 172,
        status: 'Active',
        joinedDate: '2023-06-20',
        contactEmail: 'admin@zenithtech.io',
        billingPlan: 'Professional',
        logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&auto=format&fit=crop&q=80',
        enabledModules: ['hr', 'payroll', 'attendance'],
        geofences: [],
      },
      {
        id: 'org-apex',
        name: 'Apex Retail Solutions',
        slug: 'apex-retail',
        industry: 'Omnichannel E-Commerce',
        employeeCount: 650,
        activeUsers: 610,
        status: 'Active',
        joinedDate: '2022-11-05',
        contactEmail: 'hr@apexretail.com',
        billingPlan: 'Enterprise',
        logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&auto=format&fit=crop&q=80',
        enabledModules: ['hr', 'payroll', 'attendance', 'performance'],
        geofences: [],
      },
    ];

    // 2. Organization Modules (Super Admin Matrix)
    const allModuleIds: ModuleId[] = [
      'hr', 'payroll', 'attendance', 'performance', 'recruitment',
      'leave', 'ess', 'engagement', 'marketplace', 'expense'
    ];

    for (const org of this.organizations) {
      for (const modId of allModuleIds) {
        const isEnabled = org.enabledModules.includes(modId);
        this.orgModules.push({
          id: `mod-${org.id}-${modId}`,
          orgId: org.id,
          moduleId: modId,
          enabled: isEnabled,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 3. User Accounts with authentic bcrypt passwords
    this.users = [
      {
        id: 'usr-superadmin',
        email: 'superadmin@sqbehrms.com',
        passwordHash: defaultPasswordHash,
        name: 'Alex Vance',
        role: 'Super Admin',
        orgId: 'all',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        designation: 'Global Platform Director',
        department: 'Executive Governance',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'usr-admin-priya',
        email: 'priya.sharma@sqbehrms.com',
        passwordHash: defaultPasswordHash,
        name: 'Priya Sharma',
        role: 'Admin',
        orgId: 'org-acro',
        employeeId: 'emp-acro-101',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        designation: 'Head of Human Resources',
        department: 'Human Resources',
        isActive: true,
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'usr-mgr-vikram',
        email: 'vikram.aditya@sqbehrms.com',
        passwordHash: defaultPasswordHash,
        name: 'Vikram Aditya',
        role: 'Manager',
        orgId: 'org-acro',
        employeeId: 'emp-acro-102',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        designation: 'Engineering Manager',
        department: 'Engineering',
        isActive: true,
        createdAt: '2023-02-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'usr-lead-rohit',
        email: 'rohit.verma@sqbehrms.com',
        passwordHash: defaultPasswordHash,
        name: 'Rohit Verma',
        role: 'Team Lead',
        orgId: 'org-acro',
        employeeId: 'emp-acro-103',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        designation: 'Lead Frontend Architect',
        department: 'Engineering',
        isActive: true,
        createdAt: '2023-03-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'usr-exec-sneha',
        email: 'sneha.patel@sqbehrms.com',
        passwordHash: defaultPasswordHash,
        name: 'Sneha Patel',
        role: 'Executive',
        orgId: 'org-acro',
        employeeId: 'emp-acro-104',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        designation: 'Senior Software Engineer',
        department: 'Engineering',
        isActive: true,
        createdAt: '2023-04-10T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
      // Org Zenith User for tenant isolation test
      {
        id: 'usr-zenith-admin',
        email: 'admin@zenithtech.io',
        passwordHash: defaultPasswordHash,
        name: 'Kavita Rao',
        role: 'Admin',
        orgId: 'org-zenith',
        employeeId: 'emp-zenith-201',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        designation: 'VP People Operations',
        department: 'People Operations',
        isActive: true,
        createdAt: '2023-06-20T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    ];

    // 4. Employees
    this.employees = [
      {
        id: 'emp-acro-101',
        orgId: 'org-acro',
        employeeCode: 'EMP-101',
        firstName: 'Priya',
        lastName: 'Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        email: 'priya.sharma@sqbehrms.com',
        phone: '+91 98765 43210',
        department: 'Human Resources',
        designation: 'Head of Human Resources',
        employmentType: 'Full-Time',
        joiningDate: '2022-03-01',
        location: 'Bengaluru HQ',
        status: 'Active',
        annualCtc: 3200000,
        monthlyGross: 266667,
        documents: [
          { uploadDate: '2022-03-01', verified: true, fileName: 'Aadhaar_Card.pdf', type: 'Aadhaar' },
          { uploadDate: '2022-03-01', verified: true, fileName: 'PAN_Card.pdf', type: 'PAN Card' }
        ],
        history: [{ date: '2022-03-01', event: 'Joined as Senior HR Manager' }],
      },
      {
        id: 'emp-acro-102',
        orgId: 'org-acro',
        employeeCode: 'EMP-102',
        firstName: 'Vikram',
        lastName: 'Aditya',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        email: 'vikram.aditya@sqbehrms.com',
        phone: '+91 98765 43211',
        department: 'Engineering',
        designation: 'Engineering Manager',
        employmentType: 'Full-Time',
        joiningDate: '2021-06-15',
        location: 'Bengaluru HQ',
        status: 'Active',
        annualCtc: 4200000,
        monthlyGross: 350000,
        documents: [],
        history: [],
      },
      {
        id: 'emp-acro-103',
        orgId: 'org-acro',
        employeeCode: 'EMP-103',
        firstName: 'Rohit',
        lastName: 'Verma',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        email: 'rohit.verma@sqbehrms.com',
        phone: '+91 98765 43212',
        department: 'Engineering',
        designation: 'Lead Frontend Architect',
        employmentType: 'Full-Time',
        joiningDate: '2022-01-10',
        location: 'Bengaluru HQ',
        status: 'Active',
        annualCtc: 2800000,
        monthlyGross: 233333,
        documents: [],
        history: [],
      },
      {
        id: 'emp-acro-104',
        orgId: 'org-acro',
        employeeCode: 'EMP-104',
        firstName: 'Sneha',
        lastName: 'Patel',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        email: 'sneha.patel@sqbehrms.com',
        phone: '+91 98765 43213',
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        employmentType: 'Full-Time',
        joiningDate: '2023-05-02',
        location: 'Bengaluru HQ',
        status: 'Active',
        annualCtc: 1800000,
        monthlyGross: 150000,
        documents: [],
        history: [],
      },
      {
        id: 'emp-zenith-201',
        orgId: 'org-zenith',
        employeeCode: 'ZEN-201',
        firstName: 'Kavita',
        lastName: 'Rao',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        email: 'admin@zenithtech.io',
        phone: '+91 99887 76655',
        department: 'People Operations',
        designation: 'VP People Operations',
        employmentType: 'Full-Time',
        joiningDate: '2023-06-20',
        location: 'Hyderabad Tech Center',
        status: 'Active',
        annualCtc: 3600000,
        monthlyGross: 300000,
        documents: [],
        history: [],
      },
    ];

    // 5. Departments
    this.departments = [
      { id: 'dept-acro-eng', orgId: 'org-acro', name: 'Engineering', code: 'ENG', headEmployeeId: 'emp-acro-102', headName: 'Vikram Aditya', employeeCount: 180, budgetInr: 45000000 },
      { id: 'dept-acro-hr', orgId: 'org-acro', name: 'Human Resources', code: 'HR', headEmployeeId: 'emp-acro-101', headName: 'Priya Sharma', employeeCount: 22, budgetInr: 8000000 },
      { id: 'dept-acro-fin', orgId: 'org-acro', name: 'Finance & Accounts', code: 'FIN', headEmployeeId: '', headName: 'Rahul Mehra', employeeCount: 18, budgetInr: 6500000 },
      { id: 'dept-zenith-eng', orgId: 'org-zenith', name: 'Core AI Platform', code: 'AI-ENG', headEmployeeId: 'emp-zenith-201', headName: 'Kavita Rao', employeeCount: 95, budgetInr: 25000000 },
    ];

    // 6. Designations
    this.designations = [
      { id: 'desig-1', orgId: 'org-acro', title: 'Senior Software Engineer', department: 'Engineering', level: 'IC-3', minExperienceYears: 4 },
      { id: 'desig-2', orgId: 'org-acro', title: 'Lead Frontend Architect', department: 'Engineering', level: 'IC-5', minExperienceYears: 7 },
      { id: 'desig-3', orgId: 'org-acro', title: 'Engineering Manager', department: 'Engineering', level: 'M-1', minExperienceYears: 9 },
      { id: 'desig-4', orgId: 'org-acro', title: 'Head of Human Resources', department: 'Human Resources', level: 'DIR-1', minExperienceYears: 12 },
    ];

    // 7. Work Shifts
    this.shifts = [
      { id: 'shift-gen', orgId: 'org-acro', name: 'General Shift', startTime: '09:00', endTime: '18:00', graceMinutes: 15, breakDurationMinutes: 60, workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'shift-morn', orgId: 'org-acro', name: 'Early Morning Shift', startTime: '07:00', endTime: '16:00', graceMinutes: 10, breakDurationMinutes: 60, workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    ];

    // 8. Geofence Locations
    this.geofences = [
      {
        id: 'geo-blr-hq',
        orgId: 'org-acro',
        name: 'Bengaluru Innovation Tech Park HQ',
        address: 'Outer Ring Road, Bellandur, Bengaluru 560103',
        latitude: 12.9279,
        longitude: 77.6271,
        radiusMeters: 250,
        policy: 'Allow with Warning',
        isRemoteAllowed: true,
      },
      {
        id: 'geo-mum-hub',
        orgId: 'org-acro',
        name: 'Mumbai Financial Centre Hub',
        address: 'BKC, Bandra East, Mumbai 400051',
        latitude: 19.0657,
        longitude: 72.8687,
        radiusMeters: 200,
        policy: 'Strict Block',
        isRemoteAllowed: false,
      },
      {
        id: 'geo-hyd-lab',
        orgId: 'org-zenith',
        name: 'Hyderabad HITEC City Campus',
        address: 'HITEC City, Madhapur, Hyderabad 500081',
        latitude: 17.4474,
        longitude: 78.3762,
        radiusMeters: 300,
        policy: 'Allow with Warning',
        isRemoteAllowed: true,
      },
    ];

    // 9. Attendance Records
    this.attendanceRecords = [
      {
        id: 'att-104-today',
        orgId: 'org-acro',
        employeeId: 'emp-acro-104',
        employeeName: 'Sneha Patel',
        department: 'Engineering',
        date: new Date().toISOString().split('T')[0],
        clockInTime: '09:12:00',
        workHours: 8.5,
        totalWorkingHours: 8.5,
        status: 'Present',
        geofenceStatus: 'Inside Allowed Location',
        punchLocation: {
          latitude: 12.9281,
          longitude: 77.6273,
          accuracyMeters: 12,
          distanceFromOfficeMeters: 45,
          officeGeofenceName: 'Bengaluru Innovation Tech Park HQ',
          geofenceStatus: 'Inside Allowed Location',
          deviceInfo: 'Mozilla/5.0 (Client Simulator)',
        },
      },
    ];

    // 10. Leave Requests
    this.leaveRequests = [
      {
        id: 'leave-1',
        orgId: 'org-acro',
        employeeId: 'emp-acro-104',
        employeeName: 'Sneha Patel',
        department: 'Engineering',
        leaveType: 'Casual Leave (CL)',
        startDate: '2026-09-10',
        endDate: '2026-09-12',
        days: 2,
        reason: 'Attending family wedding ceremony',
        appliedDate: '2026-09-01',
        status: 'Pending',
      },
    ];

    // 11. Salary Structures with `effectiveFrom` versioning
    this.salaryStructures = [
      {
        id: 'sal-struct-acro-std',
        orgId: 'org-acro',
        name: 'Standard Corporate INR CTC Structure v2',
        description: 'Standard 40% Basic, 20% HRA, 30% Special Allowance with PF & ESI',
        basicPercentage: 40,
        hraPercentage: 20,
        specialAllowancePercentage: 30,
        conveyanceFixed: 1600,
        medicalAllowanceFixed: 1250,
        pfRate: 12,
        esiRate: 0.75,
        professionalTaxFixed: 200,
        isDefault: true,
        effectiveFrom: '2025-04-01T00:00:00.000Z',
      },
      {
        id: 'sal-struct-zenith-std',
        orgId: 'org-zenith',
        name: 'Zenith Tech Standard Structure v1',
        description: 'Standard technology compensation structure',
        basicPercentage: 45,
        hraPercentage: 22.5,
        specialAllowancePercentage: 25,
        conveyanceFixed: 2000,
        medicalAllowanceFixed: 1500,
        pfRate: 12,
        esiRate: 0.75,
        professionalTaxFixed: 200,
        isDefault: true,
        effectiveFrom: '2025-01-01T00:00:00.000Z',
      },
    ];

    // 12. Performance Goals & Reviews
    this.goals = [
      {
        id: 'goal-1',
        orgId: 'org-acro',
        employeeId: 'emp-acro-104',
        employeeName: 'Sneha Patel',
        department: 'Engineering',
        title: 'Refactor Core HR State Store to PostgreSQL Engine',
        description: 'Complete high-performance server-side data synchronization',
        targetMetric: '100% Endpoint Coverage',
        currentProgress: 85,
        weightage: 40,
        dueDate: '2026-09-30',
        priority: 'High',
        status: 'On Track',
        score: 4.5,
      },
    ];

    this.reviews = [
      {
        id: 'rev-1',
        orgId: 'org-acro',
        employeeId: 'emp-acro-104',
        employeeName: 'Sneha Patel',
        reviewerName: 'Vikram Aditya',
        department: 'Engineering',
        reviewCycle: 'FY26 Q2 Performance Cycle',
        rating: 4.6,
        currentStage: 'Manager Review',
        isCompleted: false,
        selfRating: 4.8,
        selfComments: 'Delivered all sprint features ahead of schedule.',
        managerRating: 4.5,
        managerComments: 'Exceptional architectural rigor and team collaboration.',
        finalRecommendation: 'Promote',
      },
    ];

    // 13. Recruitment Jobs & Candidates
    this.jobs = [
      {
        id: 'job-1',
        orgId: 'org-acro',
        title: 'Staff Full-Stack TypeScript Engineer',
        department: 'Engineering',
        location: 'Bengaluru HQ (Hybrid)',
        employmentType: 'Full-Time',
        experience: '6-9 Years',
        salaryRange: '₹30L - ₹42L CTC',
        description: 'Lead backend enterprise architecture and distributed systems.',
        skillsRequired: ['TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'React'],
        status: 'Published',
        openings: 2,
        appliedCount: 28,
        postedDate: '2026-08-15',
      },
    ];

    this.candidates = [
      {
        id: 'cand-1',
        orgId: 'org-acro',
        jobId: 'job-1',
        jobTitle: 'Staff Full-Stack TypeScript Engineer',
        name: 'Arjun Mehta',
        email: 'arjun.mehta@example.com',
        phone: '+91 98111 22334',
        currentCompany: 'FinTech Unlocked',
        experienceYears: 7.5,
        skills: ['Node.js', 'PostgreSQL', 'Express', 'React'],
        expectedSalaryInr: '₹36,00,000',
        noticePeriodDays: 30,
        location: 'Bengaluru',
        source: 'LinkedIn',
        stage: 'Technical Round',
        appliedDate: '2026-08-20',
        rating: 4.7,
      },
    ];

    // 14. Audit Logs
    this.auditLogs = [
      {
        id: 'audit-init-1',
        orgId: 'org-acro',
        timestamp: new Date().toISOString(),
        userName: 'Priya Sharma',
        userRole: 'Admin',
        action: 'INITIALIZE_TENANT_SCHEMA',
        module: 'system',
        recordName: 'Acro Corp Global Core Workspace',
        ipAddress: '127.0.0.1',
      },
    ];

    // 15. Notifications
    this.notifications = [
      {
        id: 'notif-1',
        orgId: 'org-acro',
        title: 'Payroll Calculation Ready for Review',
        message: 'Monthly payroll run draft for August 2026 is ready for review and approval.',
        type: 'payroll',
        timestamp: '10 minutes ago',
        isRead: false,
      },
    ];
  }
}

// Export singleton database instance
export const db = new DatabaseStore();
