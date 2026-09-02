/**
 * Sqbe HRMS - Core Type Definitions
 * Note: All types define data models for the enterprise cloud HRMS platform.
 */

export type Role = 
  | 'Super Admin'
  | 'Admin'
  | 'Org Admin'
  | 'Manager'
  | 'Team Lead'
  | 'Executive'
  | 'Employee'
  | 'HR Manager'
  | 'Payroll Manager'
  | 'Recruiter';

export type ModuleId =
  | 'hr'
  | 'payroll'
  | 'attendance'
  | 'performance'
  | 'recruitment'
  | 'leave'
  | 'ess'
  | 'engagement'
  | 'marketplace'
  | 'expense';

export type ActivityCategory = 'hr' | 'payroll' | 'attendance' | 'performance' | 'recruitment' | 'leave' | 'system' | 'security';

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  category: 'Core' | 'Operations' | 'Growth' | 'Add-on';
  description: string;
  icon: string;
  isFullyImplemented: boolean;
  comingSoonBadge?: boolean;
}

export const ALL_MODULES: ModuleDefinition[] = [
  {
    id: 'hr',
    name: 'HR Core & Directory',
    category: 'Core',
    description: 'Complete employee lifecycle, org structure, document repository, and headcount analytics.',
    icon: 'Users',
    isFullyImplemented: true,
  },
  {
    id: 'payroll',
    name: 'Payroll & Statutory',
    category: 'Core',
    description: 'Multi-step salary calculation, statutory deductions preview, approval workflows, and PDF payslips.',
    icon: 'IndianRupee',
    isFullyImplemented: true,
  },
  {
    id: 'attendance',
    name: 'Attendance & Geofencing',
    category: 'Operations',
    description: 'Real-time GPS geofenced clock-in, shift management, biometric simulation, and regularization.',
    icon: 'MapPin',
    isFullyImplemented: true,
  },
  {
    id: 'performance',
    name: 'Performance & OKRs',
    category: 'Growth',
    description: 'Goal management, OKR tracking, 5-stage 360 review workflows, and high-performer analytics.',
    icon: 'TrendingUp',
    isFullyImplemented: true,
  },
  {
    id: 'recruitment',
    name: 'Recruitment & ATS',
    category: 'Growth',
    description: 'Job postings, visual candidate hiring pipelines, scorecards, and automated interview scheduling.',
    icon: 'Briefcase',
    isFullyImplemented: true,
  },
  {
    id: 'leave',
    name: 'Leave Management',
    category: 'Operations',
    description: 'Statutory leave quotas, holiday calendar, multi-tier approval workflows, and leave analytics.',
    icon: 'CalendarDays',
    isFullyImplemented: true,
  },
  {
    id: 'ess',
    name: 'Employee Self Service',
    category: 'Core',
    description: 'Self-service dashboard for attendance punches, payslip downloads, leave applications, and goal progress.',
    icon: 'UserCheck',
    isFullyImplemented: true,
  },
  {
    id: 'expense',
    name: 'Expense Claims',
    category: 'Operations',
    description: 'Reimbursement tracking, receipt uploads, approval workflows, and finance disbursal.',
    icon: 'Receipt',
    isFullyImplemented: true,
  },
  {
    id: 'engagement',
    name: 'Engagement & Kudos',
    category: 'Growth',
    description: 'Company-wide announcements, peer recognition kudos badges, and social feedback feed.',
    icon: 'HeartHandshake',
    isFullyImplemented: true,
  },
  {
    id: 'marketplace',
    name: 'Integration Marketplace',
    category: 'Add-on',
    description: 'Connect Slack, Jira, GitHub, Zoho, Google Workspace, and biometric devices seamlessly.',
    icon: 'Boxes',
    isFullyImplemented: true,
  },
];

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  employeeCount: number;
  activeUsers: number;
  status: 'Active' | 'Inactive' | 'Trial';
  joinedDate: string;
  contactEmail: string;
  billingPlan: 'Enterprise' | 'Professional' | 'Growth';
  logoUrl?: string;
  enabledModules: ModuleId[];
  geofences: GeofenceLocation[];
}

export interface GeofenceLocation {
  id: string;
  orgId?: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  policy: 'Block' | 'Allow with Warning' | 'Allow with Approval Required' | 'Strict Block' | 'Manager Approval Required';
  isRemoteAllowed?: boolean;
}

export type Geofence = GeofenceLocation;

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern' | string;
export type EmploymentStatus = 'Active' | 'On Leave' | 'Notice Period' | 'Terminated' | 'Probation' | string;

export interface DocumentItem {
  id?: string;
  name?: string;
  title?: string;
  type?: 'Aadhaar' | 'PAN Card' | 'Offer Letter' | 'Degree Certificate' | 'NDA' | 'Passport' | string;
  fileName?: string;
  uploadDate: string;
  size?: string;
  verified: boolean;
  fileKey?: string;
}

export interface LifecycleEvent {
  id?: string;
  employeeId?: string;
  type?: 'Onboarding' | 'Promotion' | 'Transfer' | 'Role Change' | 'Department Change' | 'Resignation' | 'Exit' | string;
  date: string;
  title?: string;
  event?: string;
  actor?: string;
  description?: string;
  previousValue?: string;
  newValue?: string;
  approvedBy?: string;
}

export interface Employee {
  id: string;
  orgId: string;
  employeeCode: string;
  name?: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  department: string;
  designation: string;
  managerId?: string;
  managerName?: string;
  reportingManager?: string;
  employmentType: EmploymentType;
  joiningDate: string;
  workLocation?: string;
  location?: string;
  status: EmploymentStatus;
  
  // Salary representation
  salary?: number;
  annualCtc: number;
  monthlyGross?: number;
  
  // Bank details (Masked strictly for demo safety)
  bankDetails?: {
    bankName: string;
    maskedAccountNumber: string; // e.g. "•••• 4821"
    ifscCode: string;
  };
  
  documents: DocumentItem[];
  history?: LifecycleEvent[];
  lifecycleHistory?: LifecycleEvent[];
  shiftId?: string;
  performanceRating?: number;
}

export interface Department {
  id: string;
  orgId: string;
  name: string;
  code: string;
  headEmployeeId: string;
  headName: string;
  employeeCount: number;
  budgetInr: number;
}

export interface Designation {
  id: string;
  orgId: string;
  title: string;
  department: string;
  level: string; // e.g., "IC-3", "IC-5", "M-1", "DIR-1"
  minExperienceYears: number;
}

export interface WorkShift {
  id: string;
  orgId: string;
  name: string;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  graceMinutes: number; // 15 mins
  breakDurationMinutes: number; // 60 mins
  workingDays: string[]; // ["Monday", "Tuesday", ...]
}

export interface PunchLocationTelemetry {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  distanceFromOfficeMeters: number;
  officeGeofenceName: string;
  geofenceStatus: string;
  deviceInfo?: string;
  simulatedBiometricScore?: number;
  isBiometricSimulated?: boolean;
}

export interface AttendanceRecord {
  id: string;
  orgId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // "YYYY-MM-DD"
  clockInTime?: string; // "09:02:14"
  clockOutTime?: string; // "18:15:30"
  workHours?: number;
  totalWorkingHours?: number;
  overtimeHours?: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave' | string;
  geofenceStatus?: string;
  breakMinutes?: number;
  punchLocation?: PunchLocationTelemetry;
  withinGeofence?: boolean;
  distanceMeters?: number;
  verifiedAt?: string;
}

export interface RegularizationRequest {
  id: string;
  orgId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  reason: string;
  requestedClockIn?: string;
  requestedClockOut?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverRole?: Role;
  approverName?: string;
  comment?: string;
  appliedDate?: string;
}

export interface LeaveRequest {
  id: string;
  orgId: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  leaveType: 'Earned Leave (EL)' | 'Casual Leave (CL)' | 'Sick Leave (SL)' | 'Maternity / Paternity' | 'Comp Off' | string;
  type?: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverName?: string;
  approverRole?: Role;
  approvedOrRejectedDate?: string;
}

export interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  pending: number;
  available: number;
  icon?: string;
}

export interface SalaryStructure {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  basicPercentage: number;          // 40% of CTC
  hraPercentage: number;            // 20% of CTC
  specialAllowancePercentage: number; // balancing allowance (~30%)
  conveyanceFixed: number;          // 1,600 INR/month
  medicalAllowanceFixed: number;    // 1,250 INR/month
  pfRate: number;                   // 12% on Basic capped at standard slabs
  esiRate: number;                  // 0.75% of Gross if Gross <= 21,000
  professionalTaxFixed: number;     // 200 INR/month standard
  isDefault?: boolean;
}

export interface PayrollRun {
  id: string;
  orgId: string;
  monthYear: string; // "August 2026" or "2026-08"
  month?: string;
  year?: number;
  status: 'Draft' | 'Calculating' | 'Calculated' | 'Review' | 'Approved' | 'Disbursed';
  totalEmployees: number;
  processedEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalTaxes?: number;
  totalNetPay: number;
  processedDate?: string;
  approvedBy?: string;
  currentStep?: number;
  disclaimer?: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  orgId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  bankName: string;
  maskedAccount: string;
  monthYear: string;
  workingDays: number;
  daysPresent: number;
  paidLeaves: number;
  lossOfPayDays: number;
  
  // Earnings
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  bonusOrIncentive: number;
  grossEarnings: number;
  
  // Deductions
  providentFund: number;
  esi: number;
  professionalTax: number;
  tdsIncomeTax: number;
  totalDeductions: number;
  
  netSalary: number;
  pdfFileKey?: string;
  generatedDate: string;
}

export interface PerformanceGoal {
  id: string;
  orgId: string;
  employeeId?: string;
  employeeName: string;
  department?: string;
  title: string;
  description?: string;
  category?: 'Individual' | 'Team' | 'Department' | 'OKR' | string;
  type?: string;
  targetMetric: string;
  progress?: number;
  currentProgress?: number;
  weightage: number;
  startDate?: string;
  dueDate: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed' | string;
  score?: number;
}

export type Goal = PerformanceGoal;

export type ReviewStage = 'Self' | 'Manager' | 'Peer' | 'HR' | 'Final' | 'Self Evaluation' | 'Manager Review' | 'Peer Feedback' | 'HR Calibration' | 'Final Score Published' | string;

export interface PerformanceReview {
  id: string;
  orgId: string;
  employeeId?: string;
  employeeName: string;
  reviewerName?: string;
  cycle?: string;
  rating?: number;
  feedback?: string;
  department?: string;
  reviewCycle?: string;
  currentStage?: ReviewStage;
  stage?: string;
  isCompleted?: boolean;
  
  selfRating?: number;
  selfComments?: string;
  
  managerRating?: number;
  managerComments?: string;
  managerStrengths?: string;
  managerImprovements?: string;
  
  peerRating?: number;
  peerComments?: string;
  
  hrRating?: number;
  hrComments?: string;
  
  finalScore?: number;
  finalRecommendation?: 'Promote' | 'Salary Revision' | 'Retain & Train' | 'Performance Plan' | 'Exceeds Expectations' | string;
  updatedAt?: string;
}

export type Review = PerformanceReview;

export type CandidateStage = 
  | 'Applied'
  | 'Screening'
  | 'Shortlisted'
  | 'Interview'
  | 'Technical'
  | 'Technical Round'
  | 'HR Round'
  | 'Offer'
  | 'Offer Extended'
  | 'Offered'
  | 'Hired'
  | 'Rejected';

export interface JobPosting {
  id: string;
  orgId: string;
  title: string;
  department: string;
  location: string;
  employmentType?: EmploymentType;
  experience?: string;
  experienceRange?: string;
  salaryRange?: string;
  salaryRangeInr?: string;
  description?: string;
  skillsRequired?: string[];
  qualifications?: string;
  hiringManager?: string;
  status: 'Published' | 'Draft' | 'Closed' | string;
  openings?: number;
  openPositions?: number;
  applicantsCount?: number;
  appliedCount?: number;
  postedDate?: string;
  createdDate?: string;
}

export type Job = JobPosting;

export interface Candidate {
  id: string;
  orgId: string;
  jobId?: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  currentCompany: string;
  experience?: string;
  experienceYears?: number;
  skills?: string[];
  expectedSalaryInr?: string;
  noticePeriodDays?: number;
  location?: string;
  source?: 'LinkedIn' | 'Referral' | 'Naukri' | 'Direct Career Page' | 'Agency' | string;
  stage: CandidateStage;
  resumeFileKey?: string;
  resumeFileName?: string;
  appliedDate?: string;
  rating?: number;
  notes?: string;
  roleApplied?: string;
  matchScore?: number;
  avatar?: string;
}

export interface Interview {
  id: string;
  orgId: string;
  candidateId?: string;
  candidateName: string;
  jobTitle?: string;
  round?: string;
  roundName?: string;
  roundType?: 'Screening Call' | 'Technical Round 1' | 'System Design' | 'HR Culture Fit' | 'Leadership' | string;
  interviewerName: string;
  scheduledAt?: string;
  scheduledDateTime?: string;
  date?: string;
  time?: string;
  mode?: string;
  durationMinutes?: number;
  meetingLink?: string;
  feedback?: string;
  score?: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled' | string;
}

// -------------------------------------------------------------
// EXPENSE MANAGEMENT TYPES
// -------------------------------------------------------------
export type ExpenseCategory = 'Travel' | 'Meals & Entertainment' | 'Software & Tools' | 'Office Supplies' | 'Medical' | 'Training & Certs' | 'Other';
export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected' | 'Reimbursed';

export interface ExpenseClaim {
  id: string;
  orgId: string;
  employeeId: string;
  employeeName: string;
  category: ExpenseCategory | string;
  amount: number;
  currency: string;
  date: string;
  merchant: string;
  description: string;
  receiptUrl?: string;
  receiptFileKey?: string;
  status: ExpenseStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// ENGAGEMENT TYPES
// -------------------------------------------------------------
export interface EngagementAnnouncement {
  id: string;
  orgId: string;
  title: string;
  content: string;
  category: 'General' | 'Townhall' | 'Milestone' | 'Policy' | 'Celebration' | string;
  authorName: string;
  authorAvatar?: string;
  pinned: boolean;
  likesCount: number;
  publishedAt: string;
  createdAt: string;
}

export interface EngagementRecognition {
  id: string;
  orgId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  badge: 'Team Player' | 'Innovation Hero' | 'Customer Champion' | 'Star Performer' | 'Helping Hand' | string;
  message: string;
  createdAt: string;
}

// -------------------------------------------------------------
// MARKETPLACE TYPES
// -------------------------------------------------------------
export interface MarketplaceApp {
  id: string;
  name: string;
  slug: string;
  category: 'Communication' | 'Productivity' | 'Developer Tools' | 'Compliance' | 'Payments' | 'Identity' | string;
  description: string;
  developer: string;
  icon: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  pricing: string;
  isPopular: boolean;
  installed?: boolean;
}

export interface NotificationItem {
  id: string;
  orgId: string;
  title: string;
  message: string;
  type: 'payroll' | 'attendance' | 'review' | 'recruitment' | 'approval' | 'system';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  orgId: string;
  timestamp: string;
  userName: string;
  userRole: Role;
  action: string;
  module: ModuleId | 'admin' | 'auth' | string;
  recordName: string;
  previousValue?: string;
  newValue?: string;
  ipAddress: string;
}

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgId: string;
  avatar: string;
  department: string;
  designation: string;
  tierNumber?: string; // "1.", "2.", "3.1", "3.2", "3.3"
  tierLabel?: string; // "1. Super admin", "2. Admin", "3.1 Manager", etc.
  category?: 'Super Admin' | 'Admin' | 'Employee';
  description?: string;
  capabilities?: string[];
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
