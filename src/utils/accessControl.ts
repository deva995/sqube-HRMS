import { Role, ModuleId } from '../types';

/**
 * Access Control Utility
 * 
 * =========================================================================================
 * ACCESS CONTROL POLICY ENGINE:
 * Role-Based Access Control (RBAC) permission definitions and matrix.
 * Switching roles dynamically toggles persona views and module accessibility.
 * =========================================================================================
 */

export const ROLE_PERMISSIONS: Record<Role, {
  canManageOrgs: boolean;
  canAssignModules: boolean;
  canApprovePayroll: boolean;
  canProcessPayroll: boolean;
  canManageEmployees: boolean;
  canReviewCandidates: boolean;
  canConductInterviews: boolean;
  canApproveAttendance: boolean;
  canManageGeofences: boolean;
  canPerformFinalReview: boolean;
  canViewSystemAudit: boolean;
}> = {
  'Super Admin': {
    canManageOrgs: true,
    canAssignModules: true,
    canApprovePayroll: true,
    canProcessPayroll: true,
    canManageEmployees: true,
    canReviewCandidates: true,
    canConductInterviews: true,
    canApproveAttendance: true,
    canManageGeofences: true,
    canPerformFinalReview: true,
    canViewSystemAudit: true,
  },
  'Admin': {
    canManageOrgs: false,
    canAssignModules: true,
    canApprovePayroll: true,
    canProcessPayroll: true,
    canManageEmployees: true,
    canReviewCandidates: true,
    canConductInterviews: true,
    canApproveAttendance: true,
    canManageGeofences: true,
    canPerformFinalReview: true,
    canViewSystemAudit: true,
  },
  'Org Admin': {
    canManageOrgs: false,
    canAssignModules: true,
    canApprovePayroll: true,
    canProcessPayroll: true,
    canManageEmployees: true,
    canReviewCandidates: true,
    canConductInterviews: true,
    canApproveAttendance: true,
    canManageGeofences: true,
    canPerformFinalReview: true,
    canViewSystemAudit: true,
  },
  'Manager': {
    canManageOrgs: false,
    canAssignModules: false,
    canApprovePayroll: false,
    canProcessPayroll: false,
    canManageEmployees: false,
    canReviewCandidates: true,
    canConductInterviews: true,
    canApproveAttendance: true,
    canManageGeofences: false,
    canPerformFinalReview: true,
    canViewSystemAudit: false,
  },
  'Team Lead': {
    canManageOrgs: false,
    canAssignModules: false,
    canApprovePayroll: false,
    canProcessPayroll: false,
    canManageEmployees: false,
    canReviewCandidates: false,
    canConductInterviews: true,
    canApproveAttendance: true,
    canManageGeofences: false,
    canPerformFinalReview: false,
    canViewSystemAudit: false,
  },
  'Executive': {
    canManageOrgs: false,
    canAssignModules: false,
    canApprovePayroll: false,
    canProcessPayroll: false,
    canManageEmployees: false,
    canReviewCandidates: false,
    canConductInterviews: false,
    canApproveAttendance: false,
    canManageGeofences: false,
    canPerformFinalReview: false,
    canViewSystemAudit: false,
  },
  'Employee': {
    canManageOrgs: false,
    canAssignModules: false,
    canApprovePayroll: false,
    canProcessPayroll: false,
    canManageEmployees: false,
    canReviewCandidates: false,
    canConductInterviews: false,
    canApproveAttendance: false,
    canManageGeofences: false,
    canPerformFinalReview: false,
    canViewSystemAudit: false,
  },
  'HR Manager': {
    canManageOrgs: false,
    canAssignModules: false,
    canApprovePayroll: false,
    canProcessPayroll: true,
    canManageEmployees: true,
    canReviewCandidates: true,
    canConductInterviews: true,
    canApproveAttendance: true,
    canManageGeofences: true,
    canPerformFinalReview: true,
    canViewSystemAudit: false,
  },
  'Payroll Manager': {
    canManageOrgs: false,
    canAssignModules: false,
    canApprovePayroll: true,
    canProcessPayroll: true,
    canManageEmployees: false,
    canReviewCandidates: false,
    canConductInterviews: false,
    canApproveAttendance: false,
    canManageGeofences: false,
    canPerformFinalReview: false,
    canViewSystemAudit: false,
  },
  'Recruiter': {
    canManageOrgs: false,
    canAssignModules: false,
    canApprovePayroll: false,
    canProcessPayroll: false,
    canManageEmployees: false,
    canReviewCandidates: true,
    canConductInterviews: true,
    canApproveAttendance: false,
    canManageGeofences: false,
    canPerformFinalReview: false,
    canViewSystemAudit: false,
  },
};

/**
 * Checks if a given role is allowed to perform an action (UI gating only)
 */
export function hasPermission(
  role: Role,
  permission: keyof typeof ROLE_PERMISSIONS['Super Admin']
): boolean {
  return !!ROLE_PERMISSIONS[role]?.[permission];
}

/**
 * Check if the active organization has the module enabled in in-memory state
 */
export function isModuleEnabledForOrg(
  moduleId: ModuleId,
  enabledModules: ModuleId[]
): boolean {
  return enabledModules.includes(moduleId);
}
