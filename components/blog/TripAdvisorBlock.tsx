import { searchLocation, getPlaces, getReviews } from '@/lib/tripadvisor/api'
import styles from './TripAdvisorBlock.module.css'

type Props = {
  locationId?: string
  location: string
  widget: string
  limit: number
}

const LABELS: Record<string, string> = {
  attractions: 'Top Attractions',
  restaurants: 'Top Restaurants',
  hotels: 'Top Hotels',
  reviews: 'Recent Reviews',
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className={styles.stars}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

export default async function TripAdvisorBlock({ locationId: propId, location, widget, limit }: Props) {
  // Use the exact locationId picked in the editor; fall back to a search only for
  // old blocks that were saved without an id.
  const locationId = propId || (await searchLocation(location))?.[0]?.location_id

  if (!locationId) {
    return (
      <div className={styles.empty}>
        No TripAdvisor results found for &ldquo;{location}&rdquo;.
      </div>
    )
  }

  const items = widget === 'reviews'
    ? await getReviews(locationId, limit)
    : await getPlaces(locationId, widget, limit)

  if (!items?.length) {
    return (
      <div className={styles.empty}>
        No {LABELS[widget] ?? widget} found near &ldquo;{location}&rdquo;.
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.dot} />
          <span className={styles.label}>{LABELS[widget] ?? widget} · {location}</span>
        </div>
        <span className={styles.attribution}>TripAdvisor</span>
      </div>

      <ul className={styles.list}>
        {items.map((item: any, i: number) => (
          <li key={item.location_id ?? i} className={styles.item}>
            <span className={styles.num}>{i + 1}</span>
            <div className={styles.info}>
              <div className={styles.name}>{item.name ?? item.title ?? 'Unknown'}</div>
              {item.rating && (
                <div className={styles.ratingRow}>
                  <Stars rating={Number(item.rating)} />
                  {item.num_reviews && (
                    <span className={styles.reviewCount}>({item.num_reviews} reviews)</span>
                  )}
                </div>
              )}
              {item.text && (
                <p className={styles.excerpt}>{item.text}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
