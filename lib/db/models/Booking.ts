import mongoose, { Schema, models } from 'mongoose'

const BookingSchema = new Schema({
  bookingRef:  { type: String, required: true, unique: true },

  // tour info — denormalized so bookings survive tour edits
  tour:        { type: Schema.Types.ObjectId, ref: 'Tour' },
  tourTitle:   { type: String, required: true },
  tourSlug:    { type: String, default: '' },

  // what was booked
  date:        { type: Date,   required: true },
  timeSlot:    { type: String, default: '' },
  adults:      { type: Number, required: true, min: 1 },
  children:    { type: Number, default: 0,     min: 0 },
  totalPrice:  { type: Number, required: true },
  currency:    { type: String, default: 'USD' },

  // guest
  guestName:   { type: String, required: true },
  guestEmail:  { type: String, required: true },
  guestPhone:  { type: String, default: '' },
  notes:       { type: String, default: '' },

  // lifecycle
  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true })

BookingSchema.index({ status: 1 })
BookingSchema.index({ guestEmail: 1 })
BookingSchema.index({ date: 1 })
BookingSchema.index({ tour: 1 })

export default models.Booking ?? mongoose.model('Booking', BookingSchema)
