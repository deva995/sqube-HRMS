import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Award,
  TrendingUp,
  Briefcase,
  Smartphone,
  MapPin,
  FileText,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Shield,
  MessageSquare,
  Star,
  Check,
  Send,
  Sliders,
  UserCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { KpiCard } from '../common/KpiCard';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import { Modal } from '../common/Modal';
import { formatInr } from '../../utils/payrollCalc';
import confetti from 'canvas-confetti';

export const ManagerDashboardView: React.FC = () => {
  const {
    currentOrg,
    employees,
    attendanceRecords,
    leaveRequests,
    regularizationRequests,
    goals,
    reviews,
    interviews,
    approveLeaveRequest,
    rejectLeaveRequest,
    approveRegularization,
    rejectRegularization,
    submitInterviewFeedback,
    updateGoalProgress,
    todayUserRecord,
    clockIn,
    clockOut,
    setIsFieldStaffModalOpen,
    setIsExecutiveReportModalOpen,
    showToast,
    navigateTo,
  } = useHrms();

  // Filter direct reports in manager's department (Engineering)
  const myTeam = employees.filter((e) => e.department.includes('Engineering') || e.department.includes('Product'));
  const pendingLeaves = leaveRequests.filter((r) => r.status === 'Pending');
  const pendingRegularizations = regularizationRequests.filter((r) => r.status === 'Pending');
  const myTeamGoals = goals.filter((g) => g.department === 'Engineering' || (g as any).type === 'Team' || g.category === 'Team');
  const upcomingInterviews = interviews.filter((i) => i.status === 'Scheduled');

  // Modal states for manager actions
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [interviewScore, setInterviewScore] = useState<number>(4);
  const [interviewFeedbackText, setInterviewFeedbackText] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'team' | 'approvals' | 'okrs' | 'interviews' | 'my-ess'>('team');

  const handleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    submitInterviewFeedback(selectedInterview.id, interviewScore, interviewFeedbackText || 'Strong technical and problem solving capabilities demonstrated.');
    setSelectedInterview(null);
    setInterviewFeedbackText('');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div id="manager-dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Manager Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-3 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Role 3.1 • Department & Line Manager Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Engineering Team Command Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Oversee direct report attendance, expedite 1-click leave & regularization approvals, evaluate candidate interviews, and cascade quarterly OKRs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsFieldStaffModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Simulate Mobile Punch</span>
            </button>
            <button
              onClick={() => setIsExecutiveReportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-300" />
              <span>Team Productivity Report</span>
            </button>
          </div>
        </div>
      </div>

      <PrototypeDisclaimer
        type="general"
        customText="Role 3.1 Manager View: You have approval authority over team leaves and attendance regularizations, 360 appraisal review privileges, candidate interview scorecards, and team OKR trackers."
      />

      {/* Quick KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="kpi-manager-directs"
          title="Direct Reports"
          value={`${myTeam.length} Members`}
          subtitle="Engineering & Product"
          trend="up"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50/80"
          onClick={() => setActiveTab('team')}
        />
        <KpiCard
          id="kpi-manager-leaves"
          title="Pending Approvals"
          value={`${pendingLeaves.length + pendingRegularizations.length} Requests`}
          subtitle={`${pendingLeaves.length} Leaves • ${pendingRegularizations.length} Regularizations`}
          trend={pendingLeaves.length > 0 ? 'down' : 'up'}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50/80"
          onClick={() => setActiveTab('approvals')}
        />
        <KpiCard
          id="kpi-manager-okrs"
          title="Team Goal Progress"
          value="78% On Track"
          subtitle={`${myTeamGoals.length} Active Key Results`}
          trend="up"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50/80"
          onClick={() => setActiveTab('okrs')}
        />
        <KpiCard
          id="kpi-manager-interviews"
          title="Candidate Interviews"
          value={`${upcomingInterviews.length} Scheduled`}
          subtitle="Technical & Architecture"
          trend="neutral"
          icon={Briefcase}
          iconColor="text-blue-600"
          iconBg="bg-blue-50/80"
          onClick={() => setActiveTab('interviews')}
        />
      </div>

      {/* Tab Navigation Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'team'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>My Team Direct Reports ({myTeam.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'approvals'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Approval Queue</span>
          {pendingLeaves.length + pendingRegularizations.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingLeaves.length + pendingRegularizations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('okrs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'okrs'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Team OKRs & 360 Appraisals</span>
        </button>

        <button
          onClick={() => setActiveTab('interviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'interviews'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Hiring Interviews ({upcomingInterviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my-ess')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'my-ess'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>My Personal Punch & ESS</span>
        </button>
      </div>

      {/* Tab 1: My Team Direct Reports */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Direct Reports & Today's Attendance</h2>
              <p className="text-xs text-slate-500">Live roster of engineering staff, shift status, and punch locations.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
              Department: Engineering
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {myTeam.map((emp) => {
              const punch = attendanceRecords.find((a) => a.employeeId === emp.id);
              const isPresent = punch?.status === 'Present';

              return (
                <div key={emp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={emp.avatar}
                      alt={emp.name || `${emp.firstName} ${emp.lastName}`}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {emp.name || `${emp.firstName} ${emp.lastName}`}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {emp.employeeCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {emp.designation} • {emp.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Punch Status Badge */}
                    <div className="text-right">
                      {isPresent ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Clocked In at {punch.clockInTime}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Not Punched Today</span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Shift: General (09:00 AM - 06:00 PM)
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        showToast({
                          title: `Employee Profile - ${emp.firstName}`,
                          message: `Annual CTC: ${formatInr(emp.annualCtc)} • Joined: ${emp.joiningDate}`,
                          type: 'info',
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="View Member Record"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Approval Queue (Leaves & Regularization) */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Leave Requests Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Leave Approval Requests</h2>
                <p className="text-xs text-slate-500">Review and approve team time-off applications.</p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                {pendingLeaves.length} Pending
              </span>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">All team leave requests are up to date!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingLeaves.map((req) => (
                  <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{req.employeeName}</span>
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {req.leaveType || (req as any).type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {req.days} Day{req.days > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.startDate} to {req.endDate}</span>
                        <span className="text-slate-300">•</span>
                        <span className="italic text-slate-500">"{req.reason}"</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveLeaveRequest(req.id, 'Rajesh Subramanian (Manager)')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => rejectLeaveRequest(req.id, 'Rajesh Subramanian (Manager)')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Regularization Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Attendance Regularization Requests</h2>
                <p className="text-xs text-slate-500">Approve missed punches or external duty regularizations.</p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                {pendingRegularizations.length} Pending
              </span>
            </div>

            {pendingRegularizations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No pending attendance regularizations.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingRegularizations.map((reg) => (
                  <div key={reg.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{reg.employeeName}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                          Date: {reg.date}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Requested: <span className="font-semibold">{reg.requestedClockIn || '09:00 AM'} - {reg.requestedClockOut || '06:00 PM'}</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span className="italic text-slate-500">"{reg.reason}"</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveRegularization(reg.id, 'Rajesh Subramanian (Manager)')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Regularization</span>
                      </button>
                      <button
                        onClick={() => rejectRegularization(reg.id, 'Rajesh Subramanian (Manager)')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: OKRs & 360 Reviews */}
      {activeTab === 'okrs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Engineering Quarterly Objectives & Key Results (OKRs)</h2>
                <p className="text-xs text-slate-500">Track and update milestone achievement metrics for your department.</p>
              </div>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                Q3 2026 Active Cycle
              </span>
            </div>

            <div className="space-y-3">
              {myTeamGoals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{goal.title}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          Weight: {goal.weightage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{goal.description}</p>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-600 font-mono">
                      {goal.progress}%
                    </span>
                  </div>

                  {/* Progress Bar & Interactive Slider */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Hiring Interviews */}
      {activeTab === 'interviews' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Assigned Candidate Technical Rounds</h2>
              <p className="text-xs text-slate-500">Log interview feedback, evaluate architecture chops, and record ratings.</p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
              Recruitment ATS Connected
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingInterviews.map((int) => (
              <div key={int.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{int.candidateName}</span>
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      {int.jobTitle || 'Senior Software Engineer'}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {int.round || 'System Design Round'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Scheduled: {int.scheduledAt || 'Today 04:00 PM'} (45 min)</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInterview(int)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Submit Scorecard & Feedback</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Manager's Personal ESS */}
      {activeTab === 'my-ess' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personal Self-Service Portal (Manager)</h2>
              <p className="text-xs text-slate-500">Punch in your own daily attendance and inspect personal salary breakdown.</p>
            </div>
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
              Rajesh Subramanian • Director of Engineering
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Punch Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Geofenced Punch-In Terminal</span>
              </h3>
              <p className="text-xs text-slate-600">
                Office Location: Bengaluru HQ (Ecospace Outer Ring Road).
              </p>
              {todayUserRecord?.clockInTime ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Clocked in today at {todayUserRecord.clockInTime} ({todayUserRecord.geofenceStatus || 'Inside HQ Geofence'})</span>
                  </div>
                  <button
                    onClick={clockOut}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Clock Out for Day
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => clockIn({ latitude: 12.9260, longitude: 77.6830, accuracy: 12, isBiometricSimulated: true })}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Punch In (Biometric GPS Verified)
                </button>
              )}
            </div>

            {/* Manager Salary Snapshot */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-500" />
                <span>Compensation Snapshot</span>
              </h3>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Annual CTC:</span>
                <span className="font-bold text-slate-900">₹32,00,000</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Monthly Gross:</span>
                <span className="font-bold text-slate-900">₹2,66,666</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Net Estimated Take-Home:</span>
                <span className="font-bold text-emerald-600">₹2,14,500</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scorecard Modal */}
      {selectedInterview && (
        <Modal
          isOpen={!!selectedInterview}
          onClose={() => setSelectedInterview(null)}
          title={`Interview Scorecard • ${selectedInterview.candidateName}`}
          subtitle={`Round: ${selectedInterview.round || 'Technical'} • Position: ${selectedInterview.jobTitle || 'Engineering'}`}
        >
          <form onSubmit={handleInterviewSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Performance Rating (1 - 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setInterviewScore(star)}
                    className={`p-2 rounded-lg border transition-all ${
                      interviewScore >= star
                        ? 'bg-amber-50 border-amber-400 text-amber-600'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {interviewScore} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technical Feedback & Architecture Observations
              </label>
              <textarea
                rows={3}
                required
                value={interviewFeedbackText}
                onChange={(e) => setInterviewFeedbackText(e.target.value)}
                placeholder="Candidate showed deep understanding of distributed systems and microservice caching patterns. Recommended for Offer round."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInterview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                Submit Scorecard
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
