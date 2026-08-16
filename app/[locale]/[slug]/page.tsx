import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RichContent from '@/components/blog/RichContent'
import { getPageBySlug, getPageTranslations } from '@/lib/actions/pages'
import { SITE_URL } from '@/lib/site'
import styles from '../legal.module.css'

// Catch-all for admin-managed static content pages (Terms, Privacy, etc.)
// under app/admin/pages. Next.js only falls through to this dynamic segment
// when nothing else at this level matches (/apply, /tours, /blog, ...), so
// it can't shadow any existing route.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const loc = (['en', 'es', 'ar'].includes(locale) ? locale : 'en') as 'en' | 'es' | 'ar'
  const page = await getPageBySlug(slug, loc)
  if (!page) return {}

  const siblings = await getPageTranslations(page.translationGroupId)
  const languages = Object.fromEntries(
    siblings.map((s: any) => [s.locale, `${SITE_URL}/${s.locale}/${s.slug}`])
  )

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    robots: (page.noindex || page.nofollow) ? {
      index:  !page.noindex,
      follow: !page.nofollow,
    } : undefined,
    alternates: {
      canonical: page.canonicalUrl || `${SITE_URL}/${locale}/${slug}`,
      languages,
    },
  }
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loc = (['en', 'es', 'ar'].includes(locale) ? locale : 'en') as 'en' | 'es' | 'ar'

  const page = await getPageBySlug(slug, loc)
  if (!page) notFound()

  const dir = loc === 'ar' ? 'rtl' : 'ltr'

  return (
    <div className={styles.page} dir={dir}>
      <h1 className={styles.title}>{page.title}</h1>
      <RichContent doc={page.content} className={styles.body} />
    </div>
  )
}
