import mongoose, { Schema } from 'mongoose'
import { routing } from '@/i18n/routing'

// Custom static pages (Terms & Conditions, Privacy Policy, and any future
// one-off content page) editable from the admin like blog posts, instead of
// being hardcoded in the app. Same shape/conventions as BlogSchema, minus
// the blog-specific fields (categories, tags, cover image, read time).
export const PageSchema = new Schema({
    locale: { type: String, enum: [...routing.locales], required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    // TipTap JSON document (rich text), same as Blog.content.
    content: { type: Schema.Types.Mixed, default: null },

    metaTitle:       { type: String,  default: '' },
    metaDescription: { type: String,  default: '' },
    noindex:         { type: Boolean, default: false },
    nofollow:        { type: Boolean, default: false },
    canonicalUrl:    { type: String,  default: '' },

    translationGroupId: { type: String, required: true },

    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: Date,
},
  { timestamps: true }
)

PageSchema.index({ locale: 1, slug: 1 }, { unique: true })
PageSchema.index({ translationGroupId: 1, locale: 1 }, { unique: true })
PageSchema.index({ status: 1 })

export default mongoose.models.Page ?? mongoose.model('Page', PageSchema)
