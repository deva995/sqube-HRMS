import React, { useState } from 'react';
import {
  UserCheck,
  MapPin,
  Clock,
  Calendar,
  IndianRupee,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Shield,
  Smartphone,
  ChevronRight,
  Sparkles,
  Send,
  Plus,
  Info,
  Receipt,
  Heart,
  User,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { KpiCard } from '../common/KpiCard';
import { Modal } from '../common/Modal';
import { fileApi } from '../../services/fileApi';
import confetti from 'canvas-confetti';

export const EssModuleView: React.FC = () => {
  const {
    currentUserPersona,
    todayUserRecord,
    clockIn,
    clockOut,
    leaveRequests,
    submitLeaveRequest,
    submitRegularization,
    goals,
    updateGoalProgress,
    payslips,
    showToast,
    setIsFieldStaffModalOpen,
  } = useHrms();

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leaves' | 'payslips' | 'goals'>('overview');

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<any>('Earned Leave (EL)');
  const [leaveStartDate, setLeaveStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('');

  // Clock in GPS loading
  const [isClockingIn, setIsClockingIn] = useState(false);

  const isClockedIn = !!todayUserRecord?.clockInTime;

  const handleQuickClockIn = () => {
    setIsClockingIn(true);
    if (!navigator.geolocation) {
      showToast({ message: 'Geolocation is not supported by your browser.', type: 'error' });
      setIsClockingIn(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result = clockIn({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setIsClockingIn(false);
        if (result.success) {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        }
      },
      (error) => {
        // Fallback with default office coordinates for desktop demo
        const result = clockIn({
          latitude: 12.9279,
          longitude: 77.6271,
          accuracy: 10,
        });
        setIsClockingIn(false);
        if (result.success) {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaveRequest({
      employeeId: currentUserPersona.id || 'emp-acro-104',
      employeeName: currentUserPersona.name || 'Sneha Patel',
      department: currentUserPersona.department || 'Engineering',
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      days: Math.max(1, leaveDays),
      reason: leaveReason || 'Personal urgent matter',
    });
    setIsLeaveModalOpen(false);
    setLeaveReason('');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    showToast({ message: 'Leave application submitted to your reporting manager.', type: 'success' });
  };

  const myLeaves = leaveRequests.filter(
    (r) => r.employeeId === currentUserPersona.id || r.employeeName === currentUserPersona.name
  );

  const myGoals = goals.filter(
    (g) => g.employeeId === currentUserPersona.id || g.employeeName === currentUserPersona.name
  );

  return (
    <div className="space-y-6">
      {/* Top ESS Profile Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUserPersona.avatar}
              alt={currentUserPersona.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{currentUserPersona.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentUserPersona.role}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>{currentUserPersona.designation}</span>
              <span>•</span>
              <span>{currentUserPersona.department}</span>
              <span>•</span>
              <span>{currentUserPersona.email}</span>
            </div>
          </div>
        </div>

        {/* Quick Attendance Clock Widget */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
          <div className="text-right pr-2">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Today's Punch</div>
            <div className="text-sm font-extrabold text-slate-900">
              {todayUserRecord?.clockInTime ? todayUserRecord.clockInTime : 'Not Clocked In'}
            </div>
          </div>

          {!isClockedIn ? (
            <button
              onClick={handleQuickClockIn}
              disabled={isClockingIn}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {isClockingIn ? 'Verifying GPS...' : 'Clock In Now'}
            </button>
          ) : (
            <button
              onClick={clockOut}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Clock Out
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Available Leave"
          value="22 Days"
          subtitle="Earned + Casual Quota"
          icon={<Calendar className="w-5 h-5 text-indigo-600" />}
          gradient="from-indigo-500/10 to-blue-500/10"
        />
        <KpiCard
          title="This Month Attendance"
          value="98.2%"
          subtitle="21/22 Days Present"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <KpiCard
          title="Latest Net Salary"
          value="₹1,24,500"
          subtitle="August 2026 Payslip"
          icon={<IndianRupee className="w-5 h-5 text-purple-600" />}
          gradient="from-purple-500/10 to-indigo-500/10"
        />
        <KpiCard
          title="Active Goals (OKRs)"
          value={myGoals.length}
          subtitle="Average 72% Progress"
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
          gradient="from-amber-500/10 to-orange-500/10"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          My Overview
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'leaves'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          My Time-Off & Leaves ({myLeaves.length})
        </button>
        <button
          onClick={() => setActiveTab('payslips')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'payslips'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          My Payslips ({payslips.length})
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'goals'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          My Goals & Reviews ({myGoals.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Quick ESS Actions
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="p-4 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-100 text-left transition-all group"
              >
                <Calendar className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900">Apply for Leave</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Submit request to manager</div>
              </button>

              <button
                onClick={() => setIsFieldStaffModalOpen(true)}
                className="p-4 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-100 text-left transition-all group"
              >
                <Smartphone className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900">Mobile Field Punch</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Simulate GPS coordinates</div>
              </button>

              <button
                onClick={() => setActiveTab('payslips')}
                className="p-4 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-100 text-left transition-all group"
              >
                <IndianRupee className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900">Download Payslip</div>
                <div className="text-[11px] text-slate-500 mt-0.5">August 2026 statement</div>
              </button>

              <button
                onClick={() => setActiveTab('goals')}
                className="p-4 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-100 text-left transition-all group"
              >
                <TrendingUp className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900">Update Goal OKR</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Log quarterly progress</div>
              </button>
            </div>
          </div>

          {/* Goals Snapshot */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>My Active Goals</span>
              <span className="text-xs font-semibold text-indigo-600 cursor-pointer" onClick={() => setActiveTab('goals')}>
                View All
              </span>
            </h3>

            <div className="space-y-3">
              {myGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs text-slate-900">{goal.title}</span>
                    <span className="text-xs font-bold text-indigo-600">{goal.currentProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${goal.currentProgress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Leaves */}
      {activeTab === 'leaves' && (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">My Leave History</h3>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              + Apply Leave
            </button>
          </div>

          <div className="space-y-3">
            {myLeaves.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No leave requests found.</div>
            ) : (
              myLeaves.map((l) => (
                <div key={l.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{l.leaveType}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{l.startDate} to {l.endDate} ({l.days} days) • Reason: {l.reason}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    l.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {l.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Payslips */}
      {activeTab === 'payslips' && (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">My Monthly Salary Payslips</h3>

          <div className="space-y-3">
            {payslips.map((ps) => (
              <div key={ps.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Month: {ps.monthYear}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Gross: ₹{ps.grossEarnings.toLocaleString()} • Deductions: ₹{ps.totalDeductions.toLocaleString()} • Net: ₹{ps.netSalary.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => fileApi.downloadDocument(`payslip-${ps.monthYear}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Payslip
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Goals */}
      {activeTab === 'goals' && (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">My Goals & OKR Deliverables</h3>

          <div className="space-y-4">
            {myGoals.map((g) => (
              <div key={g.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{g.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>
                    <div className="text-[11px] text-slate-400 mt-1">Metric: {g.targetMetric} • Due: {g.dueDate}</div>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                    {g.currentProgress || 0}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g.currentProgress || 0}
                    onChange={(e) => updateGoalProgress(g.id, parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Slide to update</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Apply for Time-Off">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Earned Leave (EL)">Earned Leave (EL)</option>
              <option value="Casual Leave (CL)">Casual Leave (CL)</option>
              <option value="Sick Leave (SL)">Sick Leave (SL)</option>
              <option value="Comp Off">Comp Off</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
            <textarea
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="State the reason for leave..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
