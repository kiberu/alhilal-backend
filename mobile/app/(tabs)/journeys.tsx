import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { JourneyHorizontalCard } from '@/components/guest/cards';
import {
  EmptyStateCard,
  FilterChip,
  InfoPromptCard,
  LoadingScreen,
  SecondaryPillButton,
  TopBar,
} from '@/components/guest/primitives';
import { guestContent, guestSupport } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import { type PublicTrip } from '@/lib/api/services';
import { formatPublicMoney } from '@/lib/public-format';
import { openWhatsAppConversation } from '@/lib/support/open-external';
import { syncPublicTrips } from '@/lib/support/public-cache';

export default function JourneysScreen() {
  const theme = useGuestTheme();
  const router = useRouter();

  const [journeys, setJourneys] = useState<PublicTrip[]>([]);
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const monthOptions = useMemo(
    () => [
      'ALL',
      ...Array.from(
        new Set(
          journeys
            .map((item) => item.commercial_month_label)
            .filter((item): item is string => Boolean(item))
        )
      ),
    ],
    [journeys]
  );

  const filteredJourneys = useMemo(() => {
    const next = journeys.filter((journey) =>
      monthFilter === 'ALL' ? true : journey.commercial_month_label === monthFilter
    );

    return next.sort(
      (left, right) => new Date(left.start_date).getTime() - new Date(right.start_date).getTime()
    );
  }, [journeys, monthFilter]);

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
          title={guestContent.journeys.title}
          subtitle="Browse published departures by month."
        />

        {monthOptions.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipList}
          >
            {monthOptions.map((option) => (
              <FilterChip
                key={option}
                label={option === 'ALL' ? 'All departures' : option}
                selected={monthFilter === option}
                onPress={() => setMonthFilter(option)}
              />
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.section}>
          {filteredJourneys.length ? (
            filteredJourneys.map((journey) => (
              <JourneyHorizontalCard
                key={journey.id || journey.slug}
                journey={journey}
                subtitle={
                  journey.starting_price_minor_units
                    ? `Published price direction: ${formatPublicMoney(
                        journey.starting_price_minor_units,
                        journey.starting_price_currency || 'UGX'
                      )}`
                    : 'Speak to Al Hilal for current pricing'
                }
                onPress={() => router.push(`/journey/${journey.slug || journey.id}` as never)}
              />
            ))
          ) : (
            <EmptyStateCard
              title="No journeys matched this month"
              body="Try another month to see more published departures."
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
  chipList: {
    gap: 10,
    paddingRight: 20,
  },
});
