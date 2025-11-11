import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthTokens, User, PilgrimProfile } from '../api/types';

const KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
  PROFILE_DATA: 'auth_profile_data',
} as const;

// Platform-specific storage helpers
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export class AuthStorage {
  /**
   * Save authentication tokens securely
   */
  static async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        storage.setItem(KEYS.ACCESS_TOKEN, tokens.access),
        storage.setItem(KEYS.REFRESH_TOKEN, tokens.refresh),
      ]);
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  /**
   * Get access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await storage.getItem(KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await storage.getItem(KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get both tokens
   */
  static async getTokens(): Promise<AuthTokens | null> {
    try {
      const [access, refresh] = await Promise.all([
        storage.getItem(KEYS.ACCESS_TOKEN),
        storage.getItem(KEYS.REFRESH_TOKEN),
      ]);

      if (!access || !refresh) return null;
      return { access, refresh };
    } catch (error) {
      console.error('Failed to get tokens:', error);
      return null;
    }
  }

  /**
   * Update access token (after refresh)
   */
  static async updateAccessToken(accessToken: string): Promise<void> {
    try {
      await storage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    } catch (error) {
      console.error('Failed to update access token:', error);
      throw new Error('Failed to update access token');
    }
  }

  /**
   * Save user data
   */
  static async saveUserData(user: User): Promise<void> {
    try {
      await storage.setItem(KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Get user data
   */
  static async getUserData(): Promise<User | null> {
    try {
      const data = await storage.getItem(KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Save profile data
   */
  static async saveProfileData(profile: PilgrimProfile | any): Promise<void> {
    try {
      // Ensure we have valid data before saving
      if (!profile || typeof profile !== 'object') {
        console.warn('Invalid profile data, skipping save');
        return;
      }
      await storage.setItem(KEYS.PROFILE_DATA, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save profile data:', error);
      throw new Error('Failed to save profile data');
    }
  }

  /**
   * Get profile data
   */
  static async getProfileData(): Promise<PilgrimProfile | null> {
    try {
      const data = await storage.getItem(KEYS.PROFILE_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get profile data:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data (logout)
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        storage.deleteItem(KEYS.ACCESS_TOKEN),
        storage.deleteItem(KEYS.REFRESH_TOKEN),
        storage.deleteItem(KEYS.USER_DATA),
        storage.deleteItem(KEYS.PROFILE_DATA),
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      // Don't throw - we want logout to succeed even if clearing fails
    }
  }

  /**
   * Check if user is authenticated (has tokens)
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      return tokens !== null;
    } catch (error) {
      console.error('Failed to check authentication:', error);
      return false;
    }
  }
}

