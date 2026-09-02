import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  IndianRupee,
  FileCheck,
  TrendingUp,
  Award,
  ChevronRight,
  Shield,
  UserPlus,
  Layers,
  ArrowRight,
  Sparkles,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, Department, Designation } from '../../types';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import { formatInr } from '../../utils/payrollCalc';
import confetti from 'canvas-confetti';

export const HrModuleView: React.FC = () => {
  const {
    employees,
    departments,
    designations,
    addEmployee,
    updateEmployee,
    currentOrg,
    activeSubTab,
    setActiveSubTab,
    logAuditEvent,
    selectedEmployeeForDetail,
    setSelectedEmployeeForDetail,
  } = useHrms();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Sync with global selectedEmployeeForDetail if opened via Global Search Bar
  useEffect(() => {
    if (selectedEmployeeForDetail) {
      setSelectedEmployee(selectedEmployeeForDetail);
    }
  }, [selectedEmployeeForDetail]);

  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<'details' | 'salary' | 'docs' | 'history'>('details');

  // New Employee Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState(departments[0]?.name || 'Engineering');
  const [newDesig, setNewDesig] = useState(designations[0]?.title || 'Software Engineer');
  const [newLocation, setNewLocation] = useState('Bengaluru HQ');
  const [newSalary, setNewSalary] = useState(1200000);
  const [newJoiningDate, setNewJoiningDate] = useState('2026-09-01');

  // Status Change Dialog inside profile
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatusValue, setNewStatusValue] = useState<'Active' | 'Probation' | 'Notice Period' | 'Terminated'>('Active');
  const [statusChangeReason, setStatusChangeReason] = useState('');

  const activeEmployees = employees.filter((e) => e.status === 'Active');
  const probationEmployees = employees.filter((e) => e.status === 'Probation');
  const noticeEmployees = employees.filter((e) => e.status === 'Notice Period');

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim()) return;

    addEmployee({
      name: `${newFirstName} ${newLastName}`.trim(),
      email: newEmail || `${newFirstName.toLowerCase()}@${currentOrg.slug}.in`,
      phone: newPhone || '+91 98765 00000',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      department: newDept,
      designation: newDesig,
      joiningDate: newJoiningDate,
      status: 'Probation',
      salary: Number(newSalary),
      location: newLocation,
      reportingManager: 'Rajesh Subramanian',
      employmentType: 'Full-time',
      documents: [
        { name: 'Aadhaar Card', verified: true, uploadDate: '2026-08-20' },
        { name: 'PAN Card', verified: true, uploadDate: '2026-08-20' },
        { name: 'Degree Certificate', verified: true, uploadDate: '2026-08-20' },
      ],
      history: [
        {
          date: newJoiningDate,
          event: 'Offer Letter Signed & Onboarded to Enterprise Platform',
          actor: 'HR Manager',
        },
      ],
    });

    setIsAddEmployeeModalOpen(false);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleApplyStatusChange = () => {
    if (!selectedEmployee) return;

    const prev = selectedEmployee.status;
    const updatedHistory = [
      ...(selectedEmployee.history || []),
      {
        date: new Date().toISOString().split('T')[0],
        event: `Status changed from ${prev} to ${newStatusValue}: ${statusChangeReason || 'Administrative update'}`,
        actor: 'HR Administrator',
      },
    ];

    updateEmployee(selectedEmployee.id, {
      status: newStatusValue,
      history: updatedHistory,
    });

    setSelectedEmployee((prevEmp) =>
      prevEmp ? { ...prevEmp, status: newStatusValue, history: updatedHistory } : null
    );

    setIsStatusModalOpen(false);
    setStatusChangeReason('');
  };

  return (
    <div id="hr-module-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              HR Core & Workforce Management
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-md">
              {currentOrg.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain employee records, organizational departments, designations, and digital onboarding lifecycle.
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
            onClick={() => setActiveSubTab('employees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'employees'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Directory ({employees.length})
          </button>
          <button
            onClick={() => setActiveSubTab('org-structure')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'org-structure'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Org Structure ({departments.length} Depts)
          </button>
          <button
            onClick={() => setActiveSubTab('lifecycle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'lifecycle'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lifecycle & Onboarding
          </button>
        </div>
      </div>

      <PrototypeDisclaimer
        type="general"
        customText="Employee directory and document vaults are populated in-memory for this demo. Any additions or status transitions are logged to the interactive audit trail."
      />

      {/* ========================================================================= */}
      {/* 1. HR OVERVIEW / DASHBOARD */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              id="kpi-total-employees"
              title="Total Headcount"
              value={employees.length}
              change="+14% this quarter"
              trend="up"
              icon={Users}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50/80"
            />
            <KpiCard
              id="kpi-active-employees"
              title="Active Staff"
              value={activeEmployees.length}
              subtitle="Confirmed full-time"
              trend="neutral"
              icon={Award}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50/80"
            />
            <KpiCard
              id="kpi-probation"
              title="Under Probation"
              value={probationEmployees.length}
              subtitle="Pending review"
              trend="neutral"
              icon={UserPlus}
              iconColor="text-amber-600"
              iconBg="bg-amber-50/80"
            />
            <KpiCard
              id="kpi-departments"
              title="Business Units"
              value={departments.length}
              subtitle="Across 3 offices"
              trend="up"
              icon={Building2}
              iconColor="text-purple-600"
              iconBg="bg-purple-50/80"
            />
          </div>

          {/* Department Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/75 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 font-heading mb-4 flex items-center justify-between">
                <span>Headcount by Department</span>
                <span className="text-xs font-normal text-slate-500">Live Roster</span>
              </h3>
              <div className="space-y-3">
                {departments.map((dept) => {
                  const count = employees.filter((e) => e.department === dept.name).length;
                  const pct = Math.round((count / (employees.length || 1)) * 100);

                  return (
                    <div key={dept.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{dept.name}</span>
                        <span>{count} staff ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100/80 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Recent Highlights */}
            <div className="bg-white/75 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading mb-3">
                  Workforce Operations Shortcuts
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setIsAddEmployeeModalOpen(true)}
                    className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:bg-indigo-50/70 text-left transition-all group backdrop-blur-xs bg-white/50"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold text-slate-900">Onboard Talent</div>
                    <div className="text-[10px] text-slate-500">Add employee & docs</div>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('org-structure')}
                    className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:bg-indigo-50/70 text-left transition-all group backdrop-blur-xs bg-white/50"
                  >
                    <Layers className="w-4 h-4 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold text-slate-900">Org Hierarchy</div>
                    <div className="text-[10px] text-slate-500">View reporting trees</div>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80 text-xs text-slate-500 flex items-center justify-between">
                <span>Verified Compliance Documents: 98%</span>
                <span className="text-emerald-600 font-bold">Audit Ready</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EMPLOYEE DIRECTORY & PROFILE DRAWER */}
      {/* ========================================================================= */}
      {activeSubTab === 'employees' && (
        <div className="space-y-4">
          <DataTable<Employee>
            data={employees}
            exportFilename={`Employees_${currentOrg.slug}`}
            title="Employee Directory"
            subtitle="Search and view comprehensive employee profiles, CTC structure, and verified records."
            searchPlaceholder="Search by name, designation, department..."
            actions={
              <button
                onClick={() => setIsAddEmployeeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            }
            filterOptions={[
              {
                label: 'Departments',
                key: 'department',
                options: departments.map((d) => ({ label: d.name, value: d.name })),
              },
              {
                label: 'Status',
                key: 'status',
                options: [
                  { label: 'Active', value: 'Active' },
                  { label: 'Probation', value: 'Probation' },
                  { label: 'Notice Period', value: 'Notice Period' },
                  { label: 'Terminated', value: 'Terminated' },
                ],
              },
            ]}
            columns={[
              {
                header: 'Employee Name',
                accessorKey: 'name',
                sortable: true,
                cell: (row: Employee) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={row.avatar}
                      alt={row.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div
                        onClick={() => setSelectedEmployee(row)}
                        className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer hover:underline"
                      >
                        {row.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{row.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Department & Role',
                cell: (row: Employee) => (
                  <div>
                    <div className="font-semibold text-slate-800">{row.designation}</div>
                    <div className="text-[11px] text-slate-500">{row.department}</div>
                  </div>
                ),
              },
              {
                header: 'Location',
                accessorKey: 'location',
                className: 'text-slate-600',
              },
              {
                header: 'Annual CTC (INR)',
                accessorKey: 'salary',
                sortable: true,
                cell: (row: Employee) => (
                  <span className="font-bold text-slate-900">
                    {formatInr(row.salary)}
                  </span>
                ),
              },
              {
                header: 'Status',
                cell: (row: Employee) => <StatusBadge status={row.status} size="sm" />,
              },
              {
                header: 'Actions',
                cell: (row: Employee) => (
                  <button
                    onClick={() => setSelectedEmployee(row)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Employee Profile"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ORG STRUCTURE & DEPARTMENTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'org-structure' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
              Executive Reporting Hierarchy
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Simulated organizational chain of command and department divisions.
            </p>

            {/* Tree Nodes Visual */}
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* CEO Node */}
              <div className="p-4 bg-indigo-900 text-white rounded-2xl text-center shadow-md">
                <div className="font-bold text-sm">Rajesh Subramanian</div>
                <div className="text-xs text-indigo-300">Chief Executive Officer (CEO)</div>
                <div className="text-[10px] text-indigo-200 mt-1">Direct reports: 4 Department Leads</div>
              </div>

              <div className="w-0.5 h-6 bg-slate-300 mx-auto" />

              {/* Department Heads Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {departments.slice(0, 3).map((dept) => (
                  <div
                    key={dept.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-xs"
                  >
                    <div className="font-bold text-xs text-slate-900">{dept.name}</div>
                    <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                      Lead: {dept.headName}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {employees.filter((e) => e.department === dept.name).length} Team Members
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department List Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-4">
              Registered Business Departments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900">{dept.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Department Head: <strong className="text-slate-800">{dept.headName}</strong>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Monthly Budget: <strong className="text-indigo-700">{dept.budgetInr}</strong>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                    {dept.employeeCount} Staff
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LIFECYCLE & ONBOARDING */}
      {/* ========================================================================= */}
      {activeSubTab === 'lifecycle' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
              Onboarding & Transition Workflows
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Track candidate document verification, probation reviews, and exit clearances.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Ready to Onboard
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    3 New Joiners
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Background check cleared. IT asset dispatch and email provisioning queued.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Probation Review Due
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {probationEmployees.length} Staff
                  </span>
                </div>
                <p className="text-xs text-amber-800">
                  90-day performance review checklist pending manager sign-off.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    Notice Period Exits
                  </span>
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    {noticeEmployees.length} Exits
                  </span>
                </div>
                <p className="text-xs text-rose-800">
                  Handover protocols, asset returns, and Full & Final settlement workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EMPLOYEE PROFILE DETAIL MODAL / DRAWER */}
      {/* ========================================================================= */}
      {selectedEmployee && (
        <Modal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          title={selectedEmployee.name}
          subtitle={`${selectedEmployee.designation} • ${selectedEmployee.department}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(true)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                Change Lifecycle Status...
              </button>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                Close Profile
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Header info card */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base">
                    {selectedEmployee.name}
                  </h4>
                  <StatusBadge status={selectedEmployee.status} />
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Email: {selectedEmployee.email}</span>
                  <span>Phone: {selectedEmployee.phone}</span>
                  <span>Location: {selectedEmployee.location}</span>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setProfileActiveTab('details')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  profileActiveTab === 'details'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview & Org
              </button>
              <button
                onClick={() => setProfileActiveTab('salary')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  profileActiveTab === 'salary'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Compensation Structure
              </button>
              <button
                onClick={() => setProfileActiveTab('docs')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  profileActiveTab === 'docs'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Verified Documents ({selectedEmployee.documents?.length || 0})
              </button>
              <button
                onClick={() => setProfileActiveTab('history')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  profileActiveTab === 'history'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Timeline History
              </button>
            </div>

            {/* Tab 1: Details */}
            {profileActiveTab === 'details' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Reporting Manager</span>
                  <span className="font-bold text-slate-800">{selectedEmployee.reportingManager || 'Rajesh Subramanian'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Date of Joining</span>
                  <span className="font-bold text-slate-800">{selectedEmployee.joiningDate}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Employment Type</span>
                  <span className="font-bold text-slate-800">{selectedEmployee.employmentType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Department Division</span>
                  <span className="font-bold text-slate-800">{selectedEmployee.department}</span>
                </div>
              </div>
            )}

            {/* Tab 2: Salary Structure */}
            {profileActiveTab === 'salary' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-indigo-950">Annual Gross CTC</span>
                  <span className="font-extrabold text-indigo-700 text-sm font-mono">
                    {formatInr(selectedEmployee.salary)} / year
                  </span>
                </div>
                <div className="space-y-2 divide-y divide-slate-100">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Basic Salary (50%)</span>
                    <span className="font-bold text-slate-800">{formatInr(selectedEmployee.salary * 0.5)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">House Rent Allowance - HRA (20%)</span>
                    <span className="font-bold text-slate-800">{formatInr(selectedEmployee.salary * 0.2)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Special & Flexi Allowance (30%)</span>
                    <span className="font-bold text-slate-800">{formatInr(selectedEmployee.salary * 0.3)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Documents Vault */}
            {profileActiveTab === 'docs' && (
              <div className="space-y-2">
                {selectedEmployee.documents?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800">{doc.name}</span>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                      Verified {doc.uploadDate}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: History Timeline */}
            {profileActiveTab === 'history' && (
              <div className="space-y-2">
                {selectedEmployee.history?.map((hist, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{hist.date}</span>
                      <span>By: {hist.actor}</span>
                    </div>
                    <p className="font-semibold text-slate-800 mt-1">{hist.event}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Change Status Modal */}
      {isStatusModalOpen && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title="Update Employee Lifecycle Status"
          subtitle={`Modify organizational status for ${selectedEmployee?.name}`}
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyStatusChange}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Apply Transition
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                New Lifecycle Status
              </label>
              <select
                value={newStatusValue}
                onChange={(e: any) => setNewStatusValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="Active">Active (Confirmed Staff)</option>
                <option value="Probation">Under Probation (Trial Period)</option>
                <option value="Notice Period">Notice Period (Resigned)</option>
                <option value="Terminated">Terminated / Relieved</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reason / Note for Audit Trail
              </label>
              <textarea
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder="e.g. Probation review completed with 4.8 star rating."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                rows={3}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        title="Add New Employee (In-Memory Roster)"
        subtitle="Registers an employee to the client-side roster with auto-calculated compensation structure."
        maxWidth="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddEmployeeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddEmployee}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Save Employee
            </button>
          </>
        }
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                placeholder="e.g. Neha"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                placeholder="e.g. Sharma"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="neha@company.in"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Department
              </label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Designation
              </label>
              <select
                value={newDesig}
                onChange={(e) => setNewDesig(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                {designations.map((des) => (
                  <option key={des.id} value={des.title}>
                    {des.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Annual Fixed CTC (INR) *
              </label>
              <input
                type="number"
                required
                value={newSalary}
                onChange={(e) => setNewSalary(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={newJoiningDate}
                onChange={(e) => setNewJoiningDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
