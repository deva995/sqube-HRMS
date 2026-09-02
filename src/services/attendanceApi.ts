import { api } from './api';
import { AttendanceRecord, GeofenceLocation, RegularizationRequest } from '../types';

export interface ClockInResponse {
  attendanceRecord: AttendanceRecord;
  verification: {
    withinGeofence: boolean;
    distanceMeters: number;
    matchedGeofence?: GeofenceLocation;
    verifiedAt: string;
    statusText: string;
    policyVerdict: string;
    disclaimer: string;
  };
}

export const attendanceApi = {
  getRecords: async (date?: string): Promise<AttendanceRecord[]> => {
    return api.get<AttendanceRecord[]>('/attendance/records', date ? { date } : undefined);
  },

  getGeofences: async (): Promise<GeofenceLocation[]> => {
    return api.get<GeofenceLocation[]>('/attendance/geofences');
  },

  clockIn: async (params: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    deviceInfo?: string;
    employeeId?: string;
  }): Promise<ClockInResponse> => {
    return api.post<ClockInResponse>('/attendance/clock-in', params);
  },

  getRegularizations: async (): Promise<RegularizationRequest[]> => {
    return api.get<RegularizationRequest[]>('/attendance/regularizations');
  },

  submitRegularization: async (data: {
    employeeId: string;
    employeeName: string;
    date: string;
    reason: string;
    requestedClockIn?: string;
    requestedClockOut?: string;
  }): Promise<RegularizationRequest> => {
    return api.post<RegularizationRequest>('/attendance/regularizations', data);
  },

  updateRegularizationStatus: async (
    id: string,
    status: 'Approved' | 'Rejected'
  ): Promise<RegularizationRequest> => {
    return api.patch<RegularizationRequest>(`/attendance/regularizations/${id}/status`, { status });
  },
};
