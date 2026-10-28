import api from './api';
import { ApiResponse, PagedResponse, WaterSource, WaterSourceType } from '../types';

export interface WaterSourceFilterParams {
  district?: string;
  type?: WaterSourceType | '';
  search?: string;
  page?: number;
  size?: number;
}

export interface WaterSourceCreateDto {
  sourceName: string;
  sourceType: WaterSourceType;
  district: string;
  locationDescription: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const waterSourceService = {
  getWaterSources: async (
    params?: WaterSourceFilterParams
  ): Promise<PagedResponse<WaterSource>> => {
    const response = await api.get<ApiResponse<PagedResponse<WaterSource>>>('/water-sources', {
      params,
    });
    return response.data.data;
  },

  getAllWaterSources: async (): Promise<WaterSource[]> => {
    const response = await api.get<ApiResponse<WaterSource[]>>('/water-sources/all');
    return response.data.data;
  },

  getWaterSourceById: async (id: number): Promise<WaterSource> => {
    const response = await api.get<ApiResponse<WaterSource>>(`/water-sources/${id}`);
    return response.data.data;
  },

  getDistricts: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/water-sources/districts');
    return response.data.data;
  },

  createWaterSource: async (data: WaterSourceCreateDto): Promise<WaterSource> => {
    const response = await api.post<ApiResponse<WaterSource>>('/water-sources', data);
    return response.data.data;
  },

  updateWaterSource: async (
    id: number,
    data: Partial<WaterSourceCreateDto>
  ): Promise<WaterSource> => {
    const response = await api.put<ApiResponse<WaterSource>>(`/water-sources/${id}`, data);
    return response.data.data;
  },

  deleteWaterSource: async (id: number): Promise<void> => {
    await api.delete(`/water-sources/${id}`);
  },
};
