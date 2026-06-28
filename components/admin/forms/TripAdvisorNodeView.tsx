'use client'

import { NodeViewWrapper } from '@tiptap/react'
import { MapPin, X } from 'lucide-react'

const LABELS: Record<string, string> = {
  attractions: 'Attractions',
  restaurants: 'Restaurants',
  hotels: 'Hotels',
  reviews: 'Reviews',
}

export default function TripAdvisorNodeView({
  node,
  deleteNode,
}: {
  node: any
  deleteNode: () => void
}) {
  const { location, widget, limit } = node.attrs

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          border: '1.5px solid var(--base-5, #d9d9d9)',
          borderRadius: 12,
          background: 'var(--base-3, #f5f5f5)',
          margin: '8px 0',
          fontFamily: 'var(--font-family)',
          userSelect: 'none',
        }}
      >
        <MapPin size={16} color="var(--primary-12, #f07054)" style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, color: 'var(--base-13, #000)', fontWeight: 600 }}>
          TripAdvisor · {location || '—'} · {LABELS[widget] ?? widget} · {limit} results
        </span>
        <button
          type="button"
          onClick={deleteNode}
          title="Remove block"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'none', cursor: 'pointer', padding: 2,
            color: 'var(--base-8, #595959)',
          }}
        >
          <X size={14} />
        </button>
      </div>
    </NodeViewWrapper>
  )
}
