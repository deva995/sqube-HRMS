import { api } from './api';
import { EngagementAnnouncement, EngagementRecognition } from '../types';

export const engagementApi = {
  getAnnouncements: async (): Promise<EngagementAnnouncement[]> => {
    return api.get<EngagementAnnouncement[]>('/engagement/announcements');
  },

  createAnnouncement: async (data: {
    title: string;
    content: string;
    category?: string;
    pinned?: boolean;
  }): Promise<EngagementAnnouncement> => {
    return api.post<EngagementAnnouncement>('/engagement/announcements', data);
  },

  likeAnnouncement: async (id: string): Promise<{ id: string; likesCount: number }> => {
    return api.post<{ id: string; likesCount: number }>(`/engagement/announcements/${id}/like`);
  },

  getRecognitions: async (): Promise<EngagementRecognition[]> => {
    return api.get<EngagementRecognition[]>('/engagement/recognitions');
  },

  createRecognition: async (data: {
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
    badge: string;
    message: string;
  }): Promise<EngagementRecognition> => {
    return api.post<EngagementRecognition>('/engagement/recognitions', data);
  },
};
