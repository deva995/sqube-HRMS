import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  IndianRupee,
  Briefcase,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Globe2,
  Filter,
  ArrowRight,
  UserCheck,
  Shield,
  Search,
  Check,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { ActivityCategory } from '../../types';
import { formatInr } from '../../utils/payrollCalc';

interface ActivityFeedItem {
  id: string;
  orgId: string;
  category: ActivityCategory;
  title: string;
  subtitle: string;
  description?: string;
  timestamp: string;
  timeSortKey: number; // for chronological sorting
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Processing' | 'Info';
  actorName: string;
  actorAvatar?: string;
  actorRole?: string;
  metadata?: {
    leaveId?: string;
    payrollRunId?: string;
    candidateId?: string;
    employeeId?: string;
    amount?: number;
    days?: number;
    dates?: string;
    targetModule?: string;
    targetTab?: string;
  };
}

export const RecentActivityWidget: React.FC = () => {
  const {
    currentOrgId,
    currentOrg,
    organizations,
    switchOrganization,
    allLeaveRequests,
    payrollRuns,
    candidates,
    interviews,
    regularizationRequests,
    auditLogs,
    approveLeaveRequest,
    rejectLeaveRequest,
    navigateTo,
  } = useHrms();

  // Widget internal state for organization view mode
  // 'all' = view consolidated cross-organization activity, or specific org ID
  const [scopeFilter, setScopeFilter] = useState<'current' | 'all'>(
    currentOrgId === 'all' ? 'all' : 'current'
  );
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<{ id: string; text: string } | null>(null);

  // Sync scopeFilter when currentOrgId changes from outside
  React.useEffect(() => {
    if (currentOrgId === 'all') {
      setScopeFilter('all');
    }
  }, [currentOrgId]);

  // Aggregate and normalize all activity items chronologically
  const allActivities: ActivityFeedItem[] = useMemo(() => {
    const items: ActivityFeedItem[] = [];
    const now = Date.now();

    // 1. Leave Requests (Pending approvals and recent decisions)
    allLeaveRequests.forEach((leave, idx) => {
      const isPending = leave.status === 'Pending';
      const timeOffset = isPending ? idx * 25 * 60 * 1000 : (idx + 4) * 3600 * 1000;
      const sortKey = now - timeOffset;
      const timeLabel = isPending
        ? `${(idx + 1) * 15}m ago`
        : leave.approvedOrRejectedDate
        ? `On ${leave.approvedOrRejectedDate}`
        : '1d ago';

      items.push({
        id: `act-leave-${leave.id}`,
        orgId: leave.orgId,
        category: 'leave',
        title: isPending
          ? `Pending Leave Approval: ${leave.employeeName}`
          : `Leave Request ${leave.status}: ${leave.employeeName}`,
        subtitle: `${leave.leaveType} • ${leave.days} ${leave.days === 1 ? 'day' : 'days'} (${leave.startDate} to ${leave.endDate})`,
        description: `Reason: "${leave.reason}"`,
        timestamp: timeLabel,
        timeSortKey: sortKey,
        status: leave.status === 'Pending' ? 'Pending' : leave.status === 'Approved' ? 'Approved' : 'Rejected',
        actorName: leave.employeeName,
        actorAvatar: leave.employeeAvatar,
        actorRole: leave.department,
        metadata: {
          leaveId: leave.id,
          employeeId: leave.employeeId,
          days: leave.days,
          dates: `${leave.startDate} - ${leave.endDate}`,
          targetModule: 'leave',
          targetTab: 'requests',
        },
      });
    });

    // 2. Payroll Runs & Disbursement Actions
    payrollRuns.forEach((run, idx) => {
      const isDisbursed = run.status === 'Disbursed';
      const sortKey = now - (idx * 2 + 1) * 3600 * 1000;
      const timeLabel = isDisbursed ? 'Yesterday, 05:30 PM' : '2h ago';
      const grossStr = formatInr(run.totalGrossPay || 0);
      const deductionsStr = formatInr(run.totalDeductions || 0);
      const headcount = run.totalEmployees || 10;
      const cycleTitle = run.monthYear || (run.month ? `${run.month} ${run.year || ''}`.trim() : 'Current Cycle');

      items.push({
        id: `act-payroll-${run.id}`,
        orgId: run.orgId,
        category: 'payroll',
        title: isDisbursed
          ? `Payroll Disbursed for ${cycleTitle}`
          : `Payroll Cycle in Progress (${cycleTitle})`,
        subtitle: `Total Gross: ${grossStr} • ${headcount} Employees Processed`,
        description: isDisbursed
          ? `Total Deductions: ${deductionsStr} (PF & PT withholdings) settled via direct bank transfer.`
          : `Current Step: ${run.currentStep || 1} of 6 - Approval required before final disbursement.`,
        timestamp: timeLabel,
        timeSortKey: sortKey,
        status: isDisbursed ? 'Completed' : 'Processing',
        actorName: run.approvedBy || 'Finance & Payroll Ops',
        actorRole: 'Payroll Team',
        metadata: {
          payrollRunId: run.id,
          amount: run.totalGrossPay,
          targetModule: 'payroll',
          targetTab: isDisbursed ? 'overview' : 'wizard',
        },
      });
    });

    // 3. Candidate Status Updates & Recruitment
    candidates.forEach((cand, idx) => {
      const sortKey = now - (idx * 3 + 2) * 3600 * 1000;
      let statusType: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Processing' | 'Info' = 'Info';
      if (cand.stage === 'Offered' || cand.stage === 'Hired') statusType = 'Approved';
      else if (cand.stage === 'Interview') statusType = 'Pending';
      else if (cand.stage === 'Rejected') statusType = 'Rejected';

      items.push({
        id: `act-cand-${cand.id}`,
        orgId: cand.orgId,
        category: 'recruitment',
        title: `Candidate Pipeline Update: ${cand.name}`,
        subtitle: `${cand.roleApplied || cand.jobTitle} • Stage: ${cand.stage}`,
        description: `Current score: ${cand.rating || 4.5}★ • Match: ${cand.matchScore || 90}% • Applied on ${cand.appliedDate}`,
        timestamp: `${idx + 2}h ago`,
        timeSortKey: sortKey,
        status: statusType,
        actorName: cand.name,
        actorAvatar: cand.avatar,
        actorRole: cand.stage,
        metadata: {
          candidateId: cand.id,
          targetModule: 'recruitment',
          targetTab: 'pipeline',
        },
      });
    });

    // 4. Interviews Scheduled / Feedback
    interviews.forEach((interview, idx) => {
      const sortKey = now - (idx * 4 + 1.5) * 3600 * 1000;
      const isCompleted = interview.status === 'Completed';

      items.push({
        id: `act-interview-${interview.id}`,
        orgId: interview.orgId,
        category: 'recruitment',
        title: isCompleted
          ? `Interview Feedback Submitted: ${interview.candidateName}`
          : `Interview Scheduled: ${interview.candidateName}`,
        subtitle: `${interview.roundName || interview.round || 'Round'} (${interview.date || interview.scheduledAt || 'Scheduled'})`,
        description: isCompleted
          ? `Interviewer score: ${interview.score || 4.5}/5.0 • Notes: "${interview.feedback || 'Positive communication & technical depth.'}"`
          : `Interviewer: ${interview.interviewerName} (${interview.mode || 'Video Link'})`,
        timestamp: isCompleted ? '3h ago' : '4h ago',
        timeSortKey: sortKey,
        status: isCompleted ? 'Completed' : 'Pending',
        actorName: interview.interviewerName,
        actorRole: 'Interviewer',
        metadata: {
          candidateId: interview.candidateId,
          targetModule: 'recruitment',
          targetTab: 'interviews',
        },
      });
    });

    // 5. Attendance Regularization Requests
    regularizationRequests.forEach((reg, idx) => {
      const sortKey = now - (idx * 5 + 3) * 3600 * 1000;
      const isPending = reg.status === 'Pending';

      items.push({
        id: `act-reg-${reg.id}`,
        orgId: reg.orgId,
        category: 'attendance',
        title: isPending
          ? `Attendance Regularization Pending: ${reg.employeeName}`
          : `Attendance Regularization ${reg.status}: ${reg.employeeName}`,
        subtitle: `Date: ${reg.date} • Requested Punch: ${reg.requestedClockIn} - ${reg.requestedClockOut}`,
        description: `Reason: "${reg.reason}"`,
        timestamp: isPending ? '45m ago' : 'Yesterday',
        timeSortKey: sortKey,
        status: reg.status === 'Pending' ? 'Pending' : reg.status === 'Approved' ? 'Approved' : 'Rejected',
        actorName: reg.employeeName,
        actorRole: 'Field / Remote Punch',
        metadata: {
          employeeId: reg.employeeId,
          targetModule: 'attendance',
          targetTab: 'regularization',
        },
      });
    });

    // 6. System Audit & Compliance Logs
    auditLogs.slice(0, 10).forEach((audit, idx) => {
      const sortKey = now - (idx * 1.5 + 0.5) * 3600 * 1000;
      items.push({
        id: `act-audit-${audit.id}`,
        orgId: audit.orgId,
        category: 'system',
        title: audit.action,
        subtitle: `${audit.recordName} • by ${audit.userName} (${audit.userRole})`,
        description: audit.newValue ? `Change details: ${audit.newValue}` : undefined,
        timestamp: audit.timestamp || `${idx * 20 + 10}m ago`,
        timeSortKey: sortKey,
        status: 'Info',
        actorName: audit.userName,
        actorRole: audit.userRole,
        metadata: {
          targetModule: audit.module === 'admin' ? 'super-admin' : audit.module,
        },
      });
    });

    // Sort chronologically (newest first)
    return items.sort((a, b) => b.timeSortKey - a.timeSortKey);
  }, [allLeaveRequests, payrollRuns, candidates, interviews, regularizationRequests, auditLogs]);

  // Filter activities based on organization scope and category
  const filteredActivities = useMemo(() => {
    return allActivities.filter((item) => {
      // Organization Scope Filter
      if (scopeFilter === 'current' && currentOrgId !== 'all') {
        if (item.orgId !== currentOrgId) return false;
      }

      // Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search Filter
      if (activitySearch.trim()) {
        const query = activitySearch.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(query);
        const matchesActor = item.actorName.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubtitle && !matchesActor && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [allActivities, scopeFilter, currentOrgId, selectedCategory, activitySearch]);

  // Counts by category for badge indicators
  const categoryCounts = useMemo(() => {
    const baseItems = scopeFilter === 'current' && currentOrgId !== 'all'
      ? allActivities.filter((i) => i.orgId === currentOrgId)
      : allActivities;

    return {
      all: baseItems.length,
      leave: baseItems.filter((i) => i.category === 'leave').length,
      payroll: baseItems.filter((i) => i.category === 'payroll').length,
      recruitment: baseItems.filter((i) => i.category === 'recruitment').length,
      attendance: baseItems.filter((i) => i.category === 'attendance').length,
      system: baseItems.filter((i) => i.category === 'system').length,
    };
  }, [allActivities, scopeFilter, currentOrgId]);

  // Pending action counts
  const pendingActionsCount = useMemo(() => {
    return filteredActivities.filter((i) => i.status === 'Pending').length;
  }, [filteredActivities]);

  // Handle inline Leave Approval
  const handleApproveLeave = (e: React.MouseEvent, leaveId: string, empName: string) => {
    e.stopPropagation();
    approveLeaveRequest(leaveId);
    setActionSuccessMsg({ id: leaveId, text: `Approved leave for ${empName}` });
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Handle inline Leave Rejection
  const handleRejectLeave = (e: React.MouseEvent, leaveId: string, empName: string) => {
    e.stopPropagation();
    rejectLeaveRequest(leaveId);
    setActionSuccessMsg({ id: leaveId, text: `Rejected leave request for ${empName}` });
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const getOrgName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    return org ? org.name : orgId;
  };

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'leave':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'payroll':
        return <IndianRupee className="w-4 h-4 text-emerald-600" />;
      case 'recruitment':
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      case 'attendance':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'system':
      default:
        return <Shield className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBg = (category: ActivityCategory) => {
    switch (category) {
      case 'leave':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'payroll':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'recruitment':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'attendance':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'system':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/80';
    }
  };

  return (
    <div id="recent-activity-widget" className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200">
      {/* Widget Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Recent Activity & Audit Log
                </h3>
                {pendingActionsCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                    {pendingActionsCount} Pending Action{pendingActionsCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time chronological feed of HR operations, approvals, payroll runs, and candidate pipeline movements.
              </p>
            </div>
          </div>

          {/* Scope Controls: All Organizations vs Current Organization */}
          <div className="flex items-center gap-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
            <button
              id="activity-scope-current"
              onClick={() => setScopeFilter('current')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scopeFilter === 'current'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={`Show activity for ${currentOrg.name}`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="max-w-[120px] truncate">{currentOrg.name}</span>
            </button>

            <button
              id="activity-scope-all"
              onClick={() => {
                setScopeFilter('all');
                if (currentOrgId !== 'all') {
                  // If user explicitly asks for all orgs, can also optionally switch context or keep preview
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scopeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Show consolidated activity across all 3 organizations"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>All Organizations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${scopeFilter === 'all' ? 'bg-indigo-700/80 text-white' : 'bg-slate-200 text-slate-700'}`}>
                3 Orgs
              </span>
            </button>
          </div>
        </div>

        {/* Global Context Switcher Quick Link if in All Orgs mode */}
        {scopeFilter === 'all' && currentOrgId !== 'all' && (
          <div className="mt-3 py-1.5 px-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex items-center justify-between text-indigo-900">
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Showing cross-tenant logs. Would you like to switch your active workspace to <strong>All Organizations (Consolidated)</strong>?</span>
            </div>
            <button
              onClick={() => switchOrganization('all')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline ml-2 shrink-0"
            >
              Switch Workspace Context
            </button>
          </div>
        )}

        {/* Category Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-4 pt-3 border-t border-slate-200/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              All ({categoryCounts.all})
            </button>
            <button
              onClick={() => setSelectedCategory('leave')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'leave'
                  ? 'bg-amber-600 text-white font-bold shadow-2xs'
                  : 'bg-white text-amber-700 hover:bg-amber-50/80 border border-amber-200/80'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Leaves ({categoryCounts.leave})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('payroll')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'payroll'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50/80 border border-emerald-200/80'
              }`}
            >
              <IndianRupee className="w-3 h-3" />
              <span>Payroll ({categoryCounts.payroll})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('recruitment')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'recruitment'
                  ? 'bg-purple-600 text-white font-bold shadow-2xs'
                  : 'bg-white text-purple-700 hover:bg-purple-50/80 border border-purple-200/80'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Recruitment ({categoryCounts.recruitment})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('attendance')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'attendance'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-white text-blue-700 hover:bg-blue-50/80 border border-blue-200/80'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Attendance ({categoryCounts.attendance})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('system')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'system'
                  ? 'bg-slate-700 text-white font-bold shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Audit & Org ({categoryCounts.system})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Filter activity..."
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
            {activitySearch && (
              <button
                onClick={() => setActivitySearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Banner for Quick Actions */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg.text}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Activity Items List */}
      <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No activity logs found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your category filter or search query.
            </p>
          </div>
        ) : (
          filteredActivities.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.metadata?.targetModule) {
                  navigateTo(item.metadata.targetModule, item.metadata.targetTab);
                }
              }}
              className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Avatar or Category Icon */}
                <div className="relative shrink-0 mt-0.5">
                  {item.actorAvatar ? (
                    <img
                      src={item.actorAvatar}
                      alt={item.actorName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${getCategoryBg(item.category)}`}>
                      {getCategoryIcon(item.category)}
                    </div>
                  )}
                  {/* Category Small Badge */}
                  {item.actorAvatar && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white shadow-xs flex items-center justify-center border border-slate-200">
                      {item.category === 'leave' && <Calendar className="w-2.5 h-2.5 text-amber-600" />}
                      {item.category === 'payroll' && <IndianRupee className="w-2.5 h-2.5 text-emerald-600" />}
                      {item.category === 'recruitment' && <Briefcase className="w-2.5 h-2.5 text-purple-600" />}
                      {item.category === 'attendance' && <MapPin className="w-2.5 h-2.5 text-blue-600" />}
                      {item.category === 'system' && <Shield className="w-2.5 h-2.5 text-slate-600" />}
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </span>

                    {/* Organization Badge (especially helpful in All Orgs view) */}
                    {(scopeFilter === 'all' || currentOrgId === 'all') && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                        <Building2 className="w-2.5 h-2.5 text-indigo-500" />
                        <span>{getOrgName(item.orgId)}</span>
                      </span>
                    )}

                    {/* Status Pill */}
                    {item.status && item.status !== 'Info' && (
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          item.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : item.status === 'Approved' || item.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : item.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium">{item.subtitle}</p>

                  {item.description && (
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Timestamp & Interactive Quick Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pl-12 sm:pl-0">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-300" />
                  <span>{item.timestamp}</span>
                </span>

                {/* Inline Quick Action Buttons for Pending Leave Approvals */}
                {item.category === 'leave' && item.status === 'Pending' && item.metadata?.leaveId && (
                  <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleApproveLeave(e, item.metadata!.leaveId!, item.actorName)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      title="Quick Approve Leave"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={(e) => handleRejectLeave(e, item.metadata!.leaveId!, item.actorName)}
                      className="px-2 py-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-600 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Reject Leave"
                    >
                      <X className="w-3 h-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {/* Navigate Arrow for Non-Pending Actions */}
                {(item.status !== 'Pending' || item.category !== 'leave') && item.metadata?.targetModule && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100">
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Widget Footer */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">
          Showing {filteredActivities.length} of {allActivities.length} total events recorded
        </span>
        <button
          onClick={() => navigateTo('super-admin', 'audit')}
          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          <span>View Full System Audit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
