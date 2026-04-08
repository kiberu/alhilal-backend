import { guidanceArticles, type Guide } from '../data/site'
import { appEnv } from './env'

export type PublicGuidanceSection = {
  heading: string
  paragraphs: string[]
  checklist?: string[]
}

export type PublicGuidanceSource = {
  label: string
  url: string
}

export type PublicGuidanceArticle = {
  id: string
  slug: string
  title: string
  description: string
  category: string
  featured: boolean
  featuredOrder: number
  imageUrl: string
  readTime: string
  publishedAt: string
  updatedAt: string
  authorName: string
  authorRole: string
  intro: string[]
  sections: PublicGuidanceSection[]
  takeaway: string
  sources: PublicGuidanceSource[]
  keywords: string[]
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0
}

function booleanValue(value: unknown): boolean {
  return Boolean(value)
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function normalizeGuideFallback(item: Guide, index: number): PublicGuidanceArticle {
  return {
    id: item.slug,
    slug: item.slug,
    title: item.title,
    description: item.description,
    category: item.category,
    featured: index < 3,
    featuredOrder: index < 3 ? index + 1 : 0,
    imageUrl: item.image,
    readTime: item.readTime,
    publishedAt: item.publishedAt,
    updatedAt: item.updatedAt,
    authorName: item.author,
    authorRole: item.authorRole,
    intro: item.intro,
    sections: item.sections,
    takeaway: item.takeaway,
    sources: item.sources,
    keywords: item.keywords,
  }
}

export function getFallbackPublicGuidanceArticles(): PublicGuidanceArticle[] {
  return guidanceArticles.map((item, index) => normalizeGuideFallback(item, index))
}

export function normalizeGuidanceArticle(rawValue: unknown): PublicGuidanceArticle {
  const raw = recordValue(rawValue)
  const normalizedSections = arrayValue(raw.sections).map((sectionValue) => {
    const section = recordValue(sectionValue)
    return {
      heading: stringValue(section.heading) || stringValue(section.title),
      paragraphs: arrayValue(section.paragraphs).filter((item): item is string => typeof item === 'string'),
      checklist: arrayValue(section.checklist).filter((item): item is string => typeof item === 'string'),
    }
  })

  const normalizedSources = arrayValue(raw.sources).map((sourceValue) => {
    const source = recordValue(sourceValue)
    return {
      label: stringValue(source.label),
      url: stringValue(source.url),
    }
  })

  return {
    id: stringValue(raw.id) || stringValue(raw.slug),
    slug: stringValue(raw.slug),
    title: stringValue(raw.title),
    description: stringValue(raw.description),
    category: stringValue(raw.category),
    featured: booleanValue(raw.featured),
    featuredOrder: numberValue(raw.featured_order ?? raw.featuredOrder),
    imageUrl: stringValue(raw.image_url ?? raw.imageUrl),
    readTime: stringValue(raw.read_time ?? raw.readTime),
    publishedAt: stringValue(raw.published_at ?? raw.publishedAt),
    updatedAt: stringValue(raw.updated_at ?? raw.updatedAt),
    authorName: stringValue(raw.author_name ?? raw.authorName),
    authorRole: stringValue(raw.author_role_label ?? raw.authorRoleLabel),
    intro: arrayValue(raw.intro).filter((item): item is string => typeof item === 'string'),
    sections: normalizedSections.filter((section) => section.heading.length > 0),
    takeaway: stringValue(raw.takeaway),
    sources: normalizedSources.filter((source) => source.label.length > 0 && source.url.length > 0),
    keywords: arrayValue(raw.keywords).filter((item): item is string => typeof item === 'string'),
  }
}

function getApiBaseUrl(): string {
  return appEnv.apiBaseUrl
}

async function fetchPublicApi(path: string): Promise<unknown | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path.replace(/^\//, '')}`)
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch {
    return null
  }
}

function applyGuidanceFilters(
  items: PublicGuidanceArticle[],
  options: { featured?: boolean; category?: string; limit?: number }
): PublicGuidanceArticle[] {
  let filtered = [...items]
  if (typeof options.featured === 'boolean') {
    filtered = filtered.filter((item) => item.featured === options.featured)
  }
  if (options.category && options.category.trim()) {
    const category = options.category.trim().toLowerCase()
    filtered = filtered.filter((item) => item.category.toLowerCase() === category)
  }
  if (typeof options.limit === 'number' && options.limit > 0) {
    filtered = filtered.slice(0, options.limit)
  }
  return filtered
}

export async function getPublicGuidanceArticles(options: {
  featured?: boolean
  category?: string
  limit?: number
} = {}): Promise<PublicGuidanceArticle[]> {
  const params = new URLSearchParams()
  if (typeof options.featured === 'boolean') {
    params.set('featured', options.featured ? 'true' : 'false')
  }
  if (options.category && options.category.trim()) {
    params.set('category', options.category.trim())
  }
  if (typeof options.limit === 'number' && options.limit > 0) {
    params.set('limit', String(options.limit))
  }

  const query = params.toString()
  const payload = await fetchPublicApi(`public/guidance/${query ? `?${query}` : ''}`)
  const results = Array.isArray(payload) ? payload : []

  if (!results.length) {
    return applyGuidanceFilters(getFallbackPublicGuidanceArticles(), options)
  }

  return results.map((item) => normalizeGuidanceArticle(item)).filter((item) => item.slug.length > 0)
}

export async function getPublicGuidanceArticleBySlug(slug: string): Promise<PublicGuidanceArticle | null> {
  if (!slug) {
    return null
  }

  const payload = await fetchPublicApi(`public/guidance/${slug}/`)
  if (payload) {
    const normalized = normalizeGuidanceArticle(payload)
    return normalized.slug ? normalized : null
  }

  return getFallbackPublicGuidanceArticles().find((item) => item.slug === slug) || null
}

export function formatGuidanceDate(value: string): string {
  if (!value) {
    return 'Not published'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-UG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}
