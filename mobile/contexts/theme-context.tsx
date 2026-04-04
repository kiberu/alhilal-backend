import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName, Platform } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeValue = {
  colorScheme: NonNullable<ColorSchemeName>;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  setTheme: (scheme: NonNullable<ColorSchemeName>) => void;
  toggleTheme: () => void;
};

const THEME_PREFERENCE_KEY = 'mobile_theme_preference';
const ThemeContext = createContext<ThemeValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

function resolveScheme(preference: ThemePreference, systemScheme: NonNullable<ColorSchemeName>): NonNullable<ColorSchemeName> {
  if (preference === 'system') {
    return systemScheme;
  }
  return preference;
}

function toValidPreference(value: string | null): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return 'system';
}

function hasWebStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

async function readThemePreference(): Promise<ThemePreference> {
  try {
    if (Platform.OS === 'web') {
      if (!hasWebStorage()) {
        return 'system';
      }
      return toValidPreference(localStorage.getItem(THEME_PREFERENCE_KEY));
    }
    return toValidPreference(await SecureStore.getItemAsync(THEME_PREFERENCE_KEY));
  } catch {
    return 'system';
  }
}

async function persistThemePreference(preference: ThemePreference) {
  try {
    if (Platform.OS === 'web') {
      if (!hasWebStorage()) {
        return;
      }
      localStorage.setItem(THEME_PREFERENCE_KEY, preference);
      return;
    }
    await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, preference);
  } catch {
    // Ignore write failures and keep in-memory preference.
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [systemScheme, setSystemScheme] = useState<NonNullable<ColorSchemeName>>(
    () => Appearance.getColorScheme() ?? 'light',
  );

  useEffect(() => {
    let isMounted = true;
    void readThemePreference().then((savedPreference) => {
      if (isMounted) {
        setThemePreferenceState(savedPreference);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? 'light');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    void persistThemePreference(preference);
  }, []);

  const colorScheme = useMemo(
    () => resolveScheme(themePreference, systemScheme),
    [themePreference, systemScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      themePreference,
      setThemePreference,
      setTheme: (scheme: NonNullable<ColorSchemeName>) => setThemePreference(scheme),
      toggleTheme: () => setThemePreference(colorScheme === 'dark' ? 'light' : 'dark'),
    }),
    [colorScheme, setThemePreference, themePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }

  return context;
}
