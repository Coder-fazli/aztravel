import Link from 'next/link'
import styles from './EventCard.module.css'

type EventDate = { month: string; day: string }

type Props = {
  title:    string
  time:     string
  location: string
  dates:    EventDate[]
  image:    string
  href:     string
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="9" r="6.75" />
      <polyline points="9 5 9 9 11.5 10.5" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 1.7c2.9 0 5.2 2.3 5.2 5.2 0 3.6-5.2 9.4-5.2 9.4S3.8 10.5 3.8 6.9C3.8 4 6.1 1.7 9 1.7Z" />
      <circle cx="9" cy="6.9" r="1.9" />
    </svg>
  )
}

/* Section 07 event card — photo + title + time/place + a vertical date slider.
   Hover: lifts with shadow, the date mini-cards turn gradient and slide. */
export default function EventCard({ title, time, location, dates, image, href }: Props) {
  // duplicate the list so the vertical scroll loops seamlessly on hover
  const loop = [...dates, ...dates]
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.imgWrap}>
        <img src={image} alt="" className={styles.img} />
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span className={styles.metaRow}><ClockIcon />{time}</span>
          <span className={styles.metaRow}><PinIcon />{location}</span>
        </div>
      </div>

      <div className={styles.dateCol}>
        <div className={styles.dateStrip} style={{ '--n': dates.length } as React.CSSProperties}>
          {loop.map((d, i) => (
            <span className={styles.dateCard} key={i}>
              <span className={styles.dateMonth}>{d.month}</span>
              <span className={styles.dateDay}>{d.day}</span>
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
