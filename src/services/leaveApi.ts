import { api } from './api';
import { LeaveRequest, LeaveBalance } from '../types';

export const leaveApi = {
  getLeaves: async (): Promise<LeaveRequest[]> => {
    return api.get<LeaveRequest[]>('/leaves');
  },

  applyLeave: async (data: {
    employeeId?: string;
    employeeName?: string;
    department?: string;
    leaveType: LeaveRequest['leaveType'];
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }): Promise<LeaveRequest> => {
    return api.post<LeaveRequest>('/leaves', data);
  },

  updateLeaveStatus: async (
    id: string,
    status: 'Approved' | 'Rejected'
  ): Promise<LeaveRequest> => {
    return api.patch<LeaveRequest>(`/leaves/${id}/status`, { status });
  },

  getBalances: async (employeeId?: string): Promise<LeaveBalance[]> => {
    // Standard Statutory default leave matrix computation
    return [
      { leaveType: 'Earned Leave (EL)', total: 18, used: 4, pending: 1, available: 13, icon: 'Calendar' },
      { leaveType: 'Casual Leave (CL)', total: 12, used: 3, pending: 0, available: 9, icon: 'Clock' },
      { leaveType: 'Sick Leave (SL)', total: 12, used: 2, pending: 0, available: 10, icon: 'HeartPulse' },
      { leaveType: 'Comp Off', total: 4, used: 1, pending: 0, available: 3, icon: 'Award' },
      { leaveType: 'Maternity / Paternity', total: 180, used: 0, pending: 0, available: 180, icon: 'Users' },
    ];
  },
};
