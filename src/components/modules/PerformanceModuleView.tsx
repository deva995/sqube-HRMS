import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  Award,
  Star,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
  Users,
  MessageSquare,
  ClipboardCheck,
  Layers,
  Search,
  Filter,
  Eye,
  Check,
  Send,
  Sliders,
  Calendar,
  Briefcase,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Goal, Review, PerformanceReview } from '../../types';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import confetti from 'canvas-confetti';

const STAGES = [
  'Self Evaluation',
  'Manager Review',
  'Peer Feedback',
  'HR Calibration',
  'Final Score Published'
] as const;

export const PerformanceModuleView: React.FC = () => {
  const {
    currentOrg,
    employees,
    goals,
    reviews,
    addGoal,
    updateGoalProgress,
    addReview,
    submitReviewFeedback,
    activeSubTab,
    setActiveSubTab,
    addAuditLog,
    currentUserPersona,
    currentUserRole
  } = useHrms();

  // Modals state
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isInitiateReviewModalOpen, setIsInitiateReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

  // 360 Review Sub-tab Filter states
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<string>('all');

  // New Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalEmp, setGoalEmp] = useState(employees[0]?.name || 'Aarav Patel');
  const [goalTarget, setGoalTarget] = useState('100% target SLA');
  const [goalDue, setGoalDue] = useState('2026-10-30');

  // New 360 Review Form State
  const [newRevEmpId, setNewRevEmpId] = useState(employees[0]?.id || 'emp-104');
  const [newRevReviewerName, setNewRevReviewerName] = useState('Rajesh Subramanian');
  const [newRevCycle, setNewRevCycle] = useState('H2 2026 Appraisal Cycle');
  const [newRevNotes, setNewRevNotes] = useState('Annual 360 multi-stage review focusing on technical architecture, leadership, and team collaboration.');

  // Modal Review Feedback State
  const [modalFeedbackText, setModalFeedbackText] = useState('');
  const [modalRatingValue, setModalRatingValue] = useState<number>(4.5);
  const [modalStrengthsText, setModalStrengthsText] = useState('');
  const [modalImprovementsText, setModalImprovementsText] = useState('');
  const [modalRecommendation, setModalRecommendation] = useState('Salary Revision');

  // Stats Calculations
  const completedGoals = goals.filter((g) => g.status === 'Completed').length;
  const onTrackGoals = goals.filter((g) => g.status === 'On Track').length;
  const publishedReviewsCount = reviews.filter(
    (r) => (r.stage || r.currentStage) === 'Final Score Published'
  ).length;

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const currentStage = rev.stage || rev.currentStage || 'Self Evaluation';
      const cycle = rev.cycle || rev.reviewCycle || 'Active Cycle';

      const matchesStage =
        selectedStageFilter === 'all' || currentStage.toLowerCase() === selectedStageFilter.toLowerCase();

      const matchesCycle =
        selectedCycleFilter === 'all' || cycle.toLowerCase() === selectedCycleFilter.toLowerCase();

      const matchesSearch =
        !reviewSearchQuery ||
        rev.employeeName.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
        (rev.reviewerName && rev.reviewerName.toLowerCase().includes(reviewSearchQuery.toLowerCase())) ||
        (rev.department && rev.department.toLowerCase().includes(reviewSearchQuery.toLowerCase()));

      return matchesStage && matchesCycle && matchesSearch;
    });
  }, [reviews, selectedStageFilter, selectedCycleFilter, reviewSearchQuery]);

  // Unique cycles available
  const availableCycles = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach((r) => {
      if (r.cycle) set.add(r.cycle);
      if (r.reviewCycle) set.add(r.reviewCycle);
    });
    return Array.from(set);
  }, [reviews]);

  // Handle Goal Creation
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    addGoal({
      title: goalTitle,
      employeeName: goalEmp,
      targetMetric: goalTarget,
      progress: 20,
      dueDate: goalDue,
      status: 'On Track',
      weightage: 25,
    });

    setIsAddGoalModalOpen(false);
    setGoalTitle('');

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Handle Review Initiation
  const handleInitiateReview = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((item) => item.id === newRevEmpId) || employees[0];

    const newReviewData: Omit<PerformanceReview, 'id' | 'orgId' | 'updatedAt'> = {
      employeeId: emp ? emp.id : 'emp-104',
      employeeName: emp ? emp.name : 'Aarav Patel',
      reviewerName: newRevReviewerName,
      department: emp ? emp.department : 'Engineering',
      cycle: newRevCycle,
      reviewCycle: newRevCycle,
      stage: 'Self Evaluation',
      currentStage: 'Self Evaluation',
      rating: 4.5,
      feedback: newRevNotes,
      isCompleted: false,
      selfRating: 4.5,
      selfComments: 'Self-assessment initiated. Pending submission of personal highlights and key deliverables.',
      managerRating: 4.5,
      managerComments: 'Manager review queued. Awaiting employee self-evaluation sign-off.',
      managerStrengths: 'High velocity, ownership, and cross-team alignment.',
      managerImprovements: 'Continuous technical documentation sharing.',
      peerRating: 4.5,
      peerComments: 'Peer feedback group pending nomination.',
      hrRating: 4.5,
      hrComments: 'HR calibration scheduled for end-of-cycle moderation.',
      finalScore: 4.5,
      finalRecommendation: 'Salary Revision',
    };

    addReview(newReviewData);

    addAuditLog({
      orgId: currentOrg.id,
      userName: currentUserPersona.name,
      userRole: currentUserRole,
      action: 'Initiated 360 Review Cycle',
      module: 'performance',
      recordName: `${emp?.name} - ${newRevCycle}`,
      newValue: 'Self Evaluation',
    });

    setIsInitiateReviewModalOpen(false);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Helper to get stage index (0 to 4)
  const getStageIndex = (stageName?: string) => {
    const stage = stageName || 'Self Evaluation';
    if (stage.includes('Self') || stage === 'Self') return 0;
    if (stage.includes('Manager') || stage === 'Manager') return 1;
    if (stage.includes('Peer') || stage === 'Peer') return 2;
    if (stage.includes('HR') || stage === 'HR') return 3;
    if (stage.includes('Final') || stage === 'Final') return 4;
    return 0;
  };

  // Advance Review Stage
  const handleAdvanceStage = (rev: PerformanceReview) => {
    const currentIdx = getStageIndex(rev.stage || rev.currentStage);
    if (currentIdx >= STAGES.length - 1) return;

    const nextStage = STAGES[currentIdx + 1];
    const isNowFinal = currentIdx + 1 === STAGES.length - 1;

    submitReviewFeedback(rev.id, {
      stage: nextStage,
      currentStage: nextStage,
      isCompleted: isNowFinal,
      rating: rev.finalScore || rev.rating || 4.7,
    });

    addAuditLog({
      orgId: currentOrg.id,
      userName: currentUserPersona.name,
      userRole: currentUserRole,
      action: 'Advanced 360 Review Stage',
      module: 'performance',
      recordName: `${rev.employeeName} (${rev.cycle || rev.reviewCycle})`,
      newValue: nextStage,
    });

    // Update modal view if currently open
    if (selectedReview && selectedReview.id === rev.id) {
      setSelectedReview({
        ...selectedReview,
        stage: nextStage,
        currentStage: nextStage,
        isCompleted: isNowFinal,
      });
    }

    if (isNowFinal) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  // Open Review Detail Modal
  const openReviewModal = (rev: PerformanceReview) => {
    setSelectedReview(rev);
    setModalFeedbackText(rev.feedback || rev.managerComments || '');
    setModalRatingValue(rev.rating || rev.finalScore || 4.7);
    setModalStrengthsText(rev.managerStrengths || '');
    setModalImprovementsText(rev.managerImprovements || '');
    setModalRecommendation(rev.finalRecommendation || 'Salary Revision');
  };

  // Save Modal Review Updates
  const handleSaveModalFeedback = () => {
    if (!selectedReview) return;

    const currentIdx = getStageIndex(selectedReview.stage || selectedReview.currentStage);

    const updates: Partial<PerformanceReview> = {
      feedback: modalFeedbackText,
      rating: modalRatingValue,
      managerStrengths: modalStrengthsText,
      managerImprovements: modalImprovementsText,
      finalRecommendation: modalRecommendation,
      finalScore: modalRatingValue,
    };

    if (currentIdx === 0) {
      updates.selfComments = modalFeedbackText;
      updates.selfRating = modalRatingValue;
    } else if (currentIdx === 1) {
      updates.managerComments = modalFeedbackText;
      updates.managerRating = modalRatingValue;
    } else if (currentIdx === 2) {
      updates.peerComments = modalFeedbackText;
      updates.peerRating = modalRatingValue;
    } else if (currentIdx === 3) {
      updates.hrComments = modalFeedbackText;
      updates.hrRating = modalRatingValue;
    }

    submitReviewFeedback(selectedReview.id, updates);

    setSelectedReview({
      ...selectedReview,
      ...updates,
    });

    addAuditLog({
      orgId: currentOrg.id,
      userName: currentUserPersona.name,
      userRole: currentUserRole,
      action: 'Updated 360 Evaluation Notes',
      module: 'performance',
      recordName: `${selectedReview.employeeName} Review`,
      newValue: `Score: ${modalRatingValue} ★`,
    });
  };

  return (
    <div id="performance-module-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Performance & 360 Review Management
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-md">
              {currentOrg.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Goal alignment, OKR tracking, continuous feedback, and 5-stage 360 degree performance cycles.
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
            onClick={() => setActiveSubTab('goals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'goals'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Goals & OKRs ({goals.length})
          </button>
          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'reviews'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            360 Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'analytics'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Talent Matrix (9-Box)
          </button>
        </div>
      </div>

      <PrototypeDisclaimer
        type="general"
        customText="Goals, ratings, and 360 feedback reviews are modeled for active enterprise performance appraisal cycles."
      />

      {/* ========================================================================= */}
      {/* 1. PERFORMANCE DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              id="kpi-avg-rating"
              title="Average Org Rating"
              value="4.7 ★"
              subtitle="Out of 5.0 scale"
              trend="up"
              icon={Star}
              iconColor="text-amber-600"
              iconBg="bg-amber-50/80"
            />
            <KpiCard
              id="kpi-goals-on-track"
              title="Goals On Track"
              value={`${onTrackGoals + completedGoals} / ${goals.length}`}
              subtitle="Active OKR milestones"
              trend="up"
              icon={Target}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50/80"
            />
            <KpiCard
              id="kpi-reviews-completed"
              title="360 Reviews Completed"
              value={`${publishedReviewsCount} / ${reviews.length}`}
              subtitle="Published Appraisal Cycles"
              trend="neutral"
              icon={CheckCircle2}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50/80"
            />
            <KpiCard
              id="kpi-top-performers"
              title="High Performers"
              value={`${reviews.filter((r) => (r.rating || 0) >= 4.8).length || 4} Staff`}
              subtitle="Exceeding expectations"
              trend="up"
              icon={Award}
              iconColor="text-purple-600"
              iconBg="bg-purple-50/80"
            />
          </div>

          {/* Quick Action Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2">
                  <Target className="w-4 h-4" />
                  <span>Strategic OKR Objectives</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Define & Align Department Goals
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Assign measurable KPIs, target completion metrics, and weighted sliders for teams.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{goals.length} Goals Registered</span>
                <button
                  onClick={() => setIsAddGoalModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Define OKR Goal
                </button>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2">
                  <Users className="w-4 h-4" />
                  <span>360° Multi-Stage Cycles</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Initiate New 360 Appraisal Cycle
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Launch progressive 5-stage reviews with self-evaluations, peer nominations, and HR calibrations.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{reviews.length} Active Appraisals</span>
                <button
                  onClick={() => setIsInitiateReviewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Initiate 360 Review
                </button>
              </div>
            </div>
          </div>

          {/* 5-Stage Appraisal Flow Guide */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  360° Appraisal Progressive Workflow Pipeline
                </h3>
                <p className="text-xs text-slate-500">
                  Every employee undergoes 5 structured milestones before final compensation and promotion publication.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('reviews')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All Reviews</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {STAGES.map((st, idx) => {
                const count = reviews.filter((r) => (r.stage || r.currentStage) === st).length;
                return (
                  <div
                    key={st}
                    onClick={() => {
                      setSelectedStageFilter(st);
                      setActiveSubTab('reviews');
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-200 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {count} Active
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 font-heading truncate">
                      {st}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {idx === 0 && 'Employee reflections & OKR self ratings'}
                      {idx === 1 && 'Manager evaluation & strength areas'}
                      {idx === 2 && '360 peer feedback & collaboration'}
                      {idx === 3 && 'HR bell-curve normalization'}
                      {idx === 4 && 'Official promotion & salary outcome'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GOALS & OKRs MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'goals' && (
        <div className="space-y-4">
          <DataTable<Goal>
            data={goals}
            exportFilename={`Goals_${currentOrg.slug}`}
            title="Strategic Goals & Key Results (OKRs)"
            subtitle="Track progress sliders and target milestones across departments."
            actions={
              <button
                onClick={() => setIsAddGoalModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </button>
            }
            columns={[
              {
                header: 'Goal Title & OKR',
                accessorKey: 'title',
                sortable: true,
                cell: (row: Goal) => (
                  <div>
                    <div className="font-bold text-slate-900">{row.title}</div>
                    <div className="text-[11px] text-slate-500">Target: {row.targetMetric}</div>
                  </div>
                ),
              },
              {
                header: 'Owner',
                accessorKey: 'employeeName',
                className: 'font-semibold text-slate-800',
              },
              {
                header: 'Progress Slider',
                cell: (row: Goal) => (
                  <div className="w-48 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>{row.progress || row.currentProgress || 0}%</span>
                      <span className="text-slate-400 font-normal">Weight: {row.weightage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={row.progress || row.currentProgress || 0}
                      onChange={(e) => updateGoalProgress(row.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                ),
              },
              {
                header: 'Due Date',
                accessorKey: 'dueDate',
                className: 'font-mono text-slate-500 text-xs',
              },
              {
                header: 'Status',
                cell: (row: Goal) => <StatusBadge status={row.status} size="sm" />,
              },
            ]}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 360 REVIEWS (5-STAGE EVALUATION) */}
      {/* ========================================================================= */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-5">
          {/* Top Stage Pipeline Filters & Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <span>360° Multi-Stage Performance Appraisal Cycles</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                    {reviews.length} Appraisals in Matrix
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive 5-stage review tracking: Self, Manager, Peer, HR Calibration, and Final Outcomes.
                </p>
              </div>

              <button
                onClick={() => setIsInitiateReviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Initiate 360 Review</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                  placeholder="Search employee, reviewer, or department..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {availableCycles.length > 0 && (
                <select
                  value={selectedCycleFilter}
                  onChange={(e) => setSelectedCycleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Appraisal Cycles</option>
                  {availableCycles.map((cyc) => (
                    <option key={cyc} value={cyc}>
                      {cyc}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Stage Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedStageFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedStageFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Stages ({reviews.length})
              </button>
              {STAGES.map((st, i) => {
                const count = reviews.filter((r) => (r.stage || r.currentStage) === st).length;
                const isSelected = selectedStageFilter.toLowerCase() === st.toLowerCase();
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedStageFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="opacity-75">{i + 1}.</span>
                    <span>{st}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reviews Cards List */}
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 font-heading">
                No 360 Reviews Found
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {selectedStageFilter !== 'all'
                  ? `There are currently no reviews in the "${selectedStageFilter}" stage for this organization.`
                  : 'No 360 reviews have been initiated yet. You can launch a new appraisal cycle below.'}
              </p>
              <button
                onClick={() => {
                  setSelectedStageFilter('all');
                  setReviewSearchQuery('');
                  setIsInitiateReviewModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Initiate New 360 Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((rev) => {
                const currentStageName = rev.stage || rev.currentStage || 'Self Evaluation';
                const currentStageIdx = getStageIndex(currentStageName);
                const isFinal = currentStageIdx === STAGES.length - 1;
                const score = rev.rating || rev.finalScore || 4.7;

                return (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm font-heading">
                            {rev.employeeName}
                          </h4>
                          {rev.department && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              {rev.department}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Reviewer: <strong className="text-slate-700">{rev.reviewerName || 'Primary Manager'}</strong> • Cycle: {rev.cycle || rev.reviewCycle}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{score} / 5.0</span>
                      </div>
                    </div>

                    {/* Progressive Stage Stepper */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Appraisal Stage:</span>
                        <StatusBadge status={currentStageName} size="sm" />
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {STAGES.map((st, idx) => {
                          const isDone = idx < currentStageIdx;
                          const isCurrent = idx === currentStageIdx;
                          return (
                            <div
                              key={st}
                              title={`${idx + 1}. ${st}`}
                              className={`h-1.5 rounded-full transition-all ${
                                isDone
                                  ? 'bg-emerald-500'
                                  : isCurrent
                                  ? 'bg-indigo-600'
                                  : 'bg-slate-200'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>1. Self</span>
                        <span>2. Manager</span>
                        <span>3. Peer</span>
                        <span>4. HR</span>
                        <span>5. Final</span>
                      </div>
                    </div>

                    {/* Feedback Quote */}
                    <div className="p-3 bg-slate-50/80 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Evaluation Notes</span>
                      </div>
                      <p className="italic">
                        "{rev.feedback || rev.managerComments || rev.selfComments || 'Review cycle in progress.'}"
                      </p>
                    </div>

                    {/* Recommendation & Actions Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      {rev.finalRecommendation ? (
                        <div className="flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-md border border-purple-200">
                          <Award className="w-3 h-3" />
                          <span>{rev.finalRecommendation}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Stage {currentStageIdx + 1} of 5 Active
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openReviewModal(rev)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 font-bold rounded-lg border border-slate-200 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>360 Breakdown</span>
                        </button>

                        {!isFinal && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStage(rev)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TALENT MATRIX / 9-BOX GRID */}
      {/* ========================================================================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  9-Box Talent Performance vs. Potential Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Strategic talent categorization for leadership succession, promotion readiness, and targeted development.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 self-start sm:self-auto">
                Quarterly Calibration Active
              </span>
            </div>

            {/* 9-Box Grid Layout */}
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-3 text-xs">
                {/* Row 1: High Potential */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Future Leaders</span>
                    <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded font-bold">L3/H3</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    High Potential • Moderate Performance
                  </p>
                  <div className="text-xs font-bold text-slate-800 pt-1">
                    Sneha Rao, Rajesh S.
                  </div>
                </div>

                <div className="p-4 bg-emerald-100/90 border border-emerald-300 rounded-xl space-y-1.5 shadow-2xs hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Stars & Key Assets</span>
                    </span>
                    <span className="text-[10px] bg-emerald-300 text-emerald-950 px-1.5 py-0.5 rounded font-bold">L3/H3</span>
                  </div>
                  <p className="text-[11px] text-emerald-900">
                    High Potential • High Performance
                  </p>
                  <div className="text-xs font-bold text-slate-900 pt-1">
                    Kavita Menon, Aarav Patel
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-1.5 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900">High Performers</span>
                    <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-1.5 py-0.5 rounded font-bold">L2/H3</span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    Moderate Potential • High Performance
                  </p>
                  <div className="text-xs font-bold text-slate-800 pt-1">
                    Dr. Ramesh Sundaram, Vikram Malhotra
                  </div>
                </div>

                {/* Row 2: Medium Potential */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900">Enigma / Specialists</span>
                    <span className="text-[10px] bg-amber-200/60 text-amber-900 px-1.5 py-0.5 rounded font-bold">L3/H1</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    High Potential • Low Performance
                  </p>
                  <div className="text-xs font-bold text-slate-800 pt-1">
                    Rohan Verma (Needs Ramp-up)
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Core Contributors</span>
                    <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">L2/H2</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Moderate Potential • Moderate Performance
                  </p>
                  <div className="text-xs font-bold text-slate-800 pt-1">
                    Ananya Iyer, Murugan Thangavel
                  </div>
                </div>

                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">Effective Professionals</span>
                    <span className="text-[10px] bg-blue-200/60 text-blue-900 px-1.5 py-0.5 rounded font-bold">L1/H3</span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Low Potential • High Performance
                  </p>
                  <div className="text-xs font-bold text-slate-800 pt-1">
                    Suresh Chandran, Priya Sharma
                  </div>
                </div>

                {/* Row 3: Low Potential */}
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900">Underperformers</span>
                    <span className="text-[10px] bg-rose-200/60 text-rose-900 px-1.5 py-0.5 rounded font-bold">L1/H1</span>
                  </div>
                  <p className="text-[11px] text-rose-800">
                    Low Potential • Low Performance
                  </p>
                  <div className="text-xs font-bold text-slate-800 pt-1">
                    None (PIP Zero Policy)
                  </div>
                </div>

                <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-1.5 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-900">Dilemma / Realign</span>
                    <span className="text-[10px] bg-orange-200/60 text-orange-900 px-1.5 py-0.5 rounded font-bold">L1/H2</span>
                  </div>
                  <p className="text-[11px] text-orange-800">
                    Low Potential • Moderate Performance
                  </p>
                  <div className="text-xs font-bold text-slate-800 pt-1">
                    Vikram Das (Mentorship Track)
                  </div>
                </div>

                <div className="p-4 bg-slate-100/90 border border-slate-300 rounded-xl space-y-1.5 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Trusted Veterans</span>
                    <span className="text-[10px] bg-slate-300 text-slate-900 px-1.5 py-0.5 rounded font-bold">L1/H3</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Experienced Subject Matter Experts
                  </p>
                  <div className="text-xs font-bold text-slate-800 pt-1">
                    Deepak Rao, Meera Nair
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Define New OKR Goal */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        title="Define New OKR Goal"
        subtitle="Assigns a measurable objective to an employee for the active performance cycle."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddGoalModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateGoal}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Save Goal
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateGoal} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Goal Objective *
            </label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Reduce average API response latency by 35%"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Assignee Employee
            </label>
            <select
              value={goalEmp}
              onChange={(e) => setGoalEmp(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.name}>
                  {e.name} ({e.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Metric
              </label>
              <input
                type="text"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="e.g. < 120ms P99"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={goalDue}
                onChange={(e) => setGoalDue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: Initiate 360 Review Cycle */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isInitiateReviewModalOpen}
        onClose={() => setIsInitiateReviewModalOpen(false)}
        title="Initiate 360° Appraisal Cycle"
        subtitle="Launches a progressive 5-stage performance review cycle for an employee."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsInitiateReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInitiateReview}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Launch 360 Review</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleInitiateReview} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Select Employee for Review *
            </label>
            <select
              value={newRevEmpId}
              onChange={(e) => setNewRevEmpId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.designation} ({e.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Primary Manager Reviewer *
              </label>
              <input
                type="text"
                required
                value={newRevReviewerName}
                onChange={(e) => setNewRevReviewerName(e.target.value)}
                placeholder="e.g. Rajesh Subramanian"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Appraisal Cycle Name *
              </label>
              <input
                type="text"
                required
                value={newRevCycle}
                onChange={(e) => setNewRevCycle(e.target.value)}
                placeholder="e.g. H2 2026 Appraisal Cycle"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Evaluation Context & Objectives
            </label>
            <textarea
              rows={3}
              value={newRevNotes}
              onChange={(e) => setNewRevNotes(e.target.value)}
              placeholder="Detail focus areas, OKR achievements, or development priorities..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs resize-none"
            />
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 space-y-1">
            <span className="font-bold block">5-Stage Review Cycle Plan:</span>
            <p className="text-[11px] text-indigo-800">
              The employee will first complete a self-evaluation form, followed by manager ratings, peer nominations, HR normalization, and final recommendation.
            </p>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: Detailed 360 Review Breakdown & Multi-Stage Evaluation */}
      {/* ========================================================================= */}
      {selectedReview && (
        <Modal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title={`360° Appraisal: ${selectedReview.employeeName}`}
          subtitle={`${selectedReview.department || 'Department'} • Cycle: ${selectedReview.cycle || selectedReview.reviewCycle}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveModalFeedback}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Save Feedback Updates
                </button>

                {getStageIndex(selectedReview.stage || selectedReview.currentStage) < STAGES.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStage(selectedReview)}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <span>Advance to Next Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {/* Header Stage Tracker */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Active Appraisal Stage:</span>
                <StatusBadge status={selectedReview.stage || selectedReview.currentStage || 'Self Evaluation'} size="sm" />
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {STAGES.map((st, idx) => {
                  const currentIdx = getStageIndex(selectedReview.stage || selectedReview.currentStage);
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div
                      key={st}
                      className={`p-2 rounded-lg text-center text-[10px] font-bold border transition-all ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <div className="truncate">{idx + 1}. {st}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5-Stage Breakdown Sections */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Multi-Stage Evaluation Insights
              </h4>

              {/* 1. Self Evaluation */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Stage 1: Employee Self-Evaluation</span>
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ★ {selectedReview.selfRating || 4.8} / 5.0
                  </span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg italic">
                  "{selectedReview.selfComments || 'Successfully achieved core quarterly deliverables and exceeded key OKR targets.'}"
                </p>
              </div>

              {/* 2. Manager Review */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Stage 2: Manager Review ({selectedReview.reviewerName || 'Primary Manager'})</span>
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ★ {selectedReview.managerRating || 4.7} / 5.0
                  </span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg italic">
                  "{selectedReview.managerComments || selectedReview.feedback || 'Exemplary technical execution, strong leadership in sprint planning, and high delivery consistency.'}"
                </p>
                {selectedReview.managerStrengths && (
                  <div className="text-[11px] text-slate-600 pt-1">
                    <strong>Core Strengths:</strong> {selectedReview.managerStrengths}
                  </div>
                )}
                {selectedReview.managerImprovements && (
                  <div className="text-[11px] text-slate-600">
                    <strong>Growth Opportunities:</strong> {selectedReview.managerImprovements}
                  </div>
                )}
              </div>

              {/* 3. Peer Feedback */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Stage 3: 360° Peer Feedback</span>
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ★ {selectedReview.peerRating || 4.6} / 5.0
                  </span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg italic">
                  "{selectedReview.peerComments || 'Consistently unblocks teammates with constructive code reviews and clear functional architectural guidelines.'}"
                </p>
              </div>

              {/* 4. HR Calibration */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Stage 4: HR Calibration & Normalization</span>
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ★ {selectedReview.hrRating || 4.7} / 5.0
                  </span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg italic">
                  "{selectedReview.hrComments || 'Strong organizational culture fit, high attendance compliance, and positive contributions to engineering all-hands.'}"
                </p>
              </div>

              {/* 5. Final Recommendation */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-700" />
                    <span>Stage 5: Official Appraisal Outcome</span>
                  </span>
                  <span className="text-xs font-extrabold text-purple-900 bg-purple-200/70 px-2.5 py-0.5 rounded-md">
                    {selectedReview.finalRecommendation || 'Salary Revision'}
                  </span>
                </div>
                <div className="text-xs text-purple-900">
                  Final Score: <strong>{selectedReview.finalScore || selectedReview.rating || 4.7} / 5.0</strong> • Published & synchronized to employee record.
                </div>
              </div>
            </div>

            {/* Quick Feedback Form */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h5 className="text-xs font-bold text-slate-800">
                Update Appraisal Notes & Stage Rating
              </h5>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rating Score (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={modalRatingValue}
                    onChange={(e) => setModalRatingValue(parseFloat(e.target.value) || 4.5)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Appraisal Recommendation
                  </label>
                  <select
                    value={modalRecommendation}
                    onChange={(e) => setModalRecommendation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="Promote">Promote</option>
                    <option value="Salary Revision">Salary Revision</option>
                    <option value="Exceeds Expectations">Exceeds Expectations</option>
                    <option value="Retain & Train">Retain & Train</option>
                    <option value="Performance Plan">Performance Plan (PIP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Evaluation Feedback Comments
                </label>
                <textarea
                  rows={2}
                  value={modalFeedbackText}
                  onChange={(e) => setModalFeedbackText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg resize-none"
                  placeholder="Enter comments or appraisal calibration remarks..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Key Strengths
                  </label>
                  <input
                    type="text"
                    value={modalStrengthsText}
                    onChange={(e) => setModalStrengthsText(e.target.value)}
                    placeholder="e.g. Technical rigor, system design"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Areas for Growth
                  </label>
                  <input
                    type="text"
                    value={modalImprovementsText}
                    onChange={(e) => setModalImprovementsText(e.target.value)}
                    placeholder="e.g. Delegation, mentorship"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
