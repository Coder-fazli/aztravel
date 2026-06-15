import mongoose, { Schema } from 'mongoose'

const i18n = {
    en: { type: String, required: true },
    es: { type: String, default: '' },
    ar: { type: String, default: '' },
}

export const TourSchema = new Schema({
    title:      i18n,
    slug:        { type: String, required: true, unique: true },
    description: i18n,
    type:        { type: String, enum: ['guided', 'private', 'group', 'day-trip'] },
    duration: {
    value: Number,
    unit:  { type: String, enum: ['hours', 'days'] }
    },
    location: { type: Schema.Types.ObjectId, ref: 'Location' },
    guide: { type: Schema.Types.ObjectId, ref: 'Guide' },
    price: { amount:    Number, currency:  
           { type: String, default: 'USD' },
    perPerson: Boolean },
    capacity: { min: Number, max: Number },
    images:   [String],
    itinerary: [{
    title:       i18n,
    description: i18n
  }],
    inclusions: [i18n],
    exclusions: [i18n],
    tags:   [String],
    rating: { avg: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'draft' }
}, { timestamps: true })

TourSchema.index({ slug: 1 })
TourSchema.index({ location: 1 })
TourSchema.index({ status: 1 })
TourSchema.index({ createdAt: -1 })

export default mongoose.models.Tour ?? mongoose.model('Tour', TourSchema)

