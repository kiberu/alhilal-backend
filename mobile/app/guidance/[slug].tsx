import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  ArticleHeader,
  GuidanceMiniCard,
  InlineCalloutCard,
  RichTextArticleBody,
  SupportActionCard,
} from '@/components/guest/cards';
import { EmptyStateCard, LoadingScreen, SecondaryPillButton, TopBar } from '@/components/guest/primitives';
import { guestSupport } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import type { GuidanceArticleDetail, GuidanceArticleSummary } from '@/lib/api/services';
import { openExternalUrl, openWhatsAppConversation } from '@/lib/support/open-external';
import { syncPublicGuidanceArticles, syncPublicGuidanceDetail } from '@/lib/support/public-cache';

function formatDate(value: string) {
  if (!value) {
    return 'Not published';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export default function GuidanceDetailScreen() {
  const theme = useGuestTheme();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const articleSlug = typeof slug === 'string' ? slug : '';

  const [article, setArticle] = useState<GuidanceArticleDetail | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<GuidanceArticleSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const articleMeta = useMemo(() => {
    if (!article) {
      return '';
    }

    return [article.category, article.readTime, formatDate(article.publishedAt), article.authorName || 'Al Hilal Team']
      .filter(Boolean)
      .join(' · ');
  }, [article]);

  const loadArticle = useCallback(async () => {
    if (!articleSlug) {
      setError('Article not found.');
      setLoading(false);
      return;
    }

    try {
      const [articleResult, listResult] = await Promise.all([
        syncPublicGuidanceDetail(articleSlug),
        syncPublicGuidanceArticles(),
      ]);

      if (!articleResult.data) {
        throw new Error(articleResult.error || 'Unable to load this guidance article.');
      }

      setArticle(articleResult.data);
      setRelatedArticles(listResult.data.filter((item) => item.slug !== articleSlug).slice(0, 2));
      setError('');
    } catch (loadError: any) {
      setArticle(null);
      setError(loadError?.message || 'Unable to load this guidance article.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [articleSlug]);

  useEffect(() => {
    void loadArticle();
  }, [loadArticle]);

  const shareArticle = async () => {
    if (!article) {
      return;
    }

    await Share.share({
      message: `${article.title}\n${guestSupport.website}/guidance/${article.slug}`,
    });
  };

  if (loading) {
    return <LoadingScreen message="Loading article..." />;
  }

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
        <View style={[styles.emptyWrap, { paddingHorizontal: theme.spacing.pageHorizontal }]}>
          <EmptyStateCard title="Article unavailable" body={error || 'This guidance article could not be loaded right now.'} />
          <SecondaryPillButton label="Go back" icon="arrow-back-outline" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.pageHorizontal,
            paddingBottom: theme.spacing.heroGap * 2,
            gap: theme.spacing.sectionGap,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          void loadArticle();
        }} tintColor={theme.palette.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title="Guidance" subtitle="Article reader" leadingIcon="arrow-back" onLeadingPress={() => router.back()} />

        <ArticleHeader title={article.title} meta={articleMeta} imageUri={article.imageUrl} />
        <RichTextArticleBody paragraphs={article.intro} />

        <View style={styles.stack}>
          {article.sections.map((section) => (
            <View key={section.heading} style={styles.stack}>
              <InlineCalloutCard title={section.heading} body={section.paragraphs.join('\n\n')} />
              {section.checklist?.length ? (
                <InlineCalloutCard title="Checklist" body={section.checklist.map((item) => `• ${item}`).join('\n')} />
              ) : null}
            </View>
          ))}
        </View>

        <InlineCalloutCard title="Key takeaway" body={article.takeaway} />

        {relatedArticles.length ? (
          <View style={styles.stack}>
            {relatedArticles.map((related) => (
              <GuidanceMiniCard
                key={related.slug}
                title={related.title}
                date={related.readTime || related.category}
                onPress={() => router.push(`/guidance/${related.slug}` as never)}
              />
            ))}
          </View>
        ) : null}

        <SupportActionCard
          title="Need help?"
          body="If you want help after reading, Al Hilal can guide you into the right journey or booking next step."
          actions={[
            { label: 'Share', icon: 'share-social-outline', onPress: () => void shareArticle() },
            {
              label: 'WhatsApp',
              icon: 'logo-whatsapp',
              onPress: () => void openWhatsAppConversation({ phone: guestSupport.whatsapp }),
            },
            { label: 'Email', icon: 'mail-outline', onPress: () => void openExternalUrl(guestSupport.emailHref) },
          ]}
        />

        {article.sources.length ? (
          <View style={styles.stack}>
            {article.sources.map((source) => (
              <SecondaryPillButton
                key={source.url}
                label={source.label}
                icon="open-outline"
                onPress={() => void openExternalUrl(source.url)}
                fullWidth
              />
            ))}
          </View>
        ) : null}
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
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  stack: {
    gap: 12,
  },
});
