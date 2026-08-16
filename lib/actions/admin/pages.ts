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

function slugify(s: string) {
  return s.toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
}

function formToPage(formData: FormData) {
  const get = (key: string) => (formData.get(key) as string) || ''

  // The client already auto-fills slug from title, but this is the actual
  // save boundary — if slug ever arrives empty (JS disabled, a future bug
  // like the one that just shipped, whatever), fall back to deriving it
  // from the title here rather than saving a blank one.
  const title = get('title')
  const slug = get('slug') || slugify(title)

  return {
    locale: get('locale'),
    title,
    slug,
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
    // updatePage/createDoc only revalidate the public '/' path (so the
    // homepage doesn't serve stale content) -- the admin edit page itself
    // was never told to drop its cached render, so re-landing on the same
    // /admin/pages/[id] URL after a save could still show the pre-save
    // status/content until the router cache happened to expire on its own.
    revalidatePath(`/admin/pages/${id}`)
    revalidatePath('/admin/pages')
    redirect(`/admin/pages/${id}`)
  } else {
    const created = await createPage(data)
    revalidatePath('/admin/pages')
    redirect(`/admin/pages/${created._id}`)
  }
}

export async function deletePageFromForm(formData: FormData) {
  const id = formData.get('id') as string
  await deletePage(id)
  revalidatePath('/admin/pages')
}
