import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { BookingsService, type Booking } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

const STATUS_CONFIG = {
  EOI: { label: 'Expression of Interest', color: '#F59E0B', icon: 'time-outline' as const, description: 'Your booking request is being reviewed by our team.' },
  BOOKED: { label: 'Booked', color: '#3B82F6', icon: 'calendar-outline' as const, description: 'Your booking has been confirmed. Awaiting payment.' },
  CONFIRMED: { label: 'Confirmed', color: '#10B981', icon: 'checkmark-circle-outline' as const, description: 'Your booking is confirmed and payment is complete.' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', icon: 'close-circle-outline' as const, description: 'This booking has been cancelled.' },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: '#F59E0B', icon: 'time-outline' as const },
  PARTIAL: { label: 'Partial Payment', color: '#3B82F6', icon: 'card-outline' as const },
  PAID: { label: 'Fully Paid', color: '#10B981', icon: 'checkmark-circle-outline' as const },
  REFUNDED: { label: 'Refunded', color: '#6B7280', icon: 'arrow-undo-outline' as const },
};

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { accessToken } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string' && accessToken) {
      loadBookingDetails(id);
    }
  }, [id, accessToken]);

  const loadBookingDetails = async (bookingId: string) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const response = await BookingsService.getBookingDetail(bookingId, accessToken);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load booking details');
      }

      setBooking(response.data as Booking);
    } catch (err: any) {
      console.error('Error loading booking details:', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCallSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('tel:+256700773535');
  };

  const handleWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('https://wa.me/256700773535');
  };

  const formatPrice = (minorUnits: number, currency: string) => {
    const major = minorUnits / 100;
    if (currency === 'UGX') {
      return `UGX ${major.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
    }
    return `$${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading booking details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Error</Text>
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            {error || 'Booking not found'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => id && typeof id === 'string' && loadBookingDetails(id)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = STATUS_CONFIG[booking.status];
  const paymentStatusInfo = PAYMENT_STATUS_CONFIG[booking.payment_status];
  const balanceDue = booking.balance_due;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Reference Number Banner */}
        <View style={[styles.referenceBanner, { backgroundColor: colors.primary }]}>
          <Text style={styles.referenceLabel}>Reference Number</Text>
          <Text style={styles.referenceNumber}>{booking.reference_number}</Text>
        </View>

        {/* Status Card */}
        <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Status</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15`, borderColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
          <Text style={[styles.statusDescription, { color: colors.mutedForeground }]}>
            {statusInfo.description}
          </Text>
        </View>

        {/* Trip & Package Details */}
        <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="airplane" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Trip Details</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Trip Name</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{booking.trip_name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Trip Code</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{booking.trip_code}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Departure Date</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(booking.trip_date)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Package</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{booking.package_name}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Payment Information</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${paymentStatusInfo.color}15`, borderColor: paymentStatusInfo.color }]}>
            <Ionicons name={paymentStatusInfo.icon} size={20} color={paymentStatusInfo.color} />
            <Text style={[styles.statusText, { color: paymentStatusInfo.color }]}>{paymentStatusInfo.label}</Text>
          </View>

          <View style={[styles.paymentSummary, { backgroundColor: colors.muted }]}>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.mutedForeground }]}>Package Price</Text>
              <Text style={[styles.paymentAmount, { color: colors.text }]}>
                {formatPrice(booking.package_price, booking.currency_code)}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.mutedForeground }]}>Amount Paid</Text>
              <Text style={[styles.paymentAmount, { color: colors.primary }]}>
                {formatPrice(booking.amount_paid_minor_units, booking.currency_code)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabelBold, { color: colors.text }]}>Balance Due</Text>
              <Text style={[styles.paymentAmountBold, { color: balanceDue > 0 ? '#F59E0B' : colors.primary }]}>
                {formatPrice(balanceDue, booking.currency_code)}
              </Text>
            </View>
          </View>

          {balanceDue > 0 && (
            <View style={[styles.infoBox, { backgroundColor: colors.muted, borderColor: '#F59E0B' }]}>
              <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Please contact our team to arrange payment for the remaining balance.
              </Text>
            </View>
          )}
        </View>

        {/* Special Needs */}
        {booking.special_needs && (
          <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
            <View style={styles.cardHeader}>
              <Ionicons name="medical" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Special Needs</Text>
            </View>
            <Text style={[styles.specialNeedsText, { color: colors.text }]}>
              {booking.special_needs}
            </Text>
          </View>
        )}

        {/* Travel Documents */}
        {(booking.ticket_number || booking.room_assignment) && (
          <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Travel Documents</Text>
            </View>

            {booking.ticket_number && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Ticket Number</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{booking.ticket_number}</Text>
              </View>
            )}

            {booking.room_assignment && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Room Assignment</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{booking.room_assignment}</Text>
              </View>
            )}
          </View>
        )}

        {/* Booking Timeline */}
        <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Booking Timeline</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Booked On</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(booking.created_at)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Last Updated</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(booking.updated_at)}
            </Text>
          </View>
        </View>

        {/* Contact Support */}
        <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Need Help?</Text>
          </View>

          <Text style={[styles.supportText, { color: colors.mutedForeground }]}>
            Have questions about your booking? Our team is here to help!
          </Text>

          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
              onPress={handleCallSupport}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Call Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: '#25D366' }]}
              onPress={handleWhatsApp}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  referenceBanner: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  referenceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: Typography.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  referenceNumber: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  statusDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  detailRow: {
    gap: Spacing.xs,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  paymentSummary: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: Typography.fontSize.sm,
  },
  paymentAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  paymentLabelBold: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  paymentAmountBold: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  infoBox: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    flex: 1,
  },
  specialNeedsText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  supportText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

