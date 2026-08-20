'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './HeroSection.module.css'

// each field already resolved to the current locale by the page
export type HeroSlide = {
  imageDesktop: string
  imageMobile:  string
  title:        string
  buttonText:   string
  buttonLink:   string
}

const FALLBACK: HeroSlide[] = [
  { imageDesktop: '/images/hero-slide-1.jpg', imageMobile: '/images/hero-slide-1.jpg', title: 'Enjoy exploring Azerbaijan and its nature!', buttonText: 'Explore', buttonLink: '/tours' },
  { imageDesktop: '/images/hero-slide-2.jpg', imageMobile: '/images/hero-slide-2.jpg', title: 'Everything you search for is here, hurry up!', buttonText: 'Explore', buttonLink: '/tours' },
  { imageDesktop: '/images/hero-slide-3.jpg', imageMobile: '/images/hero-slide-3.jpg', title: 'Azerbaijani culture, music, cuisine is waiting.', buttonText: 'Explore', buttonLink: '/tours' },
]

export default function HeroSection({ slides: input }: { slides?: HeroSlide[] }) {
  const slides = input && input.length ? input : FALLBACK
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

  const prevBg = slides[(active - 1 + slides.length) % slides.length].imageDesktop
  const nextBg = slides[(active + 1) % slides.length].imageDesktop

  return (
    <section className={styles.hero} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* FULLSCREEN BACKGROUND — desktop vs mobile served via <picture> */}
      <picture>
        {slides[active].imageMobile && (
          <source media="(max-width: 900px)" srcSet={slides[active].imageMobile} />
        )}
        <img
          src={slides[active].imageDesktop}
          alt=""
          className={styles.slideBg}
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
      </picture>
      <div className={styles.slideOverlay} />

      {/* TITLE + BUTTON — grouped so mobile can flex-stack them with a gap
          instead of colliding when a title wraps to more lines than usual */}
      <div className={styles.mobileStack}>
        {/* TITLE — changes per slide, positioned at Figma: x=232, y=235 */}
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{slides[active].title}</h1>
        </div>

        {/* EXPLORE BUTTON — per-slide text + link, opens in a new tab */}
        {slides[active].buttonText && (
          <a
            href={slides[active].buttonLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.exploreBtn}
          >
            <span>{slides[active].buttonText}</span>
            <img src="/images/icon-arrow-right.svg" alt="" />
          </a>
        )}
      </div>

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
          <img src={prevBg} alt="" className={styles.arrowBg} loading="lazy" decoding="async" />
          <div className={styles.arrowBgOverlay} />
          <div className={styles.arrowIcons}>
            <span className={styles.arrowIcon1}>←</span>
            <span className={styles.arrowIcon2}>←</span>
          </div>
        </button>
        <button className={styles.arrowBtn} onClick={next} aria-label="Next">
          <img src={nextBg} alt="" className={styles.arrowBg} loading="lazy" decoding="async" />
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
