import { api } from './api';
import { ExpenseClaim, ExpenseStatus } from '../types';

export const expenseApi = {
  getExpenses: async (): Promise<ExpenseClaim[]> => {
    return api.get<ExpenseClaim[]>('/expenses');
  },

  createExpense: async (data: {
    employeeId?: string;
    employeeName?: string;
    category: string;
    amount: number;
    currency?: string;
    date: string;
    merchant: string;
    description: string;
    receiptUrl?: string;
    receiptFileKey?: string;
  }): Promise<ExpenseClaim> => {
    return api.post<ExpenseClaim>('/expenses', data);
  },

  updateStatus: async (
    id: string,
    status: ExpenseStatus,
    rejectionReason?: string
  ): Promise<ExpenseClaim> => {
    return api.patch<ExpenseClaim>(`/expenses/${id}/status`, { status, rejectionReason });
  },

  deleteExpense: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/expenses/${id}`);
  },
};
