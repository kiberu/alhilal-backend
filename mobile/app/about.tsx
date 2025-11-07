import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const timeline = [
  {
    year: '2009',
    title: 'Founded in Kampala',
    description: 'Al-Hilal Tours & Travel opened its first office to serve Ugandan pilgrims with reliable Umrah journeys.',
  },
  {
    year: '2015',
    title: 'Expanded Services',
    description: 'Introduced Hajj facilitation, educational tours, and bespoke spiritual retreats across the region.',
  },
  {
    year: '2022',
    title: 'Digital Transformation',
    description: 'Launched our mobile concierge platform offering seamless booking, documents, and support for pilgrims.',
  },
];

const values = [
  {
    icon: 'heart',
    title: 'Service with Care',
    description: 'Dedicated team support from pre-departure to safe return.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Trusted Compliance',
    description: 'Licensed and accredited with key pilgrimage partners and airlines.',
  },
  {
    icon: 'sparkles',
    title: 'Memorable Journeys',
    description: 'Curated itineraries that blend spirituality, comfort, and cultural discovery.',
  },
];

export default function AboutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About Al-Hilal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Connecting Hearts to the Holy Lands</Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>For over 15 years, Al-Hilal has guided East African pilgrims with reliable, spiritually uplifting journeys to Makkah, Madinah, and beyond.</Text>
        </View>

        <View style={[styles.metricsRow]}>
          <View style={[styles.metricCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.metricValue, { color: colors.primary }]}>15k+</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Pilgrims served</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.metricValue, { color: colors.primary }]}>30+</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Curated itineraries</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.metricValue, { color: colors.primary }]}>24/7</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Pilgrim support</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>To make every pilgrim’s journey meaningful, stress-free, and spiritually fulfilling through meticulous planning, experienced guidance, and heartfelt hospitality.</Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What We Believe</Text>
          <View style={styles.valuesList}>
            {values.map((value) => (
              <View key={value.title} style={[styles.valueCard, { backgroundColor: colors.muted }]}> 
                <Ionicons name={value.icon as any} size={24} color={colors.primary} />
                <Text style={[styles.valueTitle, { color: colors.text }]}>{value.title}</Text>
                <Text style={[styles.valueDescription, { color: colors.mutedForeground }]}>{value.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Journey</Text>
          <View style={styles.timeline}>
            {timeline.map((item) => (
              <View key={item.year} style={styles.timelineItem}>
                <View style={[styles.timelineYear, { backgroundColor: colors.muted }]}> 
                  <Text style={[styles.timelineYearText, { color: colors.text }]}>{item.year}</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.timelineDescription, { color: colors.mutedForeground }]}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Visit Us</Text>
          <View style={styles.contactList}>
            <View style={[styles.contactRow, { borderColor: colors.border }]}> 
              <Ionicons name="location" size={22} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>Kyato Complex, Bombo Rd, Kampala</Text>
            </View>
            <View style={[styles.contactRow, { borderColor: colors.border }]}> 
              <Ionicons name="call" size={22} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>+256 700 773535</Text>
            </View>
            <View style={[styles.contactRow, { borderColor: colors.border }]}> 
              <Ionicons name="mail" size={22} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>info@alhilaltravels.com</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
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
    paddingBottom: Spacing.xxxl,
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  heroTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metricValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  metricLabel: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionBody: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  valuesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  valueCard: {
    flexBasis: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  valueTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  valueDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  timeline: {
    gap: Spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timelineYear: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineYearText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  timelineContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  timelineTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  timelineDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  contactList: {
    gap: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  contactText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
});


