import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Linking,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { AlHilalIcon } from '@/components/AlHilalIcon';
import * as Haptics from 'expo-haptics';
import { AlHilalLogo } from '@/components/AlHilalLogo';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 80; // Show partial next card

const packages = [
  {
    id: 1,
    title: 'Ramadhan Umrah',
    subtitle: 'Last 15 Days',
    price: '6,750,000',
    currency: 'UGX',
    discount: '45% OFF',
    image: require('@/assets/alhilal-assets/Kaaba-hero1.jpg'),
    featured: true,
  },
  {
    id: 2,
    title: 'December Umrah + Dubai',
    subtitle: 'Umrah + 4 days in Dubai',
    price: '2,650',
    currency: 'USD',
    // discount: '45% OFF',
    image: require('@/assets/alhilal-assets/about-image.jpg'),
    featured: true,
  },
];

const nextTrip = {
  id: 1,
  title: 'November Umrah',
  price: '1,800',
  currency: 'USD',
  dateFrom: 'Nov 27, 2025',
  dateTo: 'Dec 6, 2025',
  cities: ['Makkah', 'Madinah'],
  spotsLeft: 8,
  image: require('@/assets/alhilal-assets/Kaaba-hero1.jpg'),
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleCallPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('tel:+256700773535');
  };

  const handleTripPress = (tripId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/trip/${tripId}` as any);
  };

  const handleViewAllTrips = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/trips');
  };

  const handleLoginPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/login');
  };

  const handleNotificationsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to notifications screen when available
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleLoginPress();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.header,
            {
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <AlHilalLogo width={180} height={32} />
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleNotificationsPress}
              activeOpacity={0.8}
              style={[styles.headerButton, { backgroundColor: colors.muted }]}
            >
              <FontAwesome name="bell-o" size={18} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleProfilePress}
              activeOpacity={0.8}
              style={[styles.headerButton, { backgroundColor: colors.muted }]}
            >
              <FontAwesome name="user-o" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.welcomeSection,
            Shadow.medium,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.welcomeHeader}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome back, Guest!</Text>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>For a Hussle-Free Pilgrimage </Text>
          </View>
        </View>
        
        {/* Next Trip Card */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.nextTripCard, Shadow.large]}
            onPress={() => handleTripPress(nextTrip.id)}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={[colors.primary, '#A8024E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextTripGradient}
            >
              <View style={styles.nextTripContent}>
                <Text style={styles.upcomingTripLabel}>UPCOMING TRIP</Text>
                <Text style={styles.nextTripTitle}>{nextTrip.title}</Text>
                
                <View style={styles.nextTripRow}>
                  <View style={styles.nextTripInfo}>
                    <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.nextTripText}>
                      {nextTrip.dateFrom} - {nextTrip.dateTo}
                    </Text>
                  </View>
                </View>

                <View style={styles.nextTripRow}>
                  <View style={styles.nextTripInfo}>
                    <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.nextTripText}>
                      {nextTrip.cities.join(' • ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.nextTripFooter}>
                  <View>
                    <Text style={styles.nextTripPrice}>
                      {nextTrip.currency} {nextTrip.price}
                    </Text>
                    <Text style={styles.nextTripSeats}>
                      {nextTrip.spotsLeft} seats left
                    </Text>
                  </View>
                  <View style={[styles.nextTripButton, { backgroundColor: colors.gold }]}>
                    <Ionicons name="arrow-forward" size={24} color={colors.goldForeground} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Featured Packages */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Featured Trips
            </Text>
            <TouchableOpacity onPress={handleViewAllTrips}>
              <Text style={[styles.sectionLink, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.packagesScroll}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
          >
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[styles.packageCard, Shadow.large]}
                onPress={() => handleTripPress(pkg.id)}
                activeOpacity={0.95}
              >
                <Image
                  source={pkg.image}
                  style={styles.packageImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.packageGradient}
                >
                  {pkg.featured && (
                    <View style={[styles.featuredBadge, { backgroundColor: colors.gold }]}>
                      <Ionicons name="star" size={12} color={colors.goldForeground} />
                      <Text style={[styles.featuredText, { color: colors.goldForeground }]}>
                        FEATURED
                      </Text>
                    </View>
                  )}
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageSubtitle}>{pkg.subtitle}</Text>
                    <Text style={styles.packageTitle}>{pkg.title}</Text>
                    <View style={styles.packageFooter}>
                      <View>
                        <Text style={styles.packagePrice}>
                          {pkg.price} {pkg.currency}
                        </Text>
                        {pkg.discount && (
                          <Text style={[styles.packageDiscount, { color: colors.gold }]}>
                            {pkg.discount}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.packageButton, { backgroundColor: colors.gold }]}>
                        <Ionicons name="arrow-forward" size={20} color={colors.goldForeground} />
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* About Al-Hilal */}
        <View style={[styles.aboutCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>About Al-Hilal</Text>
          <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
            Al-Hilal is a trusted and licensed Hajj and Umrah operator dedicated to providing
            hassle-free, spiritually fulfilling, and professionally organized pilgrimage experiences.
          </Text>
          
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleCallPress}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.mutedForeground }]}>
                  Call Us
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  +256 700 773535
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Linking.openURL('https://maps.google.com/?q=Kyato+Complex+Bombo+Road+Kampala');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconCircle, { backgroundColor: `${colors.gold}15` }]}>
                <Ionicons name="location" size={20} color={colors.gold} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.mutedForeground }]}>
                  Visit Us
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  Kyato Complex B5-18, Bombo Road
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login CTA */}
        <TouchableOpacity
          style={[styles.loginCard, { backgroundColor: colors.card }, Shadow.large]}
          onPress={handleLoginPress}
          activeOpacity={0.95}
        >
          <LinearGradient
            colors={[colors.primary, '#A8024E']}
            style={styles.loginGradient}
          >
            <View style={styles.loginIconContainer}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
            <View style={styles.loginContent}>
              <Text style={styles.loginTitle}>Sign In to Your Account</Text>
              <Text style={styles.loginSubtitle}>
                Access your bookings, trips, and exclusive content
              </Text>
            </View>
            <View style={styles.loginButton}>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  welcomeHeader: {
    gap: Spacing.xs,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  welcomeTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.black,
    lineHeight: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    marginBottom: Spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  nextTripCard: {
    // height: 350,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginHorizontal: Spacing.md,
  },
  nextTripGradient: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: Spacing.xl,
  },
  nextTripContent: {
    gap: Spacing.sm,
  },
  upcomingTripLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  nextTripTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.black,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  nextTripRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextTripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nextTripText: {
    fontSize: Typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.medium,
  },
  nextTripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  nextTripPrice: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.black,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  nextTripSeats: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: Typography.fontWeight.medium,
  },
  nextTripButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionLink: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  packagesScroll: {
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
    gap: Spacing.md,
  },
  packageCard: {
    width: CARD_WIDTH,
    height: 400,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  packageImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  packageGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  featuredText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  packageInfo: {
    gap: Spacing.xs,
  },
  packageSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  packageTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.sm,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  packagePrice: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  packageDiscount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 4,
  },
  packageButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsGrid: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  actionCardWide: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  actionLargeTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  actionLargeSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.fontSize.sm,
  },
  loginCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  loginIconContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContent: {
    flex: 1,
  },
  loginTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  loginSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.fontSize.sm,
  },
  loginButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
  aboutTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  aboutText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  contactRow: {
    marginBottom: Spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
