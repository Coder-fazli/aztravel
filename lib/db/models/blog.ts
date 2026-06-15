import mongoose, { Schema } from 'mongoose'

const i18n = {
    en: { type: String, required: true },
    es: { type: String, default: '' },
    ar: { type: String, default: '' },
  }

export const BlogSchema = new Schema({
    title: i18n,
    slug: i18n,
    excerpt: i18n,
    content: i18n,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    coverImage: String,
    images: [String],
    tags: [String],
    category: [String],
    status:      { type: String, enum: ['draft','published'], default: 'draft' },
    readTime: Number,
    publishedAt: Date,
    views: { type: Number, default: 59 },
    video: String,
},
 {timestamps: true}
)

  BlogSchema.index({ 'slug.en': 1 }, { unique: true })
  BlogSchema.index({ 'slug.es': 1 }, { unique: true, sparse:
  true })
  BlogSchema.index({ 'slug.ar': 1 }, { unique: true, sparse:
  true })
  BlogSchema.index({ status: 1 })
  BlogSchema.index({ category: 1 })
  BlogSchema.index({ publishedAt: -1 })

  export default mongoose.models.Blog ?? mongoose.model('Blog', BlogSchema)
