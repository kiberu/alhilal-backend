import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { BookingsService, type Booking } from '@/lib/api';

const STATUS_CONFIG = {
  EOI: { label: 'Pending', color: '#F59E0B', icon: 'time-outline' as const },
  BOOKED: { label: 'Booked', color: '#3B82F6', icon: 'calendar-outline' as const },
  CONFIRMED: { label: 'Confirmed', color: '#10B981', icon: 'checkmark-circle-outline' as const },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', icon: 'close-circle-outline' as const },
};

export default function MyBookingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, accessToken } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async (isRefresh = false) => {
    if (!accessToken) return;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await BookingsService.getMyBookings(accessToken);
      
      console.log('Bookings API response:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        console.log('Bookings data type:', typeof response.data, 'Is array:', Array.isArray(response.data));
        console.log('Bookings count:', Array.isArray(response.data) ? response.data.length : 'Not an array');
        setBookings(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch bookings');
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchBookings(true);
  }, [accessToken]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBookingPress = (bookingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/booking/${bookingId}`);
  };

  const handleBrowseTrips = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/trips');
  };

  if (!isAuthenticated) {
    return null;
  }

  const renderBookingCard = (booking: Booking) => {
    const status = STATUS_CONFIG[booking.status];
    const tripDate = new Date(booking.trip_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    // Format currency
    const formatPrice = (minorUnits: number, currency: string) => {
      const major = minorUnits / 100;
      if (currency === 'UGX') {
        return `UGX ${major.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
      }
      return `$${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
      <TouchableOpacity
        key={booking.id}
        style={[styles.bookingCard, { backgroundColor: colors.card }, Shadow.medium]}
        onPress={() => handleBookingPress(booking.id)}
        activeOpacity={0.95}
      >
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${status.color}15`, borderColor: status.color },
          ]}
        >
          <Ionicons name={status.icon} size={16} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>

        {/* Trip Info */}
        <View style={styles.bookingHeader}>
          <Text style={[styles.tripName, { color: colors.text }]}>{booking.trip_name}</Text>
            <Text style={[styles.packageName, { color: colors.mutedForeground }]}>
              {booking.package_name}
            </Text>
          <Text style={[styles.referenceNumber, { color: colors.mutedForeground }]}>
            Ref: {booking.reference_number}
          </Text>
        </View>

        {/* Trip Date */}
        <View style={styles.bookingRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.bookingText, { color: colors.mutedForeground }]}>{tripDate}</Text>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.mutedForeground }]}>Paid:</Text>
            <Text style={[styles.paymentValue, { color: colors.primary }]}>
              {formatPrice(booking.amount_paid_minor_units, booking.currency_code)}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.mutedForeground }]}>Total:</Text>
            <Text style={[styles.paymentValue, { color: colors.text }]}>
              {formatPrice(booking.package_price, booking.currency_code)}
            </Text>
          </View>
        </View>

        {/* View Details Button */}
        <TouchableOpacity
          style={[styles.viewButton, { borderColor: colors.border }]}
          onPress={() => handleBookingPress(booking.id)}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewButtonText, { color: colors.primary }]}>View Details</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>
        <TouchableOpacity 
          onPress={handleRefresh} 
          style={styles.refreshButton} 
          activeOpacity={0.8}
          disabled={isRefreshing || isLoading}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={isRefreshing ? colors.mutedForeground : colors.text} 
            style={isRefreshing ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading bookings...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Error</Text>
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchBookings()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : bookings.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <Ionicons name="calendar-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bookings Yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            You haven't made any trip bookings yet.{'\n'}Explore our trips and start your pilgrimage journey!
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={handleBrowseTrips}
            activeOpacity={0.8}
          >
            <Text style={styles.browseButtonText}>Browse Trips</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Stats Summary */}
          <View style={[styles.statsCard, { backgroundColor: colors.card }, Shadow.medium]}>
            <LinearGradient
              colors={[colors.primary, '#A8024E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Array.isArray(bookings) ? bookings.length : 0}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Array.isArray(bookings) ? bookings.filter((b) => b.status === 'CONFIRMED').length : 0}
                </Text>
                <Text style={styles.statLabel}>Confirmed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Array.isArray(bookings) ? bookings.filter((b) => b.status === 'EOI').length : 0}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Bookings List */}
          <View style={styles.bookingsList}>
            {Array.isArray(bookings) && bookings.map((booking) => renderBookingCard(booking))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
  refreshButton: {
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
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.md,
  },
  errorTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  statsCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  statsGradient: {
    flexDirection: 'row',
    padding: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.black,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: Spacing.md,
  },
  bookingsList: {
    gap: Spacing.md,
  },
  bookingCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingHeader: {
    gap: Spacing.xs,
  },
  tripName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  packageName: {
    fontSize: Typography.fontSize.sm,
  },
  referenceNumber: {
    fontSize: Typography.fontSize.xs,
    fontStyle: 'italic',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bookingText: {
    fontSize: Typography.fontSize.base,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  paymentRow: {
    gap: Spacing.xs,
  },
  paymentLabel: {
    fontSize: Typography.fontSize.sm,
  },
  paymentValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  viewButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

