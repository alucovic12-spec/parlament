import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { getSiteUrl } from '@/lib/site'

/** Preview and development deployments must never be indexed; only production is open to crawlers. */
const isIndexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production'

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) return { rules: { userAgent: '*', disallow: '/' } }

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/auth/', '/brand', '/en/brand'] },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: getSiteUrl(),
  }
}
