import api from './api';
import { ApiResponse, AuthResponse, User } from '../types';

export interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterParams {
  fullName: string;
  email: string;
  phone: string;
  district: string;
  password: string;
  confirmPassword: string;
  termsAccepted?: boolean;
}

export const authService = {
  login: async (credentials: LoginParams): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: RegisterParams): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<string> => {
    const response = await api.post<ApiResponse<string>>('/auth/forgot-password', { email });
    return response.data.message;
  },

  resetPassword: async (token: string, newPassword: string): Promise<string> => {
    const response = await api.post<ApiResponse<string>>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data.message;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('aquaverify_token');
      localStorage.removeItem('aquaverify_user');
    }
  },
};
