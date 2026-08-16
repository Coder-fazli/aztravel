'use server'

import Page from '../db/models/Page'
import { findMany, findOne, createDoc, updateDoc, removeDoc } from '../db/crud'
import { routing } from '@/i18n/routing'

type Locale = (typeof routing.locales)[number]

// Public single page — slug is scoped to its language (e.g. "/en/terms").
export async function getPageBySlug(slug: string, locale: Locale) {
  return findOne(Page, { slug, locale, status: 'published' })
}

export async function getPageTranslations(translationGroupId: string) {
  return findMany(Page, { translationGroupId, status: 'published' })
}

// Get all pages, including drafts, for the admin list.
export async function getAllPages(locale: Locale) {
  return findMany(Page, { locale })
}

export async function getPageGroupsMap() {
  const all = await findMany(Page, {})
  const map: Record<string, string[]> = {}
  for (const p of all) {
    (map[p.translationGroupId] ??= []).push(p.locale)
  }
  return map
}

export async function getPageById(id: string) {
  return findOne(Page, { _id: id })
}

export async function createPage(data: any) {
  return createDoc(Page, data, '/')
}
export async function updatePage(id: string, data: any) {
  return updateDoc(Page, id, data, '/')
}
export async function deletePage(id: string) {
  return removeDoc(Page, id, '/')
}
