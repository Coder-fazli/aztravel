import SectionHeadline from './SectionHeadline'
import CatalogCard from './CatalogCard'
import styles from './ThingsToDoSection.module.css'

const desc = 'Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim.'
const cards = [
  { title: 'Visit Flame Towers Landscape', desc, image: '/images/thing-1.jpg', href: '/things-to-do/1' },
  { title: 'Visit Flame Towers Landscape', desc, image: '/images/thing-2.jpg', href: '/things-to-do/2' },
  { title: 'Visit Flame Towers Landscape', desc, image: '/images/thing-3.jpg', href: '/things-to-do/3' },
  { title: 'Visit Flame Towers Landscape', desc, image: '/images/thing-4.jpg', href: '/things-to-do/4' },
  { title: 'Visit Flame Towers Landscape', desc, image: '/images/thing-5.jpg', href: '/things-to-do/5' },
]

/* Home Section 08 — "Things to do" horizontal card slider */
export default function ThingsToDoSection() {
  return (
    <section className={styles.section}>
      <div className={styles.headWrap}>
        <SectionHeadline
          watermark="Things to do"
          title="Things to do"
          subtitle="Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim."
          seeMoreHref="/things-to-do"
        />
      </div>

      {/* full-width edge-to-edge strip — square tiles, no gaps */}
      <div className={styles.slider}>
        <div className={styles.track}>
          {cards.map((c, i) => (
            <CatalogCard key={i} {...c} />
          ))}
        </div>
      </div>
    </section>
  )
}
