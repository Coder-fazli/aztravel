'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/core'

type Props = { editor: Editor; onClose: () => void }

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
}
const modal: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 28, width: 420,
  display: 'flex', flexDirection: 'column', gap: 16,
  fontFamily: 'var(--font-family)',
}
const fieldStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6,
  fontSize: 13, fontWeight: 600, color: '#1a1a2e',
}
const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #e4e4ec', borderRadius: 9,
  fontSize: 14, color: '#1a1a2e', outline: 'none',
}
const row: React.CSSProperties = { display: 'flex', gap: 10, justifyContent: 'flex-end' }
const btnPrimary: React.CSSProperties = {
  padding: '9px 22px', border: 'none', borderRadius: 10,
  background: '#4f7cf6', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
}
const btnSecondary: React.CSSProperties = {
  padding: '9px 22px', border: '1px solid #e4e4ec', borderRadius: 10,
  background: '#fff', color: '#666', fontSize: 14, cursor: 'pointer',
}

export default function TripAdvisorPicker({ editor, onClose }: Props) {
  const [location, setLocation] = useState('')
  const [widget, setWidget] = useState('attractions')
  const [limit, setLimit] = useState(5)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!location.trim()) return
    editor.chain().focus().insertContent({
      type: 'tripadvisorBlock',
      attrs: { location: location.trim(), widget, limit },
    }).run()
    onClose()
  }

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <strong style={{ fontSize: 16, color: '#1a1a2e' }}>Insert TripAdvisor Block</strong>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={fieldStyle}>
            Location
            <input
              style={inputStyle}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Baku, Azerbaijan"
              required
              autoFocus
            />
          </label>

          <label style={fieldStyle}>
            Widget type
            <select
              style={{ ...inputStyle, background: '#fff' }}
              value={widget}
              onChange={(e) => setWidget(e.target.value)}
            >
              <option value="attractions">Attractions</option>
              <option value="restaurants">Restaurants</option>
              <option value="hotels">Hotels</option>
              <option value="reviews">Reviews</option>
            </select>
          </label>

          <label style={fieldStyle}>
            Limit (max 10)
            <input
              style={inputStyle}
              type="number"
              value={limit}
              onChange={(e) => setLimit(Math.min(10, Math.max(1, Number(e.target.value))))}
              min={1}
              max={10}
            />
          </label>

          <div style={row}>
            <button type="button" style={btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" style={btnPrimary}>Insert</button>
          </div>
        </form>
      </div>
    </div>
  )
}
