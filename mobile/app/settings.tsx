import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const router = useRouter();
  const systemScheme = useColorScheme();
  const colors = Colors[systemScheme ?? 'light'];

  const [settings, setSettings] = React.useState({
    pushNotifications: true,
    emailUpdates: false,
    darkMode: systemScheme === 'dark',
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const toggleSetting = (key: keyof typeof settings, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === 'darkMode') {
      Alert.alert(
        'Theme preference saved',
        value
          ? 'Dark theme will be applied across the app in a future update.'
          : 'Light theme preference saved. We will remember this for your next visit.',
      );
    }
  };

  const handleSupportPress = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Open support option:', type);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>Receive booking reminders, offers, and important travel updates.</Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) => toggleSetting('pushNotifications', value)}
              thumbColor={settings.pushNotifications ? colors.primary : colors.border}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Email Updates</Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>Monthly highlights, new packages, and travel tips.</Text>
            </View>
            <Switch
              value={settings.emailUpdates}
              onValueChange={(value) => toggleSetting('emailUpdates', value)}
              thumbColor={settings.emailUpdates ? colors.primary : colors.border}
            />
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>Preview the upcoming dark theme experience.</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => toggleSetting('darkMode', value)}
              thumbColor={settings.darkMode ? colors.primary : colors.border}
            />
          </View>
          <View style={[styles.themePreview, { backgroundColor: colors.muted }]}> 
            <Ionicons name={settings.darkMode ? 'moon' : 'sunny'} size={24} color={colors.primary} />
            <View style={styles.themePreviewText}>
              <Text style={[styles.themePreviewTitle, { color: colors.text }]}>Theme preview</Text>
              <Text style={[styles.themePreviewSubtitle, { color: colors.mutedForeground }]}>Interactive theme switching is coming soon.</Text>
            </View>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          <View style={styles.supportList}>
            <TouchableOpacity
              style={[styles.supportRow, { borderColor: colors.border }]}
              onPress={() => handleSupportPress('faq')}
              activeOpacity={0.8}
            >
              <Ionicons name="help-buoy" size={22} color={colors.primary} />
              <View style={styles.supportTextGroup}>
                <Text style={[styles.supportTitle, { color: colors.text }]}>FAQs & Guides</Text>
                <Text style={[styles.supportSubtitle, { color: colors.mutedForeground }]}>Answers to common pilgrimage questions</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.supportRow, { borderColor: colors.border }]}
              onPress={() => handleSupportPress('whatsapp')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={22} color={colors.primary} />
              <View style={styles.supportTextGroup}>
                <Text style={[styles.supportTitle, { color: colors.text }]}>Chat with Concierge</Text>
                <Text style={[styles.supportSubtitle, { color: colors.mutedForeground }]}>Available daily 8am – 10pm EAT</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.versionCard, { backgroundColor: colors.muted }]}>
          <Text style={[styles.versionTitle, { color: colors.text }]}>Al-Hilal App v1.0.0</Text>
          <Text style={[styles.versionSubtitle, { color: colors.mutedForeground }]}>Last updated 07 Nov 2025</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  settingTextGroup: {
    flex: 1,
    gap: Spacing.xs,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  divider: {
    height: 1,
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  themePreviewText: {
    flex: 1,
    gap: 4,
  },
  themePreviewTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  themePreviewSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  supportList: {
    gap: Spacing.sm,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  supportTextGroup: {
    flex: 1,
    gap: 4,
  },
  supportTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  supportSubtitle: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  versionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  versionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  versionSubtitle: {
    fontSize: Typography.fontSize.xs,
  },
});


