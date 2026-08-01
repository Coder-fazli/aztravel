'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { findMany, findOne, createDoc, updateDoc, removeDoc } from '@/lib/db/crud'
import Category from '@/lib/db/models/Category'

export async function getCategoriesAdmin() {
  const all = await findMany(Category, {})
  return all.sort((a: any, b: any) => (a.orderNum ?? 0) - (b.orderNum ?? 0))
}

export async function getCategoryAdmin(id: string) {
  return findOne(Category, { _id: id })
}

function slugify(s: string) {
  return s.toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
}

function get(f: FormData, k: string) { return (f.get(k) as string) || '' }
function num(f: FormData, k: string) { const v = get(f, k); return v === '' ? undefined : Number(v) }

function formToCategory(f: FormData) {
  const nameEn = get(f, 'name_en')
  const slug = get(f, 'slug') || slugify(nameEn)
  return {
    name: { en: nameEn, es: get(f, 'name_es'), ar: get(f, 'name_ar') },
    slug,
    description: { en: get(f, 'description_en'), es: get(f, 'description_es'), ar: get(f, 'description_ar') },
    orderNum: num(f, 'orderNum') ?? 0,
  }
}

export async function saveCategoryFromForm(formData: FormData) {
  const id = get(formData, 'id')
  const data = formToCategory(formData)

  if (id) {
    await updateDoc(Category, id, data)
  } else {
    await createDoc(Category, data)
  }
  revalidatePath('/admin/blog/categories')
  revalidatePath('/blog')
  redirect('/admin/blog/categories')
}

export async function deleteCategoryFromForm(formData: FormData) {
  const id = formData.get('id') as string
  await removeDoc(Category, id)
  revalidatePath('/admin/blog/categories')
}
