import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { EvisaHero } from '@/components/features/evisa/Hero'
import { EvisaStepsSection } from '@/components/features/evisa/StepsSection'
import { EvisaWorldMapSection } from '@/components/features/evisa/WorldMapSection'
import { EvisaNationalitySection } from '@/components/features/evisa/NationalitySection'
import { EvisaFAQSection } from '@/components/features/evisa/FAQSection'
import { EvisaBlogsSection } from '@/components/features/evisa/BlogsSection'
import { getPublicCountries } from '@/lib/actions/evisa'
import { getBlogsByCategory } from '@/lib/actions/content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'evisa.hero' })
  return {
    title: `${t('title')} | AzTravel`,
    description: t('label'),
  }
}

export default async function EvisaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [countries, tGuide, { posts: blogPosts }] = await Promise.all([
    getPublicCountries(),
    getTranslations({ locale, namespace: 'evisa.guide' }),
    getBlogsByCategory('evisa', locale as any),
  ])

  const displayCountries = countries.map((c: any) => ({
    name: c.name?.[locale] || c.name?.en || c.code,
    code: c.code,
    slug: c.slug,
    flag: c.flag,
    baseFee: c.baseFee,
  }))

  return (
    <main>
      <EvisaHero locale={locale} />
      <EvisaStepsSection />
      <EvisaWorldMapSection />
      <EvisaNationalitySection countries={displayCountries} locale={locale} />
      <EvisaFAQSection />
      <EvisaBlogsSection locale={locale} posts={blogPosts} />

      <div style={{ background: '#fff', padding: '48px 24px 64px', maxWidth: 860, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1a1a2e', marginBottom: 14 }}>
          {tGuide('title')}
        </h2>
        <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#4b5563' }}>
          {tGuide('intro1')}
        </p>
        <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#4b5563' }}>
          {tGuide('intro2')}
        </p>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: '20px 0 10px' }}>
          {tGuide('whyVisitTitle')}
        </h3>
        <p style={{ lineHeight: 1.7, color: '#4b5563' }}>
          {tGuide('whyVisitText')}
        </p>
      </div>
    </main>
  )
}
