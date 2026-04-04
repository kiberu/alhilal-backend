import { Fonts, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const guestLightPalette = {
  canvas: '#F7EFEA',
  canvasAccent: '#F3E2D8',
  surface: '#FFF9F5',
  surfaceMuted: '#F6EBE6',
  surfaceStrong: '#EFDCE0',
  card: '#FFFFFF',
  text: '#2B1621',
  mutedText: '#735967',
  border: '#EAD6DB',
  primary: '#970246',
  primaryStrong: '#700235',
  primaryForeground: '#FFFFFF',
  primarySoft: '#F7E3EC',
  accent: '#F9A028',
  accentForeground: '#3D2500',
  accentSoft: '#FDF0DA',
  success: '#2E7D5B',
  warning: '#B7791F',
  error: '#C7504B',
  shadow: '#4D0C2A',
  tabInactive: '#A08D96',
} as const;

const guestDarkPalette = {
  canvas: '#23151C',
  canvasAccent: '#2F1A23',
  surface: '#2C1D24',
  surfaceMuted: '#3A2630',
  surfaceStrong: '#4A3040',
  card: '#37232D',
  text: '#FFF6FA',
  mutedText: '#D2BCC7',
  border: '#5A3A49',
  primary: '#F9A028',
  primaryStrong: '#FFB84D',
  primaryForeground: '#281204',
  primarySoft: '#5A263B',
  accent: '#C93F7A',
  accentForeground: '#FFF6FA',
  accentSoft: '#5B2336',
  success: '#74D3A4',
  warning: '#FFD37A',
  error: '#F48F88',
  shadow: '#000000',
  tabInactive: '#B4A0AB',
} as const;

export const GuestSpacing = {
  pageHorizontal: 20,
  sectionGap: 20,
  cardPadding: 16,
  dense: 12,
  compact: 8,
  heroGap: 24,
  bottomDockInset: 18,
} as const;

export const GuestRadius = {
  screenCard: 28,
  componentCard: 22,
  pill: 999,
  input: 18,
  chip: 999,
  iconTile: 18,
  bottomDock: 30,
} as const;

export const GuestType = {
  display: {
    fontSize: Typography.fontSize['4xl'],
    lineHeight: 44,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Fonts.rounded,
  },
  heading1: {
    fontSize: Typography.fontSize['3xl'],
    lineHeight: 38,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Fonts.rounded,
  },
  heading2: {
    fontSize: Typography.fontSize['2xl'],
    lineHeight: 30,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Fonts.rounded,
  },
  heading3: {
    fontSize: Typography.fontSize.lg,
    lineHeight: 24,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Fonts.rounded,
  },
  body: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    fontWeight: Typography.fontWeight.normal,
    fontFamily: Fonts.sans,
  },
  bodySm: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 22,
    fontWeight: Typography.fontWeight.normal,
    fontFamily: Fonts.sans,
  },
  caption: {
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Fonts.sans,
  },
} as const;

export const GuestShadow = {
  card: {
    shadowColor: guestLightPalette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  hero: {
    shadowColor: guestLightPalette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },
  dock: {
    shadowColor: guestLightPalette.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

export function useGuestTheme() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === 'dark' ? guestDarkPalette : guestLightPalette;

  return {
    colorScheme,
    palette,
    spacing: GuestSpacing,
    radius: GuestRadius,
    typography: GuestType,
    shadow: GuestShadow,
  };
}

export type GuestTheme = ReturnType<typeof useGuestTheme>;
