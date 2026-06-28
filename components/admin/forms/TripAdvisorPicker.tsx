'use client'

import { useState } from 'react'

type Attrs = { locationId: string; location: string; widget: string; limit: number; placeIds: string }
type Props = { onInsert: (attrs: Attrs) => void; onClose: () => void; initialAttrs?: Partial<Attrs> }
type Result = { location_id: string; name: string; result_type?: string; address_obj?: { city?: string; country?: string } }
type Intent = 'photos' | 'reviews' | 'list' | 'nearby'
type NearbyType = 'hotels' | 'attractions' | 'restaurants'

const INTENTS: { id: Intent; icon: string; title: string; desc: string }[] = [
  { id: 'photos',  icon: '🖼️', title: 'Photo Gallery', desc: 'Show photos of one place' },
  { id: 'reviews', icon: '⭐', title: 'Rating Card',   desc: 'Show rating, reviews & link' },
  { id: 'list',    icon: '📍', title: 'Top List',      desc: 'Curated cards (you pick each)' },
  { id: 'nearby',  icon: '🗺️', title: 'Places Nearby', desc: 'Top hotels / attractions / restaurants' },
]

const NEARBY_TYPES: { value: NearbyType; label: string }[] = [
  { value: 'hotels',      label: '🏨 Hotels' },
  { value: 'attractions', label: '🏛️ Attractions' },
  { value: 'restaurants', label: '🍽️ Restaurants' },
]

const VENUE_KEYWORDS = [
  'restaurant','cafe','café','bar','pub','bistro','grill','kitchen',
  'hotel','inn','hostel','resort','suite','lodge',
  'spa','museum','gallery','theatre','theater','cinema',
  'park','garden','beach','market','bazaar','mall',
  'shop','store','tower','center','centre','palace',
]
function isArea(r: Result): boolean {
  if (r.result_type) return r.result_type === 'geos'
  return !VENUE_KEYWORDS.some((kw) => r.name.toLowerCase().includes(kw))
}

async function fetchSearch(q: string): Promise<Result[]> {
  const res = await fetch(`/api/tripadvisor/search?q=${encodeURIComponent(q)}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

const BASE: React.CSSProperties = { fontFamily: 'var(--font-family)' }

export default function TripAdvisorPicker({ onInsert, onClose, initialAttrs }: Props) {
  const [step,       setStep]       = useState<1 | 2 | 3>(1)
  const [intent,     setIntent]     = useState<Intent | null>(null)
  const [query,      setQuery]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [results,    setResults]    = useState<Result[]>([])
  const [searched,   setSearched]   = useState(false)
  const [selected,   setSelected]   = useState<Result | null>(null)
  const [picked,     setPicked]     = useState<Result[]>([])   // for list mode
  const [nearbyType, setNearbyType] = useState<NearbyType>('hotels')
  const [photoLimit, setPhotoLimit] = useState<3 | 6 | 9>(6)
  const [inserting,  setInserting]  = useState(false)
  const [preview,    setPreview]    = useState<any>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setSearched(false)
    try { setResults(await fetchSearch(query)) }
    catch { setResults([]) }
    finally { setLoading(false); setSearched(true) }
  }

  const addToList = (r: Result) => {
    if (!picked.find((p) => p.location_id === r.location_id)) {
      setPicked((prev) => [...prev, r])
    }
  }

  const canNext = intent === 'list' ? picked.length > 0 : !!selected

  const goToStep3 = async () => {
    setStep(3)
    setPreview(null)
    setPreviewLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('widget', intent === 'list' ? 'list' : intent === 'nearby' ? nearbyType : intent ?? '')
      if (intent === 'list') {
        params.set('placeIds', picked.map((p) => p.location_id).join(','))
      } else {
        params.set('locationId', selected?.location_id ?? '')
      }
      const res = await fetch(`/api/tripadvisor/preview?${params}`)
      setPreview(await res.json())
    } catch { setPreview({ ok: false }) }
    finally { setPreviewLoading(false) }
  }

  const insert = async () => {
    if (!canNext || inserting) return
    setInserting(true)
    try {
      if (intent === 'photos') {
        onInsert({ locationId: selected!.location_id, location: selected!.name, widget: 'photos', limit: photoLimit, placeIds: selected!.location_id })
      } else if (intent === 'reviews') {
        onInsert({ locationId: selected!.location_id, location: selected!.name, widget: 'reviews', limit: 5, placeIds: '' })
      } else if (intent === 'list') {
        const label = picked[0]?.address_obj?.city || picked[0]?.name || ''
        onInsert({ locationId: '', location: label, widget: nearbyType, limit: picked.length, placeIds: picked.map((p) => p.location_id).join(',') })
      } else {
        // nearby — resolve city ID if venue was picked
        const s = selected!
        if (!isArea(s)) {
          const city = s.address_obj?.city || s.name
          const cityResults = await fetchSearch(city)
          const geo = cityResults.find((r) => r.result_type === 'geos') ?? cityResults[0]
          onInsert({ locationId: geo?.location_id || s.location_id, location: city, widget: nearbyType, limit: 5, placeIds: '' })
        } else {
          onInsert({ locationId: s.location_id, location: s.name, widget: nearbyType, limit: 5, placeIds: '' })
        }
      }
    } catch {
      onInsert({ locationId: selected?.location_id || '', location: selected?.name || query, widget: nearbyType, limit: 5, placeIds: '' })
    } finally { setInserting(false) }
  }

  const placeholder = intent === 'nearby'
    ? 'Search a city or area — e.g. Baku'
    : intent === 'list'
    ? 'Search a place to add — e.g. Firuze Restaurant'
    : 'Search a specific place — e.g. Maiden Tower Baku'

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ ...BASE, background: '#fff', borderRadius: 20, padding: 28, width: 520, maxHeight: '88vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>

        {/* ── STEP 1 — intent ── */}
        {step === 1 && (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--base-13)' }}>What do you want to show?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {INTENTS.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => { setIntent(it.id); setStep(2) }}
                  style={{
                    border: `2px solid ${intent === it.id ? '#f07054' : '#e4e4ec'}`,
                    background: intent === it.id ? '#fff8f7' : '#fff',
                    borderRadius: 14, padding: '18px 16px', cursor: 'pointer',
                    textAlign: 'left' as const, display: 'flex', flexDirection: 'column' as const, gap: 6,
                    fontFamily: 'var(--font-family)', transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{it.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--base-13)' }}>{it.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--base-8)', lineHeight: 1.4 }}>{it.desc}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '9px 20px', border: '1px solid #e4e4ec', borderRadius: 10, background: '#fff', color: '#666', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                Cancel
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2 — search ── */}
        {step === 2 && (
          <>
            {/* back + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="button" onClick={() => { setStep(1); setResults([]); setSelected(null); setSearched(false) }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--base-8)', padding: 0, lineHeight: 1 }}>←</button>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--base-13)' }}>
                {INTENTS.find((i) => i.id === intent)?.icon} {INTENTS.find((i) => i.id === intent)?.title}
              </span>
            </div>

            {/* chips for list mode */}
            {intent === 'list' && picked.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {picked.map((p) => (
                  <span key={p.location_id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: '#f070541a', border: '1px solid #f0705440', fontSize: 12, fontWeight: 600, color: '#f07054' }}>
                    {p.name}
                    <button type="button" onClick={() => setPicked((prev) => prev.filter((x) => x.location_id !== p.location_id))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f07054', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
                <span style={{ fontSize: 12, color: 'var(--base-8)', alignSelf: 'center' }}>{picked.length} place{picked.length !== 1 ? 's' : ''} added</span>
              </div>
            )}

            {/* search input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ flex: 1, padding: '9px 12px', border: '1px solid #e4e4ec', borderRadius: 10, fontSize: 14, color: 'var(--base-13)', outline: 'none', fontFamily: 'var(--font-family)' }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder={placeholder}
                autoFocus
              />
              <button onClick={search} disabled={loading} style={{ padding: '9px 18px', border: 'none', borderRadius: 10, background: 'var(--primary-12,#f07054)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-family)' }}>
                {loading ? '…' : 'Search'}
              </button>
            </div>

            {searched && !loading && results.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--base-8)', textAlign: 'center', padding: '4px 0' }}>No results — try a different name.</div>
            )}

            {/* results */}
            {results.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {results.slice(0, 8).map((r) => {
                  const addr = [r.address_obj?.city, r.address_obj?.country].filter(Boolean).join(', ')
                  const isVenue = !isArea(r)
                  const isSelected = selected?.location_id === r.location_id
                  const alreadyAdded = picked.some((p) => p.location_id === r.location_id)
                  return (
                    <div
                      key={r.location_id}
                      onClick={() => intent !== 'list' && setSelected(r)}
                      style={{
                        padding: '10px 14px', borderRadius: 10,
                        cursor: intent === 'list' ? 'default' : 'pointer',
                        border: `1.5px solid ${isSelected ? '#f07054' : '#e4e4ec'}`,
                        background: isSelected ? '#fff8f7' : '#fff',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--base-13)' }}>{r.name}</div>
                        {addr && <div style={{ fontSize: 12, color: 'var(--base-8)' }}>{addr}</div>}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: isVenue ? '#f070541a' : '#8886f51a', color: isVenue ? '#f07054' : '#8886f5', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {isVenue ? 'Venue' : 'Area'}
                      </span>
                      {intent === 'list' && (
                        <button
                          type="button"
                          onClick={() => addToList(r)}
                          disabled={alreadyAdded}
                          style={{ border: 'none', borderRadius: 8, padding: '4px 10px', background: alreadyAdded ? '#f0f0f0' : '#f07054', color: alreadyAdded ? '#aaa' : '#fff', fontSize: 12, fontWeight: 700, cursor: alreadyAdded ? 'default' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'var(--font-family)' }}
                        >
                          {alreadyAdded ? '✓' : '+ Add'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* next button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <button onClick={onClose} style={{ padding: '9px 20px', border: '1px solid #e4e4ec', borderRadius: 10, background: '#fff', color: '#666', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>Cancel</button>
              <button
                disabled={!canNext}
                onClick={goToStep3}
                style={{ padding: '9px 22px', border: 'none', borderRadius: 10, background: '#f07054', color: '#fff', fontSize: 14, fontWeight: 600, cursor: canNext ? 'pointer' : 'default', opacity: canNext ? 1 : 0.35, fontFamily: 'var(--font-family)' }}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3 — confirm & insert ── */}
        {step === 3 && (
          <>
            {/* back + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="button" onClick={() => setStep(2)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--base-8)', padding: 0, lineHeight: 1 }}>←</button>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--base-13)' }}>Confirm & Insert</span>
            </div>

            {/* summary card */}
            <div style={{ border: '1.5px solid #e4e4ec', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--base-8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {INTENTS.find((i) => i.id === intent)?.icon} {INTENTS.find((i) => i.id === intent)?.title}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--base-13)' }}>
                {intent === 'list'
                  ? `${picked.length} place${picked.length !== 1 ? 's' : ''} selected`
                  : selected?.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--base-8)' }}>
                {intent === 'photos'   && `${photoLimit} photos · TripAdvisor`}
                {intent === 'reviews'  && 'Rating, reviews & TripAdvisor link'}
                {intent === 'list'     && `${nearbyType} · TripAdvisor`}
                {intent === 'nearby'   && `Top ${nearbyType} nearby · TripAdvisor`}
              </div>
            </div>

            {/* live preview / feedback */}
            {previewLoading && (
              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f7f7fb', fontSize: 13, color: 'var(--base-8)', textAlign: 'center' }}>
                Checking TripAdvisor data…
              </div>
            )}
            {!previewLoading && preview && (
              preview.ok ? (
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid #c8edd0', background: '#f0faf2' }}>
                  {/* photo thumbnail for photos widget */}
                  {preview.type === 'photos' && preview.photoUrl && (
                    <img src={preview.photoUrl} alt={preview.name} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                  )}
                  <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    <div>
                      {preview.type === 'photos'  && <div style={{ fontSize: 13, fontWeight: 600, color: '#2d7a3a' }}>Found on TripAdvisor — photos will load.</div>}
                      {preview.type === 'reviews' && <div style={{ fontSize: 13, fontWeight: 600, color: '#2d7a3a' }}>{preview.name} · ★{Number(preview.rating).toFixed(1)} · {Number(preview.numReviews).toLocaleString()} reviews</div>}
                      {preview.type === 'list'    && <div style={{ fontSize: 13, fontWeight: 600, color: '#2d7a3a' }}>{preview.names?.slice(0,2).join(', ')}{preview.names?.length > 2 ? ` +${preview.names.length - 2} more` : ''}</div>}
                      {preview.type === 'nearby'  && <div style={{ fontSize: 13, fontWeight: 600, color: '#2d7a3a' }}>Location found: {preview.name}</div>}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #f5c6c6', background: '#fff5f5', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                  <div style={{ fontSize: 13, color: '#a00', lineHeight: 1.5 }}>
                    TripAdvisor returned no data for this place. The block may appear empty on the page. Try a different place or widget type.
                  </div>
                </div>
              )
            )}

            {/* photo limit pills */}
            {intent === 'photos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--base-13)' }}>Number of photos</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([3, 6, 9] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPhotoLimit(n)}
                      style={{ flex: 1, padding: '8px', border: `2px solid ${photoLimit === n ? '#f07054' : '#e4e4ec'}`, borderRadius: 10, background: photoLimit === n ? '#fff8f7' : '#fff', fontSize: 14, fontWeight: 700, color: photoLimit === n ? '#f07054' : 'var(--base-9)', cursor: 'pointer', fontFamily: 'var(--font-family)' }}
                    >
                      {n} photos
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* list type + picked places */}
            {intent === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--base-13)' }}>Show as</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {NEARBY_TYPES.map((t) => (
                      <button key={t.value} type="button" onClick={() => setNearbyType(t.value)}
                        style={{ flex: 1, padding: '8px', border: `2px solid ${nearbyType === t.value ? '#f07054' : '#e4e4ec'}`, borderRadius: 10, background: nearbyType === t.value ? '#fff8f7' : '#fff', fontSize: 13, fontWeight: 600, color: nearbyType === t.value ? '#f07054' : 'var(--base-9)', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {picked.map((p, i) => (
                    <div key={p.location_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: '#f7f7fb', border: '1px solid #e4e4ec' }}>
                      <span style={{ fontSize: 12, color: '#999', minWidth: 18 }}>{i + 1}.</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--base-13)' }}>{p.name}</span>
                      <button type="button" onClick={() => setPicked((prev) => prev.filter((x) => x.location_id !== p.location_id))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16, lineHeight: 1, fontFamily: 'var(--font-family)' }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* nearby type */}
            {intent === 'nearby' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--base-13)' }}>Type of places</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {NEARBY_TYPES.map((t) => (
                    <button key={t.value} type="button" onClick={() => setNearbyType(t.value)}
                      style={{ flex: 1, padding: '8px', border: `2px solid ${nearbyType === t.value ? '#f07054' : '#e4e4ec'}`, borderRadius: 10, background: nearbyType === t.value ? '#fff8f7' : '#fff', fontSize: 13, fontWeight: 600, color: nearbyType === t.value ? '#f07054' : 'var(--base-9)', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <button onClick={onClose} style={{ padding: '9px 20px', border: '1px solid #e4e4ec', borderRadius: 10, background: '#fff', color: '#666', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>Cancel</button>
              <button
                disabled={inserting || (intent === 'list' && picked.length === 0)}
                onClick={insert}
                style={{ padding: '9px 26px', border: 'none', borderRadius: 10, background: '#f07054', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)' }}
              >
                {inserting ? '…' : 'Insert'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
