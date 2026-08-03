'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { findMany, findOne, createDoc, updateDoc, removeDoc } from '@/lib/db/crud'
import Country from '@/lib/db/models/evisa/Country'

export async function getCountriesAdmin() {
  const all = await findMany(Country, {})
  return all.sort((a: any, b: any) => (a.orderNum ?? 0) - (b.orderNum ?? 0))
}

export async function getCountryAdmin(id: string) {
  return findOne(Country, { _id: id })
}

// ── helpers ──────────────────────────────────────────────────────────────────
function get(f: FormData, k: string)  { return (f.get(k) as string) || '' }
function num(f: FormData, k: string)  { const v = get(f, k); return v === '' ? undefined : Number(v) }
function bool(f: FormData, k: string) { const v = f.get(k); return v === 'true' || v === 'on' }

// pricing rows and conditions are edited as raw JSON for now — same tradeoff
// as Form Elements: fast to ship, a real builder UI comes once the basics work.
function json(f: FormData, k: string, fallback: any) {
  const raw = get(f, k)
  if (!raw.trim()) return fallback
  try { return JSON.parse(raw) } catch { return fallback }
}

function formToCountry(f: FormData) {
  return {
    code: get(f, 'code').toUpperCase(),
    name: { en: get(f, 'name_en'), es: get(f, 'name_es'), ar: get(f, 'name_ar') },
    flag: get(f, 'flag'),

    eligible: bool(f, 'eligible'),
    orderNum: num(f, 'orderNum') ?? 0,

    baseFee:    num(f, 'baseFee') ?? 0,
    conditions: json(f, 'conditions_json', []),
  }
}

export async function saveCountryFromForm(formData: FormData) {
  const id   = get(formData, 'id')
  const data = formToCountry(formData)

  if (id) {
    await updateDoc(Country, id, data)
  } else {
    await createDoc(Country, data)
  }
  revalidatePath('/admin/evisa/countries')
  redirect('/admin/evisa/countries')
}

export async function deleteCountryFromForm(formData: FormData) {
  const id = formData.get('id') as string
  await removeDoc(Country, id)
  revalidatePath('/admin/evisa/countries')
}
