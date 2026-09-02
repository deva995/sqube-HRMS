import { api } from './api';
import { PerformanceGoal, PerformanceReview } from '../types';

export const performanceApi = {
  getGoals: async (): Promise<PerformanceGoal[]> => {
    return api.get<PerformanceGoal[]>('/performance/goals');
  },

  createGoal: async (data: Omit<PerformanceGoal, 'id' | 'orgId'>): Promise<PerformanceGoal> => {
    return api.post<PerformanceGoal>('/performance/goals', data);
  },

  updateGoalProgress: async (id: string, progress: number): Promise<PerformanceGoal> => {
    return api.patch<PerformanceGoal>(`/performance/goals/${id}/progress`, { progress });
  },

  getReviews: async (): Promise<PerformanceReview[]> => {
    return api.get<PerformanceReview[]>('/performance/reviews');
  },
};
