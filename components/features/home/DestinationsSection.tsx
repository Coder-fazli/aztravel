'use client'

import { useState } from 'react'
import CityCard from './CityCard'
import styles from './DestinationsSection.module.css'

const cities = [
  {
    name: 'Ganja City',
    image: '/images/city-ganja.jpg',
    desc: "Azerbaijan's second city carries centuries of Silk Road history. Explore the Bottle House, the Javadkhan mausoleum, and the lively central bazaar.",
    links: ['Ganja Day Trip', 'Bottle House', 'Nizami Street', 'Javadkhan Tomb'],
    href: '/destinations/ganja',
  },
  {
    name: 'Baku City',
    image: '/images/city-baku.jpg',
    desc: "Azerbaijan's capital blends medieval fortress walls with flame-shaped skyscrapers. Walk the Old City, visit the Heydar Aliyev Centre, and dine by the Caspian — all within one afternoon.",
    links: ['Baku City Tour', 'Old City', 'Flame Towers', 'Heydar Aliyev Centre'],
    href: '/destinations/baku',
  },
  {
    name: 'Shaki City',
    image: '/images/city-shaki.jpg',
    desc: "Nestled in forested foothills, Shaki is known for its ornate Khan's Palace, silk workshops, and the finest piti stew in the country.",
    links: ['Shaki City Tour', "Khan's Palace", 'Silk Road Trail', 'Sheki Bazaar'],
    href: '/destinations/shaki',
  },
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
          Sea, mountains, history and modern life — <b>all in one country.</b>
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
