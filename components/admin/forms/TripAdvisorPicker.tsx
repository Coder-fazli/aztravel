'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/core'

type Props = { editor: Editor; onClose: () => void }

type Result = {
  location_id: string
  name: string
  address_obj?: { city?: string; country?: string }
}

const WIDGETS = [
  { value: 'attractions', label: 'Attractions' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'hotels', label: 'Hotels' },
  { value: 'reviews', label: 'Reviews' },
]

/* ── inline styles (modal only — keeps it isolated from the editor page) ── */
const s = {
  overlay: {
    position: 'fixed' as const, inset: 0,
    background: 'rgba(0,0,0,0.45)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: 28, width: 460, maxHeight: '80vh',
    overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, gap: 18,
    fontFamily: 'var(--font-family)', boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
  },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--base-13)' },
  row: { display: 'flex', gap: 8 },
  input: {
    flex: 1, padding: '9px 12px', border: '1px solid #e4e4ec',
    borderRadius: 10, fontSize: 14, color: 'var(--base-13)', outline: 'none',
    fontFamily: 'var(--font-family)',
  },
  btnSearch: {
    padding: '9px 18px', border: 'none', borderRadius: 10,
    background: 'var(--primary-12, #f07054)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const,
    fontFamily: 'var(--font-family)',
  },
  resultList: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  resultItem: (selected: boolean) => ({
    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
    border: `1.5px solid ${selected ? 'var(--primary-12, #f07054)' : '#e4e4ec'}`,
    background: selected ? '#fff8f7' : '#fff',
    display: 'flex', flexDirection: 'column' as const, gap: 2,
  }),
  resultName: { fontSize: 14, fontWeight: 600, color: 'var(--base-13)' },
  resultAddr: { fontSize: 12, color: 'var(--base-8)' },
  label: {
    display: 'flex', flexDirection: 'column' as const, gap: 6,
    fontSize: 13, fontWeight: 600, color: 'var(--base-13)',
  },
  select: {
    padding: '9px 12px', border: '1px solid #e4e4ec', borderRadius: 10,
    fontSize: 14, color: 'var(--base-13)', outline: 'none', background: '#fff',
    fontFamily: 'var(--font-family)',
  },
  btnRow: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  btnCancel: {
    padding: '9px 20px', border: '1px solid #e4e4ec', borderRadius: 10,
    background: '#fff', color: '#666', fontSize: 14, cursor: 'pointer',
    fontFamily: 'var(--font-family)',
  },
  btnInsert: {
    padding: '9px 22px', border: 'none', borderRadius: 10,
    background: 'var(--primary-12, #f07054)', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-family)',
  },
  divider: { borderTop: '1px solid #f0f0f0', margin: '2px 0' },
  hint: { fontSize: 12, color: 'var(--base-8)' },
  loading: { fontSize: 13, color: 'var(--base-8)', textAlign: 'center' as const, padding: '8px 0' },
}

export default function TripAdvisorPicker({ editor, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<Result | null>(null)
  const [widget, setWidget] = useState('attractions')
  const [limit, setLimit] = useState(5)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(false)
    setSelected(null)
    try {
      const res = await fetch(`/api/tripadvisor/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  const insert = () => {
    if (!selected) return
    const addr = [selected.address_obj?.city, selected.address_obj?.country]
      .filter(Boolean).join(', ')
    editor.chain().focus().insertContent({
      type: 'tripadvisorBlock',
      attrs: {
        locationId: selected.location_id,
        location: addr || selected.name,
        widget,
        limit,
      },
    }).run()
    onClose()
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <strong style={s.title}>Insert TripAdvisor Block</strong>

        {/* search row */}
        <div style={s.row}>
          <input
            style={s.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Search a place — e.g. Firuze Restaurant Baku"
            autoFocus
          />
          <button style={s.btnSearch} onClick={search} disabled={loading}>
            {loading ? '…' : 'Search'}
          </button>
        </div>

        {/* results */}
        {loading && <div style={s.loading}>Searching TripAdvisor…</div>}
        {searched && !loading && results.length === 0 && (
          <div style={s.loading}>No results found. Try a different name.</div>
        )}
        {results.length > 0 && (
          <div style={s.resultList}>
            <span style={s.hint}>Select the exact place:</span>
            {results.slice(0, 8).map((r) => {
              const addr = [r.address_obj?.city, r.address_obj?.country]
                .filter(Boolean).join(', ')
              return (
                <div
                  key={r.location_id}
                  style={s.resultItem(selected?.location_id === r.location_id)}
                  onClick={() => setSelected(r)}
                >
                  <span style={s.resultName}>{r.name}</span>
                  {addr && <span style={s.resultAddr}>{addr}</span>}
                </div>
              )
            })}
          </div>
        )}

        {/* configure — only shown once a place is selected */}
        {selected && (
          <>
            <div style={s.divider} />
            <label style={s.label}>
              Widget type
              <select style={s.select} value={widget} onChange={(e) => setWidget(e.target.value)}>
                {WIDGETS.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </label>
            <label style={s.label}>
              How many results (max 10)
              <input
                style={{ ...s.input, flex: 'unset' }}
                type="number"
                value={limit}
                onChange={(e) => setLimit(Math.min(10, Math.max(1, Number(e.target.value))))}
                min={1} max={10}
              />
            </label>
          </>
        )}

        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>Cancel</button>
          <button style={{ ...s.btnInsert, opacity: selected ? 1 : 0.4 }} onClick={insert} disabled={!selected}>
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}
