'use server'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { routing } from '@/i18n/routing'
import { createBlog, updateBlog, deleteBlog } from
  '@/lib/actions/content'
import { revalidatePath } from 'next/cache'

// Rich-text fields arrive as a JSON string from the TipTap editor's hidden
// input. Parse them back into objects; fall back to null if empty/invalid.
function parseJson(s: string) {
    if (!s) return null
    try { return JSON.parse(s) } catch { return null }
}

// Auto reading time from the content's word count (~200 words/min, min 1).
function estimateReadTime(doc: any): number {
    if (!doc) return 1
    let words = 0
    const walk = (n: any) => {
        if (!n) return
        if (n.type === 'text' && n.text) {
            words += n.text.trim().split(/\s+/).filter(Boolean).length
        }
        if (Array.isArray(n.content)) n.content.forEach(walk)
    }
    walk(doc)
    return Math.max(1, Math.round(words / 200))
}

function formToBlog(formData: FormData) {

    const get = (key: string) => (formData.get(key) as string) || ''

    const content = parseJson(get('content'))

    const data = {
        locale: get('locale'),
        title: get('title'),
        slug:  get('slug'),
        excerpt: parseJson(get('excerpt')),
        content,

        metaTitle:       get('metaTitle'),
        metaDescription: get('metaDescription'),
        noindex:         get('noindex')   === 'true',
        nofollow:        get('nofollow')  === 'true',
        canonicalUrl:    get('canonicalUrl'),

        translationGroupId: get('translationGroupId') ||
                            randomUUID(),

        coverImage: get('coverImage'),
        coverImageAlt: get('coverImageAlt'),
        category: get('category').split(',').map((s) =>
         s.trim()).filter(Boolean),
        tags:  get('tags').split(',').map((s) =>
        s.trim()).filter(Boolean),
        readTime: estimateReadTime(content),   // auto-detected, not user-entered
        views:    Number(get('views')) || 0,
        status:   get('status'),
        images: get('images').split(',').map((s) =>
        s.trim()).filter(Boolean),
        video:  get('video'),
        publishedAt: get('status') === 'published' ? new Date() : undefined,
    }
     return data
}

export async function saveBlogFromForm(formData: FormData) {
    const id = (formData.get('id') as string) || ''
    const data = formToBlog(formData)

    if (id) {
        await updateBlog(id, data)
        redirect(`/admin/blog/${id}`)             // stay in the editor
    } else {
        const created = await createBlog(data)
        redirect(`/admin/blog/${created._id}`)    // open the new post's editor
    }
}


export async function deleteBlogFromForm(formData: FormData) {
    const id = formData.get('id') as string
    await deleteBlog(id)
    revalidatePath('/admin/blog')  
}