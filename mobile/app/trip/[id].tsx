import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { TripsService, TripDetail, BookingsService } from '@/lib/api/services';
import { useAuth } from '@/contexts/auth-context';

// Generic services offered (from website)
const GENERIC_SERVICES = [
  {
    id: 1,
    title: 'Umrah Packages',
    icon: 'moon' as const,
    features: ['Visa processing', 'Return flights', 'Hotel near Haram', 'Ground transfers', 'Guided Ziyarah', 'On-ground support']
  },
  {
    id: 2,
    title: 'Hajj Packages',
    icon: 'moon-outline' as const,
    features: ['Visa processing', 'Return flights', 'Mina/Arafat logistics', 'Makkah/Madinah hotels', 'Internal transport', 'Guided Ziyarah']
      },
      {
    id: 3,
    title: 'Ziyarah Tours',
    icon: 'map' as const,
    features: ['Historic Islamic sites', 'Expert scholar guidance', 'Context and history', 'Spiritual insights', 'Group or private tours', 'Flexible scheduling']
      },
      {
    id: 4,
    title: 'Group & Community Bookings',
    icon: 'people' as const,
    features: ['Discounted group rates', 'Dedicated coordinator', 'Customized schedules', 'Group transportation', 'Private sessions', 'Community bonding']
      },
      {
    id: 5,
    title: 'VIP & Concierge Services',
    icon: 'star' as const,
    features: ['Private airport transfers', 'Premium accommodations', 'Bespoke itineraries', 'On-call liaison', 'VIP lounge access', 'Priority services']
      },
      {
    id: 6,
    title: 'Travel Facilitation',
    icon: 'airplane' as const,
    features: ['Visa advisory & processing', 'Flight booking & optimization', 'Hotel reservations', 'Travel insurance guidance', 'Documentation assistance', '24/7 support']
  }
];

// Generic FAQs (from website)
const GENERIC_FAQS = [
  {
    id: 1,
    question: 'How far in advance should I book?',
    answer: 'We recommend booking at least 2-3 months in advance, especially for Ramadan and Hajj packages. This ensures visa processing time and better accommodation availability.'
  },
  {
    id: 2,
        question: 'What is the payment schedule?',
    answer: 'Typically, a 30-50% deposit secures your booking, with the balance due 30 days before departure. Specific terms are outlined on your invoice.'
  },
  {
    id: 3,
    question: 'Can I make changes after booking?',
    answer: 'Changes are possible subject to availability and may incur fees. Contact us as soon as possible if you need to modify your booking.'
  },
  {
    id: 4,
    question: 'What if my visa is rejected?',
    answer: 'In the rare case of visa rejection, we\'ll work with you on options. Refund terms depend on the circumstances and are outlined in your contract.'
  },
  {
    id: 5,
    question: 'Are payment plans available?',
    answer: 'Yes, we offer flexible payment plans for most packages. Contact us to discuss options that work for your budget.'
  },
  {
    id: 6,
    question: 'What\'s included in the package price?',
    answer: 'Packages typically include flights, visa processing, accommodation, transfers, and guided tours. Specific inclusions vary by package—full details provided at booking.'
  }
];

// How to book steps (from website)
const BOOKING_STEPS = [
  {
    step: 1,
    icon: 'call' as const,
    title: 'Enquire',
    description: 'Reach out to us with your preferred dates, party size, and budget.',
    details: ['Call or WhatsApp: +256 700 773535', 'Email: info@alhilaltravels.com', 'Visit our office in Kampala', 'Or sign in to book directly through the app']
  },
  {
    step: 2,
    icon: 'document-text' as const,
    title: 'Confirm',
    description: 'Review your tailored itinerary and package details.',
    details: ['Receive customized quote & itinerary', 'Review package inclusions & exclusions', 'Ask questions and clarify details', 'Approve package and submit documents']
  },
  {
    step: 3,
    icon: 'card' as const,
    title: 'Secure',
    description: 'Complete payment and finalize your booking.',
    details: ['Pay deposit to reserve your seats', 'Complete balance as per schedule', 'Receive booking confirmation', 'Get visa, tickets, hotel vouchers & briefing pack']
  }
];

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, accessToken } = useAuth();
  
  // State
  const [tripDetails, setTripDetails] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<string[]>([]); // Package IDs user has booked
  
  // Booking modal state
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  
  // Success modal state
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>('');
  
  // Fetch trip details and user bookings
  useEffect(() => {
    if (id && typeof id === 'string') {
      loadTripDetails(id);
    }
    if (isAuthenticated && accessToken) {
      loadUserBookings();
    }
  }, [id, isAuthenticated, accessToken]);
  
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
  
  const loadUserBookings = async () => {
    if (!accessToken) return;
    
    try {
      const response = await BookingsService.getMyBookings(accessToken);
      if (response.success && response.data) {
        // Extract package IDs from bookings (excluding cancelled)
        const bookedPackageIds = Array.isArray(response.data)
          ? response.data
              .filter(b => b.status !== 'CANCELLED')
              .map(b => b.package_id)
          : [];
        setUserBookings(bookedPackageIds);
      }
    } catch (err) {
      console.error('Error loading user bookings:', err);
    }
  };
  
  const isPackageBooked = (packageId: string) => {
    return userBookings.includes(packageId);
  };
  
  const handleBookPackage = (packageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isAuthenticated) {
      router.push('/(auth)/phone-login');
      return;
    }
    setSelectedPackageId(packageId);
    setBookingModalVisible(true);
  };
  
  const handleSubmitBooking = async () => {
    if (!selectedPackageId || !accessToken) return;
    
    try {
      setSubmittingBooking(true);
      const response = await BookingsService.createBooking(
        {
          package: selectedPackageId,
          special_needs: specialNeeds || undefined,
        },
        accessToken
      );
      
      console.log('Booking response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // Close booking modal and show success modal
        setBookingModalVisible(false);
        setBookingReference(response.data.reference_number);
        setSuccessModalVisible(true);
        setSpecialNeeds('');
        setSelectedPackageId(null);
        
        // Reload user bookings to update the UI
        loadUserBookings();
      } else {
        // Handle different error formats from API
        let errorMessage = 'Failed to create booking';
        if (response.error) {
          if (typeof response.error === 'string') {
            errorMessage = response.error;
          } else if (typeof response.error === 'object') {
            // Handle field-specific errors
            const errors = Object.entries(response.error)
              .map(([field, msgs]) => {
                const messages = Array.isArray(msgs) ? msgs : [msgs];
                return `${field}: ${messages.join(', ')}`;
              })
              .join('\n');
            errorMessage = errors || 'Failed to create booking';
          }
        }
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      const errorMessage = err?.message || err?.toString?.() || 'Failed to submit booking. Please try again.';
      Alert.alert(
        'Booking Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setSubmittingBooking(false);
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
      return `UGX ${major.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
    }
    // For USD and other currencies
    return `$${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            <Text style={[styles.title, { color: colors.text }]}>{tripDetails.name}</Text>
            
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {tripDetails.cities.join(' • ')}
            </Text>
            
              <View style={[styles.badge, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {formatDateRange(tripDetails.start_date, tripDetails.end_date)}
              </Text>
            </View>

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
              </View>
            </View>

          {/* Packages Section */}
          {tripDetails.packages.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Packages</Text>
              <View style={styles.packagesList}>
                {tripDetails.packages.map((pkg, index) => (
                  <View key={pkg.id} style={[styles.packageCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    {/* Package Header */}
                    <View style={styles.packageCardHeader}>
                      <Text style={[styles.packageCardName, { color: colors.text }]}>
                        {pkg.name}
              </Text>
                      <Text style={[styles.packageCardPrice, { color: colors.primary }]}>
                        {formatPrice(pkg.price_minor_units, pkg.currency)}
                  </Text>
                </View>

                    {/* Hotels List */}
                    {pkg.hotels.length > 0 && (
                      <View style={styles.packageSection}>
                        <View style={styles.packageSectionHeader}>
                          <Ionicons name="bed" size={16} color={colors.primary} />
                          <Text style={[styles.packageSectionTitle, { color: colors.text }]}>Accommodations</Text>
                        </View>
                        {pkg.hotels.map((hotel, hotelIndex) => (
                          <View key={hotel.id} style={styles.hotelItem}>
                            <Text style={[styles.hotelName, { color: colors.text }]} numberOfLines={1}>
                              • {hotel.name}
                            </Text>
                            <Text style={[styles.hotelDetails, { color: colors.mutedForeground }]}>
                              {new Date(hotel.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(hotel.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({calculateNights(hotel.check_in, hotel.check_out)} nights)
                            </Text>
                            {hotel.room_type && (
                              <Text style={[styles.hotelRoomType, { color: colors.mutedForeground }]}>
                                {hotel.room_type}
                              </Text>
              )}
            </View>
                        ))}
                      </View>
                    )}

                    {/* Flights List */}
                    {pkg.flights.length > 0 && (
                      <View style={styles.packageSection}>
                        <View style={styles.packageSectionHeader}>
                          <Ionicons name="airplane" size={16} color={colors.primary} />
                          <Text style={[styles.packageSectionTitle, { color: colors.text }]}>Flights</Text>
                        </View>
                        {pkg.flights.map((flight, flightIndex) => (
                          <View key={flight.id} style={styles.flightItem}>
                            <View style={styles.flightHeader}>
                              <Text style={[styles.flightCarrier, { color: colors.text }]}>
                                {flight.carrier} {flight.flight_no}
            </Text>
                              <Text style={[styles.flightLeg, { color: colors.mutedForeground }]}>
                                {flight.leg}
                              </Text>
              </View>
                            <Text style={[styles.flightRoute, { color: colors.mutedForeground }]}>
                              {flight.dep_airport} → {flight.arr_airport}
                            </Text>
                            <Text style={[styles.flightTime, { color: colors.mutedForeground }]}>
                              {new Date(flight.dep_dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Text>
              </View>
                        ))}
              </View>
                    )}

                    {/* Book Package Button */}
                    {isAuthenticated && (
                      isPackageBooked(pkg.id) ? (
                        <View style={[styles.bookPackageButton, { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }]}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <Text style={[styles.bookPackageButtonText, { color: colors.text }]}>Already Booked</Text>
              </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.bookPackageButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleBookPackage(pkg.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.bookPackageButtonText}>Book This Package</Text>
                          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                      )
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

          {/* Generic Services Section */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Services</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
              Complete pilgrimage solutions for every traveler
            </Text>
            <View style={styles.servicesList}>
              {GENERIC_SERVICES.map((service) => (
                <View key={service.id} style={[styles.serviceCard, { backgroundColor: colors.muted }]}>
                  <View style={styles.serviceHeader}>
                    <View style={[styles.serviceIconContainer, { backgroundColor: colors.primary }]}>
                      <Ionicons name={service.icon} size={20} color="#FFFFFF" />
            </View>
                    <Text style={[styles.serviceTitle, { color: colors.text }]}>{service.title}</Text>
                  </View>
                  <View style={styles.serviceFeatures}>
                    {service.features.map((feature, idx) => (
                      <View key={idx} style={styles.serviceFeatureRow}>
                        <View style={[styles.serviceBullet, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.serviceFeatureText, { color: colors.mutedForeground }]}>
                          {feature}
                        </Text>
                  </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Generic FAQ Section */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking FAQs</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
              Common questions about our booking process
            </Text>
            <View style={styles.faqList}>
              {GENERIC_FAQS.map((faq) => (
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

          {/* How to Book / Sign In Section */}
          {!isAuthenticated && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Book</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
                Three easy steps to secure your spiritual journey
              </Text>
              
              {/* Sign In Prompt */}
              <View style={[styles.signInPrompt, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                <Ionicons name="information-circle" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.signInPromptTitle, { color: colors.text }]}>
                    Sign in to book instantly
                  </Text>
                  <Text style={[styles.signInPromptText, { color: colors.mutedForeground }]}>
                    Create an account or sign in to book this trip directly through the app
                  </Text>
        </View>
                <TouchableOpacity
                  style={[styles.signInButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push('/(auth)/phone-login');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>

              {/* Booking Steps */}
              <View style={styles.bookingStepsList}>
                {BOOKING_STEPS.map((step, index) => (
                  <View key={step.step} style={styles.bookingStepItem}>
                    <View style={styles.bookingStepHeader}>
                      <View style={[styles.bookingStepNumber, { backgroundColor: colors.primary }]}>
                        <Text style={styles.bookingStepNumberText}>{step.step}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.bookingStepTitle, { color: colors.text }]}>{step.title}</Text>
                        <Text style={[styles.bookingStepDescription, { color: colors.mutedForeground }]}>
                          {step.description}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.bookingStepDetails}>
                      {step.details.map((detail, idx) => (
                        <View key={idx} style={styles.bookingStepDetailRow}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                          <Text style={[styles.bookingStepDetailText, { color: colors.mutedForeground }]}>
                            {detail}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              {/* Contact Options */}
              <View style={styles.contactOptions}>
        <TouchableOpacity
                  style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    // TODO: Open phone dialer
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                  <Text style={styles.contactButtonText}>Call Us</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.contactButton, { backgroundColor: '#25D366' }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    // TODO: Open WhatsApp
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                  <Text style={styles.contactButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Book Package</Text>
              <TouchableOpacity
                onPress={() => setBookingModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.modalInfoCard, { backgroundColor: colors.muted }]}>
                <Ionicons name="information-circle" size={24} color={colors.primary} />
                <Text style={[styles.modalInfoText, { color: colors.mutedForeground }]}>
                  Your booking will be submitted as an "Expression of Interest". Our team will review and confirm your booking shortly.
          </Text>
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={[styles.modalLabel, { color: colors.text }]}>Special Needs (Optional)</Text>
                <Text style={[styles.modalHelpText, { color: colors.mutedForeground }]}>
                  Let us know if you have any dietary requirements, mobility needs, or other special requests.
                </Text>
                <TextInput
                  style={[
                    styles.modalTextArea,
                    { 
                      backgroundColor: colors.muted,
                      color: colors.text,
                      borderColor: colors.border
                    }
                  ]}
                  placeholder="Enter any special needs or requirements..."
                  placeholderTextColor={colors.mutedForeground}
                  value={specialNeeds}
                  onChangeText={setSpecialNeeds}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setBookingModalVisible(false)}
                disabled={submittingBooking}
              >
                <Text style={[styles.modalCancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmitBooking}
                disabled={submittingBooking}
                activeOpacity={0.8}
              >
                {submittingBooking ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.modalSubmitButtonText}>Submit Booking</Text>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  </>
                )}
        </TouchableOpacity>
      </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={[styles.successContent, { backgroundColor: colors.card }]}>
            <View style={[styles.successIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
            </View>
            
            <Text style={[styles.successTitle, { color: colors.text }]}>Booking Submitted!</Text>
            
            <View style={[styles.successReferenceCard, { backgroundColor: colors.muted }]}>
              <Text style={[styles.successReferenceLabel, { color: colors.mutedForeground }]}>
                Reference Number
              </Text>
              <Text style={[styles.successReferenceNumber, { color: colors.primary }]}>
                {bookingReference}
              </Text>
            </View>
            
            <Text style={[styles.successMessage, { color: colors.mutedForeground }]}>
              Your booking has been submitted successfully. Our team will review and confirm your booking shortly.
            </Text>
            
            <View style={styles.successButtonsRow}>
              <TouchableOpacity
                style={[styles.successButton, styles.successButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSuccessModalVisible(false);
                  router.push('/my-bookings');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.successButtonTextPrimary}>View My Bookings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.successButton, styles.successButtonSecondary, { borderColor: colors.border }]}
                onPress={() => setSuccessModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.successButtonTextSecondary, { color: colors.text }]}>Continue Browsing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  packageCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  packageCardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  packageCardName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  packageCardPrice: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  packageSection: {
    gap: Spacing.xs,
  },
  packageSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  packageSectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hotelItem: {
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 2,
  },
  hotelName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  hotelDetails: {
    fontSize: Typography.fontSize.sm,
  },
  hotelRoomType: {
    fontSize: Typography.fontSize.xs,
  },
  flightItem: {
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 2,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightCarrier: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  flightLeg: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
  },
  flightRoute: {
    fontSize: Typography.fontSize.sm,
  },
  flightTime: {
    fontSize: Typography.fontSize.xs,
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
  // Services Section
  servicesList: {
    gap: Spacing.md,
  },
  serviceCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
  },
  serviceFeatures: {
    gap: Spacing.xs,
  },
  serviceFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  serviceBullet: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    marginTop: 6,
  },
  serviceFeatureText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  // Sign In Prompt
  signInPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  signInPromptTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  signInPromptText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  signInButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  // Booking Steps
  bookingStepsList: {
    gap: Spacing.lg,
    marginTop: Spacing.lg,
  },
  bookingStepItem: {
    gap: Spacing.md,
  },
  bookingStepHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  bookingStepNumber: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingStepNumberText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  bookingStepTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  bookingStepDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  bookingStepDetails: {
    paddingLeft: 48,
    gap: Spacing.xs,
  },
  bookingStepDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bookingStepDetailText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  // Contact Options
  contactOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
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
  // Book Package Button
  bookPackageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  bookPackageButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  // Booking Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalBody: {
    padding: Spacing.lg,
    maxHeight: 400,
  },
  modalInfoCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  modalInfoText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  modalFormGroup: {
    gap: Spacing.sm,
  },
  modalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  modalHelpText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 100,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  modalSubmitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  modalSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successContent: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
  successReferenceCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    width: '100%',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  successReferenceLabel: {
    fontSize: Typography.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  successReferenceNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  successMessage: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  successButtonsRow: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  successButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  successButtonPrimary: {
    // backgroundColor set dynamically
  },
  successButtonSecondary: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  successButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  successButtonTextSecondary: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

