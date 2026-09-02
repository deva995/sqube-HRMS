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

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  category: 'Core' | 'Operations' | 'Growth' | 'Add-on';
  description: string;
  icon: string;
  isFullyImplemented: boolean;
  comingSoonBadge?: boolean;
}

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
  budgetInr: number | string;
}

export interface Designation {
  id: string;
  orgId: string;
  title: string;
  department: string;
  level: string;
  minExperienceYears: number;
}

export interface WorkShift {
  id: string;
  orgId: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  breakDurationMinutes: number;
  workingDays: string[];
}

export interface AttendanceRecord {
  id: string;
  orgId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  clockInTime?: string;
  clockOutTime?: string;
  workHours?: number;
  totalWorkingHours?: number;
  overtimeHours?: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave' | 'Holiday' | string;
  geofenceStatus?: string;
  breakMinutes?: number;
  
  // Location & Geofence metrics
  withinGeofence?: boolean;
  distanceMeters?: number;
  verifiedAt?: string;
  punchLocation?: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    distanceFromOfficeMeters: number;
    officeGeofenceName: string;
    geofenceStatus: 'Inside Allowed Location' | 'Outside Authorized Location' | 'Location Unavailable' | string;
    deviceInfo: string;
    isBiometricSimulated?: boolean;
    isOfflineSync?: boolean;
  };
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
}

export type LeaveType = 
  | 'Earned Leave (EL)'
  | 'Casual Leave (CL)'
  | 'Sick Leave (SL)'
  | 'Maternity / Paternity'
  | 'Comp Off';

export interface LeaveRequest {
  id: string;
  orgId: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  leaveType: LeaveType;
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

export type ActivityCategory = 'leave' | 'payroll' | 'recruitment' | 'lifecycle' | 'attendance' | 'system';

export interface ActivityItem {
  id: string;
  orgId: string;
  orgName?: string;
  category: ActivityCategory;
  title: string;
  description: string;
  timestamp: string;
  rawDate: string;
  status?: string;
  statusBadgeColor?: string;
  actorName?: string;
  actorRole?: string;
  actorAvatar?: string;
  actionUrl?: { module: string; subTab?: string };
  actionLabel?: string;
  isPendingAction?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  metaDetails?: Record<string, any>;
}

export interface SalaryStructure {
  id: string;
  orgId: string;
  name: string;
  description: string;
  basicPercentage: number;
  hraPercentage: number;
  specialAllowancePercentage: number;
  conveyanceFixed: number;
  medicalAllowanceFixed: number;
  pfRate: number;
  esiRate: number;
  professionalTaxFixed: number;
  isDefault: boolean;
  effectiveFrom?: string; // Versioning timestamp for historical accuracy
}

export interface PayrollRun {
  id: string;
  orgId: string;
  month?: string;
  monthYear: string;
  status: 'Draft' | 'Attendance Verified' | 'Calculated' | 'Pending Approval' | 'Approved' | 'Disbursed' | string;
  totalEmployees?: number;
  processedEmployees?: number;
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
  category?: 'Individual' | 'Team' | 'Department' | 'OKR';
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
  resumeFileName?: string;
  appliedDate?: string;
  rating?: number;
  notes?: string;
}

export interface Interview {
  id: string;
  orgId: string;
  candidateId?: string;
  candidateName: string;
  jobTitle?: string;
  round?: string;
  roundType?: 'Screening Call' | 'Technical Round 1' | 'System Design' | 'HR Culture Fit' | 'Leadership' | string;
  interviewerName: string;
  scheduledAt?: string;
  scheduledDateTime?: string;
  durationMinutes?: number;
  meetingLink?: string;
  feedback?: string;
  score?: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled' | string;
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

