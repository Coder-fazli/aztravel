'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { findMany, findOne, createDoc, updateDoc, removeDoc } from '@/lib/db/crud'
import FormElement from '@/lib/db/models/evisa/FormElement'

export async function getFormElementsAdmin() {
  const all = await findMany(FormElement, {})
  return all.sort((a: any, b: any) => (a.orderNum ?? 0) - (b.orderNum ?? 0))
}

export async function getFormElementAdmin(id: string) {
  return findOne(FormElement, { _id: id })
}

// ── helpers ──────────────────────────────────────────────────────────────────
function get(f: FormData, k: string)  { return (f.get(k) as string) || '' }
function num(f: FormData, k: string)  { const v = get(f, k); return v === '' ? undefined : Number(v) }
function bool(f: FormData, k: string) { const v = f.get(k); return v === 'true' || v === 'on' }

// `options` and `conditions` are edited as raw JSON textareas for now —
// a proper per-type builder UI (option lists, condition-rule picker) comes later.
function json(f: FormData, k: string, fallback: any) {
  const raw = get(f, k)
  if (!raw.trim()) return fallback
  try { return JSON.parse(raw) } catch { return fallback }
}

function formToFormElement(f: FormData) {
  return {
    fieldKey: get(f, 'fieldKey'),
    type:     get(f, 'type'),

    label:       { en: get(f, 'label_en'),       es: get(f, 'label_es'),       ar: get(f, 'label_ar') },
    placeholder: { en: get(f, 'placeholder_en'), es: get(f, 'placeholder_es'), ar: get(f, 'placeholder_ar') },
    description: { en: get(f, 'description_en'), es: get(f, 'description_es'), ar: get(f, 'description_ar') },

    required:    bool(f, 'required'),
    isNewPerson: bool(f, 'isNewPerson'),
    orderNum:    num(f, 'orderNum') ?? 0,

    min: num(f, 'min'),
    max: num(f, 'max'),

    options:    json(f, 'options_json', undefined),
    conditions: json(f, 'conditions_json', []),
  }
}

export async function saveFormElementFromForm(formData: FormData) {
  const id   = get(formData, 'id')
  const data = formToFormElement(formData)

  if (id) {
    await updateDoc(FormElement, id, data)
  } else {
    await createDoc(FormElement, data)
  }
  revalidatePath('/admin/evisa')
  redirect('/admin/evisa')
}

export async function deleteFormElementFromForm(formData: FormData) {
  const id = formData.get('id') as string
  await removeDoc(FormElement, id)
  revalidatePath('/admin/evisa')
}
