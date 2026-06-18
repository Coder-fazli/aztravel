import { generateHTML } from '@tiptap/html'
import DOMPurify from 'isomorphic-dompurify'
import { contentExtensions } from '@/lib/tiptap/extensions'

// Renders TipTap JSON saved by the admin editor.
// JSON → HTML (using the SAME extensions as the editor) → sanitized → rendered.
export default function RichContent({
  doc,
  className,
}: {
  doc: any
  className?: string
}) {
  if (!doc || typeof doc !== 'object') return null

  let html = ''
  try {
    html = generateHTML(doc, contentExtensions)
  } catch {
    return null
  }

  const clean = DOMPurify.sanitize(html)
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
}
