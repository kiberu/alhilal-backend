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
    title: 'November Umrah',
    subtitle: '10-Day Spiritual Journey',
    price: '1,800',
    currency: 'USD',
    discount: 'Limited Slots',
    image: require('@/assets/alhilal-assets/Kaaba-hero1.jpg'),
    duration: '10 days / 9 nights',
    spotsLeft: 12,
    description:
      'Join Al-Hilal for a guided Umrah experience tailored for comfort, spirituality, and ease. Our experienced team handles every detail from visa processing to accommodation so you can focus on worship.',
    dateRange: '27 Nov – 6 Dec 2025',
    groupSize: 'Up to 35 pilgrims',
    spiritualGuide: 'Sheikh Abdul Karim',
    itinerary: [
      {
        day: 'Day 1',
        title: 'Arrival in Jeddah & Transfer to Makkah',
        description:
          'Meet our team on arrival, transfer to Swissôtel Makkah, rest and prepare for first Umrah guided by our team.',
      },
      {
        day: 'Day 2-4',
        title: 'Makkah Worship & Guided Sessions',
        description:
          'Daily prayers in the Haram, guided lectures on the rites of Umrah, and optional historical tours in Makkah.',
      },
      {
        day: 'Day 5',
        title: 'Journey to Madinah',
        description:
          'Private coach transfer to Madinah, check-in at Anwar Al Madinah Mövenpick, evening visit to Masjid An-Nabawi.',
      },
      {
        day: 'Day 6-8',
        title: 'Madinah Historical Tour & Worship',
        description:
          'Visits to Quba, Qiblatain, Uhud, and guided sessions on the Seerah. Plenty of free time for individual worship.',
      },
      {
        day: 'Day 9-10',
        title: 'Farewell & Departure',
        description:
          'Final ziyaraat, shopping, and transfer to the airport with assistance at check-in for departure flights.',
      },
    ],
    accommodations: [
      {
        city: 'Makkah',
        hotel: 'Swissôtel Makkah',
        nights: 4,
        rating: '4.7/5 guests',
        distance: 'Adjacent to Haram',
      },
      {
        city: 'Madinah',
        hotel: 'Anwar Al Madinah Mövenpick',
        nights: 5,
        rating: '4.6/5 guests',
        distance: '2 minutes to Masjid An-Nabawi',
      },
    ],
    inclusions: [
      'Return flights from Entebbe (economy class)',
      '4★ & 5★ accommodation with daily buffet breakfast',
      'Fully guided Umrah rituals with Al-Hilal scholars',
      'Saudi visa processing & travel insurance',
      'Ground transportation between cities',
      'Complimentary Zamzam water allowance',
    ],
    extras: [
      'Optional Dubai stopover packages',
      'Private family room upgrades',
      'Wheelchair assistance on request',
    ],
    documents: [
      { label: 'Passport', status: 'Submitted', icon: 'checkmark-circle', color: '#10B981' },
      { label: 'Vaccination Certificate', status: 'Pending upload', icon: 'alert-circle', color: '#F59E0B' },
      { label: 'Payment Plan', status: 'Approved', icon: 'document-text', color: '#3B82F6' },
    ],
    faqs: [
      {
        question: 'What is the payment schedule?',
        answer: 'Secure your seat with a $500 deposit. Remaining balance is split into two instalments due 60 and 30 days before departure.',
      },
      {
        question: 'Can families travel together?',
        answer: 'Yes. We arrange adjacent rooms for families and provide special assistance for elderly pilgrims travelling with relatives.',
      },
    ],
  } as const;

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
            <View style={styles.sectionHeader}>
              <Text style={[styles.title, { color: colors.text }]}>{tripDetails.title}</Text>
              <View style={[styles.badge, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons name="calendar" size={16} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>{tripDetails.dateRange}</Text>
              </View>
            </View>

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

            <View style={styles.metaGrid}>
              <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Duration</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{tripDetails.duration}</Text>
              </View>
              <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                <Ionicons name="people-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Group Size</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{tripDetails.groupSize}</Text>
              </View>
              <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Guide</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{tripDetails.spiritualGuide}</Text>
              </View>
              <View style={[styles.metaItem, { backgroundColor: colors.muted }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Availability</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{tripDetails.spotsLeft} seats left</Text>
              </View>
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Itinerary Overview</Text>
            <View style={styles.timeline}>
              {tripDetails.itinerary.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={[styles.timelineIndicator, { borderColor: colors.primary }]}>
                    <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineDay, { color: colors.primary }]}>{item.day}</Text>
                    <Text style={[styles.timelineTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.timelineDescription, { color: colors.mutedForeground }]}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Accommodations</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>Premium stays throughout the journey</Text>
            </View>
            <View style={styles.accommodationList}>
              {tripDetails.accommodations.map((stay, index) => (
                <View key={index} style={[styles.accommodationCard, { borderColor: colors.border }]}> 
                  <View style={styles.accommodationHeader}>
                    <Text style={[styles.accommodationCity, { color: colors.primary }]}>{stay.city}</Text>
                    <Text style={[styles.accommodationNights, { color: colors.mutedForeground }]}>{stay.nights} nights</Text>
                  </View>
                  <Text style={[styles.accommodationHotel, { color: colors.text }]}>{stay.hotel}</Text>
                  <View style={styles.accommodationMeta}>
                    <View style={styles.accommodationMetaItem}>
                      <Ionicons name="star" size={16} color={colors.gold} />
                      <Text style={[styles.accommodationMetaText, { color: colors.mutedForeground }]}>
                        {stay.rating}
                      </Text>
                    </View>
                    <View style={styles.accommodationMetaItem}>
                      <Ionicons name="pin" size={16} color={colors.primary} />
                      <Text style={[styles.accommodationMetaText, { color: colors.mutedForeground }]}>
                        {stay.distance}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Package Inclusions</Text>
            <View style={styles.listGrid}>
              {tripDetails.inclusions.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  <Text style={[styles.listItemText, { color: colors.mutedForeground }]}>{item}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>Optional Add-ons</Text>
            <View style={styles.listGrid}>
              {tripDetails.extras.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="add-circle" size={20} color={colors.primary} />
                  <Text style={[styles.listItemText, { color: colors.mutedForeground }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Travel Documents</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>Track the status of your submissions</Text>
            </View>
            <View style={styles.documentList}>
              {tripDetails.documents.map((doc, index) => (
                <View key={index} style={[styles.documentRow, { borderColor: colors.border }]}> 
                  <View style={[styles.documentIcon, { backgroundColor: `${doc.color}15` }]}> 
                    <Ionicons name={doc.icon as any} size={20} color={doc.color} />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={[styles.documentTitle, { color: colors.text }]}>{doc.label}</Text>
                    <Text style={[styles.documentStatus, { color: colors.mutedForeground }]}>{doc.status}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
            <View style={styles.faqList}>
              {tripDetails.faqs.map((faq, index) => (
                <View key={index} style={styles.faqItem}>
                  <View style={styles.faqHeader}>
                    <Ionicons name="help-circle" size={20} color={colors.primary} />
                    <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                  </View>
                  <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{faq.answer}</Text>
                </View>
              ))}
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
});

