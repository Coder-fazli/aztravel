'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './HeroSection.module.css'

const slides = [
  {
    id: 1,
    title: 'Enjoy exploring Azerbaijan and its nature!',
    bg: '/images/hero-slide-1.jpg',
  },
  {
    id: 2,
    title: 'Everything you search for is here, hurry up!',
    bg: '/images/hero-slide-2.jpg',
  },
  {
    id: 3,
    title: 'Azerbaijani culture, music, cuisine is waiting.',
    bg: '/images/hero-slide-3.jpg',
  },
]

export default function HeroSection() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setActive(i => (i - 1 + slides.length) % slides.length)
  const next = () => setActive(i => (i + 1) % slides.length)

  // finger swipe (mobile) — drag left = next, right = prev
  const touchX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (dx <= -50) next()
    else if (dx >= 50) prev()
    touchX.current = null
  }

  const prevBg = slides[(active - 1 + slides.length) % slides.length].bg
  const nextBg = slides[(active + 1) % slides.length].bg

  return (
    <section className={styles.hero} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* FULLSCREEN BACKGROUND */}
      <img src={slides[active].bg} alt="" className={styles.slideBg} />
      <div className={styles.slideOverlay} />

      {/* TITLE — changes per slide, positioned at Figma: x=232, y=235 */}
      <div className={styles.titleArea}>
        <h1 className={styles.title}>{slides[active].title}</h1>
      </div>

      {/* EXPLORE BUTTON — static position, Figma: x=232, y=515 */}
      <Link href="/tours" className={styles.exploreBtn}>
        <span>Explore</span>
        <img src="/images/icon-arrow-right.svg" alt="" />
      </Link>

      {/* DECORATIVE POINTER — static, Figma: x=375, y=493 */}
      <div className={styles.pointer}>
        <img src="/images/hero-pointer.svg" alt="" />
      </div>

      {/* VERTICAL INDICATORS — left side */}
      <div className={styles.verticalIndicator}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.vLine} ${i === active ? styles.activeVLine : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
        <div className={styles.vLine} />
      </div>

      {/* SCROLL DOWN */}
      <div className={styles.scrollDown}>
        <div className={styles.scrollPill}>
          <img src="/images/scroll-down.gif" alt="" />
        </div>
        <span className={styles.scrollText}>Scroll down</span>
      </div>

      {/* MOBILE watermark — "Welcome to Azerbaijan" peeks at the bottom */}
      <span className={styles.welcomeMark} aria-hidden="true">Welcome to Azerbaijan</span>

      {/* NAVIGATION ARROWS — right side */}
      <div className={styles.arrows}>
        <button className={styles.arrowBtn} onClick={prev} aria-label="Previous">
          <img src={prevBg} alt="" className={styles.arrowBg} />
          <div className={styles.arrowBgOverlay} />
          <div className={styles.arrowIcons}>
            <span className={styles.arrowIcon1}>←</span>
            <span className={styles.arrowIcon2}>←</span>
          </div>
        </button>
        <button className={styles.arrowBtn} onClick={next} aria-label="Next">
          <img src={nextBg} alt="" className={styles.arrowBg} />
          <div className={styles.arrowBgOverlay} />
          <div className={styles.arrowIcons}>
            <span className={styles.arrowIcon1}>→</span>
            <span className={styles.arrowIcon2}>→</span>
          </div>
        </button>
      </div>

    </section>
  )
}
