import { api } from './client';
import type { ApiResponse, User } from '../types';

export interface LoginDto {
  identifier: string; // username or email
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  profilePicture?: string | null;
  phone?: string | null;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (credentials: LoginDto) => {
    return api.post<ApiResponse<AuthData>>('/auth/login', credentials);
  },
  register: async (payload: RegisterDto) => {
    return api.post<ApiResponse<AuthData>>('/auth/register', payload);
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('jmz_refresh_token');
    try {
      return await api.post<ApiResponse<void>>('/auth/logout', { refreshToken });
    } catch (error: any) {
      // If logout fails due to expired token, just clear local storage
      if (error?.status === 401) {
        localStorage.removeItem('jmz_access_token');
        localStorage.removeItem('jmz_refresh_token');
        localStorage.removeItem('jmz_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return { success: true, message: 'Logged out successfully' };
      }
      throw error;
    }
  },
  getMe: async () => {
    return api.get<ApiResponse<User>>('/auth/me');
  },
  forgotPassword: async (email: string) => {
    return api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
  },
  resetPassword: async (password: string, token: string, confirmPassword?: string) => {
    return api.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      password,
      token,
      confirmPassword,
    });
  },
};
