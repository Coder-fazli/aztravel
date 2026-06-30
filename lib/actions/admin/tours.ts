'use server'
import { redirect }       from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { generateHTML }   from '@tiptap/html'
import { findMany, findOne, createDoc, updateDoc, removeDoc } from '@/lib/db/crud'
import { contentExtensions } from '@/lib/tiptap/extensions'
import Tour from '@/lib/db/models/Tour'

function jsonToHtml(jsonStr: string): string {
  if (!jsonStr) return ''
  try {
    const doc = JSON.parse(jsonStr)
    // already HTML (e.g. legacy plain-text or loaded from edit) — return as-is
    if (typeof doc === 'string') return doc
    return generateHTML(doc, contentExtensions as any)
  } catch {
    return jsonStr
  }
}

export async function getToursAdmin() {
  return findMany(Tour, {})
}

export async function getTourAdmin(id: string) {
  return findOne(Tour, { _id: id })
}

// ── helpers ──────────────────────────────────────────────────────────────────
function get(f: FormData, k: string)  { return (f.get(k) as string) || '' }
function num(f: FormData, k: string)  { return Number(f.get(k)) || 0 }
function bool(f: FormData, k: string) { const v = f.get(k); return v === 'true' || v === 'on' }
function arr(f: FormData, k: string)  { try { return JSON.parse(get(f, k)) } catch { return [] } }

function formToTour(f: FormData) {
  return {
    title:       { en: get(f,'title_en'),       es: get(f,'title_es'),       ar: get(f,'title_ar') },
    slug:        get(f,'slug'),
    description: {
      en: jsonToHtml(get(f,'description_en')),
      es: jsonToHtml(get(f,'description_es')),
      ar: jsonToHtml(get(f,'description_ar')),
    },

    categories:     get(f,'categories').split(',').map(s => s.trim()).filter(Boolean),
    isSpecialOffer: bool(f,'isSpecialOffer'),
    payLater:       bool(f,'payLater'),
    bookedLast24h:  num(f,'bookedLast24h'),

    duration: { value: num(f,'duration_value'), unit: get(f,'duration_unit') || 'hours' },
    price: {
      original:  num(f,'price_original'),
      final:     num(f,'price_final'),
      currency:  get(f,'price_currency') || 'USD',
      perPerson: bool(f,'price_perPerson'),
    },
    capacity: { min: num(f,'capacity_min'), max: num(f,'capacity_max') },
    cancellationPolicy: {
      free:        bool(f,'cancellation_free'),
      hoursNotice: num(f,'cancellation_hours') || 24,
    },

    location: get(f,'location') || undefined,
    guide:    get(f,'guide')    || undefined,

    images:         (() => { try { return JSON.parse(get(f,'images')) } catch { return [] } })(),
    availableDates: get(f,'availableDates')
      .split('\n').map(s => s.trim()).filter(Boolean).map(s => new Date(s)),

    highlights: arr(f,'highlights_json'),
    inclusions: arr(f,'inclusions_json'),
    exclusions: arr(f,'exclusions_json'),
    itinerary:  arr(f,'itinerary_json'),

    status: get(f,'status') || 'draft',
  }
}

export async function saveTourFromForm(formData: FormData) {
  const id   = get(formData, 'id')
  const data = formToTour(formData)

  if (id) {
    await updateDoc(Tour, id, data)
    redirect(`/admin/tours/${id}`)
  } else {
    const created = await createDoc(Tour, data)
    redirect(`/admin/tours/${created._id}`)
  }
}

export async function deleteTourFromForm(formData: FormData) {
  const id = formData.get('id') as string
  await removeDoc(Tour, id)
  revalidatePath('/admin/tours')
}
