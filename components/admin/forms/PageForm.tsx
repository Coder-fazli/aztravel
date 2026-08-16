'use client'

import { useState, useEffect } from 'react'
import styles from './BlogForm.module.css'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChnages'
import { savePageFromForm } from '@/lib/actions/admin/pages'
import RichTextEditor from './RichTextEditor'
import SeoPanel from './SeoPanel'

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

export default function PageForm({
  locale = 'en',
  translationGroupId = '',
  page,
}: {
  locale?: string
  translationGroupId?: string
  page?: any
}) {
  const [isDirty, setIsDirty] = useState(false)
  const guard = useUnsavedChanges(isDirty)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const [title, setTitle] = useState(page?.title ?? '')
  const [slug, setSlug] = useState(page?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(page?.slug))

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
    <form action={savePageFromForm} onChange={() => setIsDirty(true)} className={styles.form}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="translationGroupId" value={translationGroupId} />
      <input type="hidden" name="id" value={page?._id ?? ''} />
      {/* SeoPanel's permalink field only updates local state via onSlugChange —
          this is what actually submits it with the form. */}
      <input type="hidden" name="slug" value={slug} />

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
              defaultValue={page?.content ?? undefined}
              dir={dir}
              placeholder="Write the page content here…"
              onChange={() => setIsDirty(true)}
            />
          </div>
        </div>

        {/* ════ SIDEBAR ════ */}
        <aside className={styles.sidebar}>
          {/* Publish */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Publish</span>
            {page && (
              <a
                href={`/${page.locale}/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewLink}
              >
                ↗ View page
              </a>
            )}
            <label className={styles.field}>
              <span>Status</span>
              <select name="status" defaultValue={page?.status ?? 'draft'}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <div className={styles.actions}>
              <button type="submit" className={styles.submit} disabled={!isDirty && !page}>
                {page ? 'Save changes' : 'Create page'}
              </button>
              <a href="/admin/pages" className={styles.cancel}>Cancel</a>
            </div>
          </div>

          {/* SEO (Rank Math-style snippet) */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>SEO</span>
            <SeoPanel
              locale={locale}
              onSlugChange={handleSlug}
              postTitle={title}
              slug={slug}
              defaultMetaTitle={page?.metaTitle ?? ''}
              defaultMetaDescription={page?.metaDescription ?? ''}
              defaultNoindex={page?.noindex ?? false}
              defaultNofollow={page?.nofollow ?? false}
              defaultCanonical={page?.canonicalUrl ?? ''}
              onChange={() => setIsDirty(true)}
            />
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
