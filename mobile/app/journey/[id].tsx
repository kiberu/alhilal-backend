import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  ChecklistCard,
  GuidanceMiniCard,
  InlineCalloutCard,
  StickyBottomActionBar,
  SupportActionCard,
} from '@/components/guest/cards';
import {
  EmptyStateCard,
  LoadingScreen,
  PrimaryPillButton,
  SecondaryPillButton,
} from '@/components/guest/primitives';
import { guestImages, guestSupport } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import { LeadsService } from '@/lib/api/services/leads';
import type { GuidanceArticleSummary, PublicTripDetail, TripPackage } from '@/lib/api/services';
import { formatPublicDateRange, formatPublicMoney, formatPublicNightsLabel } from '@/lib/public-format';
import { openExternalUrl, openWhatsAppConversation } from '@/lib/support/open-external';
import { syncPublicGuidanceArticles, syncPublicTripDetail } from '@/lib/support/public-cache';

type BookingRequestForm = {
  name: string;
  phone: string;
  email: string;
  travellers: string;
  notes: string;
};

const EMPTY_BOOKING_FORM: BookingRequestForm = {
  name: '',
  phone: '',
  email: '',
  travellers: '',
  notes: '',
};

function resolveImageSource(uri: string | null | undefined, fallback: any) {
  if (uri) {
    return { uri };
  }

  return fallback;
}

function buildWhatsAppMessage(journey: PublicTripDetail, tripPackage?: TripPackage) {
  return [
    'Assalamu alaikum Al Hilal team,',
    `I want help planning ${journey.name}.`,
    tripPackage ? `Package: ${tripPackage.name}` : '',
    'Please guide me on the next booking step.',
  ].filter(Boolean);
}

function buildLeadNotes(journey: PublicTripDetail, form: BookingRequestForm, tripPackage?: TripPackage) {
  return [
    `Journey: ${journey.name}`,
    `Journey dates: ${formatPublicDateRange(journey.start_date, journey.end_date)}`,
    tripPackage ? `Package: ${tripPackage.name}` : '',
    tripPackage ? `Package dates: ${formatPublicDateRange(tripPackage.start_date, tripPackage.end_date)}` : '',
    tripPackage ? `Package price: ${formatPublicMoney(tripPackage.price_minor_units, tripPackage.currency || 'UGX')}` : '',
    form.travellers.trim() ? `Travellers: ${form.travellers.trim()}` : '',
    form.notes.trim() ? `Notes: ${form.notes.trim()}` : '',
  ].filter(Boolean).join('\n');
}

function isValidEmail(value: string) {
  return !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildFactItems(journey: PublicTripDetail) {
  return [
    { label: 'Duration', value: formatPublicNightsLabel(journey.default_nights) },
    { label: 'Primary city', value: journey.cities[0] || 'To be confirmed' },
    { label: 'Packages', value: String(journey.packages.length || 0) },
    { label: 'Journey status', value: journey.status.replaceAll('_', ' ') },
  ];
}

export default function JourneyDetailScreen() {
  const theme = useGuestTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const identifier = typeof id === 'string' ? id : '';

  const [journey, setJourney] = useState<PublicTripDetail | null>(null);
  const [relatedGuidance, setRelatedGuidance] = useState<GuidanceArticleSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TripPackage | undefined>();
  const [bookingForm, setBookingForm] = useState<BookingRequestForm>(EMPTY_BOOKING_FORM);
  const [bookingFeedback, setBookingFeedback] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const factItems = useMemo(() => (journey ? buildFactItems(journey) : []), [journey]);

  const loadJourney = useCallback(async () => {
    if (!identifier) {
      setError('Journey not found.');
      setLoading(false);
      return;
    }

    try {
      const [journeyResult, guidanceResult] = await Promise.all([
        syncPublicTripDetail(identifier),
        syncPublicGuidanceArticles(),
      ]);

      if (!journeyResult.data) {
        throw new Error(journeyResult.error || 'Unable to load this journey right now.');
      }

      setJourney(journeyResult.data);
      setRelatedGuidance(guidanceResult.data.slice(0, 2));
      setError('');
    } catch (loadError: any) {
      setJourney(null);
      setError(loadError?.message || 'Unable to load this journey right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [identifier]);

  useEffect(() => {
    void loadJourney();
  }, [loadJourney]);

  const openBookingRequest = useCallback((tripPackage?: TripPackage) => {
    setSelectedPackage(tripPackage);
    setBookingForm(EMPTY_BOOKING_FORM);
    setBookingFeedback('');
    setBookingModalVisible(true);
  }, []);

  const closeBookingRequest = useCallback(() => {
    if (submittingBooking) {
      return;
    }

    setBookingModalVisible(false);
  }, [submittingBooking]);

  const submitBookingRequest = useCallback(async () => {
    if (!journey) {
      return;
    }

    const name = bookingForm.name.trim();
    const phone = bookingForm.phone.trim();
    const email = bookingForm.email.trim();

    if (!name || !phone) {
      setBookingFeedback('Please enter your name and phone or WhatsApp number.');
      return;
    }

    if (!isValidEmail(email)) {
      setBookingFeedback('Please enter a valid email address, or leave it blank.');
      return;
    }

    setSubmittingBooking(true);
    setBookingFeedback('');

    try {
      const response = await LeadsService.createPublicLead({
        name,
        phone,
        email,
        interestType: 'CONSULTATION',
        travelWindow: formatPublicDateRange(journey.start_date, journey.end_date),
        notes: buildLeadNotes(journey, bookingForm, selectedPackage),
        tripId: journey.id,
        source: 'mobile_journey_detail',
        pagePath: `/journey/${journey.slug || journey.id}`,
        contextLabel: selectedPackage ? 'mobile_journey_package_booking' : 'mobile_journey_booking',
        ctaLabel: selectedPackage ? 'mobile_package_book_trip' : 'mobile_book_trip',
        campaign: 'mobile_booking',
      });

      if (!response.success) {
        throw new Error(response.error || 'Unable to save this booking request right now.');
      }

      setBookingModalVisible(false);
      setBookingForm(EMPTY_BOOKING_FORM);
      Alert.alert('Request sent', 'Thank you. Your booking request is saved and the team will follow up shortly.');
    } catch (submitError: any) {
      setBookingFeedback(submitError?.message || 'Unable to save this booking request right now.');
    } finally {
      setSubmittingBooking(false);
    }
  }, [bookingForm, journey, selectedPackage]);

  const openBookingRequestWhatsApp = useCallback(() => {
    if (!journey) {
      return;
    }

    void openWhatsAppConversation({
      phone: guestSupport.whatsapp,
      text: buildWhatsAppMessage(journey, selectedPackage).join('\n'),
    });
  }, [journey, selectedPackage]);

  if (loading) {
    return <LoadingScreen message="Loading journey..." />;
  }

  if (!journey) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
        <View style={[styles.emptyWrap, { paddingHorizontal: theme.spacing.pageHorizontal }]}>
          <EmptyStateCard title="Journey unavailable" body={error || 'This journey could not be loaded right now.'} />
          <SecondaryPillButton label="Go back" icon="arrow-back-outline" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: 154,
              gap: theme.spacing.sectionGap,
            },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            void loadJourney();
          }} tintColor={theme.palette.primary} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroWrap}>
            <Image source={resolveImageSource(journey.cover_image, guestImages.journeyFallback)} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay}>
              <TouchableOpacity style={[styles.backButton, { backgroundColor: `${theme.palette.card}D9` }]} onPress={() => router.back()} activeOpacity={0.85}>
                <Ionicons name="arrow-back" size={18} color={theme.palette.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ paddingHorizontal: theme.spacing.pageHorizontal, gap: theme.spacing.sectionGap }}>
            <View style={[styles.summaryCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}>
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, { color: theme.palette.text }]}>{journey.name}</Text>
                {journey.featured ? (
                  <View style={[styles.badge, { backgroundColor: theme.palette.primarySoft }]}>
                    <Text style={[styles.badgeText, { color: theme.palette.primary }]}>Featured</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.summaryMeta, { color: theme.palette.mutedText }]}>
                {formatPublicDateRange(journey.start_date, journey.end_date)}
              </Text>
              <Text style={[styles.summaryMeta, { color: theme.palette.mutedText }]}>
                {journey.cities.join(', ') || 'Cities to be confirmed'}
              </Text>
              <Text style={[styles.summaryBody, { color: theme.palette.text }]}>{journey.excerpt}</Text>
              <Text style={[styles.summaryPrice, { color: theme.palette.primary }]}>
                {journey.starting_price_minor_units
                  ? `Starting from ${formatPublicMoney(
                      journey.starting_price_minor_units,
                      journey.starting_price_currency || 'UGX'
                    )}`
                  : 'Pricing available on request'}
              </Text>
            </View>

            <View style={styles.factGrid}>
              {factItems.map((item) => (
                <View
                  key={item.label}
                  style={[styles.factCard, { backgroundColor: theme.palette.surface, borderColor: theme.palette.border }]}
                >
                  <Text style={[styles.factLabel, { color: theme.palette.mutedText }]}>{item.label}</Text>
                  <Text style={[styles.factValue, { color: theme.palette.text }]}>{item.value}</Text>
                </View>
              ))}
            </View>

            <ChecklistCard
              title="Pricing and booking window"
              items={[
                journey.starting_price_minor_units
                  ? `Published price direction starts from ${formatPublicMoney(
                      journey.starting_price_minor_units,
                      journey.starting_price_currency || 'UGX'
                    )}.`
                  : 'Speak to Al Hilal for current published pricing.',
                journey.sales_open_date ? `Sales opened on ${journey.sales_open_date}.` : 'Sales timing depends on the current published journey status.',
                `Current journey status: ${journey.status.replaceAll('_', ' ')}.`,
              ]}
              tone="accent"
            />

            <SecondaryPillButton
              label="Read how to book"
              icon="open-outline"
              onPress={() => void openExternalUrl(guestSupport.howToBookHref)}
              fullWidth
            />

            {journey.packages.length ? (
              journey.packages.map((tripPackage) => (
                <View
                  key={tripPackage.id}
                  style={[styles.packageCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}
                >
                  <Text style={[styles.packageTitle, { color: theme.palette.text }]}>{tripPackage.name}</Text>
                  <Text style={[styles.summaryMeta, { color: theme.palette.mutedText }]}>
                    {`${formatPublicDateRange(tripPackage.start_date, tripPackage.end_date)} · ${formatPublicNightsLabel(tripPackage.nights)}`}
                  </Text>
                  <Text style={[styles.summaryPrice, { color: theme.palette.primary }]}>
                    {formatPublicMoney(tripPackage.price_minor_units, tripPackage.currency || 'UGX')}
                  </Text>
                  <Text style={[styles.summaryMeta, { color: theme.palette.mutedText }]}>
                    {`Status: ${tripPackage.status.replaceAll('_', ' ')} · Capacity: ${tripPackage.capacity || 'N/A'} · Target: ${tripPackage.sales_target ?? 'N/A'}`}
                  </Text>

                  {tripPackage.hotels.length ? (
                    <ChecklistCard
                      title="Accommodation"
                      items={tripPackage.hotels.map((hotel) => `${hotel.name}${hotel.room_type ? ` · ${hotel.room_type}` : ''}`)}
                    />
                  ) : null}

                  {tripPackage.flights.length ? (
                    <ChecklistCard
                      title="Flights"
                      items={tripPackage.flights.map((flight) => `${flight.carrier}${flight.flight_no} ${flight.dep_airport}-${flight.arr_airport}`)}
                    />
                  ) : null}

                  <View style={styles.packageActions}>
                    <SecondaryPillButton
                      label="Plan This Trip"
                      icon="calendar-outline"
                      onPress={() => router.push('/contact' as never)}
                      fullWidth
                    />
                    <PrimaryPillButton
                      label="Book Trip"
                      icon="send-outline"
                      onPress={() => openBookingRequest(tripPackage)}
                      fullWidth
                    />
                  </View>
                </View>
              ))
            ) : (
              <InlineCalloutCard
                title="Package details are still being prepared"
                body="You can still contact Al Hilal for the current package breakdown, date fit, and next booking step."
              />
            )}

            {journey.milestones.length ? (
              <ChecklistCard
                title="Important notes"
                items={journey.milestones.map((item) => `${item.title}${item.target_date ? ` · ${item.target_date}` : ''}`)}
              />
            ) : null}

            {journey.guide_sections.length ? (
              <View style={styles.stack}>
                {journey.guide_sections.slice(0, 2).map((section) => (
                  <InlineCalloutCard key={section.id} title={section.title} body={section.content_md} />
                ))}
              </View>
            ) : null}

            {journey.faqs.length ? (
              <ChecklistCard
                title="Common questions"
                items={journey.faqs.slice(0, 4).map((item) => `${item.question}: ${item.answer}`)}
              />
            ) : null}

            {relatedGuidance.length ? (
              <View style={styles.stack}>
                <Text style={[styles.relatedHeading, { color: theme.palette.text }]}>Related guidance</Text>
                {relatedGuidance.map((article) => (
                  <GuidanceMiniCard
                    key={article.slug}
                    title={article.title}
                    date={article.readTime || article.category}
                    onPress={() => router.push(`/guidance/${article.slug}` as never)}
                  />
                ))}
              </View>
            ) : null}

            <SupportActionCard
              title="Need help choosing?"
              body="Speak to Al Hilal if you want help comparing packages, rooming, dates, or what this journey requires before you book."
              actions={[
                {
                  label: 'WhatsApp',
                  icon: 'logo-whatsapp',
                  onPress: () =>
                    void openWhatsAppConversation({
                      phone: guestSupport.whatsapp,
                      text: buildWhatsAppMessage(journey).join('\n'),
                    }),
                },
                { label: 'Call', icon: 'call-outline', onPress: () => void openExternalUrl(guestSupport.phoneHref) },
                { label: 'Email', icon: 'mail-outline', onPress: () => void openExternalUrl(guestSupport.emailHref) },
              ]}
            />
          </View>
        </ScrollView>

        <StickyBottomActionBar
          primaryLabel="Book Trip"
          secondaryLabel="Plan This Trip"
          primaryIcon="send-outline"
          onPrimaryPress={() => openBookingRequest()}
          onSecondaryPress={() => router.push('/contact' as never)}
        />

        <Modal
          visible={bookingModalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeBookingRequest}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[styles.modalCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleWrap}>
                  <Text style={[styles.modalTitle, { color: theme.palette.text }]}>Booking request</Text>
                  <Text style={[styles.modalSubtitle, { color: theme.palette.mutedText }]}>
                    {selectedPackage ? selectedPackage.name : journey.name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: theme.palette.surface, borderColor: theme.palette.border }]}
                  onPress={closeBookingRequest}
                  disabled={submittingBooking}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close" size={18} color={theme.palette.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.formStack}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.palette.text }]}>Full name *</Text>
                  <TextInput
                    value={bookingForm.name}
                    onChangeText={(value) => setBookingForm((current) => ({ ...current, name: value }))}
                    placeholder="Your name"
                    placeholderTextColor={theme.palette.mutedText}
                    autoCapitalize="words"
                    style={[styles.fieldInput, { color: theme.palette.text, borderColor: theme.palette.border, backgroundColor: theme.palette.surface }]}
                  />
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.palette.text }]}>Phone or WhatsApp *</Text>
                  <TextInput
                    value={bookingForm.phone}
                    onChangeText={(value) => setBookingForm((current) => ({ ...current, phone: value }))}
                    placeholder="+256 700 773535"
                    placeholderTextColor={theme.palette.mutedText}
                    keyboardType="phone-pad"
                    style={[styles.fieldInput, { color: theme.palette.text, borderColor: theme.palette.border, backgroundColor: theme.palette.surface }]}
                  />
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.palette.text }]}>Email</Text>
                  <TextInput
                    value={bookingForm.email}
                    onChangeText={(value) => setBookingForm((current) => ({ ...current, email: value }))}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.palette.mutedText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.fieldInput, { color: theme.palette.text, borderColor: theme.palette.border, backgroundColor: theme.palette.surface }]}
                  />
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.palette.text }]}>Travellers</Text>
                  <TextInput
                    value={bookingForm.travellers}
                    onChangeText={(value) => setBookingForm((current) => ({ ...current, travellers: value }))}
                    placeholder="Example: 2 adults"
                    placeholderTextColor={theme.palette.mutedText}
                    style={[styles.fieldInput, { color: theme.palette.text, borderColor: theme.palette.border, backgroundColor: theme.palette.surface }]}
                  />
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.palette.text }]}>Notes</Text>
                  <TextInput
                    value={bookingForm.notes}
                    onChangeText={(value) => setBookingForm((current) => ({ ...current, notes: value }))}
                    placeholder="Any family, rooming, or timing questions?"
                    placeholderTextColor={theme.palette.mutedText}
                    multiline
                    textAlignVertical="top"
                    style={[
                      styles.fieldInput,
                      styles.notesInput,
                      { color: theme.palette.text, borderColor: theme.palette.border, backgroundColor: theme.palette.surface },
                    ]}
                  />
                </View>
              </ScrollView>

              {bookingFeedback ? (
                <Text style={[styles.formFeedback, { color: theme.palette.error }]}>{bookingFeedback}</Text>
              ) : null}

              <View style={styles.modalActions}>
                <SecondaryPillButton
                  label="Submit to WhatsApp"
                  icon="logo-whatsapp"
                  onPress={openBookingRequestWhatsApp}
                  disabled={submittingBooking}
                  fullWidth
                />
                <PrimaryPillButton
                  label="Submit Request"
                  icon="send-outline"
                  onPress={() => void submitBookingRequest()}
                  loading={submittingBooking}
                  fullWidth
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  heroWrap: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 320,
  },
  heroOverlay: {
    position: 'absolute',
    top: 10,
    left: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  summaryCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryTitle: {
    flex: 1,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  summaryMeta: {
    fontSize: 14,
    lineHeight: 21,
  },
  summaryBody: {
    fontSize: 15,
    lineHeight: 24,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  factCard: {
    width: '47%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  factLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  factValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  packageCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  packageTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  packageActions: {
    gap: 10,
  },
  stack: {
    gap: 12,
  },
  relatedHeading: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalCard: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 16,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalTitleWrap: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formStack: {
    gap: 12,
  },
  modalScroll: {
    flexGrow: 0,
  },
  fieldWrap: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldInput: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 88,
  },
  formFeedback: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  modalActions: {
    gap: 10,
  },
});
