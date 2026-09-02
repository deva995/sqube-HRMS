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
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { KpiCard } from '../common/KpiCard';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import { Modal } from '../common/Modal';
import { formatInr } from '../../utils/payrollCalc';
import confetti from 'canvas-confetti';

export const EmployeeEssDashboardView: React.FC = () => {
  const {
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

  // Active user's data
  const myLeaves = leaveRequests.filter((r) => r.employeeId === 'emp-eng-001' || r.employeeName?.includes('Aarav'));
  const myGoals = goals.filter((g) => g.employeeId === 'emp-eng-001' || (g as any).type === 'Individual' || g.category === 'Individual');
  const myLatestPayslip = payslips[0];

  // Leave Form Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Earned Leave'>('Casual Leave');
  const [leaveDays, setLeaveDays] = useState<number>(1);
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveStartDate, setLeaveStartDate] = useState<string>('2026-09-05');
  const [leaveEndDate, setLeaveEndDate] = useState<string>('2026-09-05');

  // Regularization Modal
  const [isRegModalOpen, setIsRegModalOpen] = useState<boolean>(false);
  const [regDate, setRegDate] = useState<string>('2026-08-28');
  const [regClockIn, setRegClockIn] = useState<string>('09:05 AM');
  const [regClockOut, setRegClockOut] = useState<string>('06:15 PM');
  const [regReason, setRegReason] = useState<string>('On-site client meeting at Electronic City branch.');

  // Tax Regime State
  const [selectedTaxRegime, setSelectedTaxRegime] = useState<'new' | 'old'>('new');

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaveRequest({
      employeeId: 'emp-eng-001',
      employeeName: 'Aarav Patel',
      department: 'Engineering',
      leaveType: leaveType as any,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      days: leaveDays,
      reason: leaveReason || 'Personal urgent work',
    });
    setIsLeaveModalOpen(false);
    setLeaveReason('');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRegularization({
      employeeId: 'emp-eng-001',
      employeeName: 'Aarav Patel',
      date: regDate,
      requestedClockIn: regClockIn,
      requestedClockOut: regClockOut,
      reason: regReason,
    });
    setIsRegModalOpen(false);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const isClockedIn = !!todayUserRecord?.clockInTime;

  return (
    <div id="employee-ess-dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-sky-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold mb-3 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Role 3.3 • Executive / Individual Contributor (ESS Portal)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Welcome back, Aarav Patel
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Senior Full Stack Developer • Bengaluru HQ • Shift: General (09:00 AM - 06:00 PM)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
            <button
              onClick={() => setIsRegModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4 text-sky-300" />
              <span>Request Regularization</span>
            </button>
          </div>
        </div>
      </div>

      <PrototypeDisclaimer
        type="general"
        customText="Role 3.3 Executive / IC View: You have Employee Self-Service (ESS) capabilities: GPS Geofence punch-in, personal leave balance tracking, salary slip downloads, tax regime calculator, and personal OKR updates."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="kpi-ess-leaves"
          title="Available Leaves"
          value="18.5 Days"
          subtitle="12 Earned • 4 Casual • 2.5 Sick"
          trend="neutral"
          icon={Calendar}
          iconColor="text-sky-600"
          iconBg="bg-sky-50/80"
          onClick={() => setIsLeaveModalOpen(true)}
        />
        <KpiCard
          id="kpi-ess-salary"
          title="August Net Pay"
          value="₹1,18,450"
          subtitle="Processed • Bank Disbursed"
          trend="up"
          icon={IndianRupee}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50/80"
          onClick={() => {
            showToast({
              title: 'Payslip Downloaded',
              message: 'August 2026 Salary Slip PDF saved.',
              type: 'success',
            });
          }}
        />
        <KpiCard
          id="kpi-ess-attendance"
          title="Monthly Attendance"
          value="98.2%"
          subtitle="21 Days Present • 1 Leave"
          trend="up"
          icon={CheckCircle2}
          iconColor="text-teal-600"
          iconBg="bg-teal-50/80"
        />
        <KpiCard
          id="kpi-ess-okr"
          title="Personal OKRs"
          value="85% Complete"
          subtitle="3 Goals in Q3 Sprint"
          trend="up"
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50/80"
        />
      </div>

      {/* Primary 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: GPS Geofence Terminal + My Leaves */}
        <div className="lg:col-span-2 space-y-6">
          {/* GPS Punch-In Terminal */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Live GPS Geofence Terminal</h2>
                  <p className="text-xs text-slate-500">Bengaluru HQ Zone (12.9260° N, 77.6830° E • 200m Radius)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Inside Authorized Zone (14m)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-600">Today's Punch Status</div>
                {isClockedIn ? (
                  <div className="text-sm font-bold text-emerald-600 mt-0.5">
                    Clocked in at {todayUserRecord.clockInTime} • {todayUserRecord.geofenceStatus || 'Inside HQ Geofence'}
                  </div>
                ) : (
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    Ready to punch in for General Shift (09:00 AM)
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isClockedIn ? (
                  <button
                    onClick={clockOut}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    Clock Out for Day
                  </button>
                ) : (
                  <button
                    onClick={() => clockIn({ latitude: 12.9260, longitude: 77.6830, accuracy: 12, isBiometricSimulated: true })}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Clock In (Verified GPS)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* My Leave Applications Log */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">My Leave Applications & History</h2>
                <p className="text-xs text-slate-500">Track approvals submitted to Rajesh Subramanian (Manager).</p>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold border border-sky-200/60 transition-colors cursor-pointer"
              >
                + New Application
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {myLeaves.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active leave applications.
                </div>
              ) : (
                myLeaves.map((leave) => (
                  <div key={leave.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{leave.leaveType || (leave as any).type}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({leave.days} Day{leave.days > 1 ? 's' : ''})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          leave.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : leave.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {leave.startDate} to {leave.endDate} • <span className="italic">"{leave.reason}"</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Personal OKRs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">My Individual OKRs & Goals (Q3 2026)</h2>
                <p className="text-xs text-slate-500">Direct engineering deliverables and microservice performance targets.</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Individual Contributor
              </span>
            </div>

            <div className="space-y-3">
              {myGoals.map((goal) => (
                <div key={goal.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{goal.title}</span>
                    <span className="font-extrabold text-sky-600 font-mono">{goal.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                    className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Salary & Tax + Verified Document Vault */}
        <div className="space-y-6">
          {/* Monthly Payslip Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Monthly Compensation</span>
              </h2>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                August 2026
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/60 space-y-2">
              <div className="text-xs text-slate-600">Net Take-Home Pay</div>
              <div className="text-2xl font-extrabold text-emerald-700">₹1,18,450</div>
              <div className="text-[11px] text-slate-500">Credited to HDFC Bank (A/C **4902)</div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Basic Salary:</span>
                <span className="font-bold text-slate-800">₹72,500</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">House Rent Allowance (HRA):</span>
                <span className="font-bold text-slate-800">₹36,250</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Provident Fund (EPF):</span>
                <span className="font-bold text-rose-600">- ₹8,700</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Professional Tax (PT):</span>
                <span className="font-bold text-rose-600">- ₹200</span>
              </div>
            </div>

            <button
              onClick={() => {
                showToast({
                  title: 'Payslip Download Triggered',
                  message: 'Generated official PDF with digital signature.',
                  type: 'success',
                });
                confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Payslip</span>
            </button>
          </div>

          {/* Tax Regime Calculator */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Indian Tax Regime Selection</span>
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedTaxRegime('new');
                  showToast({ title: 'Tax Regime Updated', message: 'New Regime (Section 115BAC) selected.', type: 'info' });
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedTaxRegime === 'new'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">New Regime</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Lower slabs • S.D. ₹75,000</div>
              </button>

              <button
                onClick={() => {
                  setSelectedTaxRegime('old');
                  showToast({ title: 'Tax Regime Updated', message: 'Old Regime selected (HRA/80C active).', type: 'info' });
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedTaxRegime === 'old'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Old Regime</div>
                <div className="text-[10px] text-slate-500 mt-0.5">80C/80D Exemptions</div>
              </button>
            </div>
          </div>

          {/* Verified Document Vault */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Verified Document Vault</span>
            </h2>

            <div className="space-y-2 text-xs">
              {[
                { title: 'Aadhaar Card (UIDAI)', verified: true },
                { title: 'Permanent Account Number (PAN)', verified: true },
                { title: 'Signed Offer Letter & NDA', verified: true },
                { title: 'Form 16 Tax Certificate (FY 25-26)', verified: true },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-700 font-medium">{doc.title}</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <Modal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          title="Apply for Time-Off / Leave"
          subtitle="Directly routes to Rajesh Subramanian (Director of Engineering) for approval"
        >
          <form onSubmit={handleLeaveSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Leave Category</label>
              <select
                value={leaveType}
                onChange={(e: any) => setLeaveType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="Casual Leave">Casual Leave (4.0 Balance)</option>
                <option value="Sick Leave">Sick Leave (2.5 Balance)</option>
                <option value="Earned Leave">Earned Leave (12.0 Balance)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={leaveStartDate}
                  onChange={(e) => setLeaveStartDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={leaveEndDate}
                  onChange={(e) => setLeaveEndDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Leave</label>
              <textarea
                rows={3}
                required
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="E.g. Attending family function / medical recovery."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md"
              >
                Submit Application
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Regularization Modal */}
      {isRegModalOpen && (
        <Modal
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          title="Attendance Regularization Request"
          subtitle="Submit missed punch or external field assignment correction"
        >
          <form onSubmit={handleRegSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date to Regularize</label>
              <input
                type="date"
                value={regDate}
                onChange={(e) => setRegDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">In-Time</label>
                <input
                  type="text"
                  value={regClockIn}
                  onChange={(e) => setRegClockIn(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Out-Time</label>
                <input
                  type="text"
                  value={regClockOut}
                  onChange={(e) => setRegClockOut(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Reason</label>
              <textarea
                rows={3}
                required
                value={regReason}
                onChange={(e) => setRegReason(e.target.value)}
                placeholder="Reason for missed biometric/GPS punch..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRegModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md"
              >
                Submit Regularization
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
