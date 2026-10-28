import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, LoginParams, RegisterParams } from '../services/authService';
import { Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginParams) => Promise<User>;
  register: (data: RegisterParams) => Promise<User>;
  logout: () => Promise<void>;
  updateLocalUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('aquaverify_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('aquaverify_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('aquaverify_token');
      if (storedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem('aquaverify_user', JSON.stringify(freshUser));
        } catch {
          // Token invalid or expired
          localStorage.removeItem('aquaverify_token');
          localStorage.removeItem('aquaverify_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginParams): Promise<User> => {
    const authData = await authService.login(credentials);
    localStorage.setItem('aquaverify_token', authData.token);
    localStorage.setItem('aquaverify_user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);
    return authData.user;
  };

  const register = async (data: RegisterParams): Promise<User> => {
    const authData = await authService.register(data);
    localStorage.setItem('aquaverify_token', authData.token);
    localStorage.setItem('aquaverify_user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);
    return authData.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('aquaverify_token');
      localStorage.removeItem('aquaverify_user');
      setUser(null);
      setToken(null);
    }
  };

  const updateLocalUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('aquaverify_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async (): Promise<void> => {
    if (!token) return;
    try {
      const freshUser = await authService.getMe();
      updateLocalUser(freshUser);
    } catch {
      // Ignored
    }
  };

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateLocalUser,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
