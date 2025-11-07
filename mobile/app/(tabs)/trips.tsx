import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const trips = [
  {
    id: 1,
    title: 'Ramadhan Umrah',
    subtitle: 'Last 15 Days',
    month: 'MAR',
    day: '15-30',
    year: '2026',
    price: '6,750,000',
    originalPrice: '12,250,000',
    discount: '45% OFF',
    spotsLeft: 8,
    duration: '15 nights',
    featured: true,
    available: true,
    gradient: ['#970246', '#A8024E'] as const,
  },
  {
    id: 2,
    title: 'Rajab Umrah',
    subtitle: 'Mid Rajab 1446',
    month: 'JAN',
    day: '20-30',
    year: '2026',
    price: '8,500,000',
    spotsLeft: 15,
    duration: '10 nights',
    featured: false,
    available: true,
    gradient: ['#7C3AED', '#A78BFA'] as const,
  },
  {
    id: 3,
    title: 'Shawwal Umrah',
    subtitle: 'First Week',
    month: 'MAY',
    day: '1-10',
    year: '2026',
    price: '7,200,000',
    spotsLeft: 12,
    duration: '10 nights',
    featured: false,
    available: true,
    gradient: ['#F59E0B', '#FBB040'] as const,
  },
];

export default function TripsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleTripPress = (tripId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/trip/${tripId}`);
  };

  const handleCallPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('tel:+256700773535');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Umrah Trips</Text>
        <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Ionicons name="filter" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Year Selector */}
        <View style={styles.yearSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearScroll}
          >
            {['2026', '2027'].map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  year === '2026' && { backgroundColor: colors.primary },
                  year !== '2026' && { backgroundColor: colors.muted },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.yearText,
                    year === '2026' && { color: colors.primaryForeground },
                    year !== '2026' && { color: colors.text },
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: `${colors.gold}15` }]}>
          <Ionicons name="information-circle" size={20} color={colors.gold} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Limited spots available • Early booking recommended
          </Text>
        </View>

        {/* Trip Cards */}
        <View style={styles.tripsSection}>
          {trips.map((trip) => (
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
                    MOST POPULAR
                  </Text>
                </View>
              )}

              <View style={styles.tripCardContent}>
                <View style={styles.tripLeft}>
                  <LinearGradient
                    colors={trip.gradient}
                    style={styles.dateBox}
                  >
                    <Text style={styles.dateMonth}>{trip.month}</Text>
                    <Text style={styles.dateDay}>{trip.day}</Text>
                    <Text style={styles.dateYear}>{trip.year}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.tripRight}>
                  <Text style={[styles.tripTitle, { color: colors.text }]}>
                    {trip.title}
                  </Text>
                  <Text style={[styles.tripSubtitle, { color: colors.mutedForeground }]}>
                    {trip.subtitle}
                  </Text>

                  <View style={styles.tripMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                        {trip.duration}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={16} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                        {trip.spotsLeft} spots left
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripFooter}>
                    <View>
                      <Text style={[styles.price, { color: colors.text }]}>
                        UGX {trip.price}
                      </Text>
                      {trip.discount && (
                        <View style={styles.discountRow}>
                          {trip.originalPrice && (
                            <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                              {trip.originalPrice}
                            </Text>
                          )}
                          <Text style={[styles.discount, { color: colors.gold }]}>
                            {trip.discount}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.bookButton, { backgroundColor: colors.primary }]}>
                      <Ionicons name="arrow-forward" size={20} color={colors.primaryForeground} />
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
});

