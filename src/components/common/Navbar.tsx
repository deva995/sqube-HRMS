import React, { useState } from 'react';
import {
  Building2,
  Globe2,
  UserCheck,
  Bell,
  Search,
  Smartphone,
  Wifi,
  WifiOff,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  FileText,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Role } from '../../types';
import { GlobalSearchBar } from './GlobalSearchBar';

export const Navbar: React.FC = () => {
  const {
    organizations,
    currentOrgId,
    currentOrg,
    switchOrganization,
    currentUserRole,
    currentUserPersona,
    allPersonas,
    switchRole,
    logout,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    isOfflineMode,
    toggleOfflineMode,
    offlineSyncQueue,
    setIsFieldStaffModalOpen,
    setIsExecutiveReportModalOpen,
    searchQuery,
    setSearchQuery,
  } = useHrms();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const rolesList: { role: Role; label: string }[] = [
    { role: 'Super Admin', label: '1. Super admin' },
    { role: 'Admin', label: '2. Admin' },
    { role: 'Manager', label: '3.1 Manager' },
    { role: 'Team Lead', label: '3.2 Team Lead' },
    { role: 'Executive', label: '3.3 Executive / IC' },
  ];

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Left side: Brand + Quick Org Switcher */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Brand Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shadow-indigo-600/30">
            <span className="font-extrabold text-base tracking-tighter">SQ</span>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm tracking-tight font-heading">
                Sqbe HRMS
              </span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-indigo-200/60">
                ENTERPRISE
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block leading-tight">
              Cloud Workforce Platform
            </span>
          </div>
        </div>

        {/* Tenant / Organization Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsOrgDropdownOpen(!isOrgDropdownOpen);
              setIsRoleDropdownOpen(false);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 transition-colors shadow-2xs backdrop-blur-xs"
            title="Switch Simulated Tenant Organization"
          >
            {currentOrgId === 'all' ? (
              <Globe2 className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span className="max-w-[130px] sm:max-w-[180px] truncate">
              {currentOrg.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                <span>Switch Organization</span>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Multi-Tenant</span>
              </div>

              {/* All Organizations Global View Option */}
              <button
                onClick={() => {
                  switchOrganization('all');
                  setIsOrgDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between transition-colors border-b border-slate-100 ${
                  currentOrgId === 'all'
                    ? 'bg-indigo-50/90 font-bold text-indigo-700'
                    : 'text-slate-700 hover:bg-indigo-50/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="truncate font-semibold flex items-center gap-1.5">
                      <span>All Organizations</span>
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-medium">Consolidated</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Cross-Tenant Aggregated View & Activity
                    </div>
                  </div>
                </div>
                {currentOrgId === 'all' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 ml-2" />
                )}
              </button>

              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Individual Tenants
              </div>

              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.id);
                    setIsOrgDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50/70 transition-colors ${
                    org.id === currentOrgId
                      ? 'bg-indigo-50/90 font-bold text-indigo-700'
                      : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="truncate font-semibold">{org.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {org.enabledModules.length} Modules • {org.employeeCount} Staff
                      </div>
                    </div>
                  </div>
                  {org.id === currentOrgId && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar & Quick Jump Palette */}
      <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
        <GlobalSearchBar />
      </div>

      {/* Right side: Action Tools + Persona Selector + Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Trigger Button */}
        <button
          onClick={() => setIsMobileSearchOpen(true)}
          className="md:hidden p-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/90 text-slate-700 shadow-2xs transition-colors"
          title="Open Search & Quick Jump"
        >
          <Search className="w-4 h-4 text-indigo-600" />
        </button>

        {/* Offline Simulator Switch */}
        <button
          onClick={toggleOfflineMode}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all backdrop-blur-xs ${
            isOfflineMode
              ? 'bg-rose-50/90 border-rose-200 text-rose-700 shadow-2xs animate-pulse'
              : 'bg-white/80 border-slate-200/90 text-slate-600 hover:bg-white shadow-2xs'
          }`}
          title="Toggle Simulated Offline Connectivity Mode"
        >
          {isOfflineMode ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-600" />
              <span>Offline ({offlineSyncQueue.length} queued)</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px]">Online Sync</span>
            </>
          )}
        </button>

        {/* Field Staff Mobile view button */}
        <button
          onClick={() => setIsFieldStaffModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50/90 hover:bg-indigo-100/90 border border-indigo-200/90 text-indigo-700 rounded-xl text-xs font-bold transition-colors shadow-2xs backdrop-blur-xs"
          title="Launch Field Staff Smartphone Punch Simulation"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Field Mobile View</span>
        </button>

        {/* Monthly Executive PDF Report button */}
        <button
          onClick={() => setIsExecutiveReportModalOpen(true)}
          className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs backdrop-blur-xs"
          title="Generate Monthly PDF Insights Report"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Monthly PDF Report</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsOrgDropdownOpen(false);
              setIsRoleDropdownOpen(false);
            }}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-colors"
            title="Simulated Event Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Notifications Center
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Simulated in-memory event stream
                  </p>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-xs hover:bg-indigo-50/40 cursor-pointer transition-colors ${
                        !n.isRead ? 'bg-indigo-50/60 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-slate-900">
                          {n.title}
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {n.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Persona & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsRoleDropdownOpen(!isRoleDropdownOpen);
              setIsOrgDropdownOpen(false);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-white/80 hover:bg-white border border-slate-200/90 shadow-2xs backdrop-blur-xs transition-colors"
            title="Switch Simulated Role / Persona (UI Gating Only)"
          >
            <img
              src={currentUserPersona.avatar}
              alt={currentUserPersona.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUserPersona.name.split(' ')[0]}
              </div>
              <div className="text-[10px] font-semibold text-indigo-600">
                {currentUserRole}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 pb-2 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Simulated Role Persona
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5 font-medium">
                  UI-level gating demo only
                </div>
              </div>

              <div className="py-1">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchRole(item.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-indigo-50/70 transition-colors cursor-pointer ${
                      item.role === currentUserRole
                        ? 'bg-indigo-50/90 font-bold text-indigo-700'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.role === currentUserRole && (
                      <span className="text-[10px] text-indigo-600 font-bold">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Sign Out Action */}
              <div className="pt-1.5 mt-1 border-t border-slate-100 px-1">
                <button
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Modal Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col p-4 md:hidden">
          <div className="flex items-center justify-between mb-3 text-white">
            <span className="text-sm font-bold">Quick Jump & Search</span>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-1 rounded-lg bg-white/20 text-white"
            >
              ✕
            </button>
          </div>
          <div className="w-full">
            <GlobalSearchBar />
          </div>
        </div>
      )}
    </header>
  );
};
