import { api } from './api';
import { NotificationItem } from '../types';

export const notificationApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    return api.get<NotificationItem[]>('/notifications');
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    return api.patch<NotificationItem>(`/notifications/${id}/read`);
  },
};
