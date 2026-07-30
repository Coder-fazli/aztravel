import mongoose, { Schema } from 'mongoose'

const i18n = {
  en: { type: String, default: '' },
  es: { type: String, default: '' },
  ar: { type: String, default: '' },
}

// Rules that show/hide this field, add/remove price, or override visa_date
// math based on the value of another field (or 'country').
export const ConditionRuleSchema = new Schema({
  whenField: { type: String, required: true }, // fieldKey this rule depends on, or 'country'
  operator:  { type: String, enum: ['equals', 'not_equals', 'in', 'not_in'], default: 'in' },
  values:    [String], // values of whenField that trigger this rule

  action: {
    type: String,
    enum: ['show', 'hide', 'price_add', 'price_remove', 'set_date_rule'],
    required: true,
  },
  // number for price_add/price_remove, DateRuleSchema-shaped object for set_date_rule
  actionValue: Schema.Types.Mixed,
}, { _id: false })

export const FormElementSchema = new Schema({
  fieldKey: { type: String, required: true, unique: true }, // stable key stored in Evisa.answers

  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'date', 'visa_date', 'checkbox', 'radio', 'radio_2', 'select', 'select_country', 'image'],
  },

  label:       i18n,
  placeholder: i18n,
  description: i18n, // for visa_date: may contain [stay_day] [validity_day] [start_date] [finish_date] placeholders

  required:    { type: Boolean, default: false },
  isNewPerson: { type: Boolean, default: false }, // shown again when adding an additional applicant

  orderNum: { type: Number, default: 0 },

  // text/number/textarea: character or numeric length bounds
  // date/visa_date: max/min day offsets from the computed default date
  min: Schema.Types.Mixed,
  max: Schema.Types.Mixed,

  // type-specific config, shape depends on `type`:
  //  - checkbox/radio/select:  { options: [{ value, label: i18n }] }
  //  - radio_2:                { options: [...], cols: Number }
  //  - date/visa_date:         { defaultProc: 'today'|'date_add'|'date_del', defaultOffsetDays: Number,
  //                               validityDays: Number, stayDays: Number, closedDays: [String] }
  //  - image:                  { maxFileSizeKb: Number }
  options: Schema.Types.Mixed,

  conditions: [ConditionRuleSchema],
}, { timestamps: true })

FormElementSchema.index({ fieldKey: 1 }, { unique: true })
FormElementSchema.index({ orderNum: 1 })

export default mongoose.models.FormElement ?? mongoose.model('FormElement', FormElementSchema)
