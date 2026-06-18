'use client'

import { useState, useEffect } from 'react'
import styles from './BlogForm.module.css'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChnages'
import { saveBlogFromForm } from '@/lib/actions/admin/blog'
import RichTextEditor from './RichTextEditor'
import CoverImageUpload from './CoverImageUpload'


function slugify(s: string) {
  return s
   .toLocaleLowerCase()
   .normalize('NFKD')
   .replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-z0-9\s-]/g, '')
   .trim()
   .replace(/\s+/g, '-')
   .replace(/-+/g, '-')
}

export default function BlogForm({
  locale = 'en',
  translationGroupId = '',
  post,
}: {
  locale?: string
  translationGroupId?: string
  post?: any
}) {
  const [isDirty, setIsDirty] = useState(false)
  const guard = useUnsavedChanges(isDirty)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug))

 function handleTitle(v: string) {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
 }

 function handleSlug(v: string) {
   setSlug(slugify(v))
   setSlugTouched(true)
 }

  useEffect(() => {
    if (!isDirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  return (
    <form action={saveBlogFromForm} onChange={() => setIsDirty(true)} className={styles.form}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="translationGroupId" value={translationGroupId} />
      <input type="hidden" name="id" value={post?._id ?? ''} />

      <div className={styles.layout}>
        {/* ════ MAIN COLUMN ════ */}
        <div className={styles.main}>
          <input
            className={styles.titleInput}
            name="title"
            required
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            dir={dir}
            placeholder="Add title"
          />

          <div className={styles.panel}>
            <span className={styles.panelLabel}>Content</span>
            <RichTextEditor
              name="content"
              defaultValue={post?.content ?? undefined}
              dir={dir}
              placeholder="Write the article body here…"
              onChange={() => setIsDirty(true)}
            />
          </div>
        </div>

        {/* ════ SIDEBAR ════ */}
        <aside className={styles.sidebar}>
          {/* Publish */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Publish</span>
            <label className={styles.field}>
              <span>Status</span>
              <select name="status" defaultValue={post?.status ?? 'draft'}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <div className={styles.actions}>
              <button type="submit" className={styles.submit} disabled={!isDirty && !post}>
                {post ? 'Save changes' : 'Create post'}
              </button>
              <a href="/admin/blog" className={styles.cancel}>Cancel</a>
            </div>
          </div>

          {/* Organize */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Organize</span>
            <label className={styles.field}>
              <span>Slug *</span>
              <input name="slug" 
              required 
              value={slug} 
              onChange={(e) => handleSlug(e.target.value)}
              placeholder="top-10-things-to-do-in-baku" />
            </label>
            <label className={styles.field}>
              <span>Category (comma separated)</span>
              <input name="category" defaultValue={post?.category?.join(', ') ?? ''} placeholder="guide, city" />
            </label>
            <label className={styles.field}>
              <span>Tags (comma separated)</span>
              <input name="tags" defaultValue={post?.tags?.join(', ') ?? ''} placeholder="baku, food" />
            </label>
            <label className={styles.field}>
              <span>Read time (min)</span>
              <input name="readTime" type="number" min="1" defaultValue={post?.readTime ?? 5} />
            </label>
          </div>

          {/* Media */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Media</span>
            <label className={styles.field}>
              <span>Cover image</span>
              <CoverImageUpload name="coverImage" defaultValue={post?.coverImage ?? ''} onChange={() => setIsDirty(true)} />
            </label>
            <label className={styles.field}>
              <span>Gallery image URLs (comma separated)</span>
              <input name="images" defaultValue={post?.images?.join(', ') ?? ''} placeholder="/images/a.jpg, /images/b.jpg" />
            </label>
            <label className={styles.field}>
              <span>Video URL</span>
              <input name="video" defaultValue={post?.video ?? ''} placeholder="https://youtube.com/..." />
            </label>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={guard.isBlocked}
        title="Discard changes?"
        message="You have unsaved edits that will be lost."
        onConfirm={guard.confirm}
        onCancel={guard.cancel}
      />
    </form>
  )
}
