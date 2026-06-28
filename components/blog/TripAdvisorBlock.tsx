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
  let locationId: string | undefined

  if (widget === 'reviews') {
    // Reviews are fetched for the exact place the editor picked.
    locationId = propId || (await searchLocation(location))?.[0]?.location_id
  } else {
    // Nearby searches (attractions / restaurants / hotels) need a city/area ID,
    // not a specific venue ID. Search by the location text (e.g. "Baku, Azerbaijan")
    // to get the right area, then fall back to the picked ID.
    const areaResults = await searchLocation(location)
    locationId = areaResults?.[0]?.location_id || propId
  }

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
              {item.web_url ? (
                <a href={item.web_url} target="_blank" rel="noopener noreferrer" className={styles.name}>
                  {item.name ?? item.title ?? 'Unknown'}
                </a>
              ) : (
                <div className={styles.name}>{item.name ?? item.title ?? 'Unknown'}</div>
              )}
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
