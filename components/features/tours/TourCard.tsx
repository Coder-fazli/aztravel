import Link from 'next/link'
import styles from './TourCard.module.css'

type Props = {
  slug:          string
  title:         string
  excerpt:       string
  image:         string
  rating:        number
  reviewCount:   number
  priceFinal:    number
  priceOriginal: number
  currency:      string
  categories:    string[]
  isSpecialOffer: boolean
  bookedLast24h?: number
  locale:        string
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#ef6445" aria-hidden="true">
      <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#595959" strokeWidth="1.4" aria-hidden="true">
      <path d="M14 10.7a1.3 1.3 0 01-1.3 1.3H4L1.3 14.7V2.7A1.3 1.3 0 012.7 1.4h10a1.3 1.3 0 011.3 1.3z" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#595959" strokeWidth="1.5" aria-hidden="true">
      <path d="M10 17s-7-4.6-7-9a4 4 0 018 0 4 4 0 018 0c0 4.4-7 9-7 9z" />
    </svg>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  'multi-day':       'Multi day',
  'day-trip':        'Day trip',
  'guided':          'Guided tour',
  'history-culture': 'History & Culture',
  'nature':          'Nature',
  'adventure':       'Adventure',
}

export default function TourCard({
  slug, title, excerpt, image, rating, reviewCount,
  priceFinal, priceOriginal, currency, categories,
  isSpecialOffer, bookedLast24h, locale,
}: Props) {
  const saved   = priceOriginal - priceFinal
  const typeTag = categories.find(c => ['day-trip', 'guided', 'multi-day'].includes(c))
  const themeTag = categories.find(c => ['history-culture', 'nature', 'adventure'].includes(c))

  return (
    <div className={styles.card}>
      {/* left image */}
      <div className={styles.imgWrap}>
        <img src={image || '/images/tour-placeholder.jpg'} alt={title} className={styles.img} />
        {bookedLast24h && bookedLast24h > 5 ? (
          <span className={styles.bookedBadge}>Booked {bookedLast24h}x yesterday</span>
        ) : null}
      </div>

      {/* content */}
      <div className={styles.content}>
        <div className={styles.inner}>
          {/* rating row */}
          <div className={styles.details}>
            <span className={styles.ratingRow}>
              <StarIcon />
              <span className={styles.ratingNum}>{rating?.toFixed(1)}</span>
            </span>
            <span className={styles.reviewRow}>
              <ChatIcon />
              <span className={styles.reviewNum}>{reviewCount}</span>
            </span>
          </div>

          {/* title */}
          <h3 className={styles.title}>{title}</h3>

          {/* excerpt */}
          <p className={styles.excerpt}>{excerpt}</p>

          {/* tags */}
          <div className={styles.tags}>
            {isSpecialOffer && <span className={`${styles.tag} ${styles.tagOffer}`}>Special offer</span>}
            {typeTag  && <span className={`${styles.tag} ${styles.tagType}`}>{CATEGORY_LABELS[typeTag]}</span>}
            {themeTag && <span className={`${styles.tag} ${styles.tagTheme}`}>{CATEGORY_LABELS[themeTag]}</span>}
          </div>
        </div>

        {/* price + heart */}
        <div className={styles.right}>
          <div className={styles.priceBlock}>
            <div className={styles.priceRow}>
              <span className={styles.priceFinal}>{priceFinal}{currency}</span>
              <span className={styles.priceOriginal}>{priceOriginal}{currency}</span>
            </div>
            {saved > 0 && <span className={styles.priceSaved}>{saved}{currency} Saved</span>}
          </div>
          <button className={styles.heartBtn} aria-label="Add to favourites">
            <HeartIcon />
          </button>
        </div>
      </div>

      {/* full-card link */}
      <Link href={`/${locale}/tours/${slug}`} className={styles.link} aria-label={title} />
    </div>
  )
}
