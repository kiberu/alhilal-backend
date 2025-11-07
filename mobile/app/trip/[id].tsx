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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // TODO: Fetch trip details from API based on id
  const tripDetails = {
    id: id,
    title: 'Ramadhan Umrah',
    subtitle: 'Last 15 Days',
    price: '6,750,000',
    currency: 'UGX',
    discount: '45% OFF',
    image: require('@/assets/alhilal-assets/Kaaba-hero1.jpg'),
    duration: '15 nights',
    spotsLeft: 8,
    description: 'Experience the spiritual journey of Umrah during the blessed month of Ramadhan.',
  };

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
        <Image source={tripDetails.image} style={styles.heroImage} />

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
            <Text style={[styles.title, { color: colors.text }]}>{tripDetails.title}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{tripDetails.subtitle}</Text>

            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: colors.primary }]}>
                {tripDetails.currency} {tripDetails.price}
              </Text>
              {tripDetails.discount && (
                <View style={[styles.discountBadge, { backgroundColor: colors.gold }]}>
                  <Text style={[styles.discountText, { color: colors.goldForeground }]}>
                    {tripDetails.discount}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {tripDetails.description}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>{tripDetails.duration}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {tripDetails.spotsLeft} spots left
                </Text>
              </View>
            </View>
          </View>
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
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
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
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
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
});

