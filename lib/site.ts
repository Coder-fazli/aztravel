// Central SEO/indexing config.
// While the site is a work-in-progress we keep it OUT of search engines.
// Flip NEXT_PUBLIC_SITE_INDEXABLE=true (and set NEXT_PUBLIC_SITE_URL) when
// the site is ready to be indexed.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Defaults to false → noindex everywhere unless explicitly enabled.
export const SITE_INDEXABLE = process.env.NEXT_PUBLIC_SITE_INDEXABLE === 'true'
