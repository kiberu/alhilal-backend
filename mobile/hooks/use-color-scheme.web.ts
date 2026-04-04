import { useThemeContext } from '@/contexts/theme-context';

export function useColorScheme() {
  const { colorScheme } = useThemeContext();
  return colorScheme;
}

export function useTheme() {
  return useThemeContext();
}
