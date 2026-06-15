'use server'

import Blog from "../db/models/blog"
import Banner from "../db/models/Banner"
import { findMany, findOne, createDoc, updateDoc, removeDoc } from "../db/crud"


// READ
export async function getBlogs(){
    return findMany(Blog, { status: 'published' }, 'author')
}

export async function getBlogBySlug(slug: string) {
    return findOne(Blog, { 'slug.en': slug, status: 'published' }, 'author')
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