import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { routing } from '@/i18n/routing'
import { connectDb } from '@/lib/db/connect'
import Tour from '@/lib/db/models/Tour'
import Blog from '@/lib/db/models/blog'

const defaultLocale = routing.defaultLocale
const altLocales    = routing.locales.filter((l) => l !== defaultLocale)

// Build a full URL. Default locale has no prefix; others get /<locale>.
function url(locale: string, path: string) {
  const prefix = locale === defaultLocale ? '' : `/${locale}`
  return `${SITE_URL}${prefix}${path}`
}

// Build the alternates block for a given path (all locales).
function alternates(path: string) {
  return Object.fromEntries(routing.locales.map((l) => [l, url(l, path)]))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDb()

  // Fetch slugs of all published tours and blog posts.
  const tours = await Tour.find({ status: 'active' }).select('slug').lean()
  const posts  = await Blog.find({ status: 'published' }).select('slug locale').lean()

  const entries: MetadataRoute.Sitemap = []

  // ── Static pages (all locales) ────────────────────────────────────────────
  const staticPaths: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '/',      priority: 1.0, freq: 'weekly'  },
    { path: '/tours', priority: 0.9, freq: 'daily'   },
    { path: '/blog',  priority: 0.8, freq: 'weekly'  },
  ]

  for (const { path, priority, freq } of staticPaths) {
    // Default locale — canonical URL has no prefix.
    entries.push({
      url: url(defaultLocale, path),
      lastModified: new Date(),
      changeFrequency: freq,
      priority,
      alternates: { languages: alternates(path) },
    })
  }

  // ── Tour detail pages ─────────────────────────────────────────────────────
  // Tours use a single slug (not locale-specific), so the same slug is served
  // under every locale prefix.
  for (const tour of tours) {
    const slug = (tour as any).slug
    if (!slug) continue
    const path = `/tours/${slug}`
    entries.push({
      url: url(defaultLocale, path),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: alternates(path) },
    })
  }

  // ── Blog post pages ───────────────────────────────────────────────────────
  // Each post belongs to one locale. Only add the URL for its own locale;
  // the hreflang alternates are emitted by generateMetadata on the post page
  // via translationGroupId, so we don't need to enumerate sibling locales here.
  for (const post of posts) {
    const p = post as any
    if (!p.slug || !p.locale) continue
    entries.push({
      url: url(p.locale, `/blog/${p.slug}`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  return entries
}
