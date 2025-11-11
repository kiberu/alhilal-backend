import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BadgeVariant = 'primary' | 'gold' | 'success' | 'error' | 'warning' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Badge({
  children,
  variant = 'primary',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: `${colors.primary}20`,
            borderColor: `${colors.primary}40`,
          },
          text: {
            color: colors.primary,
          },
        };
      case 'gold':
        return {
          container: {
            backgroundColor: `${colors.gold}20`,
            borderColor: `${colors.gold}40`,
          },
          text: {
            color: colors.gold,
          },
        };
      case 'success':
        return {
          container: {
            backgroundColor: `${colors.success}20`,
            borderColor: `${colors.success}40`,
          },
          text: {
            color: colors.success,
          },
        };
      case 'error':
        return {
          container: {
            backgroundColor: `${colors.error}20`,
            borderColor: `${colors.error}40`,
          },
          text: {
            color: colors.error,
          },
        };
      case 'warning':
        return {
          container: {
            backgroundColor: `${colors.warning}20`,
            borderColor: `${colors.warning}40`,
          },
          text: {
            color: colors.warning,
          },
        };
      case 'muted':
        return {
          container: {
            backgroundColor: colors.muted,
            borderColor: colors.border,
          },
          text: {
            color: colors.mutedForeground,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, variantStyles.container, style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, variantStyles.text, textStyle]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
});

