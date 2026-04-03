import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/lib/api/services/auth';
import { SupportService } from '@/lib/api/services/support';
import { AuthStorage } from '@/lib/storage';
import type { User, PilgrimProfile, OTPFallback } from '@/lib/api/types';
import { registerCurrentDevice } from '@/lib/support/device-registration';

interface OTPRequestResult {
  success: boolean;
  error?: string;
  message?: string;
  fallback?: OTPFallback;
  retryAfterSeconds?: number;
  deliveryChannel?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: PilgrimProfile | null;
  accessToken: string | null;
}

interface AuthContextType extends AuthState {
  requestOTP: (phone: string) => Promise<OTPRequestResult>;
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

  // Pilgrim sessions should feel durable. We refresh silently and only clear
  // local auth when the refresh token is definitively invalid.

  const logout = useCallback(async () => {
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
  }, []);

  const performRefreshAuth = useCallback(async (logoutOnInvalid = true): Promise<boolean> => {
    try {
      const refreshToken = await AuthStorage.getRefreshToken();
      if (!refreshToken) {
        if (logoutOnInvalid) {
          await logout();
        }
        return false;
      }

      const response = await AuthService.refreshToken(refreshToken);

      if (response.success && response.data) {
        await AuthStorage.updateAccessToken(response.data.access);
        setState(prev => ({
          ...prev,
          accessToken: response.data!.access,
        }));
        return true;
      }

      if (response.status === 400 || response.status === 401) {
        if (logoutOnInvalid) {
          await logout();
        }
        return false;
      }

      return false;
    } catch (error: any) {
      console.error('Token refresh failed:', error);

      if ((error?.status === 400 || error?.status === 401) && logoutOnInvalid) {
        await logout();
      }

      return false;
    }
  }, [logout]);

  const initializeAuth = useCallback(async () => {
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

        void performRefreshAuth(true);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [performRefreshAuth]);

  // Initialize auth state from storage
  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!state.isAuthenticated || !state.accessToken) {
      return;
    }

    let cancelled = false;
    const syncDeviceRegistration = async () => {
      try {
        const preferencesResponse = await SupportService.getNotificationPreferences(state.accessToken as string);
        if (cancelled) {
          return;
        }

        await registerCurrentDevice(state.accessToken as string, preferencesResponse.data || undefined);
      } catch (error) {
        console.error('Device registration sync failed:', error);
      }
    };

    void syncDeviceRegistration();
    return () => {
      cancelled = true;
    };
  }, [state.accessToken, state.isAuthenticated]);

  const requestOTP = async (phone: string): Promise<OTPRequestResult> => {
    try {
      const response = await AuthService.requestOTP({ phone });
      
      if (response.success) {
        return {
          success: true,
          message: response.data?.message,
          fallback: response.data?.fallback,
          retryAfterSeconds: response.data?.retry_after_seconds,
          deliveryChannel: response.data?.delivery_channel,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to send OTP',
        };
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

  const refreshAuth = async () => {
    await performRefreshAuth(true);
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
