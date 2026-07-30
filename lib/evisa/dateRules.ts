import type { DateFieldOptions } from './types'

const DAY_MS = 24 * 60 * 60 * 1000

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** The field's own default date, before min/max/validity are applied. */
export function computeDefaultDate(opts: DateFieldOptions | undefined, today: Date = new Date()): Date {
  const proc = opts?.defaultProc ?? 'today'
  const offset = opts?.defaultOffsetDays ?? 0
  if (proc === 'date_add') return addDays(today, offset)
  if (proc === 'date_del') return addDays(today, -offset)
  return today
}

export interface VisaDateInfo {
  defaultDate: string // the field's computed default ("start_date" placeholder)
  minDate?: string // `min` days before defaultDate — earliest date pickable
  maxDate?: string // `max` days after defaultDate — latest date pickable
  validityDate?: string // defaultDate minus validityDays ("finish_date" placeholder)
  closedRanges: { from: string; to: string }[]
}

/** Computes every date derived from a date/visa_date field's config, for a given "today". */
export function computeVisaDateInfo(
  opts: DateFieldOptions | undefined,
  min: number | undefined,
  max: number | undefined,
  today: Date = new Date(),
): VisaDateInfo {
  const defaultDate = computeDefaultDate(opts, today)

  const info: VisaDateInfo = {
    defaultDate: toISODate(defaultDate),
    closedRanges: (opts?.closedDays ?? []).map((d) => ({ from: d.trim(), to: d.trim() })),
  }

  if (max != null) info.maxDate = toISODate(addDays(defaultDate, max))
  if (min != null) info.minDate = toISODate(addDays(defaultDate, -min))
  if (opts?.validityDays != null) info.validityDate = toISODate(addDays(defaultDate, -opts.validityDays))

  return info
}

/** Replaces [stay_day] [validity_day] [start_date] [finish_date] placeholders in a description string. */
export function resolveDescriptionPlaceholders(
  description: string,
  opts: DateFieldOptions | undefined,
  info: VisaDateInfo,
): string {
  return description
    .replaceAll('[stay_day]', String(opts?.stayDays ?? ''))
    .replaceAll('[validity_day]', String(opts?.validityDays ?? ''))
    .replaceAll('[start_date]', info.defaultDate)
    .replaceAll('[finish_date]', info.validityDate ?? '')
}
