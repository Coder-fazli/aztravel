import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { routing } from '@/i18n/routing'

// Public, indexable paths (relative to locale root). Add entries as pages ship.
const paths = ['']

// Non-default locales get a prefix (localePrefix: 'as-needed'); the default
// locale (en) is served at the root with no prefix.
const altLocales = routing.locales.filter((l) => l !== routing.defaultLocale)

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        altLocales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
      ),
    },
  }))
}
