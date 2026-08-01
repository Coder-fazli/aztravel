import mongoose, { Schema } from 'mongoose'

const i18n = {
  en: { type: String, default: '' },
  es: { type: String, default: '' },
  ar: { type: String, default: '' },
}

const CategorySchema = new Schema({
  name: i18n,
  slug: { type: String, required: true, unique: true },
  description: i18n,
  orderNum: { type: Number, default: 0 },
}, { timestamps: true })

CategorySchema.index({ slug: 1 }, { unique: true })
CategorySchema.index({ orderNum: 1 })

export default mongoose.models.Category ?? mongoose.model('Category', CategorySchema)
