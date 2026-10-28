import api from './api';
import { ApiResponse, PagedResponse, VerificationStatus, WaterTest } from '../types';

export interface WaterTestFilterParams {
  waterSourceId?: number;
  status?: VerificationStatus | '';
  district?: string;
  page?: number;
  size?: number;
}

export interface WaterTestCreateDto {
  waterSourceId: number;
  sampleDate: string;
  phValue: number;
  turbidityNtu: number;
  tdsPpm?: number | null;
  conductivityUsCm?: number | null;
  nitrateMgL?: number | null;
  eColiPresence?: boolean;
  laboratoryReference: string;
}

export const waterTestService = {
  getWaterTests: async (params?: WaterTestFilterParams): Promise<PagedResponse<WaterTest>> => {
    const response = await api.get<ApiResponse<PagedResponse<WaterTest>>>('/water-tests', {
      params,
    });
    return response.data.data;
  },

  getVerifiedWaterTests: async (district?: string): Promise<WaterTest[]> => {
    const response = await api.get<ApiResponse<WaterTest[]>>('/water-tests/verified', {
      params: { district },
    });
    return response.data.data;
  },

  getWaterTestById: async (id: number): Promise<WaterTest> => {
    const response = await api.get<ApiResponse<WaterTest>>(`/water-tests/${id}`);
    return response.data.data;
  },

  createWaterTest: async (data: WaterTestCreateDto): Promise<WaterTest> => {
    const response = await api.post<ApiResponse<WaterTest>>('/water-tests', data);
    return response.data.data;
  },

  updateWaterTest: async (
    id: number,
    data: Partial<WaterTestCreateDto>
  ): Promise<WaterTest> => {
    const response = await api.put<ApiResponse<WaterTest>>(`/water-tests/${id}`, data);
    return response.data.data;
  },

  verifyWaterTest: async (
    id: number,
    status: 'VERIFIED' | 'REJECTED'
  ): Promise<WaterTest> => {
    const response = await api.patch<ApiResponse<WaterTest>>(`/water-tests/${id}/verify`, null, {
      params: { status },
    });
    return response.data.data;
  },

  deleteWaterTest: async (id: number): Promise<void> => {
    await api.delete(`/water-tests/${id}`);
  },
};
