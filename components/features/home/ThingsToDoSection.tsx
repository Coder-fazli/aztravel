import SectionHeadline from './SectionHeadline'
import CatalogCard from './CatalogCard'
import styles from './ThingsToDoSection.module.css'

const cards = [
  { title: 'Walk the Old City (Icheri Sheher) of Baku',     desc: 'A UNESCO-listed medieval fortress city with caravanserais, mosques and carpet shops at every turn.',          image: '/images/thing-1.jpg', href: '/things-to-do/old-city' },
  { title: 'Watch the sunrise from Flame Towers viewpoint', desc: 'The three flame-shaped towers light up Baku\'s skyline. The hilltop view is best at dawn and after dark.',   image: '/images/thing-2.jpg', href: '/things-to-do/flame-towers' },
  { title: 'Take a cable car over the forests of Gabala',   desc: 'Ride over dense forest canopy to mountain viewpoints — a peaceful contrast to Baku\'s city energy.',        image: '/images/thing-3.jpg', href: '/things-to-do/gabala' },
  { title: 'Visit the Mud Volcanoes of Gobustan',           desc: 'Azerbaijan has over 400 mud volcanoes — more than anywhere on earth. Gobustan also holds 20,000-year-old rock carvings.', image: '/images/thing-4.jpg', href: '/things-to-do/gobustan' },
  { title: 'Ski the slopes of Shahdag mountain resort',     desc: 'The Caucasus peaks near Quba host Azerbaijan\'s premier ski resort, open from December through March.',      image: '/images/thing-5.jpg', href: '/things-to-do/shahdag' },
]

/* Home Section 08 — "Things to do" horizontal card slider */
export default function ThingsToDoSection() {
  return (
    <section className={styles.section}>
      <div className={styles.headWrap}>
        <SectionHeadline
          watermark="Things to do"
          title="Things to do"
          subtitle="Whether you're after adventure, culture or just a great meal — Azerbaijan delivers. Here's where to start."
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
