import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Porta Caspia — Coming Soon',
  description: 'Live by a Different Rhythm. Coming soon.',
  robots: { index: false, follow: false },
}

export default function ComingSoonPage() {
  return (
    <div className={styles.page}>

      {/* ── BACKGROUND ── */}
      <img
        src="/images/porta-caspia/background.png"
        alt=""
        className={styles.bg}
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
      <div className={styles.overlay} />

      {/* ── CONTENT STACK ── */}
      <div className={styles.content}>

        {/* LOGO — top */}
        <div className={styles.logoWrap}>
          <img
            src="/images/porta-caspia/logo.png"
            alt="Porta Caspia"
            className={styles.logo}
            draggable={false}
          />
        </div>

        {/* COMING SOON — center */}
        <div className={styles.textWrap}>
          <img
            src="/images/porta-caspia/coming-soon.png"
            alt="Coming Soon"
            className={styles.comingSoon}
            draggable={false}
          />
        </div>

        {/* SLOGAN — bottom */}
        <div className={styles.sloganWrap}>
          <img
            src="/images/porta-caspia/slogan.png"
            alt="Live by a Different Rhythm"
            className={styles.slogan}
            draggable={false}
          />
        </div>

      </div>
    </div>
  )
}
