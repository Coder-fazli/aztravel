'use client'

import { useState } from 'react'
import styles from './BlogForm.module.css'
import { createBlogFromForm } from '@/lib/actions/admin/blog'
import { useEffect } from 'react'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChnages'


export default function BlogForm() {
  
  const [isDirty, setIsDirty] = useState(false)
  const guard = useUnsavedChanges(isDirty)

  useEffect(() => {
    if (!isDirty) return

    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
   
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])


  return (
    <form
      action={createBlogFromForm}
      onChange={() => setIsDirty(true)}
      className={styles.form}
    >
      <div className={styles.grid}>
        {/* ── Title ── */}
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Title</legend>
          <label className={styles.field}>
            <span>English *</span>
            <input name="title_en" required placeholder="Top 10 things to do in Baku" />
          </label>
          <label className={styles.field}>
            <span>Spanish</span>
            <input name="title_es" />
          </label>
          <label className={styles.field}>
            <span>Arabic</span>
            <input name="title_ar" dir="rtl" />
          </label>
        </fieldset>

        {/* ── Meta ── */}
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Meta</legend>
          <label className={styles.field}>
            <span>Slug (English) *</span>
            <input name="slug_en" required placeholder="top-10-things-to-do-in-baku" />
          </label>
          <label className={styles.field}>
            <span>Cover image URL</span>
            <input name="coverImage" placeholder="/images/baku.jpg" />
          </label>
          <label className={styles.field}>
            <span>Gallery image URLs (comma separated)</span>
            <input name="images" placeholder="/images/a.jpg, /images/b.jpg" />
          </label>
          <label className={styles.field}>
            <span>Video URL</span>
            <input name="video" placeholder="https://youtube.com/..." />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Read time (min)</span>
              <input name="readTime" type="number" min="1" defaultValue={5} />
            </label>
            <label className={styles.field}>
              <span>Status</span>
              <select name="status" defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>
          <label className={styles.field}>
            <span>Category (comma separated)</span>
            <input name="category" placeholder="guide, city" />
          </label>
          <label className={styles.field}>
            <span>Tags (comma separated)</span>
            <input name="tags" placeholder="baku, food" />
          </label>
        </fieldset>
      </div>

      {/* ── Excerpt ── */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Excerpt</legend>
        <label className={styles.field}>
          <span>English</span>
          <textarea name="excerpt_en" rows={2} placeholder="Short summary shown in cards…" />
        </label>
      </fieldset>

      {/* ── Content ── */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Content (English) *</legend>
        <label className={styles.field}>
          <textarea name="content_en" rows={10} required placeholder="Write the article body here…" />
        </label>
      </fieldset>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={!isDirty}>Create post</button>
        <a href="/admin/blog" className={styles.cancel}>Cancel</a>
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
