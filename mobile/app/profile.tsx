import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const profile = {
  name: 'Guest User',
  membership: 'Silver Pilgrim',
  memberId: 'AH-2025-001',
  joined: 'February 2024',
  avatar: require('@/assets/alhilal-assets/about-image.jpg'),
};

const quickActions = [
  { id: 'edit', icon: 'create-outline', label: 'Edit Profile' },
  { id: 'documents', icon: 'document-text-outline', label: 'Upload Documents' },
  { id: 'preferences', icon: 'settings-outline', label: 'Travel Preferences' },
];

const upcomingTrips = [
  {
    id: 'november-umrah',
    title: 'November Umrah 2025',
    status: 'Deposit Paid',
    date: '27 Nov – 6 Dec 2025',
    location: 'Makkah & Madinah',
  },
];

const travelPreferences = [
  { id: 'room', icon: 'bed-outline', label: 'Room Type', value: 'Twin room' },
  { id: 'diet', icon: 'fast-food-outline', label: 'Dietary', value: 'Halal only' },
  { id: 'assistance', icon: 'walk-outline', label: 'Mobility Assistance', value: 'None required' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleActionPress = (actionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Profile action:', actionId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <View style={styles.profileTop}>
            <View style={[styles.avatar, { borderColor: colors.border }]}>
              <Image source={profile.avatar} style={styles.avatarImage} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.profileTier, { color: colors.primary }]}>{profile.membership}</Text>
              <View style={styles.profileMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="id-card" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{profile.memberId}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Joined {profile.joined}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionButton, { backgroundColor: colors.muted }]}
                onPress={() => handleActionPress(action.id)}
                activeOpacity={0.75}
              >
                <Ionicons name={action.icon as any} size={20} color={colors.primary} />
                <Text style={[styles.quickActionLabel, { color: colors.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Trips</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/trips')} activeOpacity={0.8}>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tripList}>
            {upcomingTrips.map((trip) => (
              <View key={trip.id} style={[styles.tripCard, { borderColor: colors.border }]}> 
                <View style={styles.tripHeader}>
                  <Text style={[styles.tripTitle, { color: colors.text }]}>{trip.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${colors.primary}12` }]}> 
                    <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                    <Text style={[styles.statusText, { color: colors.primary }]}>{trip.status}</Text>
                  </View>
                </View>
                <View style={styles.tripMetaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{trip.date}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{trip.location}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Travel Preferences</Text>
          <View style={styles.preferenceList}>
            {travelPreferences.map((pref) => (
              <View key={pref.id} style={[styles.preferenceRow, { borderColor: colors.border }]}> 
                <View style={[styles.preferenceIcon, { backgroundColor: colors.muted }]}> 
                  <Ionicons name={pref.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={styles.preferenceContent}>
                  <Text style={[styles.preferenceLabel, { color: colors.mutedForeground }]}>{pref.label}</Text>
                  <Text style={[styles.preferenceValue, { color: colors.text }]}>{pref.value}</Text>
                </View>
              </View>
            ))}
          </View>
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
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  profileCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.lg,
  },
  profileTop: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  profileName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  profileTier: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  profileMeta: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.fontSize.sm,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  sectionCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionAction: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  tripList: {
    gap: Spacing.md,
  },
  tripCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  tripMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  preferenceList: {
    gap: Spacing.md,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  preferenceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceContent: {
    flex: 1,
    gap: 4,
  },
  preferenceLabel: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  preferenceValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});


