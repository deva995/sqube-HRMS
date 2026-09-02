import React, { useState } from 'react';
import {
  Layers,
  Building2,
  ShieldCheck,
  History,
  CheckCircle2,
  Plus,
  Edit2,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { ALL_MODULES } from '../../mock/demoData';
import { ModuleId, Organization, Role, AuditLogEntry } from '../../types';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import { StatusBadge } from '../common/StatusBadge';
import { ROLE_PERMISSIONS } from '../../utils/accessControl';
import confetti from 'canvas-confetti';

export const SuperAdminView: React.FC = () => {
  const {
    organizations,
    currentOrgId,
    currentOrg,
    switchOrganization,
    createOrganization,
    updateOrganization,
    toggleModuleAssignment,
    activeSubTab,
    setActiveSubTab,
    auditLogs,
    currentUserRole,
  } = useHrms();

  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgIndustry, setNewOrgIndustry] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState<'Enterprise' | 'Professional' | 'Growth'>('Professional');

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    createOrganization({
      name: newOrgName,
      slug: newOrgName.toLowerCase().replace(/\s+/g, '-'),
      industry: newOrgIndustry || 'Technology & Business Services',
      contactEmail: newOrgEmail || `admin@${newOrgName.toLowerCase().replace(/\s+/g, '')}.in`,
      billingPlan: newOrgPlan,
      enabledModules: ['hr', 'attendance', 'payroll'],
    });

    setNewOrgName('');
    setNewOrgIndustry('');
    setNewOrgEmail('');
    setIsAddOrgModalOpen(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div id="super-admin-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Module Title & SubNav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Super Admin & Organization Control
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-md">
              In-Memory Mock State
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-tenant organizations, toggle live module access, audit platform activities, and inspect UI-gating rules.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/50 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs">
          <button
            onClick={() => setActiveSubTab('modules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'modules'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Module Matrix (Centerpiece)
          </button>
          <button
            onClick={() => setActiveSubTab('orgs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'orgs'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Organizations ({organizations.length})
          </button>
          <button
            onClick={() => setActiveSubTab('roles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'roles'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roles & UI Gating
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'audit'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      <PrototypeDisclaimer
        type="general"
        customText="All organization records and module assignments operate in-browser. Toggling checkboxes immediately modifies the live navigation and capability set for the active tenant."
      />

      {/* ========================================================================= */}
      {/* 1. MODULE ASSIGNMENT MATRIX (Centerpiece Feature) */}
      {/* ========================================================================= */}
      {activeSubTab === 'modules' && (
        <div className="space-y-4">
          <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Multi-Tenant Module Assignment Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Check or uncheck any module for any organization. Watch the navigation sidebar update instantly in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                <span>Active Tenant: <strong>{currentOrg.name}</strong></span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-100/60 backdrop-blur-xs text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-3.5 min-w-[220px]">Module Name</th>
                    <th className="px-3 py-3.5 text-center">Module Availability</th>
                    {organizations.map((org) => (
                      <th
                        key={org.id}
                        className={`px-4 py-3.5 text-center min-w-[150px] ${
                          org.id === currentOrgId
                            ? 'bg-indigo-50/90 text-indigo-900 font-extrabold border-x border-indigo-200'
                            : ''
                        }`}
                      >
                        <div className="truncate font-bold">{org.name}</div>
                        <div className="text-[10px] font-normal text-slate-400 capitalize">
                          {org.billingPlan} Plan
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90 bg-white/40">
                  {ALL_MODULES.map((mod) => {
                    return (
                      <tr
                        key={mod.id}
                        className="hover:bg-indigo-50/40 transition-colors"
                      >
                        {/* Module Info */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">
                            {mod.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {mod.description}
                          </div>
                        </td>

                        {/* Implementation Badge */}
                        <td className="px-3 py-3.5 text-center">
                          {mod.isFullyImplemented ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Fully Built
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">
                              Coming Soon
                            </span>
                          )}
                        </td>

                        {/* Org Checkboxes */}
                        {organizations.map((org) => {
                          const isEnabled = org.enabledModules.includes(mod.id);
                          const isCurrent = org.id === currentOrgId;

                          return (
                            <td
                              key={org.id}
                              className={`px-4 py-3.5 text-center align-middle ${
                                isCurrent
                                  ? 'bg-indigo-50/40 border-x border-indigo-100'
                                  : ''
                              }`}
                            >
                              <label className="inline-flex items-center justify-center cursor-pointer group p-1">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={() =>
                                    toggleModuleAssignment(org.id, mod.id)
                                  }
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition-transform group-hover:scale-110 cursor-pointer"
                                />
                                <span className="sr-only">
                                  Toggle {mod.name} for {org.name}
                                </span>
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-indigo-50/80 backdrop-blur-xs border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Live Demo Tip:</strong> Uncheck any module (e.g. Payroll or Recruitment) for <em>{currentOrg.name}</em>, and observe it immediately lock or vanish from the left sidebar!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ORGANIZATIONS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'orgs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Registered Multi-Tenant Organizations
            </h3>
            <button
              onClick={() => setIsAddOrgModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Organization
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {organizations.map((org) => {
              const isSelected = org.id === currentOrgId;

              return (
                <div
                  key={org.id}
                  className={`bg-white/75 backdrop-blur-md rounded-2xl border p-5 shadow-xs transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white/90 shadow-md'
                      : 'border-slate-200/80 hover:bg-white/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-heading">
                        {org.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {org.industry}
                      </p>
                    </div>
                    <StatusBadge status={org.status} size="sm" />
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100/80 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Headcount:</span>
                      <span className="font-bold text-slate-800">
                        {org.employeeCount} Employees
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Modules:</span>
                      <span className="font-bold text-indigo-600">
                        {org.enabledModules.length} of 10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subscription Plan:</span>
                      <span className="font-semibold text-slate-800">
                        {org.billingPlan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact:</span>
                      <span className="text-slate-600 truncate max-w-[150px]">
                        {org.contactEmail}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100/80 flex items-center gap-2">
                    <button
                      onClick={() => switchOrganization(org.id)}
                      disabled={isSelected}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : 'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
                      }`}
                    >
                      {isSelected ? 'Currently Selected' : 'Switch to this Org'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ROLES & PERMISSIONS UI-GATING MATRIX */}
      {/* ========================================================================= */}
      {activeSubTab === 'roles' && (
        <div className="space-y-4">
          <PrototypeDisclaimer
            type="rbac"
            customText="Role switching modifies simulated UI visibility for testing personas. No real backend authorization or session security exists."
          />

          <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs p-6 overflow-x-auto">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-4">
              Simulated Role-Based UI Action Matrix
            </h3>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/60 backdrop-blur-xs border-b border-slate-200/80 text-slate-700 font-semibold text-[11px] uppercase">
                  <th className="px-4 py-3">Permission / Capability</th>
                  {(Object.keys(ROLE_PERMISSIONS) as Role[]).map((r) => (
                    <th
                      key={r}
                      className={`px-3 py-3 text-center ${
                        r === currentUserRole ? 'bg-indigo-50 text-indigo-900 font-bold' : ''
                      }`}
                    >
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90 bg-white/40">
                {Object.keys(ROLE_PERMISSIONS['Super Admin']).map((permKey) => (
                  <tr key={permKey} className="hover:bg-indigo-50/30">
                    <td className="px-4 py-2.5 font-medium text-slate-800 capitalize">
                      {permKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </td>
                    {(Object.keys(ROLE_PERMISSIONS) as Role[]).map((r) => {
                      const has = (ROLE_PERMISSIONS[r] as any)[permKey];
                      return (
                        <td
                          key={r}
                          className={`px-3 py-2.5 text-center ${
                            r === currentUserRole ? 'bg-indigo-50/40 font-bold' : ''
                          }`}
                        >
                          {has ? (
                            <span className="text-emerald-600 font-bold">✓</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. AUDIT LOG TRAIL */}
      {/* ========================================================================= */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <DataTable<AuditLogEntry>
            data={auditLogs}
            exportFilename={`Audit_Trail_${currentOrg.slug}`}
            title="Simulated System Audit Log Trail"
            subtitle="Demonstration of chronological event tracking (tenancy changes, payroll runs, module assignments)."
            columns={[
              {
                header: 'Timestamp',
                accessorKey: 'timestamp',
                sortable: true,
                className: 'font-mono text-slate-500',
              },
              {
                header: 'User & Role',
                cell: (row: AuditLogEntry) => (
                  <div>
                    <div className="font-bold text-slate-900">{row.userName}</div>
                    <span className="text-[10px] text-indigo-600 font-semibold">{row.userRole}</span>
                  </div>
                ),
              },
              {
                header: 'Module',
                cell: (row: AuditLogEntry) => (
                  <span className="uppercase text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {row.module}
                  </span>
                ),
              },
              {
                header: 'Action Taken',
                accessorKey: 'action',
                className: 'font-semibold text-slate-900',
              },
              {
                header: 'Record / Scope',
                accessorKey: 'recordName',
              },
              {
                header: 'Value Change / Diff',
                cell: (row: AuditLogEntry) => (
                  <div className="text-[11px] text-slate-600">
                    {row.newValue && (
                      <span className="text-emerald-700 font-medium">{row.newValue}</span>
                    )}
                    {row.previousValue && (
                      <span className="text-slate-400 block text-[10px]">
                        Prev: {row.previousValue}
                      </span>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Add Org Modal */}
      <Modal
        isOpen={isAddOrgModalOpen}
        onClose={() => setIsAddOrgModalOpen(false)}
        title="Register New Organization (Multi-Tenant Demo)"
        subtitle="Creates an in-memory organization object for testing multi-tenant module assignment."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddOrgModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateOrg}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Create Organization
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateOrg} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Organization Legal Name *
            </label>
            <input
              type="text"
              required
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="e.g. Bharat Dynamics Logistics Pvt Ltd"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Industry Domain
            </label>
            <input
              type="text"
              value={newOrgIndustry}
              onChange={(e) => setNewOrgIndustry(e.target.value)}
              placeholder="e.g. Retail, Healthcare, Fintech"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Admin Contact Email
            </label>
            <input
              type="email"
              value={newOrgEmail}
              onChange={(e) => setNewOrgEmail(e.target.value)}
              placeholder="admin@company.in"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Subscription Tier
            </label>
            <select
              value={newOrgPlan}
              onChange={(e: any) => setNewOrgPlan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
            >
              <option value="Enterprise">Enterprise Tier (Full Stack)</option>
              <option value="Professional">Professional Tier</option>
              <option value="Growth">Growth Tier</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
