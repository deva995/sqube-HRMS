import { api } from './api';
import { Role } from '../types';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    orgId: string;
    employeeId?: string;
    avatar?: string;
    department?: string;
    designation?: string;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    if (res.accessToken) {
      localStorage.setItem('sqbe_access_token', res.accessToken);
    }
    return res;
  },

  getMe: async (): Promise<LoginResponse['user']> => {
    return api.get<LoginResponse['user']>('/auth/me');
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const res = await api.post<{ accessToken: string }>('/auth/refresh');
    if (res.accessToken) {
      localStorage.setItem('sqbe_access_token', res.accessToken);
    }
    return res;
  },

  logout: async (): Promise<{ message: string }> => {
    try {
      return await api.post<{ message: string }>('/auth/logout');
    } finally {
      localStorage.removeItem('sqbe_access_token');
    }
  },

  resetPassword: async (email: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/reset-password', { email });
  },
};
