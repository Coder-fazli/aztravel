import SectionHeadline from './SectionHeadline'
import DestinationCard from './DestinationCard'
import styles from './TopDestinationsSection.module.css'

const cards = [
  { title: 'Top photography point to explore', image: '/images/dest-1.jpg', href: '/destinations/photography' },
  { title: 'Top camping points at villagses',  image: '/images/dest-2.jpg', href: '/destinations/camping' },
  { title: 'Top historical monuments and more', image: '/images/dest-3.jpg', href: '/destinations/historical' },
  { title: 'Top resting points to expllore',    image: '/images/dest-4.jpg', href: '/destinations/resting' },
]

/* Home Section 06 — "Top destinations" horizontal card slider */
export default function TopDestinationsSection() {
  return (
    <section className={styles.section}>
      <SectionHeadline
        title="Top destinations"
        subtitle="Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim."
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
