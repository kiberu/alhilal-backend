import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { FeaturedGuidanceCard, GuidanceArticleCard, SupportActionCard } from '@/components/guest/cards';
import { EmptyStateCard, LoadingScreen, SearchInput, SectionHeader, TopBar } from '@/components/guest/primitives';
import { guestContent, guestFeatureFlags } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import type { GuidanceArticleSummary } from '@/lib/api/services';
import { syncPublicGuidanceArticles } from '@/lib/support/public-cache';

export default function GuidanceScreen() {
  const theme = useGuestTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [articles, setArticles] = useState<GuidanceArticleSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const sliderCardWidth = width - theme.spacing.pageHorizontal * 2;

  const featuredArticles = useMemo(() => articles.filter((article) => article.featured), [articles]);
  const filteredArticles = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const list = normalizedQuery
      ? articles.filter((article) =>
          [article.title, article.description, article.category, article.authorName]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)
        )
      : articles;

    return [...list].sort((left, right) => {
      if (left.featured !== right.featured) {
        return left.featured ? -1 : 1;
      }

      return new Date(right.publishedAt || right.updatedAt).getTime() - new Date(left.publishedAt || left.updatedAt).getTime();
    });
  }, [articles, searchTerm]);
  const sliderArticles = useMemo(() => {
    const preferred = featuredArticles.length ? featuredArticles : filteredArticles;
    return preferred.slice(0, 3);
  }, [featuredArticles, filteredArticles]);

  const loadGuidance = async () => {
    try {
      const result = await syncPublicGuidanceArticles();
      setArticles(result.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadGuidance();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading guidance..." />;
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          void loadGuidance();
        }} tintColor={theme.palette.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title={guestContent.guidance.title} subtitle={guestContent.guidance.introBody} />

        <SearchInput placeholder="Search guidance" value={searchTerm} onChangeText={setSearchTerm} />

        {guestFeatureFlags.featuredGuidanceCarousel && sliderArticles.length ? (
          <View style={styles.section}>
            <SectionHeader title="Featured guidance" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              decelerationRate="fast"
              snapToInterval={sliderCardWidth + 14}
              snapToAlignment="start"
            >
              {sliderArticles.map((article) => (
                <FeaturedGuidanceCard
                  key={article.slug}
                  article={article}
                  width={sliderCardWidth}
                  onPress={() => router.push(`/guidance/${article.slug}` as never)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Latest guidance" />
          {filteredArticles.length ? (
            filteredArticles.map((article) => (
              <GuidanceArticleCard
                key={article.slug}
                article={article}
                onPress={() => router.push(`/guidance/${article.slug}` as never)}
              />
            ))
          ) : (
            <EmptyStateCard
              title="No guidance matched your search"
              body="Try a broader search term or clear the query to see all published guidance articles."
            />
          )}
        </View>

        <SupportActionCard
          title="Need help after reading?"
          body="If an article raises a question about dates, booking, or household fit, Al Hilal can help you move into the right next step."
          actions={[
            { label: 'Contact Us', icon: 'call-outline', onPress: () => router.push('/contact' as never) },
            { label: 'WhatsApp', icon: 'logo-whatsapp', onPress: () => router.push('/contact' as never) },
          ]}
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
  horizontalList: {
    gap: 14,
    paddingRight: 20,
  },
});
