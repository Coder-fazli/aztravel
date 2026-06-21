import HeroSection from '@/components/features/home/HeroSection'
import WelcomeSection from '@/components/features/home/WelcomeSection'
import DestinationsSection from '@/components/features/home/DestinationsSection'
import LalaSection from '@/components/features/home/LalaSection'
import ShortcutsSection from '@/components/features/home/ShortcutsSection'
import LearnMoreSection from '@/components/features/home/LearnMoreSection'
import VisaSection from '@/components/features/home/VisaSection'
import TopDestinationsSection from '@/components/features/home/TopDestinationsSection'
import EventsSection from '@/components/features/home/EventsSection'
import ThingsToDoSection from '@/components/features/home/ThingsToDoSection'
import FaqSection from '@/components/features/home/FaqSection'
import GetInTouchSection from '@/components/features/home/GetInTouchSection'
import { getSettings } from '@/lib/actions/settings'
import type { Metadata } from 'next'
import styles from './page.module.css'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const s = await getSettings()
  return {
    title: s?.metaTitle?.[locale] || 'AzTravel — Discover Azerbaijan',
    description:
      s?.metaDescription?.[locale] ||
      'Discover Azerbaijan — tours, destinations, e-visa and travel guides.',
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const s = await getSettings()

  // resolve each slide's per-language text down to the active locale
  const heroSlides = (Array.isArray(s?.heroSlides) ? s.heroSlides : []).map((sl: any) => ({
    image: sl.image || '',
    title: sl.title?.[locale] || '',
    buttonText: sl.buttonText?.[locale] || '',
    buttonLink: sl.buttonLink?.[locale] || '',
  }))

  return (
    <>
      {/* HERO — fixed on mobile, content scrolls over it */}
      <HeroSection slides={heroSlides} />

      {/* SCROLLING CONTENT PANEL — slides up over the hero on mobile */}
      <div className={styles.scrollContent}>
        <WelcomeSection />
        <DestinationsSection />
        <LalaSection />
        <ShortcutsSection />
        <LearnMoreSection />
        <VisaSection />
        <TopDestinationsSection />
        <EventsSection />
        <ThingsToDoSection />
        <FaqSection />
        <GetInTouchSection />
      </div>
    </>
  )
}
