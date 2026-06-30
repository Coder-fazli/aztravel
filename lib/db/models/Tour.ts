import mongoose, { Schema } from 'mongoose'

const i18n = {
  en: { type: String, default: '' },
  es: { type: String, default: '' },
  ar: { type: String, default: '' },
}

export const TourSchema = new Schema({
  title:       i18n,
  slug:        { type: String, required: true, unique: true },
  excerpt:     i18n,
  description: i18n,

  categories: [String], // ['multi-day','day-trip','guided','history-culture','nature','adventure']

  isSpecialOffer: { type: Boolean, default: false },
  bookedLast24h:  { type: Number,  default: 0 },

  duration: {
    value: Number,
    unit:  { type: String, enum: ['hours', 'days'] },
  },

  price: {
    original:  Number,  // shown crossed-out
    final:     Number,  // shown in orange — index this
    currency:  { type: String, default: 'USD' },
    perPerson: Boolean,
  },

  availableDates: [Date],

  timeSlots: [{
    date:      Date,
    times:     [String],   // ['10:00', '14:00', '18:00']
    spotsLeft: Number,
  }],

  highlights: [i18n],    // 'Free cancellation', 'Duration 6h', etc.
  conditions: i18n,      // 'Join conditions' rich text

  cancellationPolicy: {
    free:        { type: Boolean, default: false },
    hoursNotice: { type: Number,  default: 24 },
  },
  payLater: { type: Boolean, default: false },

  location: { type: Schema.Types.ObjectId, ref: 'Location' },
  guide:    { type: Schema.Types.ObjectId, ref: 'Guide' },

  images:   [String],
  capacity: { min: Number, max: Number },

  itinerary:  [{ title: i18n, description: i18n }],
  inclusions: [i18n],
  exclusions: [i18n],

  rating: {
    avg:   { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },

  owner:  { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'draft' },
}, { timestamps: true })

TourSchema.index({ status: 1, 'price.final': 1 })
TourSchema.index({ status: 1, categories: 1 })
TourSchema.index({ status: 1, 'duration.value': 1 })
TourSchema.index({ status: 1, 'rating.avg': -1 })
TourSchema.index({ availableDates: 1 })
TourSchema.index({ location: 1 })
TourSchema.index({ createdAt: -1 })

export default mongoose.models.Tour ?? mongoose.model('Tour', TourSchema)
