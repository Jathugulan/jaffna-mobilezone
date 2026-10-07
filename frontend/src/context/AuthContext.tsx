import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { authApi, type LoginDto, type RegisterDto } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<User>;
  register: (payload: RegisterDto) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jmz_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('jmz_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('jmz_user', JSON.stringify(res.data));
      } else {
        setUser(null);
        localStorage.removeItem('jmz_user');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('jmz_user');
      localStorage.removeItem('jmz_access_token');
      localStorage.removeItem('jmz_refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: LoginDto): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('jmz_access_token', accessToken);
      localStorage.setItem('jmz_refresh_token', refreshToken);
      localStorage.setItem('jmz_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterDto): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('jmz_access_token', accessToken);
      localStorage.setItem('jmz_refresh_token', refreshToken);
      localStorage.setItem('jmz_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('jmz_access_token');
      localStorage.removeItem('jmz_refresh_token');
      localStorage.removeItem('jmz_user');
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isCustomer,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
