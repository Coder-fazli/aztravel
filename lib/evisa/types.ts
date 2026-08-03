// Plain TS shapes mirroring lib/db/models/evisa/*.ts after Mongoose's .lean().
// Kept separate from the Mongoose schemas so this module has zero dependency
// on mongoose — it needs to run unmodified in the browser (live form preview)
// and on the server (authoritative validation/pricing before payment).

export type Locale = 'en' | 'es' | 'ar'
export type LocalizedText = Record<Locale, string>

export type ConditionOperator = 'equals' | 'not_equals' | 'in' | 'not_in'
export type ConditionAction = 'show' | 'hide' | 'price_add' | 'price_remove' | 'set_date_rule'

export interface DateFieldOptions {
  defaultProc?: 'today' | 'date_add' | 'date_del'
  defaultOffsetDays?: number
  validityDays?: number
  stayDays?: number
  closedDays?: string[] // 'YYYY-MM-DD' strings the date picker should block
  // e.g. passport expiry must be >= today + 180 days — a forward-only floor,
  // distinct from `min`/`max` which define a picking window around defaultDate.
  minFutureDays?: number
}

export interface ConditionRule {
  whenField: string // a FormElement.fieldKey, or the literal 'country'
  operator: ConditionOperator
  values: string[]
  action: ConditionAction
  // number for price_add/price_remove, DateFieldOptions-shaped for set_date_rule
  actionValue?: number | DateFieldOptions
}

export type FieldType =
  | 'text' | 'email' | 'number' | 'textarea'
  | 'date' | 'visa_date'
  | 'checkbox' | 'radio' | 'radio_2' | 'select' | 'select_country'
  | 'image'

export interface FieldOption {
  value: string
  label: LocalizedText
}

export interface FormElementDoc {
  fieldKey: string
  type: FieldType
  label: LocalizedText
  description?: LocalizedText
  required: boolean
  isNewPerson: boolean
  orderNum: number
  min?: number
  max?: number
  // shape depends on `type` — see FormElement.ts for the per-type breakdown
  options?: { options?: FieldOption[]; cols?: number; maxFileSizeKb?: number } & DateFieldOptions
  conditions: ConditionRule[]
}

export interface CountryDoc {
  code: string
  name: LocalizedText
  eligible: boolean
  baseFee: number // this country's flat base visa fee, before the visa-type surcharge
  conditions: ConditionRule[]
}

// Visa types (Standard/Urgent/...) are global, not per-country — a flat
// surcharge added on top of the selected country's baseFee. Matches the live
// site's "Estimated total = country fee + processing fee" behavior.
export interface VisaTypeOption {
  key: string
  label: LocalizedText
  surcharge: number
}

// current in-progress form state: fieldKey -> answer
export type AnswersMap = Record<string, string | string[] | undefined>
