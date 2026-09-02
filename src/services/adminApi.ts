import { api } from './api';
import { Organization, AuditLogEntry, ModuleId } from '../types';

export const adminApi = {
  getOrganizations: async (): Promise<Organization[]> => {
    return api.get<Organization[]>('/admin/organizations');
  },

  updateOrganizationModules: async (orgId: string, enabledModuleIds: ModuleId[]): Promise<Organization> => {
    return api.patch<Organization>(`/admin/organizations/${orgId}/modules`, { enabledModuleIds });
  },

  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    return api.get<AuditLogEntry[]>('/admin/audit-logs');
  },
};
