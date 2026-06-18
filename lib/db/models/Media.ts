import mongoose, { Schema } from 'mongoose'

const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    filename: String,
    mime: String,
    size: Number,
    alt: { type: String, default: '' },
  },
  { timestamps: true }
)

MediaSchema.index({ createdAt: -1 })

export default mongoose.models.Media ?? mongoose.model('Media', MediaSchema)
