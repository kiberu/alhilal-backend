import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { JourneyHorizontalCard } from '@/components/guest/cards';
import {
  EmptyStateCard,
  FilterChip,
  InfoPromptCard,
  LoadingScreen,
  SectionHeader,
  SecondaryPillButton,
  TopBar,
} from '@/components/guest/primitives';
import { guestSupport } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import { type PublicTrip } from '@/lib/api/services';
import { formatPublicPackageCountLabel } from '@/lib/public-format';
import { openWhatsAppConversation } from '@/lib/support/open-external';
import { syncPublicTrips } from '@/lib/support/public-cache';

type JourneyTypeFilter = 'UMRAH' | 'HAJJ';

const journeyTypeOptions: { label: string; value: JourneyTypeFilter }[] = [
  { label: 'Umrah', value: 'UMRAH' },
  { label: 'Hajj', value: 'HAJJ' },
];

function getJourneyTypeLabel(value: JourneyTypeFilter) {
  return value === 'HAJJ' ? 'Hajj' : 'Umrah';
}

export default function JourneysScreen() {
  const theme = useGuestTheme();
  const router = useRouter();

  const [journeys, setJourneys] = useState<PublicTrip[]>([]);
  const [journeyTypeFilter, setJourneyTypeFilter] = useState<JourneyTypeFilter>('UMRAH');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const journeysByType = useMemo(
    () => journeys.filter((journey) => journey.journey_type === journeyTypeFilter),
    [journeys, journeyTypeFilter]
  );

  const monthOptions = useMemo(
    () => [
      'ALL',
      ...Array.from(
        new Set(
          journeysByType
            .map((item) => item.commercial_month_label)
            .filter((item): item is string => Boolean(item))
        )
      ).sort((left, right) => left.localeCompare(right)),
    ],
    [journeysByType]
  );

  const filteredJourneys = useMemo(() => {
    const next = journeysByType.filter((journey) =>
      monthFilter === 'ALL' ? true : journey.commercial_month_label === monthFilter
    );

    return next.sort(
      (left, right) => new Date(left.start_date).getTime() - new Date(right.start_date).getTime()
    );
  }, [journeysByType, monthFilter]);

  const handleJourneyTypePress = (value: JourneyTypeFilter) => {
    setJourneyTypeFilter(value);
    setMonthFilter('ALL');
  };

  const loadJourneys = async () => {
    try {
      const result = await syncPublicTrips();
      setJourneys(result.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadJourneys();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading journeys..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.pageHorizontal,
            paddingBottom: 120,
            gap: theme.spacing.sectionGap,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadJourneys();
            }}
            tintColor={theme.palette.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title="Plan your pilgrimage"
          subtitle="Choose Umrah or Hajj, then narrow the upcoming trips by month."
        />

        <View style={[styles.filterPanel, { backgroundColor: theme.palette.surface, borderColor: theme.palette.border }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: theme.palette.text }]}>Select journey type</Text>
          </View>
          <View style={styles.segmentedControl}>
            {journeyTypeOptions.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                selected={journeyTypeFilter === option.value}
                onPress={() => handleJourneyTypePress(option.value)}
              />
            ))}
          </View>
        </View>

        {monthOptions.length ? (
          <View style={[styles.filterPanel, { backgroundColor: theme.palette.surface, borderColor: theme.palette.border }]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: theme.palette.text }]}>Select month</Text>
              <Text style={[styles.filterCount, { color: theme.palette.mutedText }]}>
                {filteredJourneys.length} {filteredJourneys.length === 1 ? 'trip' : 'trips'}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipList}
            >
              {monthOptions.map((option) => (
                <FilterChip
                  key={option}
                  label={option === 'ALL' ? 'All months' : option}
                  selected={monthFilter === option}
                  onPress={() => setMonthFilter(option)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Upcoming Trips" />
          {filteredJourneys.length ? (
            filteredJourneys.map((journey) => (
              <JourneyHorizontalCard
                key={journey.id || journey.slug}
                journey={journey}
                subtitle={formatPublicPackageCountLabel(journey.packages_count)}
                onPress={() => router.push(`/journey/${journey.slug || journey.id}` as never)}
              />
            ))
          ) : (
            <EmptyStateCard
              title={
                journeysByType.length
                  ? 'No trips matched this month'
                  : `No upcoming ${getJourneyTypeLabel(journeyTypeFilter)} trips yet`
              }
              body={
                journeysByType.length
                  ? 'Try another month to see more published departures.'
                  : `Published ${getJourneyTypeLabel(journeyTypeFilter)} departures will appear here when they are available.`
              }
            />
          )}
        </View>

        <InfoPromptCard
          title="Need help choosing a departure?"
          body="A short WhatsApp conversation is the best next step once you have seen the month that fits."
          cta={
            <SecondaryPillButton
              label="Talk on WhatsApp"
              icon="logo-whatsapp"
              onPress={() => void openWhatsAppConversation({ phone: guestSupport.whatsapp })}
              fullWidth
            />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  section: {
    gap: 12,
  },
  filterPanel: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filterTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  filterCount: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  chipList: {
    gap: 10,
    paddingRight: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
