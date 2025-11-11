import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/lib/api/services/auth';
import { AuthStorage } from '@/lib/storage';
import { apiClient } from '@/lib/api/client';
import type { User, PilgrimProfile, AuthTokens } from '@/lib/api/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: PilgrimProfile | null;
  accessToken: string | null;
}

interface AuthContextType extends AuthState {
  requestOTP: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string; needsProfile?: boolean }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (profile: PilgrimProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    profile: null,
    accessToken: null,
  });

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up unauthorized callback
  useEffect(() => {
    apiClient.setUnauthorizedCallback(() => {
      // Auto-logout on token expiration
      logout();
    });
  }, []);

  const initializeAuth = async () => {
    try {
      const [tokens, user, profile] = await Promise.all([
        AuthStorage.getTokens(),
        AuthStorage.getUserData(),
        AuthStorage.getProfileData(),
      ]);

      if (tokens && user) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user,
          profile,
          accessToken: tokens.access,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const requestOTP = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await AuthService.requestOTP({ phone });
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to send OTP' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const verifyOTP = async (phone: string, otp: string): Promise<{ success: boolean; error?: string; needsProfile?: boolean }> => {
    try {
      const response = await AuthService.verifyOTP({ phone, otp });
      
      if (response.success && response.data) {
        const { access, refresh, user, profile } = response.data;
        
        // Save to secure storage
        await AuthStorage.saveTokens({ access, refresh });
        await AuthStorage.saveUserData(user);
        if (profile) {
          await AuthStorage.saveProfileData(profile);
        }

        // Check if profile needs completion
        const needsProfile = !profile?.full_name || !profile?.dob;

        setState({
          isAuthenticated: true,
          isLoading: false,
          user,
          profile: profile || null,
          accessToken: access,
        });

        return { success: true, needsProfile };
      } else {
        return { success: false, error: response.error || 'Invalid OTP' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await AuthStorage.clearAll();
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        profile: null,
        accessToken: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = await AuthStorage.getRefreshToken();
      if (!refreshToken) {
        await logout();
        return;
      }

      const response = await AuthService.refreshToken(refreshToken);
      
      if (response.success && response.data) {
        await AuthStorage.updateAccessToken(response.data.access);
        setState(prev => ({
          ...prev,
          accessToken: response.data!.access,
        }));
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const updateProfile = async (profile: PilgrimProfile) => {
    try {
      await AuthStorage.saveProfileData(profile);
      setState(prev => ({
        ...prev,
        profile,
        // Also update user name if profile has full_name
        user: prev.user && profile.full_name ? { ...prev.user, name: profile.full_name } : prev.user,
      }));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    requestOTP,
    verifyOTP,
    logout,
    refreshAuth,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

