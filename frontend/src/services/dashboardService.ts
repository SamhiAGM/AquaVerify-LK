import api from './api';
import {
  AdminDashboard,
  ApiResponse,
  CitizenDashboard,
  LabDashboard,
  OfficerDashboard,
  PublicStats,
} from '../types';

export const dashboardService = {
  getPublicStats: async (): Promise<PublicStats> => {
    const response = await api.get<ApiResponse<PublicStats>>('/dashboard/public-stats');
    return response.data.data;
  },

  getCitizenDashboard: async (): Promise<CitizenDashboard> => {
    const response = await api.get<ApiResponse<CitizenDashboard>>('/dashboard/citizen');
    return response.data.data;
  },

  getOfficerDashboard: async (): Promise<OfficerDashboard> => {
    const response = await api.get<ApiResponse<OfficerDashboard>>('/dashboard/officer');
    return response.data.data;
  },

  getLabDashboard: async (): Promise<LabDashboard> => {
    const response = await api.get<ApiResponse<LabDashboard>>('/dashboard/laboratory');
    return response.data.data;
  },

  getAdminDashboard: async (): Promise<AdminDashboard> => {
    const response = await api.get<ApiResponse<AdminDashboard>>('/dashboard/admin');
    return response.data.data;
  },
};
