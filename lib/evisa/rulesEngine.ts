import type { AnswersMap, ConditionRule, CountryDoc, DateFieldOptions, FormElementDoc } from './types'
import { computeVisaDateInfo, type VisaDateInfo } from './dateRules'

function valuesOf(answers: AnswersMap, whenField: string, countryCode?: string): string[] {
  if (whenField === 'country') return countryCode ? [countryCode] : []
  const v = answers[whenField]
  if (v == null || v === '') return []
  return Array.isArray(v) ? v : [v]
}

function conditionMatches(rule: ConditionRule, answers: AnswersMap, countryCode?: string): boolean {
  const current = valuesOf(answers, rule.whenField, countryCode)
  const target = rule.values ?? []

  switch (rule.operator) {
    case 'equals':     return current.length === 1 && current[0] === target[0]
    case 'not_equals': return !(current.length === 1 && current[0] === target[0])
    case 'in':          return current.some((v) => target.includes(v))
    case 'not_in':       return current.length > 0 && !current.some((v) => target.includes(v))
    default: return false
  }
}

/**
 * A field with at least one 'show' rule is hidden until one of its 'show'
 * rules matches ("only appears when X"). A field with no 'show' rules is
 * visible by default and can only be hidden ("hide unless X"). Rules are
 * applied in array order, so a later matching rule wins if both fire.
 */
function resolveVisibility(conditions: ConditionRule[], answers: AnswersMap, countryCode?: string): boolean {
  const hasShowRules = conditions.some((c) => c.action === 'show')
  let visible = !hasShowRules

  for (const rule of conditions) {
    if (!conditionMatches(rule, answers, countryCode)) continue
    if (rule.action === 'show') visible = true
    if (rule.action === 'hide') visible = false
  }

  return visible
}

function priceDeltaOf(conditions: ConditionRule[], answers: AnswersMap, countryCode?: string): number {
  let delta = 0
  for (const rule of conditions) {
    if (!conditionMatches(rule, answers, countryCode)) continue
    if (rule.action === 'price_add') delta += Number(rule.actionValue) || 0
    if (rule.action === 'price_remove') delta -= Number(rule.actionValue) || 0
  }
  return delta
}

/** First matching set_date_rule condition overrides the field's own date options. */
function resolveDateOptions(el: FormElementDoc, answers: AnswersMap, countryCode?: string): DateFieldOptions | undefined {
  for (const rule of el.conditions ?? []) {
    if (rule.action !== 'set_date_rule') continue
    if (!conditionMatches(rule, answers, countryCode)) continue
    return rule.actionValue as DateFieldOptions
  }
  return el.options
}

export interface EvaluationResult {
  visibleFields: Set<string>
  price: number
  dateInfoByField: Record<string, VisaDateInfo>
}

/**
 * Single source of truth for "what does the form look like right now" —
 * call this both client-side (live preview as the user fills the form) and
 * server-side (to re-derive price/dates before trusting anything the client
 * submitted).
 */
export function evaluateForm(
  formElements: FormElementDoc[],
  country: CountryDoc | null,
  visaType: string,
  answers: AnswersMap,
  today: Date = new Date(),
): EvaluationResult {
  const countryCode = country?.code
  const visibleFields = new Set<string>()
  const dateInfoByField: Record<string, VisaDateInfo> = {}

  let price = country?.pricing.find((p) => p.key === visaType)?.price ?? 0

  for (const el of formElements) {
    if (resolveVisibility(el.conditions ?? [], answers, countryCode)) {
      visibleFields.add(el.fieldKey)
    }

    price += priceDeltaOf(el.conditions ?? [], answers, countryCode)

    if (el.type === 'date' || el.type === 'visa_date') {
      const dateOpts = resolveDateOptions(el, answers, countryCode)
      dateInfoByField[el.fieldKey] = computeVisaDateInfo(dateOpts, el.min, el.max, today)
    }
  }

  price += priceDeltaOf(country?.conditions ?? [], answers, countryCode)

  return { visibleFields, price: Math.max(0, price), dateInfoByField }
}
