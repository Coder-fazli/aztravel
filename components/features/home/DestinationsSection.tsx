'use client'

import { useState } from 'react'
import CityCard from './CityCard'
import styles from './DestinationsSection.module.css'

const desc = 'Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim.'
const links = ['Link 1', 'Link 2', 'Link 13', 'Link 14']

const cities = [
  { name: 'Ganja City', image: '/images/city-ganja.jpg', desc, links, href: '/destinations/ganja' },
  { name: 'Baku City',  image: '/images/city-baku.jpg',  desc, links, href: '/destinations/baku' },
  { name: 'Shaki City', image: '/images/city-shaki.jpg', desc, links, href: '/destinations/shaki' },
]

export default function DestinationsSection() {
  const [active, setActive] = useState(0)
  const prev = () => setActive(i => (i - 1 + cities.length) % cities.length)
  const next = () => setActive(i => (i + 1) % cities.length)

  return (
    
    <section className={styles.section}>
      <div className={styles.watermark}>Places to visit</div>

      {/* HEADLINE */}
      <div className={styles.headline}>
        <h2 className={styles.title}>
          Sea, mountains, resorts and culture <b>in one place.</b> We&rsquo;ve got you covered.
        </h2>
        {/* orange curved decorative arrow — real Figma asset */}
        <img src="/images/curve-arrow.svg" alt="" className={styles.curveArrow} />
      </div>

      {/* CONTENT */}
      <div className={styles.content}>

        {/* MAP — exact Figma export (map + markers + legend) */}
        <div className={styles.mapWrap}>
          <img src="/images/azerbaijan-map-full.png" alt="Azerbaijan map" className={styles.mapImg} />
        </div>

        {/* CARD SLIDER */}
        <div className={styles.slider}>
          <div className={styles.sliderInner}>
            <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={prev} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="11 6 5 12 11 18" />
              </svg>
            </button>

            <div className={styles.sliderViewport}>
              <div className={styles.sliderTrack} style={{ transform: `translateX(-${active * 368}px)` }}>
                {cities.map(c => <CityCard key={c.name} {...c} />)}
              </div>
            </div>

            <button className={`${styles.navBtn} ${styles.navNext}`} onClick={next} aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
