import { searchLocation, getPlaces, getPlacesByIds, getReviews, getPhotos, getDetails } from '@/lib/tripadvisor/api'
import TripAdvisorReviewList from './TripAdvisorReviewList'
import styles from './TripAdvisorBlock.module.css'

type Props = {
  locationId?: string
  location: string
  widget: string
  limit: number
  placeIds?: string  // comma-separated specific TripAdvisor IDs (overrides nearby_search)
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

export default async function TripAdvisorBlock({ locationId: propId, location, widget, limit, placeIds }: Props) {
  const locationId = propId || (await searchLocation(location))?.[0]?.location_id

  if (!locationId) {
    return <div className={styles.empty}>No TripAdvisor results found for &ldquo;{location}&rdquo;.</div>
  }

  // ── reviews widget ──
  if (widget === 'reviews') {
    const [reviews, albumPhotos, placeDetails] = await Promise.all([
      getReviews(locationId, limit),
      getPhotos(locationId, 8),
      getDetails(locationId).catch(() => null),
    ])

    if (!reviews?.length) {
      return <div className={styles.empty}>No reviews found for &ldquo;{location}&rdquo;.</div>
    }

    const placeUrl = placeDetails?.web_url as string | undefined

    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.dot} />
            <span className={styles.label}>{LABELS.reviews} · {location}</span>
          </div>
          {placeUrl ? (
            <a href={placeUrl} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>
              View on TripAdvisor ↗
            </a>
          ) : (
            <span className={styles.attribution}>TripAdvisor</span>
          )}
        </div>

        {albumPhotos?.length > 0 && (
          <div className={styles.photoStrip}>
            {albumPhotos.map((photo: any, i: number) => {
              const url = photo.images?.medium?.url || photo.images?.small?.url
              if (!url) return null
              return <img key={photo.id ?? i} src={url} alt={photo.caption || location} className={styles.photoThumb} />
            })}
          </div>
        )}

        <TripAdvisorReviewList reviews={reviews} />
      </div>
    )
  }

  // ── place cards (attractions / restaurants / hotels) ──

  // If specific place IDs are set, fetch those exactly — no nearby_search needed.
  // This gives curated, high-quality results instead of random nearby places.
  const ids = placeIds ? placeIds.split(',').map((s) => s.trim()).filter(Boolean) : []
  let places: any[]

  if (ids.length) {
    places = await getPlacesByIds(ids)
  } else {
    places = await getPlaces(locationId, widget, limit)
    // Fallback: retry with a fresh locationId search if nearby_search returned nothing
    if (!places?.length) {
      const fallback = await searchLocation(location)
      const fallbackId = fallback?.[0]?.location_id
      if (fallbackId && fallbackId !== locationId) {
        places = await getPlaces(fallbackId, widget, limit)
      }
    }
  }

  if (!places?.length) {
    return <div className={styles.empty}>No {LABELS[widget] ?? widget} found near &ldquo;{location}&rdquo;.</div>
  }

  // For specific IDs, details are already the place object (getPlacesByIds returns getDetails results).
  // For nearby_search results, we fetch details + photos separately.
  const photos = await Promise.all(
    places.map((p: any) => getPhotos(p.location_id, 1).catch(() => []))
  )
  // If we used getPlacesByIds, detail IS the place object — skip second fetch.
  const detailsArr: any[] = ids.length
    ? places
    : await Promise.all(places.map((p: any) => getDetails(p.location_id).catch(() => null)))

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
          const photoUrl   = photos[i]?.[0]?.images?.medium?.url || photos[i]?.[0]?.images?.small?.url || null
          const detail     = detailsArr[i]
          const rating     = place.rating ? Number(place.rating) : null
          const numReviews = place.num_reviews
          const price      = detail?.price_level as string | undefined
          const cuisines   = (detail?.cuisine as { name: string }[] | undefined)?.slice(0, 3)
          const isChoice   = (detail?.awards as { award_type?: string }[] | undefined)
            ?.some((a) => a.award_type?.toLowerCase().includes('travelers'))

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
                {isChoice && <span className={styles.badge}>Travelers&apos; Choice</span>}
                <div className={styles.cardName}>{place.name}</div>
                {rating !== null && (
                  <div className={styles.cardRating}>
                    <Stars rating={rating} />
                    {numReviews && <span className={styles.reviewCount}>({Number(numReviews).toLocaleString()})</span>}
                  </div>
                )}
                {(price || cuisines?.length) && (
                  <div className={styles.cardMeta}>
                    {price && <span className={styles.price}>{price}</span>}
                    {cuisines?.map((c) => <span key={c.name} className={styles.tag}>{c.name}</span>)}
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
