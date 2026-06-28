'use client'

import { useState } from 'react'

type Attrs = { locationId: string; location: string; widget: string; limit: number }

type Props = {
  onInsert: (attrs: Attrs) => void
  onClose: () => void
  initialAttrs?: Partial<Attrs>
}

type Result = {
  location_id: string
  name: string
  address_obj?: { city?: string; country?: string }
}

const WIDGETS = [
  { value: 'reviews',     label: 'Reviews of this exact place' },
  { value: 'attractions', label: 'Attractions near this area' },
  { value: 'restaurants', label: 'Restaurants near this area' },
  { value: 'hotels',      label: 'Hotels near this area' },
]

// Guess the place type from its name — TripAdvisor search doesn't return a type field.
const VENUE_KEYWORDS = ['restaurant', 'cafe', 'café', 'bar', 'hotel', 'inn', 'hostel',
  'resort', 'spa', 'museum', 'gallery', 'park', 'beach', 'market', 'shop', 'store']

function guessIsVenue(name: string): boolean {
  const lower = name.toLowerCase()
  return VENUE_KEYWORDS.some((kw) => lower.includes(kw))
}

const s = {
  overlay: {
    position: 'fixed' as const, inset: 0,
    background: 'rgba(0,0,0,0.45)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: 28, width: 480, maxHeight: '82vh',
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

  const [query,    setQuery]    = useState(initialAttrs?.location ?? '')
  const [loading,  setLoading]  = useState(false)
  const [inserting,setInserting]= useState(false)
  const [results,  setResults]  = useState<Result[]>([])
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<Result | null>(null)
  const [widget,   setWidget]   = useState(initialAttrs?.widget ?? 'attractions')
  const [limit,    setLimit]    = useState(initialAttrs?.limit ?? 5)

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
    // Auto-suggest: specific venue → reviews; otherwise → attractions
    setWidget(guessIsVenue(r.name) ? 'reviews' : 'attractions')
  }

  const insert = async () => {
    if (!selected && !isEdit) return
    setInserting(true)
    try {
      if (widget === 'reviews') {
        // Use the exact venue the editor picked.
        const src = selected!
        onInsert({
          locationId: src.location_id,
          location: src.name,
          widget,
          limit,
        })
      } else {
        // For area widgets (attractions / restaurants / hotels) we need a city/area
        // locationId, not the venue's ID. Resolve it now by searching the city name.
        const city = selected?.address_obj?.city
          || (selected?.name ?? initialAttrs?.location ?? query)
        const cityResults = await fetchSearch(city)
        const cityId = cityResults?.[0]?.location_id
        onInsert({
          locationId: cityId || selected?.location_id || initialAttrs?.locationId || '',
          location: city,
          widget,
          limit,
        })
      }
    } catch {
      // fallback — insert with whatever we have
      onInsert({
        locationId: selected?.location_id || initialAttrs?.locationId || '',
        location: selected?.name || initialAttrs?.location || query,
        widget,
        limit,
      })
    } finally {
      setInserting(false)
    }
  }

  const canInsert = (!!selected || isEdit) && !inserting

  // hint based on selected name
  const isVenue = selected ? guessIsVenue(selected.name) : false
  const hint = selected
    ? isVenue
      ? 'This looks like a specific venue — "Reviews" will show its TripAdvisor ratings.'
      : 'This looks like a city or area — choose Attractions, Restaurants or Hotels.'
    : null

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <strong style={s.title}>
          {isEdit ? 'Edit TripAdvisor Block' : 'Insert TripAdvisor Block'}
        </strong>

        {/* search */}
        <div style={s.row}>
          <input
            style={s.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Search a place — e.g. Firuze Restaurant Baku"
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
            <span style={{ ...s.muted, textAlign: 'left' }}>Select the exact place:</span>
            {results.slice(0, 8).map((r) => {
              const addr = [r.address_obj?.city, r.address_obj?.country].filter(Boolean).join(', ')
              const isVenueResult = guessIsVenue(r.name)
              const active = selected?.location_id === r.location_id
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
                </div>
              )
            })}
          </div>
        )}

        {/* smart hint */}
        {hint && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, fontSize: 13, color: 'var(--base-9)',
            background: isVenue ? '#f070540d' : '#8886f50d',
            border: `1px solid ${isVenue ? '#f0705428' : '#8886f528'}`,
          }}>
            <strong style={{ color: isVenue ? '#f07054' : '#8886f5' }}>Tip:</strong> {hint}
          </div>
        )}

        {/* config */}
        {canInsert && (
          <>
            <div style={s.divider} />
            <label style={s.label}>
              Widget type
              <select style={s.select} value={widget} onChange={(e) => setWidget(e.target.value)}>
                {WIDGETS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </label>
            <label style={s.label}>
              How many results (max 10)
              <input
                style={{ ...s.input, flex: 'unset' as const }}
                type="number" value={limit} min={1} max={10}
                onChange={(e) => setLimit(Math.min(10, Math.max(1, Number(e.target.value))))}
              />
            </label>
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
