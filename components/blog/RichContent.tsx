import { generateHTML } from '@tiptap/html'
import DOMPurify from 'isomorphic-dompurify'
import { contentExtensions } from '@/lib/tiptap/extensions'
import TripAdvisorBlock from './TripAdvisorBlock'

type Segment =
  | { type: 'html'; html: string }
  | { type: 'ta'; locationId: string; location: string; widget: string; limit: number }

// Renders TipTap JSON saved by the admin editor.
// tripadvisorBlock nodes are rendered as the real async server component;
// everything else is generateHTML → DOMPurify → dangerouslySetInnerHTML.
export default async function RichContent({
  doc,
  className,
}: {
  doc: any
  className?: string
}) {
  if (!doc || typeof doc !== 'object') return null

  const nodes: any[] = Array.isArray(doc.content) ? doc.content : []
  const segments: Segment[] = []
  let batch: any[] = []

  const flushBatch = () => {
    if (!batch.length) return
    try {
      const html = generateHTML({ type: 'doc', content: batch }, contentExtensions)
      segments.push({ type: 'html', html: DOMPurify.sanitize(html) })
    } catch { /* malformed node — skip */ }
    batch = []
  }

  for (const node of nodes) {
    if (node.type === 'tripadvisorBlock') {
      flushBatch()
      segments.push({
        type: 'ta',
        locationId: node.attrs?.locationId ?? '',
        location: node.attrs?.location ?? '',
        widget: node.attrs?.widget ?? 'attractions',
        limit: node.attrs?.limit ?? 5,
      })
    } else {
      batch.push(node)
    }
  }
  flushBatch()

  return (
    <div className={className}>
      {segments.map((seg, i) =>
        seg.type === 'html' ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: seg.html }} />
        ) : (
          <TripAdvisorBlock key={i} locationId={seg.locationId} location={seg.location} widget={seg.widget} limit={seg.limit} />
        ),
      )}
    </div>
  )
}
