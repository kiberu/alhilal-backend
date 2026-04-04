import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  FeaturedGuidanceCard,
  FooterInfoCard,
  JourneyMiniCard,
  PartnerLogoStrip,
  SupportActionCard,
  WelcomeHeroCard,
} from '@/components/guest/cards';
import {
  EmptyStateCard,
  LoadingScreen,
  QuickActionTile,
  SecondaryPillButton,
  SectionHeader,
} from '@/components/guest/primitives';
import { AlHilalLogo } from '@/components/AlHilalLogo';
import { useAuth } from '@/contexts/auth-context';
import {
  guestContent,
  guestPartners,
  guestQuickActions,
  guestSupport,
} from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import type { GuidanceArticleSummary, PublicTrip } from '@/lib/api/services';
import { openExternalUrl, openWhatsAppConversation } from '@/lib/support/open-external';
import { syncPublicGuidanceArticles, syncPublicTrips } from '@/lib/support/public-cache';

function toGuidancePreview(articles: GuidanceArticleSummary[]) {
  return [...articles]
    .sort((left, right) => {
      if (left.featured !== right.featured) {
        return left.featured ? -1 : 1;
      }

      return (left.featuredOrder || 0) - (right.featuredOrder || 0);
    })
    .slice(0, 4);
}

export default function HomeScreen() {
  const theme = useGuestTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [journeys, setJourneys] = useState<PublicTrip[]>([]);
  const [articles, setArticles] = useState<GuidanceArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const featuredJourneys = useMemo(() => journeys.slice(0, 3), [journeys]);
  const latestGuidance = useMemo(() => toGuidancePreview(articles), [articles]);

  const loadHome = async () => {
    try {
      const [tripResult, guidanceResult] = await Promise.all([
        syncPublicTrips(),
        syncPublicGuidanceArticles(),
      ]);

      setJourneys(tripResult.data);
      setArticles(guidanceResult.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadHome();
  }, []);

  const handleQuickAction = async (target: string) => {
    if (target.startsWith('http') || target.startsWith('tel:') || target.startsWith('mailto:')) {
      await openExternalUrl(target);
      return;
    }

    router.push(target as never);
  };

  if (loading) {
    return <LoadingScreen message="Loading home..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.pageHorizontal,
            paddingTop: theme.spacing.compact,
            paddingBottom: 122,
            gap: theme.spacing.sectionGap,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          void loadHome();
        }} tintColor={theme.palette.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandHeader}>
          <View style={styles.brandStack}>
            {theme.colorScheme === 'dark' ? (
              <Image
                source={require('@/assets/brand/al-hilal-light-logo.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            ) : (
              <AlHilalLogo
                width={138}
                height={28}
                wordmarkColor={theme.palette.text}
              />
            )}
          </View>
          {!isAuthenticated ? (
            <SecondaryPillButton
              label="Pilgrim Access"
              icon="log-in-outline"
              onPress={() => router.push('/pilgrim-access' as never)}
            />
          ) : null}
        </View>

        <WelcomeHeroCard
          eyebrow={guestContent.home.greeting}
          title={guestContent.home.title}
          subtitle={guestContent.home.subtitle}
          buttonLabel={guestContent.home.primaryCta}
          onPress={() => router.push('/(tabs)/journeys' as never)}
        />

        <View style={styles.section}>
          <SectionHeader title="Featured journeys" actionLabel="View all" onActionPress={() => router.push('/(tabs)/journeys' as never)} />
          {featuredJourneys.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {featuredJourneys.map((journey) => (
                <JourneyMiniCard
                  key={journey.id || journey.slug}
                  journey={journey}
                  onPress={() => router.push(`/journey/${journey.slug || journey.id}` as never)}
                />
              ))}
            </ScrollView>
          ) : (
            <EmptyStateCard title="No journeys available" body="Published departures will appear here as soon as they are available on this device." />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Latest guidance" actionLabel="View all" onActionPress={() => router.push('/(tabs)/guidance' as never)} />
          <View style={styles.stack}>
            {latestGuidance.length ? (
              latestGuidance.slice(0, 2).map((article) => (
                <FeaturedGuidanceCard
                  key={article.slug}
                  article={article}
                  onPress={() => router.push(`/guidance/${article.slug}` as never)}
                />
              ))
            ) : (
              <EmptyStateCard title="No guidance yet" body="Guidance articles will appear here when published content is available." />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick actions" />
          <View style={styles.quickGrid}>
            {guestQuickActions.map((action) => (
              <QuickActionTile
                key={action.label}
                icon={action.icon}
                label={action.label}
                onPress={() => void handleQuickAction(action.target)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Trusted partners" />
          <PartnerLogoStrip logos={guestPartners} />
        </View>

        <FooterInfoCard
          title="About Al Hilal"
          body="Al Hilal helps Muslim pilgrims move from first question to structured, worship-first sacred travel with clearer communication and accountable support."
          linkLabel="Read more"
          onPress={() => router.push('/about' as never)}
        />

        <SupportActionCard
          title="Contact Al Hilal"
          body={`${guestSupport.phone}\n${guestSupport.email}\n${guestSupport.address}`}
          actions={[
            {
              label: 'WhatsApp',
              icon: 'logo-whatsapp',
              onPress: () => void openWhatsAppConversation({ phone: guestSupport.whatsapp }),
            },
            { label: 'Call', icon: 'call-outline', onPress: () => void openExternalUrl(guestSupport.phoneHref) },
            { label: 'Email', icon: 'mail-outline', onPress: () => void openExternalUrl(guestSupport.emailHref) },
          ]}
        />

        <Text style={[styles.copyright, { color: theme.palette.mutedText }]}>
          Al Hilal Travels Uganda
        </Text>
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
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandStack: {
    flex: 1,
    minWidth: 0,
  },
  brandLogo: {
    width: 138,
    height: 28,
  },
  section: {
    gap: 12,
  },
  horizontalList: {
    gap: 14,
    paddingRight: 20,
  },
  stack: {
    gap: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
});
