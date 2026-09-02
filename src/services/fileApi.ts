import { api } from './api';

export interface SignedUploadResponse {
  url: string;
  fields: {
    key: string;
    action: string;
    expires: number;
    sig: string;
  };
}

export const fileApi = {
  getSignedUploadUrl: async (params: {
    fileKey: string;
    fileName?: string;
    category?: 'resume' | 'payslip' | 'document' | 'policy';
    mimeType?: string;
    sizeBytes?: number;
  }): Promise<SignedUploadResponse> => {
    return api.post<SignedUploadResponse>('/files/signed-upload', params);
  },

  getSignedDownloadUrl: async (fileKey: string): Promise<string> => {
    return api.post<string>('/files/signed-download', { fileKey });
  },

  downloadDocument: (fileKey: string): void => {
    const url = `/api/v1/files/download/${fileKey}?orgId=org-acro&expires=${Date.now() + 900000}&action=read&sig=demo_sig`;
    window.open(url, '_blank');
  },
};
