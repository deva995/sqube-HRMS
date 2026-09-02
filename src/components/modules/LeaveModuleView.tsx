import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Award,
  Users,
  CalendarCheck,
  FileText,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { KpiCard } from '../common/KpiCard';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { LeaveRequest } from '../../types';

export const LeaveModuleView: React.FC = () => {
  const {
    leaveRequests,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    currentUserRole,
    currentUserPersona,
    showToast,
  } = useHrms();

  const [activeTab, setActiveTab] = useState<'requests' | 'balances' | 'calendar'>('requests');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Leave Form state
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Earned Leave (EL)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState('');

  const isManagerOrAdmin = ['Super Admin', 'Admin', 'HR Manager', 'Manager', 'Team Lead'].includes(currentUserRole);

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      const matchStatus = statusFilter === 'All' || req.status === statusFilter;
      const matchQuery =
        !searchQuery ||
        req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [leaveRequests, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter((r) => r.status === 'Pending').length;
    const approved = leaveRequests.filter((r) => r.status === 'Approved').length;
    const rejected = leaveRequests.filter((r) => r.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [leaveRequests]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast({ message: 'Please provide a reason for leave application.', type: 'error' });
      return;
    }

    submitLeaveRequest({
      employeeId: currentUserPersona.id || 'emp-acro-104',
      employeeName: currentUserPersona.name || 'Sneha Patel',
      department: currentUserPersona.department || 'Engineering',
      leaveType,
      startDate,
      endDate,
      days: Math.max(1, days),
      reason,
    });

    setIsApplyModalOpen(false);
    setReason('');
    setDays(1);
    showToast({ message: 'Leave application submitted successfully for manager approval.', type: 'success' });
  };

  const leaveBalances = [
    { type: 'Earned Leave (EL)', total: 18, used: 4, pending: 1, available: 13, color: 'from-blue-500 to-indigo-600', icon: Calendar },
    { type: 'Casual Leave (CL)', total: 12, used: 3, pending: 0, available: 9, color: 'from-emerald-500 to-teal-600', icon: Clock },
    { type: 'Sick Leave (SL)', total: 12, used: 2, pending: 0, available: 10, color: 'from-rose-500 to-red-600', icon: HeartPulse },
    { type: 'Comp Off', total: 4, used: 1, pending: 0, available: 3, color: 'from-purple-500 to-indigo-600', icon: Award },
    { type: 'Maternity / Paternity', total: 180, used: 0, pending: 0, available: 180, color: 'from-amber-500 to-orange-600', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-indigo-600" />
            Leave & Time-Off Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative leave policies, automated statutory accruals, team calendar visibility, and multi-tier approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Apply for Leave
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Applications"
          value={stats.total}
          subtitle="All-time organization records"
          icon={<FileText className="w-5 h-5 text-indigo-600" />}
          gradient="from-indigo-500/10 to-blue-500/10"
        />
        <KpiCard
          title="Pending Approvals"
          value={stats.pending}
          subtitle="Awaiting manager review"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          gradient="from-amber-500/10 to-orange-500/10"
        />
        <KpiCard
          title="Approved Leaves"
          value={stats.approved}
          subtitle="Active / scheduled time-off"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <KpiCard
          title="Rejected / Cancelled"
          value={stats.rejected}
          subtitle="Non-qualifying submissions"
          icon={<XCircle className="w-5 h-5 text-rose-600" />}
          gradient="from-rose-500/10 to-red-500/10"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Leave Applications ({leaveRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'balances'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Statutory Leave Balances
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'calendar'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Team Time-Off Calendar
        </button>
      </div>

      {/* Tab 1: Requests Table */}
      {activeTab === 'requests' && (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Filter:</span>
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee, leave type, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Leave Type</th>
                  <th className="py-3.5 px-4">Duration & Dates</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No leave requests found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{req.employeeName}</div>
                        <div className="text-[11px] text-slate-500">{req.department}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{req.leaveType}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {req.startDate} {req.startDate !== req.endDate && `to ${req.endDate}`}
                        </div>
                        <div className="text-[11px] text-slate-400">Applied on {req.appliedDate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {req.days} {req.days === 1 ? 'day' : 'days'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                        {req.approverName && (
                          <div className="text-[10px] text-slate-400 mt-0.5">by {req.approverName}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'Pending' && isManagerOrAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                approveLeaveRequest(req.id, currentUserPersona.name || 'Manager');
                                showToast({ message: `Approved leave request for ${req.employeeName}`, type: 'success' });
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs rounded-lg border border-emerald-200 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                rejectLeaveRequest(req.id, currentUserPersona.name || 'Manager');
                                showToast({ message: `Rejected leave request for ${req.employeeName}`, type: 'warning' });
                              }}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-lg border border-rose-200 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            {req.status === 'Approved' ? 'Finalized' : req.status === 'Rejected' ? 'Declined' : 'Submitted'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Leave Balances */}
      {activeTab === 'balances' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveBalances.map((bal) => {
            const IconComponent = bal.icon;
            const percentUsed = Math.round((bal.used / bal.total) * 100);
            return (
              <div key={bal.type} className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${bal.color} flex items-center justify-center text-white shadow-md`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Annual Quota
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{bal.type}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900">{bal.available}</span>
                    <span className="text-xs text-slate-500 font-medium">days available</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Used: {bal.used} days</span>
                    <span>Total: {bal.total} days</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${bal.color} rounded-full transition-all`}
                      style={{ width: `${Math.min(100, percentUsed)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Team Calendar */}
      {activeTab === 'calendar' && (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              September 2026 — Team Availability Schedule
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700">September 2026</span>
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {leaveRequests.filter(r => r.status === 'Approved').map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {req.employeeName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-900">{req.employeeName}</span>
                    <span className="text-xs text-slate-500 ml-2">({req.department})</span>
                    <div className="text-[11px] text-slate-600 mt-0.5">{req.leaveType} — {req.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-700">{req.startDate} to {req.endDate}</span>
                  <div className="text-[11px] text-slate-500">{req.days} days approved</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply for Time-Off / Leave">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Earned Leave (EL)">Earned Leave (EL) - 13 available</option>
              <option value="Casual Leave (CL)">Casual Leave (CL) - 9 available</option>
              <option value="Sick Leave (SL)">Sick Leave (SL) - 10 available</option>
              <option value="Comp Off">Comp Off - 3 available</option>
              <option value="Maternity / Paternity">Maternity / Paternity Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Days</label>
            <input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a clear justification for your leave request..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
