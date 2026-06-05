import Link from 'next/link'
import ArrowIcon from '@/components/ui/ArrowIcon'
import styles from './BlogCard.module.css'

type Props = {
  title:    string
  desc:     string
  image:    string
  date:     string
  readTime: string
  href:     string
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <line x1="2" y1="6.5" x2="14" y2="6.5" />
      <line x1="5.5" y1="1.5" x2="5.5" y2="4" />
      <line x1="10.5" y1="1.5" x2="10.5" y2="4" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.2" />
      <polyline points="8 4.5 8 8 10.5 9.5" />
    </svg>
  )
}

export default function BlogCard({ title, desc, image, date, readTime, href }: Props) {
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.imgWrap}>
        <img src={image} alt={title} className={styles.img} />
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles.badgeDate}`}>
            <CalendarIcon /><span>{date}</span>
          </span>
          <span className={`${styles.badge} ${styles.badgeRead}`}>
            <ClockIcon /><span>{readTime}</span>
          </span>
        </div>
      </div>

      <div className={styles.text}>
        <div className={styles.texts}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.desc}>{desc}</p>
        </div>
        <span className={styles.seeMore}>
          SEE MORE
          <ArrowIcon size={24} />
        </span>
      </div>
    </Link>
  )
}
