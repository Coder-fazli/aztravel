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

  // Flat base visa fee for this country. Visa type (Standard/Urgent) adds a
  // separate global surcharge on top — see Settings.evisaVisaTypes — matching
  // the live site's "Estimated total = country fee + processing fee".
  baseFee: { type: Number, default: 0 },

  conditions: [ConditionRuleSchema],

  orderNum: { type: Number, default: 0 },
}, { timestamps: true })

CountrySchema.index({ code: 1 }, { unique: true })
CountrySchema.index({ eligible: 1 })
CountrySchema.index({ orderNum: 1 })

export default mongoose.models.Country ?? mongoose.model('Country', CountrySchema)
