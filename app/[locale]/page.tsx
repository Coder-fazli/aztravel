import HeroSection from '@/components/features/home/HeroSection'
import WelcomeSection from '@/components/features/home/WelcomeSection'
import DestinationsSection from '@/components/features/home/DestinationsSection'
import LalaSection from '@/components/features/home/LalaSection'
import ShortcutsSection from '@/components/features/home/ShortcutsSection'
import LearnMoreSection from '@/components/features/home/LearnMoreSection'
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
      </div>
    </>
  )
}
