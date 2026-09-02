import { api } from './api';
import { JobPosting, Candidate, Interview, CandidateStage } from '../types';

export const recruitmentApi = {
  getJobs: async (): Promise<JobPosting[]> => {
    return api.get<JobPosting[]>('/recruitment/jobs');
  },

  getCandidates: async (): Promise<Candidate[]> => {
    return api.get<Candidate[]>('/recruitment/candidates');
  },

  updateCandidateStage: async (id: string, stage: CandidateStage): Promise<Candidate> => {
    return api.patch<Candidate>(`/recruitment/candidates/${id}/stage`, { stage });
  },

  getInterviews: async (): Promise<Interview[]> => {
    return api.get<Interview[]>('/recruitment/interviews');
  },
};
