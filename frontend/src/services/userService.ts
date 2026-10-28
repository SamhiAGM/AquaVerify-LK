import api from './api';
import { ApiResponse, PagedResponse, Role, User } from '../types';

export interface UserFilterParams {
  role?: Role | '';
  district?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface CreateStaffUserDto {
  fullName: string;
  email: string;
  phone: string;
  district: string;
  role: Role;
  password?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  district?: string;
  role?: Role;
  enabled?: boolean;
}

export const userService = {
  getUsers: async (params?: UserFilterParams): Promise<PagedResponse<User>> => {
    const response = await api.get<ApiResponse<PagedResponse<User>>>('/users', { params });
    return response.data.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  createStaffUser: async (data: CreateStaffUserDto): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users/staff', data);
    return response.data.data;
  },

  updateUser: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  toggleUserStatus: async (id: number): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/status`);
    return response.data.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
