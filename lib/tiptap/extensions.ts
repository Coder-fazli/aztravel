import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { TripAdvisorExtension } from './TripAdvisorExtension'

// Shared content extensions — the SAME list MUST be used by the editor (admin)
// and the server renderer (generateHTML on the public page), otherwise stored
// JSON won't deserialize back to the right HTML.
//
// NOTE: StarterKit v3 already bundles Link + Underline (plus bold/italic/strike/
// code/heading/lists/blockquote/hr), so we don't re-register those — we just
// configure Link through StarterKit's `link` option.
export const contentExtensions = [
  StarterKit.configure({
    link: {
      openOnClick: false,
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
    },
  }),
  Image.configure({ HTMLAttributes: { class: 'editor-image' } }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  TripAdvisorExtension,
]
