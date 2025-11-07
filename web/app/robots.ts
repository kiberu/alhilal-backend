import { MetadataRoute } from 'next'
import { seoConfig } from '@/lib/seo-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  }
}

