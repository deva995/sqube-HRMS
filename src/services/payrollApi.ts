import { api } from './api';
import { SalaryStructure, PayrollRun, Payslip } from '../types';

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

export const payrollApi = {
  getStructures: async (): Promise<SalaryStructure[]> => {
    return api.get<SalaryStructure[]>('/payroll/structures');
  },

  getRuns: async (): Promise<PayrollRun[]> => {
    return api.get<PayrollRun[]>('/payroll/runs');
  },

  calculatePayroll: async (monthYear: string, targetEmployeeIds?: string[]): Promise<CalculationResult> => {
    return api.post<CalculationResult>('/payroll/calculate', { monthYear, targetEmployeeIds });
  },

  approvePayrollRun: async (runId: string): Promise<PayrollRun> => {
    return api.post<PayrollRun>(`/payroll/runs/${runId}/approve`);
  },

  disbursePayrollRun: async (runId: string): Promise<PayrollRun> => {
    return api.post<PayrollRun>(`/payroll/runs/${runId}/disburse`);
  },

  getPayslips: async (payrollRunId?: string): Promise<Payslip[]> => {
    return api.get<Payslip[]>('/payroll/payslips', payrollRunId ? { payrollRunId } : undefined);
  },
};
