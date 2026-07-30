import mongoose, { Schema } from 'mongoose'
import { ConditionRuleSchema } from './FormElement'

const i18n = {
  en: { type: String, default: '' },
  es: { type: String, default: '' },
  ar: { type: String, default: '' },
}

export const CountrySchema = new Schema({
  name: i18n,
  code: { type: String, required: true, unique: true }, // ISO 3166-1 alpha-2, e.g. 'US'
  flag: { type: String, default: '' },

  eligible: { type: Boolean, default: true }, // can citizens of this country apply at all

  // one entry per visa type offered for this country, e.g. 'tourist' | 'business' | 'urgent' | 'standard'
  pricing: [{
    key:            { type: String, required: true },
    label:          i18n,
    price:          { type: Number, required: true },
    processingTime: i18n,
  }],

  conditions: [ConditionRuleSchema],

  orderNum: { type: Number, default: 0 },
}, { timestamps: true })

CountrySchema.index({ code: 1 }, { unique: true })
CountrySchema.index({ eligible: 1 })
CountrySchema.index({ orderNum: 1 })

export default mongoose.models.Country ?? mongoose.model('Country', CountrySchema)
