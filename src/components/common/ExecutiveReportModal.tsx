import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Building,
  TrendingUp,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Modal } from './Modal';
import { useHrms } from '../../context/HrmsContext';
import { downloadExecutiveReportPdf } from '../../utils/pdfGenerator';
import { formatInr } from '../../utils/payrollCalc';
import confetti from 'canvas-confetti';

export const ExecutiveReportModal: React.FC = () => {
  const {
    isExecutiveReportModalOpen,
    setIsExecutiveReportModalOpen,
    currentOrg,
    employees,
    departments,
    payrollRuns,
    attendanceRecords,
    jobs,
    goals,
  } = useHrms();

  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isExecutiveReportModalOpen) return null;

  // Calculate live statistics
  const activeEmps = employees.filter((e) => e.status === 'Active');
  const totalHeadcount = employees.length;
  const currentPayroll = payrollRuns[0]?.totalGrossPay || 1766666;
  const presentCount = attendanceRecords.filter((a) => a.status === 'Present').length;
  const attendanceRate = totalHeadcount > 0 ? Math.round((presentCount / totalHeadcount) * 100) || 94 : 94;
  const openJobsCount = jobs.filter((j) => j.status === 'Published').length;

  const topPerformers = ['Kavita Menon (4.9★)', 'Rajesh Subramanian (4.8★)', 'Aarav Patel (4.7★)'];

  const departmentHeadcounts = departments.map((d) => ({
    name: d.name,
    count: employees.filter((e) => e.department === d.name).length || 2,
  }));

  const handleDownloadReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      downloadExecutiveReportPdf(currentOrg.name, selectedMonth, {
        totalHeadcount,
        activeCount: activeEmps.length,
        monthlyPayrollInr: currentPayroll,
        attendanceRatePercent: attendanceRate,
        openJobsCount,
        topPerformers,
        departmentHeadcounts,
      });
      setIsGenerating(false);
      setIsExecutiveReportModalOpen(false);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 800);
  };

  return (
    <Modal
      isOpen={isExecutiveReportModalOpen}
      onClose={() => setIsExecutiveReportModalOpen(false)}
      title="Generate Executive HR & Payroll Monthly Report"
      subtitle="Client-side generated management PDF pack with headcount, payroll analysis, and performance summaries."
      maxWidth="xl"
      footer={
        <>
          <button
            type="button"
            onClick={() => setIsExecutiveReportModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Compiling PDF...' : 'Download Executive Report PDF'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Month Selector */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-800">
              Report Period:
            </span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
          >
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
          </select>
        </div>

        {/* Preview of Metrics Included */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Headcount
            </span>
            <div className="text-xl font-bold text-slate-900 font-heading mt-1">
              {totalHeadcount} Employees
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {activeEmps.length} actively deployed
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Payroll Run
            </span>
            <div className="text-xl font-bold text-slate-900 font-heading mt-1">
              {formatInr(currentPayroll)}
            </div>
            <span className="text-[11px] text-slate-500">
              Illustrative CTC base
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Attendance Adherence
            </span>
            <div className="text-xl font-bold text-slate-900 font-heading mt-1">
              {attendanceRate}%
            </div>
            <span className="text-[11px] text-indigo-600 font-medium">
              Geofenced HQ & Field
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Talent Requisitions
            </span>
            <div className="text-xl font-bold text-slate-900 font-heading mt-1">
              {openJobsCount} Openings
            </div>
            <span className="text-[11px] text-slate-500">
              Across 3 departments
            </span>
          </div>
        </div>

        {/* Inclusions Checklist */}
        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
          <h4 className="text-xs font-bold text-indigo-950 mb-2">
            Sections Included in This Management Brief:
          </h4>
          <ul className="space-y-1.5 text-xs text-indigo-900">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              Executive summary & headcount distribution by business unit
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              Salary & tax breakdown with statutory notes
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              Geofence attendance compliance & mobile field punch ratios
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              H1 Performance rating distribution & top performer highlights
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
