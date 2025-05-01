"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService'; // Assuming you have an authService to handle API calls
import { AuthFormData } from '@/lib/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  login: (data: AuthFormData) => Promise<void>;
  register: (data: AuthFormData) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (provider: string, accessToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in on initial load
    const initAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  const login = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);
      setUser(result.user);
      toast.success('Signed in successfully!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      toast.success('Registration successful! Please sign in.');
      return;
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/auth');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: string, accessToken: string) => {
    setIsLoading(true);
    try {
      const result = await authService.socialAuth(provider, accessToken);
      setUser(result.user);
      toast.success(`Signed in with ${provider} successfully!`);
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    socialLogin
  };

  // Show loading state until we've checked if the user is logged in
  if (!isInitialized) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};