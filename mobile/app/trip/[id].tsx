import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { TripsService, TripDetail } from '@/lib/api/services';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // State
  const [tripDetails, setTripDetails] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch trip details
  useEffect(() => {
    if (id && typeof id === 'string') {
      loadTripDetails(id);
    }
  }, [id]);
  
  const loadTripDetails = async (tripId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TripsService.getPublicTripDetail(tripId);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load trip details');
      }
      
      setTripDetails(response.data);
    } catch (err: any) {
      console.error('Error loading trip details:', err);
      setError(err.message || 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startFormatted = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const endFormatted = end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startFormatted} – ${endFormatted}`;
  };
  
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const nights = days - 1;
    return `${days} days / ${nights} nights`;
  };
  
  const getDefaultTripImage = () => require('@/assets/alhilal-assets/Kaaba-hero1.jpg');
  
  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Trip Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading trip details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Error state
  if (error || !tripDetails) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Trip Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error || 'Trip not found'}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (id && typeof id === 'string') {
                loadTripDetails(id);
              }
            }}
          >
            <Text style={[styles.retryButtonText, { color: colors.primaryForeground }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Helper to format price
  const formatPrice = (minorUnits: number, currency: string) => {
    const major = minorUnits / 100;
    if (currency === 'UGX') {
      return `${currency} ${major.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
    }
    return `${currency} ${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Helper to calculate nights between dates
  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };
  
  // Get all unique hotels from all packages
  const allHotels = tripDetails.packages.flatMap(pkg => pkg.hotels);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trip Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {tripDetails.cover_image ? (
          <Image source={{ uri: tripDetails.cover_image }} style={styles.heroImage} />
        ) : (
          <Image source={getDefaultTripImage()} style={styles.heroImage} />
        )}

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.title, { color: colors.text }]}>{tripDetails.name}</Text>
              <View style={[styles.badge, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons name="calendar" size={16} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {formatDateRange(tripDetails.start_date, tripDetails.end_date)}
                </Text>
              </View>
            </View>

            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {tripDetails.cities.join(' • ')}
            </Text>

            <View style={styles.metaGrid}>
              <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Duration</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>
                  {calculateDuration(tripDetails.start_date, tripDetails.end_date)}
                </Text>
              </View>
              <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Cities</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{tripDetails.cities.length} cities</Text>
              </View>
              <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Packages</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{tripDetails.packages.length} options</Text>
              </View>
              <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                <Ionicons name="bed-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Hotels</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{allHotels.length} properties</Text>
              </View>
            </View>
          </View>
          
          {/* Packages Section */}
          {tripDetails.packages.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Packages</Text>
              <View style={styles.packagesList}>
                {tripDetails.packages.map((pkg, index) => (
                  <View key={pkg.id} style={[styles.packageItem, { borderColor: colors.border }]}>
                    <View style={styles.packageHeader}>
                      <Text style={[styles.packageName, { color: colors.text }]}>{pkg.name}</Text>
                      <Text style={[styles.packagePrice, { color: colors.primary }]}>
                        {formatPrice(pkg.price_minor_units, pkg.currency)}
                      </Text>
                    </View>
                    {pkg.hotels.length > 0 && (
                      <View style={styles.packageDetails}>
                        <Ionicons name="bed-outline" size={16} color={colors.mutedForeground} />
                        <Text style={[styles.packageDetailText, { color: colors.mutedForeground }]}>
                          {pkg.hotels.length} {pkg.hotels.length === 1 ? 'hotel' : 'hotels'}
                        </Text>
                      </View>
                    )}
                    {pkg.flights.length > 0 && (
                      <View style={styles.packageDetails}>
                        <Ionicons name="airplane-outline" size={16} color={colors.mutedForeground} />
                        <Text style={[styles.packageDetailText, { color: colors.mutedForeground }]}>
                          {pkg.flights.length} {pkg.flights.length === 1 ? 'flight' : 'flights'}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Itinerary Section */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Itinerary Overview</Text>
            {tripDetails.has_itinerary ? (
              <View style={styles.timeline}>
                {tripDetails.itinerary.map((item, index) => (
                  <View key={item.id} style={styles.timelineItem}>
                    <View style={[styles.timelineIndicator, { borderColor: colors.primary }]}>
                      <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineDay, { color: colors.primary }]}>Day {item.day_index}</Text>
                      <Text style={[styles.timelineTitle, { color: colors.text }]}>{item.title}</Text>
                      {item.location && (
                        <View style={styles.timelineLocationRow}>
                          <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
                          <Text style={[styles.timelineLocation, { color: colors.mutedForeground }]}>
                            {item.location}
                          </Text>
                        </View>
                      )}
                      {item.notes && (
                        <Text style={[styles.timelineDescription, { color: colors.mutedForeground }]}>
                          {item.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.comingSoonContainer}>
                <Ionicons name="time-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.comingSoonText, { color: colors.mutedForeground }]}>
                  Itinerary Coming Soon
                </Text>
                <Text style={[styles.comingSoonSubtext, { color: colors.mutedForeground }]}>
                  Detailed day-by-day itinerary will be available soon
                </Text>
              </View>
            )}
          </View>

          {/* Accommodations Section */}
          {allHotels.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Accommodations</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
                  Premium stays throughout the journey
                </Text>
              </View>
              <View style={styles.accommodationList}>
                {allHotels.map((hotel, index) => (
                  <View key={hotel.id} style={[styles.accommodationCard, { borderColor: colors.border }]}>
                    <View style={styles.accommodationHeader}>
                      <Text style={[styles.accommodationHotel, { color: colors.text }]}>{hotel.name}</Text>
                      <Text style={[styles.accommodationNights, { color: colors.mutedForeground }]}>
                        {calculateNights(hotel.check_in, hotel.check_out)} nights
                      </Text>
                    </View>
                    {hotel.address && (
                      <View style={styles.accommodationMeta}>
                        <View style={styles.accommodationMetaItem}>
                          <Ionicons name="location-outline" size={16} color={colors.primary} />
                          <Text style={[styles.accommodationMetaText, { color: colors.mutedForeground }]}>
                            {hotel.address}
                          </Text>
                        </View>
                      </View>
                    )}
                    {hotel.room_type && (
                      <View style={styles.accommodationMeta}>
                        <View style={styles.accommodationMetaItem}>
                          <Ionicons name="bed-outline" size={16} color={colors.mutedForeground} />
                          <Text style={[styles.accommodationMetaText, { color: colors.mutedForeground }]}>
                            {hotel.room_type}
                          </Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.accommodationDates}>
                      <Text style={[styles.accommodationDateText, { color: colors.mutedForeground }]}>
                        Check-in: {new Date(hotel.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                      <Text style={[styles.accommodationDateText, { color: colors.mutedForeground }]}>
                        Check-out: {new Date(hotel.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Guide Sections / Services */}
          {tripDetails.guide_sections.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Travel Guide & Services</Text>
              <View style={styles.guideList}>
                {tripDetails.guide_sections.map((section) => (
                  <View key={section.id} style={styles.guideItem}>
                    <View style={styles.guideHeader}>
                      <Ionicons name="information-circle" size={20} color={colors.primary} />
                      <Text style={[styles.guideTitle, { color: colors.text }]}>{section.title}</Text>
                    </View>
                    <Text style={[styles.guideContent, { color: colors.mutedForeground }]}>
                      {section.content_md}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Emergency Contacts */}
          {tripDetails.emergency_contacts.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contacts</Text>
              <View style={styles.contactsList}>
                {tripDetails.emergency_contacts.map((contact) => (
                  <View key={contact.id} style={[styles.contactCard, { borderColor: colors.border }]}>
                    <View style={styles.contactHeader}>
                      <Ionicons name="call" size={20} color={colors.primary} />
                      <Text style={[styles.contactLabel, { color: colors.text }]}>{contact.label}</Text>
                    </View>
                    <Text style={[styles.contactPhone, { color: colors.primary }]}>{contact.phone}</Text>
                    {contact.hours && (
                      <Text style={[styles.contactHours, { color: colors.mutedForeground }]}>
                        Available: {contact.hours}
                      </Text>
                    )}
                    {contact.notes && (
                      <Text style={[styles.contactNotes, { color: colors.mutedForeground }]}>
                        {contact.notes}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* FAQs Section */}
          {tripDetails.faqs.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
              <View style={styles.faqList}>
                {tripDetails.faqs.map((faq) => (
                  <View key={faq.id} style={styles.faqItem}>
                    <View style={styles.faqHeader}>
                      <Ionicons name="help-circle" size={20} color={colors.primary} />
                      <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                    </View>
                    <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{faq.answer}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // TODO: Navigate to booking screen
            console.log('Book trip:', id);
          }}
        >
          <Text style={[styles.bookButtonText, { color: colors.primaryForeground }]}>
            Book Now
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>
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
    paddingBottom: Spacing.xxxl,
  },
  heroImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: Spacing.lg,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  price: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  discountBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  discountText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  description: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    marginTop: Spacing.md,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  metaItem: {
    flexBasis: '47%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  metaLabel: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  sectionCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  timeline: {
    gap: Spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
    borderLeftWidth: 2,
    paddingVertical: Spacing.xs,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  timelineDay: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: Typography.fontWeight.semibold,
  },
  timelineTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  timelineDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  accommodationList: {
    gap: Spacing.md,
  },
  accommodationCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  accommodationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accommodationCity: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  accommodationNights: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
  },
  accommodationHotel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  accommodationMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  accommodationMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  accommodationMetaText: {
    fontSize: Typography.fontSize.xs,
  },
  listGrid: {
    gap: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  listItemText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  documentList: {
    gap: Spacing.sm,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  documentStatus: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  faqList: {
    gap: Spacing.lg,
  },
  faqItem: {
    gap: Spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  faqQuestion: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  faqAnswer: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  bookButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  packagesList: {
    gap: Spacing.md,
  },
  packageItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  packageName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  packagePrice: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  packageDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  packageDetailText: {
    fontSize: Typography.fontSize.sm,
  },
  comingSoonContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  comingSoonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  comingSoonSubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  timelineLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  timelineLocation: {
    fontSize: Typography.fontSize.xs,
  },
  accommodationDates: {
    marginTop: Spacing.sm,
    gap: 2,
  },
  accommodationDateText: {
    fontSize: Typography.fontSize.xs,
  },
  guideList: {
    gap: Spacing.lg,
  },
  guideItem: {
    gap: Spacing.sm,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  guideTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  guideContent: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  contactsList: {
    gap: Spacing.md,
  },
  contactCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  contactPhone: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  contactHours: {
    fontSize: Typography.fontSize.sm,
  },
  contactNotes: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
});

