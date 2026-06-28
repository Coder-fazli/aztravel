import { searchLocation, getPlaces, getReviews, getPhotos } from '@/lib/tripadvisor/api'
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
  reviews:     '⭐',
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(Number(rating))
  return <span className={styles.stars}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default async function TripAdvisorBlock({ locationId: propId, location, widget, limit }: Props) {
  const locationId = propId || (await searchLocation(location))?.[0]?.location_id

  if (!locationId) {
    return <div className={styles.empty}>No TripAdvisor results found for &ldquo;{location}&rdquo;.</div>
  }

  if (widget === 'reviews') {
    const reviews = await getReviews(locationId, limit)
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

        <div className={styles.reviewGrid}>
          {reviews.map((r: any, i: number) => {
            const authorName = r.user?.username || r.username || `Traveler`
            const avatarUrl  = r.user?.avatar?.thumbnail || r.user?.avatar?.small
            const date       = r.published_date
              ? new Date(r.published_date).toLocaleDateString('en', { month: 'short', year: 'numeric' })
              : ''
            return (
              <a
                key={r.id ?? i}
                href={r.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.reviewCard}
              >
                <div className={styles.reviewTop}>
                  <div className={styles.reviewer}>
                    <div className={styles.avatar}>
                      {avatarUrl
                        ? <img src={avatarUrl} alt={authorName} />
                        : initials(authorName)
                      }
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
          })}
        </div>
      </div>
    )
  }

  // ── place cards (attractions / restaurants / hotels) ──
  const places = await getPlaces(locationId, widget, limit)
  if (!places?.length) {
    return <div className={styles.empty}>No {LABELS[widget] ?? widget} found near &ldquo;{location}&rdquo;.</div>
  }

  // Fetch one photo per place in parallel (all cached 24 h)
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
          const photoUrl = photos[i]?.[0]?.images?.medium?.url
            || photos[i]?.[0]?.images?.small?.url
            || null
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
