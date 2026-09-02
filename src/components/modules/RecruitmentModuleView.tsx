import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Star,
  MapPin,
  IndianRupee,
  Eye,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Job, Candidate, CandidateStage, Interview } from '../../types';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import confetti from 'canvas-confetti';

export const RecruitmentModuleView: React.FC = () => {
  const {
    currentOrg,
    jobs,
    candidates,
    interviews,
    addJob,
    updateCandidateStage,
    activeSubTab,
    setActiveSubTab,
  } = useHrms();

  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // New Job State
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('Engineering');
  const [jobLoc, setJobLoc] = useState('Bengaluru HQ');
  const [jobExp, setJobExp] = useState('4-7 Years');
  const [jobCtc, setJobCtc] = useState('₹18 - ₹26 LPA');

  const STAGES: CandidateStage[] = [
    'Applied',
    'Screening',
    'Shortlisted',
    'Interview',
    'Technical Round',
    'HR Round',
    'Offer Extended',
    'Hired',
  ];

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    addJob({
      title: jobTitle,
      department: jobDept,
      location: jobLoc,
      experience: jobExp,
      openings: 2,
      salaryRange: jobCtc,
      status: 'Published',
      applicantsCount: 0,
      postedDate: new Date().toISOString().split('T')[0],
    });

    setIsAddJobModalOpen(false);
    setJobTitle('');

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleAdvanceStage = (candId: string, currentStage: CandidateStage) => {
    const currentIdx = STAGES.indexOf(currentStage);
    if (currentIdx < STAGES.length - 1) {
      const nextStage = STAGES[currentIdx + 1];
      updateCandidateStage(candId, nextStage);
      if (nextStage === 'Hired') {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  return (
    <div id="recruitment-module-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Recruitment & Applicant Tracking (ATS)
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-md">
              {currentOrg.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Job requisitions, 8-stage interactive candidate pipeline Kanban board, interview scoring, and offer rollouts.
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
            onClick={() => setActiveSubTab('jobs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'jobs'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Job Requisitions ({jobs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'pipeline'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kanban Pipeline ({candidates.length})
          </button>
          <button
            onClick={() => setActiveSubTab('interviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'interviews'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interviews ({interviews.length})
          </button>
        </div>
      </div>

      <PrototypeDisclaimer
        type="general"
        customText="Talent pipelines, resumes, and interview feedback are simulated for ATS demonstration."
      />

      {/* ========================================================================= */}
      {/* 1. RECRUITMENT DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              id="kpi-open-positions"
              title="Open Positions"
              value={jobs.filter((j) => j.status === 'Published').length}
              subtitle="Active talent requisitions"
              trend="up"
              icon={Briefcase}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50/80"
            />
            <KpiCard
              id="kpi-total-applicants"
              title="Active Pipeline"
              value={candidates.length}
              subtitle="Candidates in process"
              trend="up"
              icon={Users}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50/80"
            />
            <KpiCard
              id="kpi-interviews-scheduled"
              title="Interviews Slated"
              value={interviews.length}
              subtitle="Scheduled rounds"
              trend="neutral"
              icon={Calendar}
              iconColor="text-amber-600"
              iconBg="bg-amber-50/80"
            />
            <KpiCard
              id="kpi-offers-accepted"
              title="Offers Accepted"
              value={candidates.filter((c) => c.stage === 'Hired').length}
              subtitle="Hired this quarter"
              trend="up"
              icon={CheckCircle2}
              iconColor="text-purple-600"
              iconBg="bg-purple-50/80"
            />
          </div>

          <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Post New Job Requisition
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish positions to career boards and receive simulated candidate applications.
              </p>
            </div>
            <button
              onClick={() => setIsAddJobModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Job Opening
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. JOB POSTINGS LIST */}
      {/* ========================================================================= */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-4">
          <DataTable<Job>
            data={jobs}
            exportFilename={`Jobs_${currentOrg.slug}`}
            title="Active Job Requisitions"
            subtitle="Manage hiring mandates, experience bands, budget CTC, and opening headcount."
            actions={
              <button
                onClick={() => setIsAddJobModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Post Job
              </button>
            }
            columns={[
              {
                header: 'Position Title',
                accessorKey: 'title',
                sortable: true,
                cell: (row: Job) => (
                  <div className="font-bold text-slate-900">{row.title}</div>
                ),
              },
              {
                header: 'Department',
                accessorKey: 'department',
              },
              {
                header: 'Location',
                accessorKey: 'location',
              },
              {
                header: 'Experience',
                accessorKey: 'experience',
              },
              {
                header: 'Budget CTC',
                accessorKey: 'salaryRange',
                className: 'font-semibold text-slate-800',
              },
              {
                header: 'Applicants',
                cell: (row: Job) => (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs">
                    {row.applicantsCount || row.appliedCount || 0} Applied
                  </span>
                ),
              },
              {
                header: 'Status',
                cell: (row: Job) => <StatusBadge status={row.status} size="sm" />,
              },
            ]}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. KANBAN CANDIDATE PIPELINE (8 STAGES) */}
      {/* ========================================================================= */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Interactive Hiring Kanban Pipeline
              </h3>
              <p className="text-xs text-slate-500">
                Click <strong>"Advance Stage →"</strong> on any candidate card to progress them across interview rounds through to final Offer & Hired!
              </p>
            </div>
          </div>

          {/* Kanban Board Container */}
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1">
            {STAGES.map((stg) => {
              const stageCandidates = candidates.filter((c) => c.stage === stg);

              return (
                <div
                  key={stg}
                  className="w-72 shrink-0 bg-slate-100/60 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-col max-h-[620px]"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                    <span className="text-xs font-bold text-slate-800">
                      {stg}
                    </span>
                    <span className="text-[10px] font-bold bg-white/90 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                    {stageCandidates.map((cand) => (
                      <div
                        key={cand.id}
                        className="p-3.5 bg-white/85 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300/80 hover:bg-white/95 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">
                              {cand.name}
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              {cand.jobTitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{cand.rating}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 flex justify-between">
                          <span>{cand.experience}</span>
                          <span>{cand.currentCompany}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          {stg !== 'Hired' ? (
                            <button
                              onClick={() => handleAdvanceStage(cand.id, cand.stage)}
                              className="w-full py-1 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                            >
                              <span>Advance Stage</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="w-full text-center py-1 bg-emerald-50/90 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200/80 shadow-2xs">
                              🎉 Hired to Staff!
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {stageCandidates.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400 italic">
                        No candidates
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INTERVIEWS SCHEDULE */}
      {/* ========================================================================= */}
      {activeSubTab === 'interviews' && (
        <div className="space-y-4">
          <DataTable<Interview>
            data={interviews}
            exportFilename={`Interviews_${currentOrg.slug}`}
            title="Scheduled Interview Rounds"
            subtitle="Evaluation panels, interview round formats, and scorecards."
            columns={[
              {
                header: 'Candidate Name',
                accessorKey: 'candidateName',
                sortable: true,
                cell: (row: Interview) => (
                  <div className="font-bold text-slate-900">
                    {row.candidateName}
                  </div>
                ),
              },
              {
                header: 'Round Type',
                accessorKey: 'round',
                className: 'font-semibold text-indigo-700',
              },
              {
                header: 'Interviewer Panel',
                accessorKey: 'interviewerName',
              },
              {
                header: 'Date & Time',
                accessorKey: 'scheduledAt',
                className: 'font-mono text-slate-500',
              },
              {
                header: 'Evaluation Status',
                cell: (row: Interview) => <StatusBadge status={row.status} size="sm" />,
              },
            ]}
          />
        </div>
      )}

      {/* Add Job Modal */}
      <Modal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        title="Post New Job Opening"
        subtitle="Publishes a position to the internal recruitment pipeline."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddJobModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateJob}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Publish Job
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateJob} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Position Title *
            </label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Lead React Architect"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Department
              </label>
              <input
                type="text"
                value={jobDept}
                onChange={(e) => setJobDept(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Location
              </label>
              <input
                type="text"
                value={jobLoc}
                onChange={(e) => setJobLoc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Experience Band
              </label>
              <input
                type="text"
                value={jobExp}
                onChange={(e) => setJobExp(e.target.value)}
                placeholder="4-7 Years"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Budget CTC Range
              </label>
              <input
                type="text"
                value={jobCtc}
                onChange={(e) => setJobCtc(e.target.value)}
                placeholder="₹18 - ₹26 LPA"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
