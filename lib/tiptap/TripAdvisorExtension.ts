import { Node } from '@tiptap/core'

export const TripAdvisorExtension = Node.create({
  name: 'tripadvisorBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      locationId: { default: '' },
      location:   { default: '' },
      widget:     { default: 'attractions' },
      limit:      { default: 5 },
      placeIds:   { default: '' },  // comma-separated specific TripAdvisor IDs
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-ta-block]' }]
  },

  renderHTML({ node }) {
    return ['div', { 'data-ta-block': JSON.stringify(node.attrs) }]
  },
})
