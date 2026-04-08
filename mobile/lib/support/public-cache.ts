import {
  ContentService,
  TripsService,
  type GuidanceArticleDetail,
  type GuidanceArticleSummary,
  normalizeGuidanceDetail,
  normalizeGuidanceSummary,
  type PublicVideoItem,
  normalizePublicTrip,
  normalizePublicTripDetail,
  type PublicTrip,
  type PublicTripDetail,
} from '@/lib/api/services';
import {
  getGuestFallbackGuidanceArticleBySlug,
  getGuestFallbackGuidanceSummaries,
} from '@/lib/guest/guidance-fallback';
import { readCollection, readSingleton, syncCollection, syncSingleton, type CachedResult } from '@/lib/storage';

function requireData<T>(response: { success: boolean; data?: T; error?: string }) {
  if (!response.success || response.data === undefined) {
    throw new Error(response.error || 'Request failed');
  }
  return response.data;
}

export type PublicSyncResult = {
  source: CachedResult<unknown>['source'] | 'fallback';
  error: string | null;
};

export function buildPublicFallbackNotice(results: PublicSyncResult[]): string {
  const sources = results.map((result) => result.source);
  const hasBundledFallback = sources.includes('fallback');
  const hasCacheFallback = sources.includes('cache');
  const hasNetworkGap = sources.includes('cache') || sources.includes('empty');
  const hasNoCachedData = results.every((result) => result.source === 'empty');
  const firstError = results.find((result) => Boolean(result.error))?.error || '';

  if (hasBundledFallback) {
    return 'Live guidance is unavailable right now. Showing bundled Al Hilal guidance in the meantime.';
  }

  if (!hasNetworkGap) {
    return '';
  }

  if (hasCacheFallback) {
    return 'Connection is limited. Showing the last synced data from this device.';
  }

  if (hasNoCachedData) {
    if (firstError) {
      return `${firstError} No public data has been cached on this device yet.`;
    }
    return 'No connection yet and no cached public data is available on this device.';
  }

  return firstError || 'Some sections are unavailable until connection returns.';
}

export async function syncPublicTrips() {
  const result = await syncCollection('public_trips', async () => {
    const payload = requireData(await TripsService.getPublicTrips());
    return payload.results || [];
  });
  return {
    ...result,
    data: result.data.map((item) => normalizePublicTrip(item)),
  };
}

export async function readCachedPublicTrips() {
  const cached = await readCollection<PublicTrip>('public_trips');
  return cached.map((item) => normalizePublicTrip(item));
}

export async function syncPublicTripDetail(tripIdentifier: string) {
  const result = await syncSingleton(
    'public_trip_detail',
    async () => requireData(await TripsService.getPublicTripDetail(tripIdentifier)),
    tripIdentifier
  );
  return {
    ...result,
    data: result.data ? normalizePublicTripDetail(result.data) : null,
  };
}

export async function readCachedPublicTripDetail(tripIdentifier: string) {
  const cached = await readSingleton<PublicTripDetail>('public_trip_detail', tripIdentifier);
  return cached ? normalizePublicTripDetail(cached) : null;
}

export async function syncPublicGuidanceArticles() {
  const result = await syncCollection('public_guidance_articles', async () => {
    const payload = requireData(await ContentService.getPublicGuidanceArticles());
    if (!payload.length) {
      throw new Error('Published guidance is unavailable right now.');
    }

    return payload;
  });
  const normalizedData = result.data.map((item) => normalizeGuidanceSummary(item));

  if (normalizedData.length) {
    return {
      ...result,
      data: normalizedData,
    };
  }

  return {
    ...result,
    source: 'fallback' as const,
    data: getGuestFallbackGuidanceSummaries(),
    error: result.error || 'Published guidance is unavailable right now.',
  };
}

export async function readCachedPublicGuidanceArticles() {
  const cached = await readCollection<GuidanceArticleSummary>('public_guidance_articles');
  return cached.map((item) => normalizeGuidanceSummary(item));
}

export async function syncPublicGuidanceDetail(slug: string) {
  const result = await syncSingleton(
    'public_guidance_detail',
    async () => requireData(await ContentService.getPublicGuidanceDetail(slug)),
    slug
  );
  const normalizedDetail = result.data ? normalizeGuidanceDetail(result.data) : null;

  if (normalizedDetail) {
    return {
      ...result,
      data: normalizedDetail,
    };
  }

  const fallbackArticle = getGuestFallbackGuidanceArticleBySlug(slug);
  return {
    ...result,
    source: fallbackArticle ? ('fallback' as const) : result.source,
    data: fallbackArticle,
    error: fallbackArticle ? result.error || 'Published guidance is unavailable right now.' : result.error,
  };
}

export async function readCachedPublicGuidanceDetail(slug: string) {
  const cached = await readSingleton<GuidanceArticleDetail>('public_guidance_detail', slug);
  return cached ? normalizeGuidanceDetail(cached) : null;
}

export async function syncPublicVideos(forceRefresh = false) {
  return syncCollection('public_videos', async () => {
    const payload = requireData(await ContentService.getPublicVideos(forceRefresh));
    return (payload.items || []).map((item) => ({
      ...item,
      id: item.videoId,
    }));
  });
}

export async function readCachedPublicVideos() {
  return readCollection<PublicVideoItem>('public_videos');
}
