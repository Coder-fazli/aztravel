'use client'

import { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { MapPin, Pencil, X } from 'lucide-react'
import TripAdvisorPicker from './TripAdvisorPicker'

const LABELS: Record<string, string> = {
  attractions: 'Attractions',
  restaurants: 'Restaurants',
  hotels: 'Hotels',
  reviews: 'Reviews',
}

export default function TripAdvisorNodeView({
  node,
  deleteNode,
  updateAttributes,
}: {
  node: any
  deleteNode: () => void
  updateAttributes: (attrs: Record<string, any>) => void
}) {
  const [editing, setEditing] = useState(false)
  const { location, widget, limit, locationId } = node.attrs

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          border: '1.5px solid var(--base-5,#d9d9d9)',
          borderRadius: 12, background: 'var(--base-3,#f5f5f5)',
          margin: '8px 0', fontFamily: 'var(--font-family)', userSelect: 'none',
        }}
      >
        <MapPin size={16} color="var(--primary-12,#f07054)" style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--base-13)' }}>
          TripAdvisor · {location || '—'} · {LABELS[widget] ?? widget} · {limit} results
        </span>
        <button
          type="button"
          title="Edit block"
          onClick={() => setEditing(true)}
          style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', padding: 3, color: 'var(--base-8)' }}
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          title="Remove block"
          onClick={deleteNode}
          style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', padding: 3, color: 'var(--base-8)' }}
        >
          <X size={14} />
        </button>
      </div>

      {editing && (
        <TripAdvisorPicker
          initialAttrs={{ locationId, location, widget, limit }}
          onInsert={(attrs) => { updateAttributes(attrs); setEditing(false) }}
          onClose={() => setEditing(false)}
        />
      )}
    </NodeViewWrapper>
  )
}
