'use client'

import { useState } from 'react'

type Attrs = { locationId: string; location: string; widget: string; limit: number; placeIds: string }

type Props = {
  onInsert: (attrs: Attrs) => void
  onClose: () => void
  initialAttrs?: Partial<Attrs>
}

type Result = {
  location_id: string
  name: string
  result_type?: string
  address_obj?: { city?: string; country?: string }
}

const WIDGETS = [
  { value: 'reviews',     label: 'Reviews of this exact place' },
  { value: 'attractions', label: 'Attractions near this area' },
  { value: 'restaurants', label: 'Restaurants near this area' },
  { value: 'hotels',      label: 'Hotels near this area' },
]

const VENUE_KEYWORDS = [
  'restaurant', 'cafe', 'café', 'bar', 'pub', 'bistro', 'grill', 'kitchen',
  'hotel', 'inn', 'hostel', 'resort', 'suite', 'lodge',
  'spa', 'museum', 'gallery', 'theatre', 'theater', 'cinema',
  'park', 'garden', 'beach', 'market', 'bazaar', 'mall',
  'shop', 'store', 'tower', 'center', 'centre', 'palace',
]

function isArea(r: Result): boolean {
  if (r.result_type) return r.result_type === 'geos'
  const lower = r.name.toLowerCase()
  return !VENUE_KEYWORDS.some((kw) => lower.includes(kw))
}

const s = {
  overlay: {
    position: 'fixed' as const, inset: 0,
    background: 'rgba(0,0,0,0.45)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: 28, width: 520, maxHeight: '88vh',
    overflowY: 'auto' as const,
    display: 'flex', flexDirection: 'column' as const, gap: 16,
    fontFamily: 'var(--font-family)', boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
  },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--base-13)' },
  row: { display: 'flex', gap: 8 },
  input: {
    flex: 1 as const, padding: '9px 12px', border: '1px solid #e4e4ec',
    borderRadius: 10, fontSize: 14, color: 'var(--base-13)', outline: 'none',
    fontFamily: 'var(--font-family)',
  },
  btnSearch: {
    padding: '9px 18px', border: 'none', borderRadius: 10,
    background: 'var(--primary-12,#f07054)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const,
    fontFamily: 'var(--font-family)',
  },
  muted: { fontSize: 12, color: 'var(--base-8)', textAlign: 'center' as const, padding: '4px 0' },
  label: {
    display: 'flex', flexDirection: 'column' as const, gap: 6,
    fontSize: 13, fontWeight: 600, color: 'var(--base-13)',
  },
  select: {
    padding: '9px 12px', border: '1px solid #e4e4ec', borderRadius: 10,
    fontSize: 14, color: 'var(--base-13)', outline: 'none', background: '#fff',
    fontFamily: 'var(--font-family)',
  },
  divider: { borderTop: '1px solid #f0f0f0', margin: '2px 0' },
  btnRow: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  btnCancel: {
    padding: '9px 20px', border: '1px solid #e4e4ec', borderRadius: 10,
    background: '#fff', color: '#666', fontSize: 14, cursor: 'pointer',
    fontFamily: 'var(--font-family)',
  },
  btnPrimary: (enabled: boolean) => ({
    padding: '9px 22px', border: 'none', borderRadius: 10,
    background: 'var(--primary-12,#f07054)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: enabled ? 'pointer' : 'default',
    opacity: enabled ? 1 : 0.4, fontFamily: 'var(--font-family)',
  }),
}

async function fetchSearch(q: string): Promise<Result[]> {
  const res = await fetch(`/api/tripadvisor/search?q=${encodeURIComponent(q)}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export default function TripAdvisorPicker({ onInsert, onClose, initialAttrs }: Props) {
  const isEdit = !!initialAttrs?.locationId

  const [query,     setQuery]     = useState(initialAttrs?.location ?? '')
  const [loading,   setLoading]   = useState(false)
  const [inserting, setInserting] = useState(false)
  const [results,   setResults]   = useState<Result[]>([])
  const [searched,  setSearched]  = useState(false)
  const [selected,  setSelected]  = useState<Result | null>(null)
  const [widget,    setWidget]    = useState(initialAttrs?.widget ?? 'attractions')
  const [limit,     setLimit]     = useState(initialAttrs?.limit ?? 5)

  // Curated place list — each item is a picked Result
  const [pickedPlaces, setPickedPlaces] = useState<Result[]>(() => {
    // Restore from initialAttrs if editing
    return []
  })

  const isCurated = widget !== 'reviews' && pickedPlaces.length > 0

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setSearched(false); setSelected(null)
    try {
      setResults(await fetchSearch(query))
    } catch { setResults([]) }
    finally { setLoading(false); setSearched(true) }
  }

  const pick = (r: Result) => {
    setSelected(r)
    if (!isCurated) {
      setWidget(isArea(r) ? 'attractions' : 'reviews')
    }
  }

  const addToList = (r: Result) => {
    if (pickedPlaces.find((p) => p.location_id === r.location_id)) return
    setPickedPlaces((prev) => [...prev, r])
    // Switch to curated mode — widget becomes whichever area type is selected
    if (widget === 'reviews') setWidget('attractions')
  }

  const removeFromList = (id: string) => {
    setPickedPlaces((prev) => prev.filter((p) => p.location_id !== id))
  }

  const insert = async () => {
    if (!selected && !isEdit && pickedPlaces.length === 0) return
    setInserting(true)
    try {
      if (isCurated) {
        // Curated mode: store specific place IDs, use first place's location as label
        const label = pickedPlaces[0]?.address_obj?.city || pickedPlaces[0]?.name || ''
        onInsert({
          locationId: '',
          location: label,
          widget,
          limit: pickedPlaces.length,
          placeIds: pickedPlaces.map((p) => p.location_id).join(','),
        })
      } else if (selected) {
        if (widget === 'reviews') {
          onInsert({ locationId: selected.location_id, location: selected.name, widget, limit, placeIds: '' })
        } else if (!isArea(selected)) {
          // Venue → resolve city
          const city = selected.address_obj?.city || selected.name
          const cityResults = await fetchSearch(city)
          const geoResult = cityResults.find((r) => r.result_type === 'geos') ?? cityResults[0]
          onInsert({
            locationId: geoResult?.location_id || selected.location_id,
            location: city,
            widget,
            limit,
            placeIds: '',
          })
        } else {
          // Area picked directly
          onInsert({ locationId: selected.location_id, location: selected.name, widget, limit, placeIds: '' })
        }
      } else {
        // Edit mode, no new selection
        onInsert({
          locationId: initialAttrs?.locationId ?? '',
          location:   initialAttrs?.location ?? query,
          widget,
          limit,
          placeIds:   initialAttrs?.placeIds ?? '',
        })
      }
    } catch {
      onInsert({
        locationId: selected?.location_id || initialAttrs?.locationId || '',
        location:   selected?.name || initialAttrs?.location || query,
        widget,
        limit,
        placeIds:   pickedPlaces.map((p) => p.location_id).join(','),
      })
    } finally {
      setInserting(false)
    }
  }

  const canInsert = (!!selected || isEdit || pickedPlaces.length > 0) && !inserting
  const selectedIsArea = selected ? isArea(selected) : false
  const hint = selected && !isCurated
    ? selectedIsArea
      ? 'This is a city or area — choose Attractions, Restaurants or Hotels.'
      : 'This is a specific venue — "Reviews" will show its ratings. Or click "+ Add to list" to build a curated selection.'
    : null

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <strong style={s.title}>
          {isEdit ? 'Edit TripAdvisor Block' : 'Insert TripAdvisor Block'}
        </strong>

        {/* curated list */}
        {pickedPlaces.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ ...s.muted, textAlign: 'left', fontWeight: 600, color: 'var(--base-13)' }}>
              Curated places ({pickedPlaces.length}):
            </span>
            {pickedPlaces.map((p, i) => (
              <div key={p.location_id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 10,
                background: '#f7f7fb', border: '1px solid #e4e4ec',
              }}>
                <span style={{ fontSize: 12, color: '#999', minWidth: 18 }}>{i + 1}.</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--base-13)' }}>{p.name}</span>
                <button
                  type="button"
                  onClick={() => removeFromList(p.location_id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16, lineHeight: 1 }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        {/* search */}
        <div style={s.row}>
          <input
            style={s.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder={pickedPlaces.length ? 'Search another place to add…' : 'Search a place — e.g. Maiden Tower Baku'}
            autoFocus={!isEdit}
          />
          <button style={s.btnSearch} onClick={search} disabled={loading}>
            {loading ? '…' : 'Search'}
          </button>
        </div>

        {loading && <div style={s.muted}>Searching TripAdvisor…</div>}
        {searched && !loading && results.length === 0 && (
          <div style={s.muted}>No results found — try a different name.</div>
        )}

        {/* result list */}
        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ ...s.muted, textAlign: 'left' }}>
              {isCurated || pickedPlaces.length > 0
                ? 'Click "+ Add" to add to curated list, or select one place:'
                : 'Select the exact place:'}
            </span>
            {results.slice(0, 8).map((r) => {
              const addr = [r.address_obj?.city, r.address_obj?.country].filter(Boolean).join(', ')
              const isVenueResult = !isArea(r)
              const active = selected?.location_id === r.location_id
              const alreadyAdded = pickedPlaces.some((p) => p.location_id === r.location_id)
              return (
                <div
                  key={r.location_id}
                  onClick={() => pick(r)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${active ? 'var(--primary-12,#f07054)' : '#e4e4ec'}`,
                    background: active ? '#fff8f7' : '#fff',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--base-13)' }}>{r.name}</div>
                    {addr && <div style={{ fontSize: 12, color: 'var(--base-8)' }}>{addr}</div>}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                    background: isVenueResult ? '#f070541a' : '#8886f51a',
                    color: isVenueResult ? '#f07054' : '#8886f5',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {isVenueResult ? 'Venue' : 'Area'}
                  </span>
                  {/* Add to curated list button — only for non-area results */}
                  {isVenueResult && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); addToList(r) }}
                      disabled={alreadyAdded}
                      style={{
                        border: 'none', borderRadius: 8, padding: '4px 10px',
                        background: alreadyAdded ? '#f0f0f0' : 'var(--primary-12,#f07054)',
                        color: alreadyAdded ? '#aaa' : '#fff',
                        fontSize: 12, fontWeight: 700, cursor: alreadyAdded ? 'default' : 'pointer',
                        whiteSpace: 'nowrap', flexShrink: 0,
                        fontFamily: 'var(--font-family)',
                      }}
                    >
                      {alreadyAdded ? '✓ Added' : '+ Add'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* smart hint */}
        {hint && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, fontSize: 13, color: 'var(--base-9)',
            background: selectedIsArea ? '#8886f50d' : '#f070540d',
            border: `1px solid ${selectedIsArea ? '#8886f528' : '#f0705428'}`,
          }}>
            <strong style={{ color: selectedIsArea ? '#8886f5' : '#f07054' }}>Tip:</strong> {hint}
          </div>
        )}

        {/* config */}
        {canInsert && (
          <>
            <div style={s.divider} />
            {!isCurated && (
              <label style={s.label}>
                Widget type
                <select style={s.select} value={widget} onChange={(e) => setWidget(e.target.value)}>
                  {WIDGETS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </label>
            )}
            {isCurated && (
              <label style={s.label}>
                Show as
                <select style={s.select} value={widget} onChange={(e) => setWidget(e.target.value)}>
                  <option value="attractions">Attractions</option>
                  <option value="restaurants">Restaurants</option>
                  <option value="hotels">Hotels</option>
                </select>
              </label>
            )}
            {!isCurated && (
              <label style={s.label}>
                How many results (max 10)
                <input
                  style={{ ...s.input, flex: 'unset' as const }}
                  type="number" value={limit} min={1} max={10}
                  onChange={(e) => setLimit(Math.min(10, Math.max(1, Number(e.target.value))))}
                />
              </label>
            )}
          </>
        )}

        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>Cancel</button>
          <button style={s.btnPrimary(canInsert)} onClick={insert} disabled={!canInsert}>
            {inserting ? '…' : isEdit ? 'Update' : 'Insert'}
          </button>
        </div>
      </div>
    </div>
  )
}
