'use server'

import Blog from "../db/models/blog"
import Banner from "../db/models/Banner"
import { findMany, findOne, createDoc, updateDoc, removeDoc } from "../db/crud"
import { routing } from "@/i18n/routing"

// READ
type Locale = (typeof routing.locales)[number]

// Public archive - one language at a time.
   export async function getBlogs(locale: Locale ) {
     return findMany(Blog, { locale, status: 'published' }, 'author' )
   }

   // Public single post — slug is scoped to its language.
 export async function getBlogBySlug(slug: string, locale:
 Locale) {
   return findOne(Blog, { slug, locale, status: 'published' },
 'author')
 }
 
 export async function getBlogTranslations (translationGroupId: string) {
    return findMany(Blog, { translationGroupId, status:
 'published' })
 }

 // Get All blogs(Drafts are included)
 export async function getAllBlogs(locale: Locale) {
    return findMany(Blog, { locale })
 }

 export async function getBlogGroupsMap() {
    const all = await findMany(Blog, {})
    const map: Record<string, string[]> = {}
    for (const p of all) {
       (map[p.translationGroupId] ??= []).push(p.locale)
    }
    return map
 }

export async function getBlogById(id: string){
   return findOne(Blog, { _id: id })
}

// WRITE
export async function createBlog(data: any) {
    return createDoc(Blog, data, '/blog')
}
export async function updateBlog(id: string, data: any) {
    return updateDoc(Blog, id, data, '/blog')
}
export async function deleteBlog(id: string) {
    return removeDoc(Blog, id, '/blog')
  }

  export async function getBanner(key: string) {
    return findOne(Banner, { key, status: 'active' })
  }