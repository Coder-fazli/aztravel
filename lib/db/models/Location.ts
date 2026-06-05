import mongoose, { Schema } from 'mongoose'

const i18n = {
    en: { type: String, required: true },
    es: { type: String, default: '' },
    ar: { type: String, default: '' },
}

const LocationSchema = new Schema({
      name: i18n,
      slug: { type: String, required: true, unique: true },
      region: String,
      type: [{ type: String, enum: ['city', 'village',
               'attraction', 'mountain', 'beach'] }],
       coordinates: { lat: Number, lng: Number },
       images: [String],
       description: i18n,
       featured:    { type: Boolean, default: false },
}, { timestamps: true })

LocationSchema.index({ featured: 1 })

export default mongoose.models.Location ?? mongoose.model('Location', LocationSchema)
