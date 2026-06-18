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

function formToBlog(formData: FormData) {

    const get = (key: string) => (formData.get(key) as string) || ''

    const data = {
        locale: get('locale'),
        title: get('title'),
        slug:  get('slug'),
        excerpt: parseJson(get('excerpt')),
        content: parseJson(get('content')),

        translationGroupId: get('translationGroupId') ||
                            randomUUID(),

        coverImage: get('coverImage'),
        category: get('category').split(',').map((s) =>
         s.trim()).filter(Boolean),
        tags:  get('tags').split(',').map((s) =>
        s.trim()).filter(Boolean),
        readTime: Number(get('readTime')) || 0,
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
    }  else 
           {
            await createBlog(data)
    }
    redirect('/admin/blog')
}


export async function deleteBlogFromForm(formData: FormData) {
    const id = formData.get('id') as string
    await deleteBlog(id)
    revalidatePath('/admin/blog')  
}