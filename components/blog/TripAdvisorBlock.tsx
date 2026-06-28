import { searchLocation, getPlaces, getReviews, getPhotos } from '@/lib/tripadvisor/api'
import TripAdvisorReviewCard from './TripAdvisorReviewCard'
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
  hotels:      'Top Hotels',
  reviews:     'TripAdvisor Reviews',
}

const PLACEHOLDERS: Record<string, string> = {
  attractions: '🏛️',
  restaurants: '🍽️',
  hotels:      '🏨',
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(Number(rating))
  return <span className={styles.stars}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
}

export default async function TripAdvisorBlock({ locationId: propId, location, widget, limit }: Props) {
  const locationId = propId || (await searchLocation(location))?.[0]?.location_id

  if (!locationId) {
    return <div className={styles.empty}>No TripAdvisor results found for &ldquo;{location}&rdquo;.</div>
  }

  if (widget === 'reviews') {
    // Fetch reviews and the place's own photo album in parallel
    const [reviews, albumPhotos] = await Promise.all([
      getReviews(locationId, limit),
      getPhotos(locationId, 8),
    ])

    if (!reviews?.length) {
      return <div className={styles.empty}>No reviews found for &ldquo;{location}&rdquo;.</div>
    }

    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.dot} />
            <span className={styles.label}>{LABELS.reviews} · {location}</span>
          </div>
          <span className={styles.attribution}>TripAdvisor</span>
        </div>

        {/* place photo album strip */}
        {albumPhotos?.length > 0 && (
          <div className={styles.photoStrip}>
            {albumPhotos.map((photo: any, i: number) => {
              const url = photo.images?.medium?.url || photo.images?.small?.url
              if (!url) return null
              return (
                <img
                  key={photo.id ?? i}
                  src={url}
                  alt={photo.caption || location}
                  className={styles.photoThumb}
                />
              )
            })}
          </div>
        )}

        <div className={styles.reviewGrid}>
          {reviews.map((r: any, i: number) => (
            <TripAdvisorReviewCard key={r.id ?? i} review={r} />
          ))}
        </div>
      </div>
    )
  }

  // ── place cards (attractions / restaurants / hotels) ──
  const places = await getPlaces(locationId, widget, limit)
  if (!places?.length) {
    return <div className={styles.empty}>No {LABELS[widget] ?? widget} found near &ldquo;{location}&rdquo;.</div>
  }

  // Fetch one cover photo per place in parallel (all cached 24 h)
  const photos = await Promise.all(
    places.map((p: any) => getPhotos(p.location_id, 1).catch(() => []))
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.dot} />
          <span className={styles.label}>{LABELS[widget] ?? widget} · {location}</span>
        </div>
        <span className={styles.attribution}>TripAdvisor</span>
      </div>

      <div className={styles.grid}>
        {places.map((place: any, i: number) => {
          const photoUrl  = photos[i]?.[0]?.images?.medium?.url || photos[i]?.[0]?.images?.small?.url || null
          const rating    = place.rating ? Number(place.rating) : null
          const numReviews= place.num_reviews

          return (
            <a
              key={place.location_id ?? i}
              href={place.web_url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
            >
              {photoUrl
                ? <img src={photoUrl} alt={place.name} className={styles.cardImg} />
                : <div className={styles.cardImgPlaceholder}>{PLACEHOLDERS[widget] ?? '📍'}</div>
              }
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{place.name}</div>
                {rating !== null && (
                  <div className={styles.cardRating}>
                    <Stars rating={rating} />
                    {numReviews && (
                      <span className={styles.reviewCount}>({Number(numReviews).toLocaleString()})</span>
                    )}
                  </div>
                )}
                <div className={styles.cardCta}>View on TripAdvisor →</div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
