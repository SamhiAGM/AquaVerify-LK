import api from './api';
import {
  ApiResponse,
  Complaint,
  ComplaintCategory,
  ComplaintDetail,
  ComplaintStatus,
  PagedResponse,
} from '../types';

export interface ComplaintFilterParams {
  search?: string;
  status?: ComplaintStatus | '';
  category?: ComplaintCategory | '';
  district?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ComplaintCreateDto {
  title: string;
  description: string;
  complaintCategory: ComplaintCategory;
  waterSourceId?: number | null;
}

export interface ComplaintUpdateDto {
  title?: string;
  description?: string;
  complaintCategory?: ComplaintCategory;
  waterSourceId?: number | null;
}

export const complaintService = {
  getComplaints: async (params?: ComplaintFilterParams): Promise<PagedResponse<Complaint>> => {
    const response = await api.get<ApiResponse<PagedResponse<Complaint>>>('/complaints', {
      params,
    });
    return response.data.data;
  },

  getComplaintById: async (id: number): Promise<ComplaintDetail> => {
    const response = await api.get<ApiResponse<ComplaintDetail>>(`/complaints/${id}`);
    return response.data.data;
  },

  createComplaint: async (data: ComplaintCreateDto): Promise<Complaint> => {
    const response = await api.post<ApiResponse<Complaint>>('/complaints', data);
    return response.data.data;
  },

  updateComplaint: async (id: number, data: ComplaintUpdateDto): Promise<Complaint> => {
    const response = await api.put<ApiResponse<Complaint>>(`/complaints/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (
    id: number,
    newStatus: ComplaintStatus,
    note: string
  ): Promise<Complaint> => {
    const response = await api.patch<ApiResponse<Complaint>>(`/complaints/${id}/status`, {
      newStatus,
      note,
    });
    return response.data.data;
  },

  assignOfficer: async (id: number, officerId: number, note?: string): Promise<Complaint> => {
    const response = await api.patch<ApiResponse<Complaint>>(`/complaints/${id}/assign`, {
      officerId,
      note,
    });
    return response.data.data;
  },

  deleteComplaint: async (id: number): Promise<void> => {
    await api.delete(`/complaints/${id}`);
  },
};
