import { searchLocation, getPlaces, getReviews } from '@/lib/tripadvisor/api'

type Props = {
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

export default async function TripAdvisorBlock({ location, widget, limit }: Props) {
  const results = await searchLocation(location)
  const locationId = results?.[0]?.location_id

  if (!locationId) {
    return (
      <div style={{ padding: '16px', background: '#f5f5f7', borderRadius: 10, color: '#666', fontSize: 14 }}>
        No TripAdvisor results found for &ldquo;{location}&rdquo;.
      </div>
    )
  }

  const items = widget === 'reviews'
    ? await getReviews(locationId, limit)
    : await getPlaces(locationId, widget, limit)

  if (!items?.length) {
    return (
      <div style={{ padding: '16px', background: '#f5f5f7', borderRadius: 10, color: '#666', fontSize: 14 }}>
        No {LABELS[widget] ?? widget} found near &ldquo;{location}&rdquo;.
      </div>
    )
  }

  return (
    <div style={{
      border: '1px solid #e4e4ec', borderRadius: 14, overflow: 'hidden',
      fontFamily: 'inherit', marginBlock: '1.5rem',
    }}>
      <div style={{
        padding: '12px 16px', background: '#34e0a1', display: 'flex',
        alignItems: 'center', gap: 8,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#000" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="#fff" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
          {LABELS[widget] ?? widget} — {location}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#005b4a', fontWeight: 600 }}>
          via TripAdvisor
        </span>
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
        {items.map((item: any, i: number) => (
          <li key={item.location_id ?? i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 16px', borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}>
            <span style={{
              minWidth: 24, height: 24, borderRadius: '50%',
              background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#666', flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                {item.name ?? item.title ?? 'Unknown'}
              </div>
              {(item.rating || item.rating_image_url) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  {item.rating && (
                    <span style={{ fontSize: 13, color: '#e67e00', fontWeight: 700 }}>
                      {'★'.repeat(Math.round(Number(item.rating)))}
                      {'☆'.repeat(5 - Math.round(Number(item.rating)))}
                    </span>
                  )}
                  {item.num_reviews && (
                    <span style={{ fontSize: 12, color: '#888' }}>({item.num_reviews} reviews)</span>
                  )}
                </div>
              )}
              {item.text && (
                <p style={{
                  fontSize: 13, color: '#555', margin: '4px 0 0',
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {item.text}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
