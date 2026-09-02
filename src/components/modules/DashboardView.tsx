import React from 'react';
import {
  Users,
  IndianRupee,
  MapPin,
  TrendingUp,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  Smartphone,
  FileText,
  Calendar,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { KpiCard } from '../common/KpiCard';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import { RecentActivityWidget } from '../dashboard/RecentActivityWidget';
import { formatInr } from '../../utils/payrollCalc';
import { ManagerDashboardView } from './ManagerDashboardView';
import { TeamLeadDashboardView } from './TeamLeadDashboardView';
import { EmployeeEssDashboardView } from './EmployeeEssDashboardView';
import { Role } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    currentOrg,
    currentUserRole,
    currentUserPersona,
    switchRole,
    employees,
    departments,
    payrollRuns,
    attendanceRecords,
    goals,
    candidates,
    jobs,
    navigateTo,
    setIsFieldStaffModalOpen,
    setIsExecutiveReportModalOpen,
  } = useHrms();

  // If active user is Manager, render the dedicated 3.1 Manager View
  if (currentUserRole === 'Manager') {
    return <ManagerDashboardView />;
  }

  // If active user is Team Lead, render the dedicated 3.2 Team Lead View
  if (currentUserRole === 'Team Lead') {
    return <TeamLeadDashboardView />;
  }

  // If active user is Executive or Employee, render the dedicated 3.3 Executive / IC ESS View
  if (currentUserRole === 'Executive' || currentUserRole === 'Employee') {
    return <EmployeeEssDashboardView />;
  }

  const activeEmployees = employees.filter((e) => e.status === 'Active');
  const latestPayroll = payrollRuns[0]?.totalGrossPay || 1766666;
  const presentCount = attendanceRecords.filter((a) => a.status === 'Present').length;
  const openRequisitions = jobs.filter((j) => j.status === 'Published').length;

  return (
    <div id="main-dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800/80">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/15 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {currentUserRole === 'Super Admin' ? '1. Super admin • Global Control Hub' : '2. Admin • Company Operations Hub'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Welcome to {currentOrg.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Unified Sqbe HRMS workforce operations dashboard. Real-time in-memory simulation of Indian HR compliance, geofenced mobile punches, and 6-step payroll cycles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsFieldStaffModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile Field Punch</span>
            </button>

            <button
              onClick={() => setIsExecutiveReportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 text-slate-900 hover:bg-white rounded-xl text-xs font-bold shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Monthly Report PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Switcher Pill Bar for Quick Testing */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Explore Role-Specific Views:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { role: 'Super Admin' as Role, label: '1. Super admin' },
            { role: 'Admin' as Role, label: '2. Admin' },
            { role: 'Manager' as Role, label: '3.1 Manager' },
            { role: 'Team Lead' as Role, label: '3.2 Team Lead' },
            { role: 'Executive' as Role, label: '3.3 Executive / IC' },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => switchRole(item.role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentUserRole === item.role
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <PrototypeDisclaimer
        type="general"
        customText="Live interactive Sqbe HRMS workspace. You can simulate role switching, switch tenant organizations, onboard employees, disburse payroll, and toggle module matrices in real-time."
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          id="kpi-headcount"
          title="Total Headcount"
          value={`${employees.length} Staff`}
          change="+3 this month"
          trend="up"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50/80"
          onClick={() => {
            navigateTo('hr');
          }}
        />
        <KpiCard
          id="kpi-payroll"
          title="Gross Payroll"
          value={formatInr(latestPayroll)}
          subtitle="Processed for August"
          trend="up"
          icon={IndianRupee}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50/80"
          onClick={() => {
            navigateTo('payroll');
          }}
        />
        <KpiCard
          id="kpi-attendance"
          title="Today's Attendance"
          value={`${presentCount}/${employees.length}`}
          subtitle={`${Math.round((presentCount / (employees.length || 1)) * 100)}% Geo Adherence`}
          trend="neutral"
          icon={MapPin}
          iconColor="text-teal-600"
          iconBg="bg-teal-50/80"
          onClick={() => {
            navigateTo('attendance');
          }}
        />
        <KpiCard
          id="kpi-performance"
          title="Active OKRs"
          value={`${goals.length} Goals`}
          subtitle="78% Company Alignment"
          trend="up"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50/80"
          onClick={() => {
            navigateTo('performance');
          }}
        />
        <KpiCard
          id="kpi-recruitment"
          title="Open Requisitions"
          value={`${openRequisitions} Positions`}
          subtitle={`${candidates.length} in ATS Pipeline`}
          trend="up"
          icon={Briefcase}
          iconColor="text-amber-600"
          iconBg="bg-amber-50/80"
          onClick={() => {
            navigateTo('recruitment');
          }}
        />
      </div>

      {/* Recent Activity & Chronological Action Log Feed */}
      <RecentActivityWidget />

      {/* Module Hub Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module Matrix Centerpiece Card */}
        <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:bg-white/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50/90 px-2 py-0.5 rounded-full border border-emerald-200/80">
                Centerpiece Feature
              </span>
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Module Assignment Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Toggle access to any of the 10 HRMS modules for any of the 3 tenant organizations. Watch the UI adapt in real-time.
            </p>
          </div>
          <button
            onClick={() => {
              navigateTo('super-admin', 'modules');
            }}
            className="mt-4 w-full py-2 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs backdrop-blur-xs"
          >
            <span>Open Module Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6-Step Payroll Processing Card */}
        <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:bg-white/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/90 px-2 py-0.5 rounded-full border border-indigo-200/80">
                Interactive Wizard
              </span>
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Payroll Processing Wizard
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Simulate attendance sync, PF/PT statutory withholdings, manager sign-off, and automated payslip PDF generation.
            </p>
          </div>
          <button
            onClick={() => {
              navigateTo('payroll', 'wizard');
            }}
            className="mt-4 w-full py-2 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs backdrop-blur-xs"
          >
            <span>Launch Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Geofence & Mobile Card */}
        <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:bg-white/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50/90 px-2 py-0.5 rounded-full border border-blue-200/80">
                Mobile & GPS
              </span>
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Attendance & Geofencing
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Test browser geolocation distance calculations, simulated biometric authentication, and offline punch queues.
            </p>
          </div>
          <button
            onClick={() => {
              navigateTo('attendance', 'logs');
            }}
            className="mt-4 w-full py-2 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs backdrop-blur-xs"
          >
            <span>View Logs & Maps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
