import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { BorderRadius, Colors, Shadow, Spacing, Typography } from '@/constants/theme';
import { ContentService, type PublicVideoFeed, type PublicVideoItem } from '@/lib/api/services/content';

export default function LessonsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [feed, setFeed] = useState<PublicVideoFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadVideos = useCallback(async (forceRefresh = false) => {
    try {
      setError('');
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await ContentService.getPublicVideos(forceRefresh);
      if (response.success && response.data) {
        setFeed(response.data);
      } else {
        setError(response.error || 'Unable to load lesson videos right now.');
      }
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to load lesson videos right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  const handleOpenVideo = async (video: PublicVideoItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await WebBrowser.openBrowserAsync(video.youtubeUrl);
  };

  const formatPublishedAt = (value: string | null) => {
    if (!value) {
      return 'Recently added';
    }

    try {
      return new Intl.DateTimeFormat('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value));
    } catch {
      return 'Recently added';
    }
  };

  const formatSyncedAt = (value: string | null | undefined) => {
    if (!value) {
      return 'Waiting for the first channel sync';
    }

    try {
      return `Synced ${new Intl.DateTimeFormat('en-UG', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(value))}`;
    } catch {
      return 'Channel sync available';
    }
  };

  if (loading && !feed) {
    return (
      <SafeAreaView style={[styles.loadingScreen, { backgroundColor: colors.background }]} edges={['top']}>
        <LinearGradient colors={[colors.primary, '#A8024E']} style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingTitle}>Loading lesson videos</Text>
          <Text style={styles.loadingText}>
            Fetching the latest lessons from Al Hilal&apos;s YouTube feed.
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadVideos(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Umrah Lessons</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
              Stream official guidance without downloading large files.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => void loadVideos(true)}
            activeOpacity={0.7}
            style={[styles.refreshButton, { backgroundColor: colors.muted }]}
          >
            <Ionicons name="refresh" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.syncCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <LinearGradient colors={[colors.primary, '#A8024E']} style={styles.syncGradient}>
            <View style={styles.syncRow}>
              <View style={styles.syncInfo}>
                <Text style={styles.syncTitle}>Channel Sync</Text>
                <Text style={styles.syncSubtitle}>{formatSyncedAt(feed?.syncedAt)}</Text>
              </View>
              <View style={styles.syncBadge}>
                <Text style={styles.syncBadgeText}>{feed?.items.length || 0} videos</Text>
              </View>
            </View>
            <Text style={styles.syncDescription}>
              Videos open in YouTube so pilgrims can keep streaming with familiar controls while we avoid hosting heavy media in-app.
            </Text>
          </LinearGradient>
        </View>

        {error ? (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: colorScheme === 'dark' ? '#4C1D1D' : '#FEE2E2',
                borderLeftColor: colors.error,
              },
            ]}
          >
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={[styles.errorBannerText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.videoSection}>
          {(feed?.items || []).map((video) => (
            <TouchableOpacity
              key={video.videoId}
              style={[styles.videoCard, { backgroundColor: colors.card }, Shadow.small]}
              activeOpacity={0.9}
              onPress={() => void handleOpenVideo(video)}
            >
              <View style={styles.thumbnailWrapper}>
                {video.thumbnailUrl ? (
                  <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumbnailFallback, { backgroundColor: colors.muted }]}>
                    <Ionicons name="logo-youtube" size={28} color={colors.primary} />
                  </View>
                )}
                <View style={styles.playBadge}>
                  <Ionicons name="play" size={14} color="#fff" />
                </View>
              </View>
              <View style={styles.videoBody}>
                <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                  {video.title}
                </Text>
                <Text style={[styles.videoMeta, { color: colors.mutedForeground }]}>
                  {video.channelTitle || 'Al Hilal Travels'} · {formatPublishedAt(video.publishedAt)}
                </Text>
                <Text style={[styles.videoDescription, { color: colors.mutedForeground }]} numberOfLines={3}>
                  {video.description || 'Open this lesson to continue learning on YouTube.'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {feed && feed.items.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }, Shadow.small]}>
              <Ionicons name="videocam-outline" size={28} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No videos published yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Once the YouTube channel or playlist is configured in admin settings, videos will appear here automatically.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  loadingCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingTitle: {
    color: '#fff',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  headerSubtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  syncGradient: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    color: '#fff',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  syncSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  syncBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  syncBadgeText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  syncDescription: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderLeftWidth: 4,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  videoSection: {
    gap: Spacing.md,
  },
  videoCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  thumbnailWrapper: {
    position: 'relative',
    height: 190,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBody: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  videoTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
  },
  videoMeta: {
    fontSize: Typography.fontSize.sm,
  },
  videoDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  emptyState: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
