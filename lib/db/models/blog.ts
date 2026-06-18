import mongoose, { Schema } from 'mongoose'
import { routing } from '@/i18n/routing'

export const BlogSchema = new Schema({
    locale: { type: String, enum: [...routing.locales], 
    required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    // excerpt + content store TipTap JSON documents (rich text), not plain strings.
    excerpt: { type: Schema.Types.Mixed, default: null },
    content: { type: Schema.Types.Mixed, default: null },

    translationGroupId: { type: String, required: true },

    author: { type: Schema.Types.ObjectId, ref: 'User' },
    coverImage: String,
    images: [String],
    tags: [String],
    category: [String],
    status:  { type: String, enum: ['draft','published'], default: 'draft' },
    readTime: Number,
    publishedAt: Date,
    views: { type: Number, default: 59 },
    video: String,
},
 {timestamps: true}
)

  BlogSchema.index({ locale: 1, slug: 1 }, { unique: true })
  BlogSchema.index({ translationGroupId: 1, locale: 1 }, {
  unique: true })
  BlogSchema.index({ status: 1 })
  BlogSchema.index({ category: 1 })
  BlogSchema.index({ publishedAt: -1 })

  export default mongoose.models.Blog ?? mongoose.model('Blog', BlogSchema)
