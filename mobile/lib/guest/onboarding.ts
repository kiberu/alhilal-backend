import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const GUEST_ONBOARDING_KEY = 'guest_onboarding_seen';

function hasWebStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export async function readGuestOnboardingSeen() {
  try {
    if (Platform.OS === 'web') {
      if (!hasWebStorage()) {
        return false;
      }

      return localStorage.getItem(GUEST_ONBOARDING_KEY) === 'true';
    }

    return (await SecureStore.getItemAsync(GUEST_ONBOARDING_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function markGuestOnboardingSeen() {
  try {
    if (Platform.OS === 'web') {
      if (!hasWebStorage()) {
        return;
      }

      localStorage.setItem(GUEST_ONBOARDING_KEY, 'true');
      return;
    }

    await SecureStore.setItemAsync(GUEST_ONBOARDING_KEY, 'true');
  } catch {
    // Ignore persistence failures and continue routing.
  }
}

export async function clearGuestOnboardingSeen() {
  try {
    if (Platform.OS === 'web') {
      if (!hasWebStorage()) {
        return;
      }

      localStorage.removeItem(GUEST_ONBOARDING_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(GUEST_ONBOARDING_KEY);
  } catch {
    // Ignore persistence failures and continue routing.
  }
}
