import { api } from './api';
import { Employee, Department, Designation, WorkShift } from '../types';

export const hrApi = {
  getEmployees: async (params?: { page?: number; pageSize?: number; department?: string; search?: string }): Promise<Employee[]> => {
    return api.get<Employee[]>('/hr/employees', params);
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    return api.get<Employee>(`/hr/employees/${id}`);
  },

  createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
    return api.post<Employee>('/hr/employees', data);
  },

  updateEmployee: async (id: string, updates: Partial<Employee>): Promise<Employee> => {
    return api.patch<Employee>(`/hr/employees/${id}`, updates);
  },

  deleteEmployee: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/hr/employees/${id}`);
  },

  getDepartments: async (): Promise<Department[]> => {
    return api.get<Department[]>('/hr/departments');
  },

  getDesignations: async (): Promise<Designation[]> => {
    return api.get<Designation[]>('/hr/designations');
  },

  getShifts: async (): Promise<WorkShift[]> => {
    return api.get<WorkShift[]>('/hr/shifts');
  },
};
