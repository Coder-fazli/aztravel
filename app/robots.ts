import type { MetadataRoute } from 'next'
import { SITE_URL, SITE_INDEXABLE } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  // Work-in-progress: block ALL crawlers until the site is ready.
  if (!SITE_INDEXABLE) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  // Live: allow crawling, keep private/internal routes out.
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
