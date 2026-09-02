import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Calendar,
  AlertTriangle,
  FileCheck,
  Send,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  Activity,
  Check,
  XCircle,
  Smartphone,
  UserCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { KpiCard } from '../common/KpiCard';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import { Modal } from '../common/Modal';
import { formatInr } from '../../utils/payrollCalc';
import confetti from 'canvas-confetti';

export const TeamLeadDashboardView: React.FC = () => {
  const {
    employees,
    attendanceRecords,
    regularizationRequests,
    goals,
    approveRegularization,
    rejectRegularization,
    updateGoalProgress,
    todayUserRecord,
    clockIn,
    clockOut,
    setIsFieldStaffModalOpen,
    showToast,
  } = useHrms();

  // Squad direct contributors (Aarav Patel, Divya Nair, Vikram Malhotra, etc.)
  const squadMembers = employees.filter(
    (e) => e.department.includes('Engineering') && e.id !== 'user-manager'
  );

  const pendingRegularizations = regularizationRequests.filter((r) => r.status === 'Pending');
  const squadGoals = goals.filter((g) => (g as any).type === 'Team' || g.category === 'Team' || g.department === 'Engineering');

  const [activeTab, setActiveTab] = useState<'squad' | 'regularizations' | 'sprint-okrs' | 'peer-reviews' | 'my-ess'>('squad');

  // Standup Blocker state
  const [blockerText, setBlockerText] = useState<string>('');
  const [standupNotes, setStandupNotes] = useState<Array<{ id: string; author: string; text: string; time: string; resolved: boolean }>>([
    {
      id: 'note-1',
      author: 'Aarav Patel',
      text: 'Pending Redis cluster credentials from DevOps for microservice caching.',
      time: '09:45 AM',
      resolved: false,
    },
    {
      id: 'note-2',
      author: 'Sneha Kulkarni (Lead)',
      text: 'Production migration scheduled for Friday 10:00 PM IST.',
      time: '10:15 AM',
      resolved: true,
    },
  ]);

  const handleAddStandupNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerText.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      author: 'Sneha Kulkarni (Team Lead)',
      text: blockerText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolved: false,
    };
    setStandupNotes([newNote, ...standupNotes]);
    setBlockerText('');
    showToast({
      title: 'Squad Standup Note Broadcasted',
      message: 'Logged on live pod board.',
      type: 'success',
    });
  };

  return (
    <div id="team-lead-dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold mb-3 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Role 3.2 • Squad Lead & Sprint Operations Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Platform Architecture Squad Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Track pod shift attendance, manage geofence adherence, approve squad attendance adjustments, and resolve daily standup blockers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsFieldStaffModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Squad Field Clock</span>
            </button>
          </div>
        </div>
      </div>

      <PrototypeDisclaimer
        type="general"
        customText="Role 3.2 Team Lead View: You oversee daily pod operations, attendance regularization reviews, sprint milestone tracking, and mentoring feedback for your squad developers."
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="kpi-lead-squad"
          title="Squad Members"
          value={`${squadMembers.length} Engineers`}
          subtitle="Platform & Core Backend"
          trend="up"
          icon={Users}
          iconColor="text-teal-600"
          iconBg="bg-teal-50/80"
          onClick={() => setActiveTab('squad')}
        />
        <KpiCard
          id="kpi-lead-attendance"
          title="Today's Check-in Rate"
          value="92% Present"
          subtitle="HQ Geofence Adherence"
          trend="up"
          icon={MapPin}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50/80"
          onClick={() => setActiveTab('squad')}
        />
        <KpiCard
          id="kpi-lead-regularizations"
          title="Squad Regularizations"
          value={`${pendingRegularizations.length} Pending`}
          subtitle="Missed Punch Adjustments"
          trend={pendingRegularizations.length > 0 ? 'down' : 'up'}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50/80"
          onClick={() => setActiveTab('regularizations')}
        />
        <KpiCard
          id="kpi-lead-sprint"
          title="Sprint 14 Velocity"
          value="84% Completed"
          subtitle="18 of 22 Story Points"
          trend="up"
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50/80"
          onClick={() => setActiveTab('sprint-okrs')}
        />
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('squad')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'squad'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Squad Attendance Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('regularizations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'regularizations'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Regularization Review</span>
          {pendingRegularizations.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingRegularizations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sprint-okrs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sprint-okrs'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Pod Sprint OKRs & Blockers</span>
        </button>

        <button
          onClick={() => setActiveTab('my-ess')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'my-ess'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>My Personal Punch</span>
        </button>
      </div>

      {/* Tab 1: Squad Attendance Roster */}
      {activeTab === 'squad' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pod Developers & Today's Clock-in Log</h2>
              <p className="text-xs text-slate-500">Real-time GPS geofence validation and shift compliance for squad members.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-100">
              Squad: Platform Core Pod
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {squadMembers.map((member) => {
              const punch = attendanceRecords.find((a) => a.employeeId === member.id);
              const isPresent = punch?.status === 'Present';

              return (
                <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={member.avatar}
                      alt={member.name || `${member.firstName} ${member.lastName}`}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {member.name || `${member.firstName} ${member.lastName}`}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {member.employeeCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {member.designation} • {member.workLocation}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {isPresent ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Punched In at {punch.clockInTime} (HQ Zone)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Shift: 09:00 AM - 06:00 PM</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        showToast({
                          title: `Developer Status - ${member.firstName}`,
                          message: `Role: ${member.designation} • Status: ${isPresent ? 'Active On-Site' : 'Awaiting Check-in'}`,
                          type: 'info',
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Tab 2: Regularization Review */}
      {activeTab === 'regularizations' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Squad Attendance Regularizations</h2>
              <p className="text-xs text-slate-500">Approve biometric or field duty adjustment requests submitted by pod developers.</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              Team Lead Review Authority
            </span>
          </div>

          {pendingRegularizations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">All squad regularizations are processed!</p>
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
                      Reason: <span className="italic text-slate-500">"{reg.reason}"</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span>Target: {reg.requestedClockIn || '09:00 AM'} - {reg.requestedClockOut || '06:00 PM'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveRegularization(reg.id, 'Sneha Kulkarni (Team Lead)')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => rejectRegularization(reg.id, 'Sneha Kulkarni (Team Lead)')}
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
      )}

      {/* Tab 3: Sprint OKRs & Daily Standup Notes */}
      {activeTab === 'sprint-okrs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OKRs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Pod Sprint Key Results</h2>
                <p className="text-xs text-slate-500">Milestones assigned to Platform Core Pod.</p>
              </div>
              <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg">
                Sprint 14
              </span>
            </div>

            <div className="space-y-3">
              {squadGoals.map((goal) => (
                <div key={goal.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{goal.title}</span>
                    <span className="font-extrabold text-teal-600 font-mono">{goal.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                    className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Daily Standup & Blocker Board */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Daily Standup & Blocker Board</h2>
                <p className="text-xs text-slate-500">Live communication thread for squad developers.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live Pod Board
              </span>
            </div>

            <form onSubmit={handleAddStandupNote} className="flex gap-2">
              <input
                type="text"
                value={blockerText}
                onChange={(e) => setBlockerText(e.target.value)}
                placeholder="Post a standup blocker or sprint announcement..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>

            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {standupNotes.map((note) => (
                <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{note.author}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{note.time}</span>
                  </div>
                  <p className="text-xs text-slate-600">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team Lead ESS */}
      {activeTab === 'my-ess' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personal Self-Service Portal (Team Lead)</h2>
              <p className="text-xs text-slate-500">Sneha Kulkarni • Lead Software Architect & Squad Lead</p>
            </div>
            <div className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">
              Role 3.2 Lead
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/50 to-emerald-50/50 border border-teal-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>GPS Geofenced Punch-In Terminal</span>
              </h3>
              {todayUserRecord?.clockInTime ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Clocked in today at {todayUserRecord.clockInTime}</span>
                  </div>
                  <button
                    onClick={clockOut}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Clock Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => clockIn({ latitude: 12.9260, longitude: 77.6830, accuracy: 12, isBiometricSimulated: true })}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Punch In (Bengaluru HQ Zone)
                </button>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-500" />
                <span>Compensation Summary</span>
              </h3>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Annual CTC:</span>
                <span className="font-bold text-slate-900">₹24,00,000</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Monthly Net (Est.):</span>
                <span className="font-bold text-emerald-600">₹1,62,000</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
