import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const bookings = [
  {
    id: 'AH-UMR-2025-11',
    title: 'November Umrah 2025',
    status: 'Confirmed',
    date: '27 Nov – 6 Dec 2025',
    travelers: 2,
    amount: 'USD 1,800',
    progress: 'Documents pending',
  },
  {
    id: 'AH-EXP-2026-02',
    title: 'February Spiritual Retreat',
    status: 'Deposit Paid',
    date: '14 – 22 Feb 2026',
    travelers: 1,
    amount: 'USD 950',
    progress: 'Next payment due 5 Jan 2026',
  },
];

const statusColor: Record<string, string> = {
  Confirmed: '#10B981',
  'Deposit Paid': '#F59E0B',
  Cancelled: '#EF4444',
};

export default function BookingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBookingPress = (bookingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Open booking:', bookingId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryItem, { backgroundColor: colors.muted }]}>
              <Ionicons name="briefcase" size={20} color={colors.primary} />
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Active Trips</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{bookings.length}</Text>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: colors.muted }]}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Balance Due</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>USD 1,450</Text>
            </View>
          </View>
        </View>

        <View style={styles.list}>
          {bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={[styles.bookingCard, { backgroundColor: colors.card }, Shadow.small]}
              activeOpacity={0.85}
              onPress={() => handleBookingPress(booking.id)}
            >
              <View style={styles.bookingHeader}>
                <View>
                  <Text style={[styles.bookingTitle, { color: colors.text }]}>{booking.title}</Text>
                  <Text style={[styles.bookingId, { color: colors.mutedForeground }]}>{booking.id}</Text>
                </View>
                <View
                  style={[styles.statusPill, { backgroundColor: `${statusColor[booking.status] ?? colors.primary}20` }]}
                >
                  <Ionicons name="ellipse" size={8} color={statusColor[booking.status] ?? colors.primary} />
                  <Text
                    style={[styles.statusLabel, { color: statusColor[booking.status] ?? colors.primary }]}
                  >
                    {booking.status}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={18} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{booking.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={18} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                    {booking.travelers} traveller{booking.travelers > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="pricetag-outline" size={18} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{booking.amount}</Text>
                </View>
              </View>

              <View style={[styles.progressRow, { borderTopColor: colors.border }]}> 
                <Ionicons name="information-circle" size={18} color={colors.primary} />
                <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{booking.progress}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.ctaCard, { backgroundColor: colors.primary }]} 
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/trips')}
        >
          <Text style={[styles.ctaText, { color: colors.primaryForeground }]}>Browse new pilgrimage packages</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.primaryForeground} />
        </TouchableOpacity>

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
  summaryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  summaryItem: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  list: {
    gap: Spacing.md,
  },
  bookingCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  bookingId: {
    marginTop: 4,
    fontSize: Typography.fontSize.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.fontSize.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
  },
  ctaCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  ctaText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});


