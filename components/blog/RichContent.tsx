import { generateHTML } from '@tiptap/html'
import DOMPurify from 'isomorphic-dompurify'
import { contentExtensions } from '@/lib/tiptap/extensions'
import TripAdvisorBlock from './TripAdvisorBlock'

type Segment =
  | { type: 'html'; html: string }
  | { type: 'ta'; locationId: string; location: string; widget: string; limit: number; placeIds: string }

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
        location:   node.attrs?.location ?? '',
        widget:     node.attrs?.widget ?? 'attractions',
        limit:      node.attrs?.limit ?? 5,
        placeIds:   node.attrs?.placeIds ?? '',
      })
    } else {
      batch.push(node)
    }
  }
  flushBatch()

  // className (e.g. styles.body) is applied only to HTML segments so its
  // descendant rules (e.g. .body a { text-decoration: underline }) don't
  // bleed into TripAdvisor cards which manage their own link styles.
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === 'html' ? (
          <div key={i} className={className} dangerouslySetInnerHTML={{ __html: seg.html }} />
        ) : (
          <TripAdvisorBlock key={i} locationId={seg.locationId} location={seg.location} widget={seg.widget} limit={seg.limit} placeIds={seg.placeIds} />
        ),
      )}
    </>
  )
}
