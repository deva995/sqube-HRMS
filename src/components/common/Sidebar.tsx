import React from 'react';
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  MapPin,
  TrendingUp,
  Briefcase,
  Calendar,
  UserCheck,
  HeartHandshake,
  ShoppingBag,
  Receipt,
  ShieldAlert,
  Building2,
  Lock,
  Sparkles,
  Layers,
  History,
  LogOut,
  Store,
  Heart,
  CalendarCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { ModuleId } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    currentOrg,
    activeModule,
    setActiveSubTab,
    activeSubTab,
    navigateTo,
    currentUserRole,
    currentUserPersona,
    logout,
  } = useHrms();

  const isModuleEnabled = (id: ModuleId) => {
    return currentOrg.enabledModules.includes(id);
  };

  const coreNavItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      moduleId: null,
    },
    {
      id: 'hr',
      label: 'HR Management',
      icon: Users,
      moduleId: 'hr' as ModuleId,
      subTabs: [
        { id: 'overview', label: 'Overview' },
        { id: 'employees', label: 'Employee Directory' },
        { id: 'org-structure', label: 'Org Structure' },
        { id: 'lifecycle', label: 'Lifecycle & Onboarding' },
      ],
    },
    {
      id: 'attendance',
      label: 'Attendance & Geo',
      icon: MapPin,
      moduleId: 'attendance' as ModuleId,
      subTabs: [
        { id: 'overview', label: 'Overview' },
        { id: 'logs', label: 'Daily Punches & Map' },
        { id: 'geofences', label: 'Geofence Policies' },
        { id: 'regularization', label: 'Regularization' },
        { id: 'shifts', label: 'Shifts & Rules' },
      ],
    },
    {
      id: 'leave',
      label: 'Leave Management',
      icon: CalendarCheck,
      moduleId: 'leave' as ModuleId,
    },
    {
      id: 'payroll',
      label: 'Payroll Engine',
      icon: IndianRupee,
      moduleId: 'payroll' as ModuleId,
      subTabs: [
        { id: 'overview', label: 'Dashboard' },
        { id: 'wizard', label: 'Processing Wizard' },
        { id: 'structure', label: 'Salary Structure' },
        { id: 'payslips', label: 'Payslips Archive' },
      ],
    },
    {
      id: 'ess',
      label: 'Self-Service (ESS)',
      icon: UserCheck,
      moduleId: 'ess' as ModuleId,
    },
  ];

  const operationsNavItems = [
    {
      id: 'performance',
      label: 'Performance & OKRs',
      icon: TrendingUp,
      moduleId: 'performance' as ModuleId,
      subTabs: [
        { id: 'overview', label: 'Overview' },
        { id: 'goals', label: 'Goals & OKRs' },
        { id: 'reviews', label: '360 Reviews (5 Stages)' },
        { id: 'analytics', label: 'Talent Matrix' },
      ],
    },
    {
      id: 'recruitment',
      label: 'Recruitment & ATS',
      icon: Briefcase,
      moduleId: 'recruitment' as ModuleId,
      subTabs: [
        { id: 'overview', label: 'Overview' },
        { id: 'jobs', label: 'Job Postings' },
        { id: 'pipeline', label: 'Kanban Pipeline' },
        { id: 'interviews', label: 'Interviews' },
      ],
    },
    {
      id: 'expense',
      label: 'Expense Claims',
      icon: Receipt,
      moduleId: 'expense' as ModuleId,
    },
    {
      id: 'engagement',
      label: 'Culture & Engagement',
      icon: Heart,
      moduleId: 'engagement' as ModuleId,
    },
    {
      id: 'marketplace',
      label: 'App Marketplace',
      icon: Store,
      moduleId: 'marketplace' as ModuleId,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 backdrop-blur-xl text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] select-none border-r border-slate-800/90 shadow-lg">
      {/* Scrollable Nav list */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Core Modules Section */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Workforce & Operations
          </div>
          <nav className="space-y-1">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const isEnabled = item.moduleId ? isModuleEnabled(item.moduleId) : true;
              const isActive = activeModule === item.id;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (!isEnabled) {
                        navigateTo('super-admin', 'modules');
                        return;
                      }
                      navigateTo(item.id, item.subTabs ? item.subTabs[0].id : 'overview');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                        : isEnabled
                        ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        : 'text-slate-500 hover:bg-slate-800/30 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-white'
                            : isEnabled
                            ? 'text-indigo-400'
                            : 'text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {!isEnabled && (
                      <span
                        className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20"
                        title="Disabled in active Organization Module Matrix"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    )}
                  </button>

                  {/* SubTabs expansion for active module */}
                  {isActive && item.subTabs && isEnabled && (
                    <div className="ml-5 mt-1 pl-3 border-l border-indigo-500/40 space-y-0.5 py-1">
                      {item.subTabs.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveSubTab(sub.id)}
                          className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                            activeSubTab === sub.id
                              ? 'text-indigo-200 font-bold bg-indigo-500/25 border border-indigo-400/20'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Growth & Extended Modules */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Growth, Talent & Add-Ons
          </div>
          <nav className="space-y-1">
            {operationsNavItems.map((item) => {
              const Icon = item.icon;
              const isEnabled = item.moduleId ? isModuleEnabled(item.moduleId) : true;
              const isActive = activeModule === item.id;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (!isEnabled) {
                        navigateTo('super-admin', 'modules');
                        return;
                      }
                      navigateTo(item.id, item.subTabs ? item.subTabs[0].id : 'overview');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                        : isEnabled
                        ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        : 'text-slate-500 hover:bg-slate-800/30 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-white'
                            : isEnabled
                            ? 'text-indigo-400'
                            : 'text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {!isEnabled && (
                      <span
                        className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20"
                        title="Disabled in active Organization Module Matrix"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    )}
                  </button>

                  {/* SubTabs expansion for active module */}
                  {isActive && item.subTabs && isEnabled && (
                    <div className="ml-5 mt-1 pl-3 border-l border-indigo-500/40 space-y-0.5 py-1">
                      {item.subTabs.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveSubTab(sub.id)}
                          className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                            activeSubTab === sub.id
                              ? 'text-indigo-200 font-bold bg-indigo-500/25 border border-indigo-400/20'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Administration Section */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Super Administration
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => {
                navigateTo('super-admin', 'modules');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeModule === 'super-admin' && activeSubTab === 'modules'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Module Matrix</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                Matrix
              </span>
            </button>

            <button
              onClick={() => {
                navigateTo('super-admin', 'orgs');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeModule === 'super-admin' && activeSubTab === 'orgs'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Org Management</span>
            </button>

            <button
              onClick={() => {
                navigateTo('super-admin', 'roles');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeModule === 'super-admin' && activeSubTab === 'roles'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <span>Roles & UI Gating</span>
            </button>

            <button
              onClick={() => {
                navigateTo('super-admin', 'audit');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeModule === 'super-admin' && activeSubTab === 'audit'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>Audit Log Trail</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-xs text-xs text-slate-400 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="font-semibold text-slate-300">Active Tenant:</span>
          <span className="text-indigo-400 font-bold font-mono">
            {currentOrg.enabledModules.length}/10 Active
          </span>
        </div>
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-300 shadow-xs"
            style={{
              width: `${(currentOrg.enabledModules.length / 10) * 100}%`,
            }}
          />
        </div>

        {/* User Persona & Sign Out */}
        <div className="pt-1.5 border-t border-slate-800/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={currentUserPersona.avatar}
              alt={currentUserPersona.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-200 truncate leading-tight">
                {currentUserPersona.name.split(' ')[0]}
              </div>
              <div className="text-[9px] text-indigo-400 font-bold truncate">
                {currentUserPersona.tierLabel || currentUserRole}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Sign Out / Return to Login Screen"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
