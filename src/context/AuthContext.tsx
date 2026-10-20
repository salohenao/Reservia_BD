'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LoginCredentials,
  RegisterClientDto,
  RegisterProviderDto,
  User,
} from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  registerClient: (data: RegisterClientDto) => Promise<User | null>;
  registerProvider: (data: RegisterProviderDto) => Promise<User | null>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (isMounted && session.user && session.token) {
          setUser(session.user);
          setToken(session.token);
        }
      } catch (err) {
        console.error('Error recuperando sesión:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerClient = useCallback(async (data: RegisterClientDto): Promise<User | null> => {
    setIsLoading(true);
    try {
      const res = await authService.registerClient(data);
      if (!res) return null;
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerProvider = useCallback(async (data: RegisterProviderDto): Promise<User | null> => {
    setIsLoading(true);
    try {
      const res = await authService.registerProvider(data);
      if (!res) return null;
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    router.push('/');
  }, [router]);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!user) throw new Error('No hay una sesión activa.');
      const updatedUser = await authService.updateProfile(user.id, updates);
      setUser(updatedUser);
      return updatedUser;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerClient,
        registerProvider,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
