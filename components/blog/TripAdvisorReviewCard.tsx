'use client'

import styles from './TripAdvisorBlock.module.css'

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(Number(rating))
  return <span className={styles.stars}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
}

type Props = {
  review: {
    id?: string
    url?: string
    rating?: number
    title?: string
    text?: string
    published_date?: string
    user?: { username?: string; avatar?: { thumbnail?: string; small?: string } }
    username?: string
  }
}

export default function TripAdvisorReviewCard({ review: r }: Props) {
  const authorName = r.user?.username || r.username || 'Traveler'
  const avatarUrl  = r.user?.avatar?.thumbnail || r.user?.avatar?.small
  const date       = r.published_date
    ? new Date(r.published_date).toLocaleDateString('en', { month: 'short', year: 'numeric' })
    : ''

  return (
    <a
      href={r.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.reviewCard}
    >
      <div className={styles.reviewTop}>
        <div className={styles.reviewer}>
          <div className={styles.avatar}>
            {avatarUrl ? <img src={avatarUrl} alt={authorName} /> : initials(authorName)}
          </div>
          <div>
            <div className={styles.reviewerName}>{authorName}</div>
            {date && <div className={styles.reviewDate}>{date}</div>}
          </div>
        </div>
        {r.rating && <Stars rating={r.rating} />}
      </div>

      {r.title && <div className={styles.reviewTitle}>{r.title}</div>}
      {r.text  && <div className={styles.reviewText}>{r.text}</div>}

      <div className={styles.readMore}>Read on TripAdvisor →</div>
    </a>
  )
}
