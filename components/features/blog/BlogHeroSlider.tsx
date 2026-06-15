'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './BlogHeroSlider.module.css'

const DESC =
  'Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim. Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim.'

const slides = [
  { title: 'Enjoy exploring Azerbaijan and its nature!', image: '/images/blog/slide-1.jpg' },
  { title: 'Everything you search for is here, hurry up!', image: '/images/blog/slide-2.jpg' },
  { title: 'Azerbaijani culture, music, cuisine is waiting.', image: '/images/blog/slide-3.jpg' },
]

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none' }}>
      <polyline points="13 9 20 16 13 23" />
    </svg>
  )
}

export default function BlogHeroSlider() {
  const [index, setIndex] = useState(0)
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const next = () => setIndex((i) => (i + 1) % slides.length)

  // touch swipe (mobile has no arrows)
  const [touchX, setTouchX] = useState<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return
    const dx = e.changedTouches[0].clientX - touchX
    if (dx > 50) prev()
    else if (dx < -50) next()
    setTouchX(null)
  }

  return (
    <section className={styles.section}>
      <div className={styles.viewport} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          className={styles.track}
          style={{ ['--i' as string]: index } as React.CSSProperties}
        >
          {slides.map((s, i) => (
            <article className={styles.slide} key={i}>
              <img src={s.image} alt="" className={styles.bg} />
              <span className={styles.shade} />
              <div className={styles.content}>
                <div className={styles.texts}>
                  <h1 className={styles.title}>{s.title}</h1>
                  <p className={styles.desc}>{DESC}</p>
                </div>
                <Link href="/blog" className={styles.btn}>
                  View blog
                  <span className={styles.btnArrow}><ArrowRight /></span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* prev / next round buttons */}
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navBtn}
            style={{ backgroundImage: 'url(/images/blog/nav-prev.jpg)' }}
            onClick={prev}
            aria-label="Previous slide"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            style={{ backgroundImage: 'url(/images/blog/nav-next.jpg)' }}
            onClick={next}
            aria-label="Next slide"
          >
            <Chevron dir="right" />
          </button>
        </div>

        {/* progress indicator */}
        <div className={styles.indicator}>
          {slides.map((_, i) => (
            <span key={i} className={i === index ? styles.barActive : styles.bar} />
          ))}
        </div>
      </div>
    </section>
  )
}
