'use server'

import Blog from "../db/models/blog"
import Banner from "../db/models/Banner"
import Category from "../db/models/Category"
import { findMany, findOne, createDoc, updateDoc, removeDoc } from "../db/crud"
import { routing } from "@/i18n/routing"

// READ
type Locale = (typeof routing.locales)[number]

// Public archive - one language at a time.
   export async function getBlogs(locale: Locale ) {
     return findMany(Blog, { locale, status: 'published' }, 'author categories' )
   }

   // Public single post — slug is scoped to its language.
 export async function getBlogBySlug(slug: string, locale:
 Locale) {
   return findOne(Blog, { slug, locale, status: 'published' },
 'author categories')
 }

 // Public: posts in one category (by slug), one language at a time.
 export async function getBlogsByCategory(categorySlug: string, locale: Locale) {
    const category = await findOne(Category, { slug: categorySlug })
    if (!category) return { category: null, posts: [] }
    const posts = await findMany(Blog, { locale, status: 'published', categories: category._id }, 'author categories')
    return { category, posts }
 }

 export async function getCategories() {
    const all = await findMany(Category, {})
    return all.sort((a: any, b: any) => (a.orderNum ?? 0) - (b.orderNum ?? 0))
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