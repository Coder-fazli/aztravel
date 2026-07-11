import SectionHeadline from './SectionHeadline'
import DestinationCard from './DestinationCard'
import styles from './TopDestinationsSection.module.css'

const cards = [
  { title: 'Best photography spots in Azerbaijan',     image: '/images/dest-1.jpg', href: '/destinations/photography' },
  { title: 'Camping & eco retreats in the mountains', image: '/images/dest-2.jpg', href: '/destinations/camping' },
  { title: 'Historical monuments & UNESCO sites',     image: '/images/dest-3.jpg', href: '/destinations/historical' },
  { title: 'Thermal spas & wellness escapes',         image: '/images/dest-4.jpg', href: '/destinations/resting' },
]

/* Home Section 06 — "Top destinations" horizontal card slider */
export default function TopDestinationsSection() {
  return (
    <section className={styles.section}>
      <SectionHeadline
        title="Top destinations"
        subtitle="The places in Azerbaijan that keep travellers coming back — from Caspian shores to ancient temples deep in the mountains."
        seeMoreHref="/destinations"
      />

      <div className={styles.slider}>
        <div className={styles.track}>
          {cards.map((c, i) => (
            <DestinationCard key={i} {...c} />
          ))}
        </div>
      </div>
    </section>
  )
}
