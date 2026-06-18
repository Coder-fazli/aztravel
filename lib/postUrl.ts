import { routing } from '@/i18n/routing'

// Public URL of a blog post. Default locale (en) is served at the root
// (localePrefix: 'as-needed'); other locales get a /<locale> prefix.
export function postUrl(locale: string, slug: string) {
  return locale === routing.defaultLocale
    ? `/blog/${slug}`
    : `/${locale}/blog/${slug}`
}
