import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { MenuListItem, TopBar } from '@/components/guest/primitives';
import { FooterInfoCard } from '@/components/guest/cards';
import { guestSettingsLinks } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import { useTheme } from '@/hooks/use-color-scheme';
import { openExternalUrl } from '@/lib/support/open-external';

const THEME_OPTIONS: { label: string; value: 'system' | 'light' | 'dark' }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const theme = useGuestTheme();
  const router = useRouter();
  const { themePreference, setThemePreference } = useTheme();
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.pageHorizontal,
            paddingBottom: theme.spacing.heroGap * 2,
            gap: theme.spacing.sectionGap,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title="Settings" subtitle="Preferences, legal links, and app information" leadingIcon="arrow-back" onLeadingPress={() => router.back()} />

        <FooterInfoCard
          title="Appearance"
          body="System is the default. Change it here if you want a fixed light or dark guest experience."
        />

        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option) => {
            const selected = option.value === themePreference;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: selected ? theme.palette.primary : theme.palette.surface,
                    borderColor: selected ? theme.palette.primary : theme.palette.border,
                  },
                ]}
                onPress={() => setThemePreference(option.value)}
                activeOpacity={0.88}
              >
                <Text style={{ color: selected ? theme.palette.primaryForeground : theme.palette.text, fontWeight: '700' }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.stack}>
          {guestSettingsLinks.map((link) => (
            <MenuListItem
              key={link.label}
              label={link.label}
              description={link.href.replace('https://', '')}
              icon="open-outline"
              onPress={() => void openExternalUrl(link.href)}
            />
          ))}
        </View>

        <View style={[styles.versionRow, { backgroundColor: theme.palette.surface, borderColor: theme.palette.border }]}>
          <Ionicons name="phone-portrait-outline" size={18} color={theme.palette.primary} />
          <Text style={{ color: theme.palette.text, fontWeight: '700' }}>{`App version ${appVersion}`}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    gap: 12,
  },
  versionRow: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
