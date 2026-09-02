import { Employee, SalaryStructure, Payslip, PayrollRun } from '../../src/types';
import { TenantScopedRepository } from '../db/repository';

export const ILLUSTRATIVE_PAYROLL_DISCLAIMER =
  'Sqbe HRMS Payroll Engine (v1 illustrative calculation). Statutory computations for EPF, ESI, Professional Tax, and TDS are calculated based on standard enterprise rules and percentage slabs for illustrative organizational purposes.';

export interface CalculationResult {
  payrollRun: PayrollRun & { disclaimer: string };
  payslips: Payslip[];
  summary: {
    totalEmployees: number;
    totalGrossPay: number;
    totalDeductions: number;
    totalTaxes: number;
    totalNetPay: number;
  };
}

/**
 * Server-Side Payroll Calculation Engine (Async with PostgreSQL Prisma)
 */
export async function calculateMonthlyPayroll(
  repo: TenantScopedRepository,
  monthYear: string,
  targetEmployeeIds?: string[]
): Promise<CalculationResult> {
  const targetDate = new Date(`${monthYear}-01T00:00:00.000Z`);
  const activeStructure = await repo.getActiveSalaryStructure(isNaN(targetDate.getTime()) ? new Date() : targetDate);

  const allEmployees = await repo.getEmployees();
  let employeeList = allEmployees.filter((e) => e.status === 'Active' || e.status === 'Probation');
  if (targetEmployeeIds && targetEmployeeIds.length > 0) {
    employeeList = employeeList.filter((e) => targetEmployeeIds.includes(e.id));
  }

  const runId = `pr-${Date.now().toString(36)}`;
  const payslips: Payslip[] = [];

  let sumGross = 0;
  let sumDeductions = 0;
  let sumTaxes = 0;
  let sumNet = 0;

  for (const emp of employeeList) {
    const annualCtc = emp.annualCtc || (emp.salary ? emp.salary * 12 : 1200000);
    const monthlyGross = Math.round(annualCtc / 12);

    // Earnings breakdown according to active SalaryStructure
    const basicSalary = Math.round((monthlyGross * activeStructure.basicPercentage) / 100);
    const hra = Math.round((monthlyGross * activeStructure.hraPercentage) / 100);
    const specialAllowance = Math.max(0, monthlyGross - basicSalary - hra);
    const bonusOrIncentive = 0;
    const grossEarnings = basicSalary + hra + specialAllowance + bonusOrIncentive;

    // Deductions according to active SalaryStructure
    const pfBase = Math.min(basicSalary, 15000);
    const providentFund = Math.round((pfBase * activeStructure.pfRate) / 100);
    const esi = grossEarnings <= 21000 ? Math.round((grossEarnings * activeStructure.esiRate) / 100) : 0;
    const professionalTax = activeStructure.professionalTaxFixed || 200;

    // TDS estimate
    let tdsIncomeTax = 0;
    if (annualCtc > 1200000) {
      tdsIncomeTax = Math.round(grossEarnings * 0.12);
    } else if (annualCtc > 700000) {
      tdsIncomeTax = Math.round(grossEarnings * 0.05);
    }

    const totalDeductions = providentFund + esi + professionalTax + tdsIncomeTax;
    const netSalary = Math.max(0, grossEarnings - totalDeductions);

    sumGross += grossEarnings;
    sumDeductions += totalDeductions;
    sumTaxes += tdsIncomeTax;
    sumNet += netSalary;

    payslips.push({
      id: `ps-${runId}-${emp.id}`,
      payrollRunId: runId,
      orgId: emp.orgId,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`.trim(),
      employeeCode: emp.employeeCode,
      designation: emp.designation,
      department: emp.department,
      bankName: emp.bankDetails?.bankName || 'HDFC Bank Corporate',
      maskedAccount: emp.bankDetails?.maskedAccountNumber || '•••• 4821',
      monthYear,
      workingDays: 30,
      daysPresent: 28,
      paidLeaves: 2,
      lossOfPayDays: 0,
      basicSalary,
      hra,
      specialAllowance,
      bonusOrIncentive,
      grossEarnings,
      providentFund,
      esi,
      professionalTax,
      tdsIncomeTax,
      totalDeductions,
      netSalary,
      generatedDate: new Date().toISOString().split('T')[0],
    });
  }

  const payrollRun: PayrollRun & { disclaimer: string } = {
    id: runId,
    orgId: activeStructure.orgId,
    monthYear,
    status: 'Calculated',
    totalEmployees: employeeList.length,
    processedEmployees: employeeList.length,
    totalGrossPay: sumGross,
    totalDeductions: sumDeductions,
    totalTaxes: sumTaxes,
    totalNetPay: sumNet,
    processedDate: new Date().toISOString().split('T')[0],
    currentStep: 3,
    disclaimer: ILLUSTRATIVE_PAYROLL_DISCLAIMER,
  };

  return {
    payrollRun,
    payslips,
    summary: {
      totalEmployees: employeeList.length,
      totalGrossPay: sumGross,
      totalDeductions: sumDeductions,
      totalTaxes: sumTaxes,
      totalNetPay: sumNet,
    },
  };
}
