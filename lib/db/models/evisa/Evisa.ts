import mongoose, { Schema } from 'mongoose'

// One dynamic answer per FormElement.fieldKey. `value` shape depends on the
// field type: string (text/email/number/date/select/radio), string[] (checkbox),
// or an uploaded file name (image).
const AnswerSchema = new Schema({
  fieldKey: { type: String, required: true },
  value:    Schema.Types.Mixed,
}, { _id: false })

export const EvisaSchema = new Schema({
  // shared by every applicant traveling together, e.g. "AZ-2026-00123"
  applicationNumber: { type: String, required: true },
  // this applicant's position within the party (1st, 2nd person, ...)
  applicantIndex:    { type: Number, required: true, default: 1 },

  country:  { type: String, required: true }, // Country.code
  visaType: { type: String, required: true }, // matches a Country.pricing[].key

  answers: [AnswerSchema],

  // extra documents staff attach after review (e.g. the issued visa PDF) —
  // separate from the applicant's own form answers/uploads
  documents: [String],

  price:    { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'USD' },

  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'rejected'],
    default: 'pending',
  },

  payment: {
    gateway:       { type: String, enum: ['stripe', 'skrill'], default: 'stripe' },
    status:        { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    transactionId: String,
    paidAt:        Date,
  },

  emailSentAt: Date,
  emailSentTo: String,

  user: { type: Schema.Types.ObjectId, ref: 'User' }, // set if the applicant was signed in
}, { timestamps: true })

EvisaSchema.index({ applicationNumber: 1, applicantIndex: 1 }, { unique: true })
EvisaSchema.index({ status: 1 })
EvisaSchema.index({ 'payment.status': 1 })

export default mongoose.models.Evisa ?? mongoose.model('Evisa', EvisaSchema)
