'use server'

import { redirect } from 'next/navigation'
import { createBlog } from '@/lib/actions/content'

export async function createBlogFromForm(formData: FormData) {
  
    const get = (key: string) => (formData.get(key) as string) || ''

    const data = {
        title: { en: get('title_en'), es: get('title_es'), ar: get('title_ar') },
        slug:    { en: get('slug_en') },
        excerpt: { en: get('excerpt_en') },
        content: { en: get('content_en') },
        coverImage: get('coverImage'),
        category: get('category').split(',').map((s) =>
         s.trim()).filter(Boolean),
        tags:     get('tags').split(',').map((s) =>
        s.trim()).filter(Boolean),
        readTime: Number(get('readTime')) || 0,
        status:   get('status'),
        images: get('images').split(',').map((s) =>
        s.trim()).filter(Boolean),
        video:  get('video'),
        publishedAt: get('status') === 'published' ? new Date() : undefined,
    }

    await createBlog(data)
    redirect('/admin/blog')
    
}


