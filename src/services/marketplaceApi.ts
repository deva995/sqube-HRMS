import { api } from './api';
import { MarketplaceApp } from '../types';

export const marketplaceApi = {
  getApps: async (): Promise<MarketplaceApp[]> => {
    return api.get<MarketplaceApp[]>('/marketplace/apps');
  },

  toggleInstall: async (appId: string, installed: boolean): Promise<any> => {
    return api.post<any>(`/marketplace/apps/${appId}/toggle-install`, { installed });
  },
};
