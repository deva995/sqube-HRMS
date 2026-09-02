import { Router, Response } from 'express';
import { getRepository } from '../db/repository';
import { db } from '../db/store';
import { TenantIsolationError } from '../types';

const router = Router();

export interface TestCaseResult {
  suite: string;
  testName: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

/**
 * Runs the comprehensive Tenant Isolation Test Suite across all tenant tables
 */
export function runTenantIsolationTests(): { passed: boolean; results: TestCaseResult[]; summary: { total: number; passed: number; failed: number } } {
  const results: TestCaseResult[] = [];

  const orgAId = 'org-acro';
  const orgBId = 'org-zenith';

  const repoA = getRepository(orgAId, 'Admin');
  const repoB = getRepository(orgBId, 'Admin');

  // 1. Employee Isolation
  try {
    const empsA = repoA.getEmployees();
    const hasOrgBEmps = empsA.some((e) => e.orgId === orgBId);
    results.push({
      suite: 'Employee Isolation',
      testName: 'Org A employee query excludes Org B records',
      passed: !hasOrgBEmps && empsA.length > 0,
      expected: 'Only Org A employees returned',
      actual: `Returned ${empsA.length} employees, hasOrgB: ${hasOrgBEmps}`,
    });
  } catch (err: any) {
    results.push({
      suite: 'Employee Isolation',
      testName: 'Org A employee query excludes Org B records',
      passed: false,
      expected: 'Success without error',
      actual: err.message,
    });
  }

  // 2. Cross-Tenant Employee Read by ID (Must fail with 403 or return undefined/throw)
  try {
    const orgBEmployee = db.employees.find((e) => e.orgId === orgBId);
    if (orgBEmployee) {
      let threwViolation = false;
      try {
        repoA.getEmployeeById(orgBEmployee.id);
      } catch (err) {
        if (err instanceof TenantIsolationError) {
          threwViolation = true;
        }
      }
      results.push({
        suite: 'Employee Isolation',
        testName: 'Org A user reading Org B employee ID throws TenantIsolationError (403)',
        passed: threwViolation,
        expected: 'TenantIsolationError thrown',
        actual: threwViolation ? 'TenantIsolationError correctly raised' : 'Allowed cross-tenant read (Violation)',
      });
    }
  } catch (err: any) {
    results.push({
      suite: 'Employee Isolation',
      testName: 'Org A user reading Org B employee ID',
      passed: false,
      expected: 'TenantIsolationError',
      actual: err.message,
    });
  }

  // 3. Cross-Tenant Employee Mutation (Must fail)
  try {
    const orgBEmployee = db.employees.find((e) => e.orgId === orgBId);
    if (orgBEmployee) {
      let mutationBlocked = false;
      try {
        repoA.updateEmployee(orgBEmployee.id, { firstName: 'HackedName' });
      } catch (err) {
        if (err instanceof TenantIsolationError) {
          mutationBlocked = true;
        }
      }
      results.push({
        suite: 'Employee Mutation Isolation',
        testName: 'Org A user mutating Org B employee record throws TenantIsolationError (403)',
        passed: mutationBlocked,
        expected: 'TenantIsolationError thrown',
        actual: mutationBlocked ? 'Mutation successfully blocked' : 'Mutation allowed (CRITICAL FAILURE)',
      });
    }
  } catch (err: any) {
    results.push({
      suite: 'Employee Mutation Isolation',
      testName: 'Org A user mutating Org B employee record',
      passed: false,
      expected: 'Blocked',
      actual: err.message,
    });
  }

  // 4. Department & Shifts Isolation
  try {
    const deptsA = repoA.getDepartments();
    const hasOrgBDepts = deptsA.some((d) => d.orgId === orgBId);
    results.push({
      suite: 'Department Isolation',
      testName: 'Org A department list excludes Org B departments',
      passed: !hasOrgBDepts,
      expected: 'No Org B departments visible',
      actual: `Found ${deptsA.length} departments, hasOrgB: ${hasOrgBDepts}`,
    });
  } catch (err: any) {
    results.push({
      suite: 'Department Isolation',
      testName: 'Org A department list',
      passed: false,
      expected: 'Clean isolation',
      actual: err.message,
    });
  }

  // 5. Leave Request Approval Isolation
  try {
    const leaveA = repoA.createLeaveRequest({
      employeeId: 'emp-acro-104',
      employeeName: 'Sneha Patel',
      department: 'Engineering',
      leaveType: 'Sick Leave (SL)',
      startDate: '2026-09-15',
      endDate: '2026-09-16',
      days: 1,
      reason: 'Medical checkup',
      appliedDate: '2026-09-02',
    });

    let crossApprovalBlocked = false;
    try {
      repoB.updateLeaveRequestStatus(leaveA.id, 'Approved', 'Malicious Manager');
    } catch (err) {
      if (err instanceof TenantIsolationError) {
        crossApprovalBlocked = true;
      }
    }

    results.push({
      suite: 'Leave Approval Isolation',
      testName: 'Org B manager attempting to approve Org A leave request throws 403',
      passed: crossApprovalBlocked,
      expected: 'Cross-tenant approval blocked',
      actual: crossApprovalBlocked ? 'Approval blocked with 403' : 'Cross-tenant approval allowed (CRITICAL FAILURE)',
    });
  } catch (err: any) {
    results.push({
      suite: 'Leave Approval Isolation',
      testName: 'Org B approving Org A leave',
      passed: false,
      expected: 'Blocked',
      actual: err.message,
    });
  }

  // 6. Salary Structure & Payroll Isolation
  try {
    const structA = repoA.getSalaryStructures();
    const hasOrgBStruct = structA.some((s) => s.orgId === orgBId);
    results.push({
      suite: 'Payroll Compensation Isolation',
      testName: 'Org A salary structures exclude Org B structures',
      passed: !hasOrgBStruct,
      expected: 'Only Org A structures visible',
      actual: `Found ${structA.length} structures, hasOrgB: ${hasOrgBStruct}`,
    });
  } catch (err: any) {
    results.push({
      suite: 'Payroll Compensation Isolation',
      testName: 'Salary structure isolation',
      passed: false,
      expected: 'Clean isolation',
      actual: err.message,
    });
  }

  // 7. Module Enablement Enforcement
  try {
    // Org Zenith has 'recruitment' disabled by default
    const isRecruitmentEnabledForZenith = repoB.isModuleEnabled('recruitment');
    results.push({
      suite: 'Module Access Control',
      testName: 'Disabled module returns false in authorization check',
      passed: !isRecruitmentEnabledForZenith,
      expected: 'Recruitment module disabled for Org Zenith',
      actual: `isRecruitmentEnabledForZenith = ${isRecruitmentEnabledForZenith}`,
    });
  } catch (err: any) {
    results.push({
      suite: 'Module Access Control',
      testName: 'Disabled module check',
      passed: false,
      expected: 'Check completes',
      actual: err.message,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    passed: failedCount === 0,
    results,
    summary: {
      total: results.length,
      passed: passedCount,
      failed: failedCount,
    },
  };
}

/**
 * GET /api/v1/test-tenant-isolation
 * Dedicated endpoint for verifying tenant isolation test assertions
 */
router.get('/', (req, res) => {
  const testReport = runTenantIsolationTests();
  res.json({
    success: testReport.passed,
    data: testReport,
  });
});

export default router;
