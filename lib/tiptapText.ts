// Extract a plain-text snippet from a TipTap JSON document.
// Used for card descriptions / meta descriptions where we need text, not HTML.
export function tiptapText(doc: any, max = 160): string {
  if (!doc || typeof doc !== 'object') return ''
  let out = ''
  const walk = (node: any) => {
    if (!node || out.length >= max) return
    if (node.type === 'text' && node.text) out += node.text + ' '
    if (Array.isArray(node.content)) node.content.forEach(walk)
  }
  walk(doc)
  out = out.replace(/\s+/g, ' ').trim()
  return out.length > max ? out.slice(0, max).trimEnd() + '…' : out
}
