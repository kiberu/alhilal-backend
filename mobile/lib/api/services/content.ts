import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

export interface PublicVideoItem {
  id?: string;
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

export interface GuidanceSection {
  heading: string;
  paragraphs: string[];
  checklist?: string[];
}

export interface GuidanceSource {
  label: string;
  url: string;
}

export interface GuidanceArticleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  featured: boolean;
  featuredOrder: number;
  imageUrl: string;
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  authorName: string;
  authorRoleLabel: string;
}

export interface GuidanceArticleDetail extends GuidanceArticleSummary {
  intro: string[];
  sections: GuidanceSection[];
  takeaway: string;
  sources: GuidanceSource[];
  keywords: string[];
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0;
}

function boolValue(value: unknown): boolean {
  return Boolean(value);
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

export function normalizeGuidanceSummary(rawValue: unknown): GuidanceArticleSummary {
  const raw = recordValue(rawValue);
  return {
    id: stringValue(raw.id) || stringValue(raw.slug),
    slug: stringValue(raw.slug),
    title: stringValue(raw.title),
    description: stringValue(raw.description),
    category: stringValue(raw.category),
    featured: boolValue(raw.featured),
    featuredOrder: numberValue(raw.featured_order ?? raw.featuredOrder),
    imageUrl: stringValue(raw.image_url ?? raw.imageUrl),
    readTime: stringValue(raw.read_time ?? raw.readTime),
    publishedAt: stringValue(raw.published_at ?? raw.publishedAt),
    updatedAt: stringValue(raw.updated_at ?? raw.updatedAt),
    authorName: stringValue(raw.author_name ?? raw.authorName),
    authorRoleLabel: stringValue(raw.author_role_label ?? raw.authorRoleLabel),
  };
}

export function normalizeGuidanceDetail(rawValue: unknown): GuidanceArticleDetail {
  const raw = recordValue(rawValue);
  const base = normalizeGuidanceSummary(raw);

  const sections = arrayValue(raw.sections).map((item) => {
    const section = recordValue(item);
    const checklist = arrayValue(section.checklist).filter((entry): entry is string => typeof entry === 'string');
    return {
      heading: stringValue(section.heading) || stringValue(section.title),
      paragraphs: arrayValue(section.paragraphs).filter((entry): entry is string => typeof entry === 'string'),
      ...(checklist.length ? { checklist } : {}),
    };
  });

  const sources = arrayValue(raw.sources).map((item) => {
    const source = recordValue(item);
    return {
      label: stringValue(source.label),
      url: stringValue(source.url),
    };
  });

  return {
    ...base,
    intro: arrayValue(raw.intro).filter((item): item is string => typeof item === 'string'),
    sections: sections.filter((section) => section.heading.length > 0),
    takeaway: stringValue(raw.takeaway),
    sources: sources.filter((source) => source.label.length > 0 && source.url.length > 0),
    keywords: arrayValue(raw.keywords).filter((item): item is string => typeof item === 'string'),
  };
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

  /**
   * Fetch public guidance article summaries.
   */
  static async getPublicGuidanceArticles(params?: {
    featured?: boolean;
    category?: string;
    limit?: number;
  }): Promise<ApiResponse<GuidanceArticleSummary[]>> {
    const response = await apiClient.get<unknown[]>(
      API_ENDPOINTS.CONTENT.GUIDANCE_LIST,
      {
        featured: typeof params?.featured === 'boolean' ? String(params.featured) : undefined,
        category: params?.category,
        limit: typeof params?.limit === 'number' ? String(params.limit) : undefined,
      }
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<GuidanceArticleSummary[]>;
    }

    return {
      ...response,
      data: response.data
        .map((item) => normalizeGuidanceSummary(item))
        .filter((item) => item.slug.length > 0),
    };
  }

  /**
   * Fetch a public guidance article detail by slug.
   */
  static async getPublicGuidanceDetail(slug: string): Promise<ApiResponse<GuidanceArticleDetail>> {
    const response = await apiClient.get<unknown>(API_ENDPOINTS.CONTENT.GUIDANCE_DETAIL(slug));
    if (!response.success || !response.data) {
      return response as ApiResponse<GuidanceArticleDetail>;
    }

    return {
      ...response,
      data: normalizeGuidanceDetail(response.data),
    };
  }
}
