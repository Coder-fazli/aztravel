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

export interface CountryPricing {
  key: string
  label: LocalizedText
  price: number
}

export interface CountryDoc {
  code: string
  name: LocalizedText
  eligible: boolean
  pricing: CountryPricing[]
  conditions: ConditionRule[]
}

// current in-progress form state: fieldKey -> answer
export type AnswersMap = Record<string, string | string[] | undefined>
