import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Linking,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { TripsService, Trip } from '@/lib/api/services';

export default function TripsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  // State
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  
  // Fetch trips on mount
  useEffect(() => {
    loadTrips();
  }, []);
  
  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TripsService.getPublicTrips();
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load trips');
      }
      
      const trips = response.data.results;
      setAllTrips(trips);
      setFeaturedTrips(trips.filter(trip => trip.featured));
    } catch (err: any) {
      console.error('Error loading trips:', err);
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };
  
  // Get unique years from trips
  const getAvailableYears = () => {
    const years = new Set<string>();
    allTrips.forEach(trip => {
      const year = new Date(trip.start_date).getFullYear().toString();
      years.add(year);
    });
    return Array.from(years).sort();
  };
  
  // Filter trips by year
  const getFilteredTrips = () => {
    if (selectedYear === 'all') return allTrips;
    return allTrips.filter(trip => {
      const year = new Date(trip.start_date).getFullYear().toString();
      return year === selectedYear;
    });
  };
  
  // Format date for display
  const formatTripDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const month = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();
    
    return {
      month,
      day: `${startDay}-${endDay}`,
      year: year.toString(),
    };
  };
  
  // Calculate duration
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) - 1;
    return `${nights} nights`;
  };
  
  // Get default image
  const getDefaultTripImage = () => require('@/assets/alhilal-assets/Kaaba-hero1.jpg');
  
  // Format price
  const formatPrice = (packages: any[], currency?: string) => {
    if (packages.length === 0) return 'Contact for pricing';
    const lowestPrice = Math.min(...packages.map(p => p.price_minor_units));
    const major = lowestPrice / 100;
    const curr = currency || packages[0].currency;
    
    if (curr === 'UGX') {
      return `UGX ${major.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
    }
    return `${curr} ${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Get gradient colors based on featured status
  const getGradient = (featured: boolean, index: number): [string, string] => {
    if (featured) return ['#970246', '#A8024E'];
    const gradients: [string, string][] = [
      ['#7C3AED', '#A78BFA'],
      ['#F59E0B', '#FBB040'],
      ['#10B981', '#34D399'],
      ['#3B82F6', '#60A5FA'],
    ];
    return gradients[index % gradients.length];
  };

  const handleTripPress = (tripId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/trip/${tripId}`);
  };

  const handleCallPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('tel:+256700773535');
  };

  const availableYears = getAvailableYears();
  const filteredTrips = getFilteredTrips();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Umrah Trips</Text>
        <TouchableOpacity onPress={loadTrips}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading trips...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadTrips}
          >
            <Text style={[styles.retryButtonText, { color: colors.primaryForeground }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Year Selector */}
          {availableYears.length > 0 && (
        <View style={styles.yearSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearScroll}
          >
                <TouchableOpacity
                  key="all"
                  style={[
                    styles.yearButton,
                    selectedYear === 'all' && { backgroundColor: colors.primary },
                    selectedYear !== 'all' && { backgroundColor: colors.muted },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedYear('all');
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.yearText,
                      selectedYear === 'all' && { color: colors.primaryForeground },
                      selectedYear !== 'all' && { color: colors.text },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {availableYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                      year === selectedYear && { backgroundColor: colors.primary },
                      year !== selectedYear && { backgroundColor: colors.muted },
                ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedYear(year);
                    }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.yearText,
                        year === selectedYear && { color: colors.primaryForeground },
                        year !== selectedYear && { color: colors.text },
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
          )}

        {/* Info Banner */}
          {featuredTrips.length > 0 && (
        <View style={[styles.infoBanner, { backgroundColor: `${colors.gold}15` }]}>
              <Ionicons name="star" size={20} color={colors.gold} />
          <Text style={[styles.infoText, { color: colors.text }]}>
                {featuredTrips.length} featured {featuredTrips.length === 1 ? 'trip' : 'trips'} available
          </Text>
        </View>
          )}

        {/* Trip Cards */}
          {filteredTrips.length > 0 ? (
        <View style={styles.tripsSection}>
              {filteredTrips.map((trip, index) => {
                const dateInfo = formatTripDate(trip.start_date, trip.end_date);
                const duration = calculateDuration(trip.start_date, trip.end_date);
                const gradient = getGradient(trip.featured, index);
                
                return (
            <TouchableOpacity
              key={trip.id}
              style={[
                styles.tripCard,
                { backgroundColor: colors.card },
                Shadow.large,
                trip.featured && styles.featuredCard,
              ]}
              onPress={() => handleTripPress(trip.id)}
              activeOpacity={0.95}
            >
              {trip.featured && (
                <View style={[styles.featuredBadge, { backgroundColor: colors.gold }]}>
                  <Ionicons name="star" size={12} color={colors.goldForeground} />
                  <Text style={[styles.featuredText, { color: colors.goldForeground }]}>
                          FEATURED
                  </Text>
                </View>
              )}

              <View style={styles.tripCardContent}>
                <View style={styles.tripLeft}>
                  <LinearGradient
                          colors={gradient}
                    style={styles.dateBox}
                  >
                          <Text style={styles.dateMonth}>{dateInfo.month}</Text>
                          <Text style={styles.dateDay}>{dateInfo.day}</Text>
                          <Text style={styles.dateYear}>{dateInfo.year}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.tripRight}>
                  <Text style={[styles.tripTitle, { color: colors.text }]}>
                          {trip.name}
                  </Text>
                  <Text style={[styles.tripSubtitle, { color: colors.mutedForeground }]}>
                          {trip.cities.join(', ')}
                  </Text>

                  <View style={styles.tripMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                              {duration}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                            <Ionicons name="briefcase-outline" size={16} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                              {trip.packages_count} {trip.packages_count === 1 ? 'package' : 'packages'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripFooter}>
                    <View>
                      <Text style={[styles.price, { color: colors.text }]}>
                              From {trip.packages_count > 0 ? 'varies' : 'TBD'}
                            </Text>
                    </View>
                    <View style={[styles.bookButton, { backgroundColor: colors.primary }]}>
                      <Ionicons name="arrow-forward" size={20} color={colors.primaryForeground} />
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No trips available for {selectedYear === 'all' ? 'this period' : selectedYear}
              </Text>
        </View>
          )}

        {/* Quick Contact */}
        <View style={[styles.contactCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <LinearGradient
            colors={[colors.primary, '#A8024E']}
            style={styles.contactGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={40} color="#FFFFFF" />
            <Text style={styles.contactTitle}>Need Help Choosing?</Text>
            <Text style={styles.contactSubtitle}>
              Our team is ready to help you plan the perfect journey
            </Text>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButtonPrimary}
                onPress={() => Linking.openURL('https://wa.me/256700773535')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={20} color={colors.primary} />
                <Text style={[styles.contactButtonText, { color: colors.primary }]}>
                  WhatsApp
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButtonSecondary}
                onPress={handleCallPress}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={styles.contactButtonTextWhite}>Call Us</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  yearSection: {
    marginBottom: Spacing.lg,
  },
  yearScroll: {
    gap: Spacing.sm,
  },
  yearButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  yearText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  tripsSection: {
    gap: Spacing.lg,
  },
  tripCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    position: 'relative',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#F9A028',
  },
  featuredBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    zIndex: 10,
  },
  featuredText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  tripCardContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  tripLeft: {
    alignItems: 'center',
  },
  dateBox: {
    width: 80,
    height: 100,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  dateMonth: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  dateDay: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.black,
    marginVertical: 4,
  },
  dateYear: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  tripRight: {
    flex: 1,
  },
  tripTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  tripSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  originalPrice: {
    fontSize: Typography.fontSize.xs,
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  bookButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginTop: Spacing.xl,
  },
  contactGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  contactTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  contactSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  contactButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  contactButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contactButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  contactButtonTextWhite: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
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
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
});

