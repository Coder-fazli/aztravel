import type { Metadata } from 'next'
import { EvisaHero } from '@/components/features/evisa/Hero'
import { EvisaStepsSection } from '@/components/features/evisa/StepsSection'
import { EvisaWorldMapSection } from '@/components/features/evisa/WorldMapSection'
import { EvisaNationalitySection } from '@/components/features/evisa/NationalitySection'
import { EvisaFAQSection } from '@/components/features/evisa/FAQSection'
import { getPublicCountries } from '@/lib/actions/evisa'

export const metadata: Metadata = {
  title: 'Azerbaijan e-Visa — Apply for Official Electronic Visa Online | AzTravel',
  description: 'Get your Azerbaijan e-Visa online in minutes. Fast electronic visa application, processing as fast as 3 hours.',
}

export default async function EvisaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const countries = await getPublicCountries()

  const displayCountries = countries.map((c: any) => ({
    name: c.name?.[locale] || c.name?.en || c.code,
    code: c.code,
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

      <div style={{ background: '#fff', padding: '48px 24px 64px', maxWidth: 860, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1a1a2e', marginBottom: 14 }}>
          Azerbaijan e-Visa — Complete Guide
        </h2>
        <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#4b5563' }}>
          Azerbaijan offers an <strong>electronic visa (e-Visa)</strong> to citizens of over 100 countries, making it easier
          than ever to visit this remarkable country at the crossroads of Europe and Asia.
        </p>
        <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#4b5563' }}>
          The entire process takes just a few minutes — fill in your personal and passport details, select your visa type,
          pay the government fee online, and receive your approved visa by email within 3 hours (urgent) or 3 business days
          (standard). Your e-Visa is valid for 90 days from the date of issue, allowing a stay of up to 30 days.
        </p>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: '20px 0 10px' }}>
          Why Visit Azerbaijan?
        </h3>
        <p style={{ lineHeight: 1.7, color: '#4b5563' }}>
          Baku, the capital, blends ultramodern architecture with a UNESCO-listed Old City. The country offers stunning
          natural landscapes — from the Caucasus mountains to the Caspian Sea coast — rich history, and a rapidly growing
          tourism infrastructure.
        </p>
      </div>
    </main>
  )
}
