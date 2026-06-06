import Link from 'next/link'
import ArrowIcon from '@/components/ui/ArrowIcon'
import EventCard from './EventCard'
import styles from './EventsSection.module.css'

const desc = 'Nisl enim ac sed purus sapien aliquam morbi turpis dui.'
const dates = [
  { month: 'Mart', day: '12' },
  { month: 'Mart', day: '18' },
  { month: 'Apr', day: '03' },
  { month: 'Apr', day: '21' },
]

const events = [
  { title: desc, time: '16:00-22:00', location: 'Flame Towers', dates, image: '/images/event-1.jpg', href: '/events/1' },
  { title: desc, time: '16:00-22:00', location: 'Flame Towers', dates, image: '/images/event-2.jpg', href: '/events/2' },
  { title: desc, time: '16:00-22:00', location: 'Flame Towers', dates, image: '/images/event-2.jpg', href: '/events/3' },
  { title: desc, time: '16:00-22:00', location: 'Flame Towers', dates, image: '/images/event-3.jpg', href: '/events/4' },
]

/* Home Section 07 — "Join the stunning events and make journey fun!" */
export default function EventsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.headline}>
        <h2 className={styles.title}>Join the stunning <b>events</b> and make journey fun!</h2>
        <Link href="/events" className={styles.seeMore}>
          SEE MORE
          <ArrowIcon size={24} />
        </Link>
      </div>

      <div className={styles.grid}>
        {events.map((e, i) => (
          <EventCard key={i} {...e} />
        ))}
      </div>
    </section>
  )
}
