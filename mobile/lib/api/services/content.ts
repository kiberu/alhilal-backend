import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

export interface PublicVideoItem {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string | null;
  channelTitle: string;
  thumbnailUrl: string | null;
  youtubeUrl: string;
}

export interface PublicVideoFeed {
  items: PublicVideoItem[];
  syncedAt: string | null;
  sourceType: string;
}

export class ContentService {
  /**
   * Fetch public lesson videos sourced from the configured YouTube feed.
   */
  static getPublicVideos(forceRefresh = false): Promise<ApiResponse<PublicVideoFeed>> {
    return apiClient.get<PublicVideoFeed>(
      API_ENDPOINTS.CONTENT.VIDEOS,
      forceRefresh ? { refresh: true } : undefined
    );
  }
}
