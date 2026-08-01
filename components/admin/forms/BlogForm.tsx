'use client'

import { useState, useEffect } from 'react'
import styles from './BlogForm.module.css'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChnages'
import { saveBlogFromForm } from '@/lib/actions/admin/blog'
import RichTextEditor from './RichTextEditor'
import CoverImageUpload from './CoverImageUpload'
import SeoPanel from './SeoPanel'
import { postUrl } from '@/lib/postUrl'


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
  categories = [],
}: {
  locale?: string
  translationGroupId?: string
  post?: any
  categories?: any[]
}) {
  const [isDirty, setIsDirty] = useState(false)
  const guard = useUnsavedChanges(isDirty)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const [title, setTitle] = useState(post?.title ?? '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    (post?.categories ?? []).map((c: any) => (typeof c === 'string' ? c : c._id)),
  )

  function toggleCategory(id: string) {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
    setIsDirty(true)
  }
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
            {post && (
              <a
                href={postUrl(post.locale, post.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewLink}
              >
                ↗ View post
              </a>
            )}
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

          {/* SEO (Rank Math-style snippet) */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>SEO</span>
            <SeoPanel
              locale={locale}
              onSlugChange={handleSlug}
              postTitle={title}
              slug={slug}
              defaultMetaTitle={post?.metaTitle ?? ''}
              defaultMetaDescription={post?.metaDescription ?? ''}
              defaultNoindex={post?.noindex ?? false}
              defaultNofollow={post?.nofollow ?? false}
              defaultCanonical={post?.canonicalUrl ?? ''}
              onChange={() => setIsDirty(true)}
            />
          </div>

          {/* Organize */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Organize</span>
            {/* slug is edited via the SEO “Edit snippet” permalink — submitted hidden */}
            <input type="hidden" name="slug" value={slug} />
            <div className={styles.field}>
              <span>Categories</span>
              {categories.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--base-8)' }}>
                  No categories yet — <a href="/admin/blog/categories/new" style={{ color: 'var(--primary-12)' }}>create one</a>.
                </span>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {categories.map((c: any) => {
                  const checked = selectedCategories.includes(c._id)
                  return (
                    <label
                      key={c._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                        borderRadius: 999, border: '1.5px solid #e4e4ec', cursor: 'pointer',
                        background: checked ? 'var(--primary-12)' : '#fff',
                        color: checked ? '#fff' : 'var(--base-9)',
                        fontFamily: 'var(--font-family)', fontSize: 12.5, fontWeight: 600,
                      }}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleCategory(c._id)} style={{ display: 'none' }} />
                      {c.name?.en || c.slug}
                    </label>
                  )
                })}
              </div>
              {selectedCategories.map(id => (
                <input key={id} type="hidden" name="categories" value={id} />
              ))}
            </div>
            <label className={styles.field}>
              <span>Tags (comma separated)</span>
              <input name="tags" defaultValue={post?.tags?.join(', ') ?? ''} placeholder="baku, food" />
            </label>
            <label className={styles.field}>
              <span>Views</span>
              <input name="views" type="number" min="0" defaultValue={post?.views ?? 0} />
            </label>
          </div>

          {/* Media */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Media</span>
            <label className={styles.field}>
              <span>Cover image</span>
              <CoverImageUpload
                name="coverImage"
                defaultValue={post?.coverImage ?? ''}
                altName="coverImageAlt"
                defaultAlt={post?.coverImageAlt ?? ''}
                onChange={() => setIsDirty(true)}
              />
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
