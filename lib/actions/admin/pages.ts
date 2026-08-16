'use server'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { createPage, updatePage, deletePage } from '@/lib/actions/pages'
import { revalidatePath } from 'next/cache'

// Rich-text field arrives as a JSON string from the TipTap editor's hidden
// input. Parse it back into an object; fall back to null if empty/invalid.
function parseJson(s: string) {
  if (!s) return null
  try { return JSON.parse(s) } catch { return null }
}

function formToPage(formData: FormData) {
  const get = (key: string) => (formData.get(key) as string) || ''

  return {
    locale: get('locale'),
    title: get('title'),
    slug:  get('slug'),
    content: parseJson(get('content')),

    metaTitle:       get('metaTitle'),
    metaDescription: get('metaDescription'),
    noindex:         get('noindex')  === 'true',
    nofollow:        get('nofollow') === 'true',
    canonicalUrl:    get('canonicalUrl'),

    translationGroupId: get('translationGroupId') || randomUUID(),

    status: get('status'),
    publishedAt: get('status') === 'published' ? new Date() : undefined,
  }
}

export async function savePageFromForm(formData: FormData) {
  const id = (formData.get('id') as string) || ''
  const data = formToPage(formData)

  if (id) {
    await updatePage(id, data)
    redirect(`/admin/pages/${id}`)
  } else {
    const created = await createPage(data)
    redirect(`/admin/pages/${created._id}`)
  }
}

export async function deletePageFromForm(formData: FormData) {
  const id = formData.get('id') as string
  await deletePage(id)
  revalidatePath('/admin/pages')
}
