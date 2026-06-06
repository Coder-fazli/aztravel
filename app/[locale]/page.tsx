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
import styles from './page.module.css'

export default function HomePage() {
  return (
    <>
      {/* HERO — fixed on mobile, content scrolls over it */}
      <HeroSection />

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
