import React, { createContext, useContext, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeValue = {
  colorScheme: NonNullable<ColorSchemeName>;
  setTheme: (scheme: NonNullable<ColorSchemeName>) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colorScheme, setColorScheme] = useState<NonNullable<ColorSchemeName>>(
    () => Appearance.getColorScheme() ?? 'light',
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setTheme: (scheme: NonNullable<ColorSchemeName>) => setColorScheme(scheme),
      toggleTheme: () => setColorScheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [colorScheme],
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


