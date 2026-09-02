import React, { useState } from 'react';
import {
  IndianRupee,
  Play,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ShieldAlert,
  FileCheck,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, Payslip } from '../../types';
import { formatInr } from '../../utils/payrollCalc';
import { downloadPayslipPdf } from '../../utils/pdfGenerator';
import { exportToCsv } from '../../utils/csvExporter';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import confetti from 'canvas-confetti';

export const PayrollModuleView: React.FC = () => {
  const {
    currentOrg,
    employees,
    payrollRuns,
    executePayrollRun,
    activeSubTab,
    setActiveSubTab,
    currentUserRole,
  } = useHrms();

  const [wizardStep, setWizardStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedPayslipRun, setSelectedPayslipRun] = useState<any | null>(null);

  // Active run calculation
  const latestRun = payrollRuns[0] || {
    id: 'run-aug-2026',
    month: 'August 2026',
    totalGrossPay: 1766666,
    totalDeductions: 215000,
    totalNetPay: 1551666,
    status: 'Disbursed',
    processedEmployees: 12,
  };

  const handleStartRun = () => {
    setWizardStep(1);
    setIsCompleted(false);
    setActiveSubTab('wizard');
  };

  const handleExecuteApproval = () => {
    setIsProcessing(true);
    setTimeout(() => {
      executePayrollRun(selectedMonth);
      setIsProcessing(false);
      setIsCompleted(true);
      setWizardStep(6);

      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 1200);
  };

  const handleDownloadSinglePayslip = (emp: Employee, netPay: number) => {
    const gross = Math.round(emp.salary / 12);
    const basic = Math.round(gross * 0.5);
    const hra = Math.round(gross * 0.2);
    const spl = gross - basic - hra;
    const pf = Math.round(basic * 0.12);
    const pt = 200;
    const tds = Math.round(gross * 0.05);
    const deductions = pf + pt + tds;

    const payslip: Payslip = {
      id: `ps-${emp.id}`,
      payrollRunId: 'pr-run-1',
      orgId: currentOrg.id,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeCode: emp.employeeCode || `SQ-${emp.id.slice(0, 4).toUpperCase()}`,
      designation: emp.designation,
      department: emp.department,
      bankName: emp.bankDetails?.bankName || 'HDFC Bank Ltd.',
      maskedAccount: emp.bankDetails?.maskedAccountNumber || '•••• 5821',
      monthYear: selectedMonth,
      workingDays: 22,
      daysPresent: 22,
      paidLeaves: 0,
      lossOfPayDays: 0,
      basicSalary: basic,
      hra: hra,
      specialAllowance: spl,
      bonusOrIncentive: 0,
      grossEarnings: gross,
      providentFund: pf,
      esi: 0,
      professionalTax: pt,
      tdsIncomeTax: tds,
      totalDeductions: deductions,
      netSalary: gross - deductions,
      generatedDate: new Date().toISOString().split('T')[0],
    };

    downloadPayslipPdf(payslip, currentOrg.name);
  };

  return (
    <div id="payroll-module-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Payroll Processing & Disbursement
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-md">
              {currentOrg.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end multi-step payroll cycle wizard, salary component calculation, and payslip generation.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/50 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab('wizard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'wizard'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Processing Wizard (6 Steps)
          </button>
          <button
            onClick={() => setActiveSubTab('structure')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'structure'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Salary Structure Config
          </button>
          <button
            onClick={() => setActiveSubTab('payslips')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'payslips'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payslips Archive
          </button>
        </div>
      </div>

      <PrototypeDisclaimer
        type="statutory"
        customText="Illustrative payroll math only. Statutory calculations (EPF ceiling, ESI thresholds, state PT, TDS slabs) are simplified for UI demonstration and are not compliant with tax authority rules."
      />

      {/* ========================================================================= */}
      {/* 1. PAYROLL DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              id="kpi-gross-payroll"
              title="Total Monthly Payroll"
              value={formatInr(latestRun.totalGrossPay)}
              subtitle="Base employee earnings"
              trend="up"
              icon={IndianRupee}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50/80"
            />
            <KpiCard
              id="kpi-net-disbursement"
              title="Net Disbursed"
              value={formatInr(latestRun.totalNetPay)}
              subtitle="Bank transfer total"
              trend="neutral"
              icon={DollarSign}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50/80"
            />
            <KpiCard
              id="kpi-deductions"
              title="Statutory Deductions"
              value={formatInr(latestRun.totalDeductions)}
              subtitle="PF + PT + TDS Statutory"
              trend="neutral"
              icon={ShieldAlert}
              iconColor="text-amber-600"
              iconBg="bg-amber-50/80"
            />
            <KpiCard
              id="kpi-processed-headcount"
              title="Processed Employees"
              value={`${employees.length} Staff`}
              subtitle="100% attendance factored"
              trend="up"
              icon={FileCheck}
              iconColor="text-purple-600"
              iconBg="bg-purple-50/80"
            />
          </div>

          {/* Quick Action Banner */}
          <div className="p-6 bg-gradient-to-r from-indigo-950/95 via-slate-900/95 to-indigo-950/95 backdrop-blur-xl rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-800/50">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Monthly Payroll Cycle Ready
              </div>
              <h3 className="text-xl font-bold font-heading mt-1">
                Run Payroll Cycle for {selectedMonth}
              </h3>
              <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                Simulate biometric attendance sync, automated PF & TDS deduction splits, multi-role approval, and batch payslip PDF generation.
              </p>
            </div>
            <button
              onClick={handleStartRun}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs font-extrabold shadow-lg transition-colors shrink-0"
            >
              <Play className="w-4 h-4 fill-indigo-900" />
              Launch Processing Wizard
            </button>
          </div>

          {/* Payroll Run History */}
          <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-4">
              Historical Payroll Disbursements
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 backdrop-blur-xs border-b border-slate-200/80 text-slate-700 font-semibold text-[11px] uppercase">
                    <th className="px-4 py-3">Pay Period</th>
                    <th className="px-4 py-3">Headcount</th>
                    <th className="px-4 py-3">Gross Total</th>
                    <th className="px-4 py-3">Deductions</th>
                    <th className="px-4 py-3">Net Payout</th>
                    <th className="px-4 py-3">Cycle Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90 bg-white/40">
                  {payrollRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-indigo-50/30">
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {run.monthYear || run.month}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {run.processedEmployees || employees.length} Staff
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {formatInr(run.totalGrossPay)}
                      </td>
                      <td className="px-4 py-3.5 text-amber-700 font-medium">
                        {formatInr(run.totalDeductions)}
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-emerald-700 font-mono">
                        {formatInr(run.totalNetPay)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={run.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedMonth(run.monthYear || run.month || 'August 2026');
                            setActiveSubTab('payslips');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                        >
                          View Payslips
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MULTI-STEP PROCESSING WIZARD */}
      {/* ========================================================================= */}
      {activeSubTab === 'wizard' && (
        <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          {/* Wizard Step Indicator */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 overflow-x-auto">
            {[
              '1. Attendance Sync',
              '2. Salary Calc',
              '3. PF & Deductions',
              '4. TDS Preview',
              '5. Net & Approval',
              '6. Payslips',
            ].map((stepName, idx) => {
              const stepNum = idx + 1;
              const isCurrent = wizardStep === stepNum;
              const isPast = wizardStep > stepNum;

              return (
                <div
                  key={stepNum}
                  onClick={() => !isProcessing && setWizardStep(stepNum)}
                  className={`flex items-center gap-2 cursor-pointer transition-colors px-2 py-1 rounded-lg ${
                    isCurrent
                      ? 'text-indigo-600 font-bold bg-indigo-50'
                      : isPast
                      ? 'text-emerald-700 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? '✓' : stepNum}
                  </span>
                  <span className="text-xs whitespace-nowrap">{stepName}</span>
                </div>
              );
            })}
          </div>

          {/* Step 1: Attendance Sync */}
          {wizardStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Step 1: Synchronize Attendance & Geofence Logs
              </h3>
              <p className="text-xs text-slate-500">
                Evaluating punch logs and approved regularizations for {selectedMonth} to compute payable days.
              </p>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-bold block">
                    {employees.length} Employee Attendance Records Reconciled
                  </span>
                  <span>Average Payable Days: 30.5 Days / 31</span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                  100% Complete
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Salary Calc */}
          {wizardStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Step 2: Component Breakdown & Allowances
              </h3>
              <p className="text-xs text-slate-500">
                Applying 50% Basic, 20% HRA, and 30% Special Allowance formula across employee CTC bands.
              </p>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block">Total Basic Salary Base</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {formatInr(latestRun.totalGrossPay * 0.5)}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block">Total HRA Allowance</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {formatInr(latestRun.totalGrossPay * 0.2)}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block">Total Special Allowances</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {formatInr(latestRun.totalGrossPay * 0.3)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: PF & Statutory */}
          {wizardStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Step 3: EPF & State Professional Tax Calculation
              </h3>
              <p className="text-xs text-slate-500">
                Illustrative employee PF contribution (12% of basic, capped at ₹1,800) + Karnataka PT (₹200/mo).
              </p>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <div className="font-bold mb-1">Statutory Estimate:</div>
                <div className="flex justify-between py-1 border-b border-amber-200">
                  <span>Provident Fund (Employee 12%)</span>
                  <span className="font-bold">₹21,600 (12 staff)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>State Professional Tax (PT)</span>
                  <span className="font-bold">₹2,400</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: TDS Preview */}
          {wizardStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Step 4: Monthly TDS Withholding Estimate
              </h3>
              <p className="text-xs text-slate-500">
                Simplified progressive tax deduction preview based on declared annual tax slabs.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Estimated Total TDS Deducted:</span>
                  <span className="text-indigo-700 font-mono text-sm">
                    {formatInr(191000)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Approval */}
          {wizardStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Step 5: Review Summary & Multi-Role Authorization
              </h3>
              <p className="text-xs text-slate-500">
                Final approval required from Payroll Manager before banking disbursement file generation.
              </p>

              <div className="p-5 bg-indigo-900 text-white rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-200 text-xs">Net Pay To Disburse</span>
                  <span className="text-2xl font-bold font-mono">
                    {formatInr(latestRun.totalNetPay)}
                  </span>
                </div>
                <div className="text-xs text-indigo-300">
                  Authorized Signatory Persona: <strong>{currentUserRole}</strong>
                </div>
              </div>

              <button
                onClick={handleExecuteApproval}
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isProcessing ? 'Executing Payroll Cycle...' : 'Authorize & Disburse Payroll'}
              </button>
            </div>
          )}

          {/* Step 6: Completed */}
          {wizardStep === 6 && (
            <div className="space-y-4 text-center py-6 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Payroll Successfully Disbursed!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All {employees.length} payslips have been generated with illustrative statutory deductions and archived to PDF.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveSubTab('payslips')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs"
                >
                  View Payslips Archive
                </button>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          {wizardStep < 5 && (
            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setWizardStep((s) => Math.max(1, s - 1))}
                disabled={wizardStep === 1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={() => setWizardStep((s) => Math.min(5, s + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SALARY STRUCTURE CONFIGURATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'structure' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Organization Salary Component Ratios
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard Indian CTC breakdown percentages applied to offer letters and payroll runs.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Basic Pay Component</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  50% of CTC
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">House Rent Allowance (HRA)</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  20% of CTC
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Special & Flexible Allowance</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  30% of CTC
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PAYSLIP ARCHIVE & PDF GENERATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'payslips' && (
        <div className="space-y-4">
          <DataTable<Employee>
            data={employees}
            exportFilename={`Payslips_${selectedMonth.replace(/\s+/g, '_')}`}
            title={`Payslips Archive (${selectedMonth})`}
            subtitle="Download individual official payslips with watermark disclaimer or export batch salary sheets."
            searchPlaceholder="Search employee name or department..."
            columns={[
              {
                header: 'Employee Name',
                accessorKey: 'name',
                sortable: true,
                cell: (row: Employee) => (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={row.avatar}
                      alt={row.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{row.name}</div>
                      <div className="text-[10px] text-slate-400">{row.designation}</div>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Department',
                accessorKey: 'department',
              },
              {
                header: 'Gross Monthly',
                cell: (row: Employee) => (
                  <span className="font-semibold text-slate-800">
                    {formatInr(Math.round(row.salary / 12))}
                  </span>
                ),
              },
              {
                header: 'Illustrative Deductions',
                cell: (row: Employee) => (
                  <span className="text-amber-700 font-medium">
                    {formatInr(Math.round((row.salary / 12) * 0.12))}
                  </span>
                ),
              },
              {
                header: 'Net Payable',
                cell: (row: Employee) => (
                  <span className="font-extrabold text-emerald-700 font-mono">
                    {formatInr(Math.round((row.salary / 12) * 0.88))}
                  </span>
                ),
              },
              {
                header: 'Status',
                cell: () => <StatusBadge status="Disbursed" size="sm" />,
              },
              {
                header: 'PDF Download',
                cell: (row: Employee) => (
                  <button
                    onClick={() =>
                      handleDownloadSinglePayslip(
                        row,
                        Math.round((row.salary / 12) * 0.88)
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Payslip PDF</span>
                  </button>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};
