'use client'

import { useState } from 'react'
import styles from './SeoPanel.module.css'
import { postUrl } from '@/lib/postUrl'

const TITLE_MAX = 60
const DESC_MAX = 160

type Props = {
  locale: string
  postTitle: string
  onSlugChange: (v: string) => void  
  slug: string
  defaultMetaTitle?: string
  defaultMetaDescription?: string
  onChange?: () => void
}

function Meter({ len, max }: { len: number; max: number }) {
  const pct = Math.min(100, (len / max) * 100)
  const color = len === 0 ? '#d1d5db' : len <= max ? '#22a06b' : '#e5533c'
  return (
    <div className={styles.meter}>
      <div className={styles.meterFill} style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function GooglePreview({ url, title, desc }: { url: string; title: string; desc: string }) {
  return (
    <div className={styles.gp}>
      <div className={styles.gpUrl}>{url}</div>
      <div className={styles.gpTitle}>{title}</div>
      <div className={styles.gpDesc}>{desc}</div>
    </div>
  )
}

export default function SeoPanel({
  locale,
  postTitle,
  slug,
  onSlugChange,
  defaultMetaTitle = '',
  defaultMetaDescription = '',
  onChange,
}: Props) {
  const [metaTitle, setMetaTitle] = useState(defaultMetaTitle)
  const [metaDesc, setMetaDesc] = useState(defaultMetaDescription)
  const [open, setOpen] = useState(false)

  const path = postUrl(locale, slug || 'post-slug')
  const url = `aztravel.com${path}`
  const previewTitle = metaTitle || postTitle || 'Your post title appears here'
  const previewDesc =
    metaDesc || 'Add a meta description to control how this post looks in Google search results.'

  return (
    <>
      {/* values submitted with the form */}
      <input type="hidden" name="metaTitle" value={metaTitle} />
      <input type="hidden" name="metaDescription" value={metaDesc} />

      {/* sidebar preview */}
      <GooglePreview url={url} title={previewTitle} desc={previewDesc} />
      <button type="button" className={styles.editBtn} onClick={() => setOpen(true)}>
        Edit snippet
      </button>

      {/* modal editor */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.head}>
              <h3 className={styles.title}>Edit snippet</h3>
              <button type="button" className={styles.close} onClick={() => setOpen(false)}>×</button>
            </div>

            <GooglePreview url={url} title={previewTitle} desc={previewDesc} />

            <label className={styles.field}>
              <div className={styles.labelRow}>
                <span>Title</span>
                <span className={metaTitle.length > TITLE_MAX ? styles.over : styles.count}>
                  {metaTitle.length} / {TITLE_MAX}
                </span>
              </div>
              <input
                value={metaTitle}
                placeholder={postTitle || 'Search engine title'}
                onChange={(e) => { setMetaTitle(e.target.value); onChange?.() }}
              />
              <Meter len={metaTitle.length} max={TITLE_MAX} />
              <p className={styles.hint}>Shown as the clickable headline in search results.</p>
            </label>

             <label className={styles.field}>
               <div 
                 className={styles.labelRow}><span>Permalink</span></div>
                    <div className={styles.permalink}>
                      <input
                        className={styles.slugInput}
                        value={slug}
                        onChange={(e) => onSlugChange(e.target.value)}
                         placeholder="post-slug"
                        />
                </div>
                      <p className={styles.hint}>This is the page URL.
                 Lowercase, words joined by hyphens.</p>
              </label>
 
            <label className={styles.field}>
              <div className={styles.labelRow}>
                <span>Description</span>
                <span className={metaDesc.length > DESC_MAX ? styles.over : styles.count}>
                  {metaDesc.length} / {DESC_MAX}
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDesc}
                placeholder="Meta description…"
                onChange={(e) => { setMetaDesc(e.target.value); onChange?.() }}
              />
              <Meter len={metaDesc.length} max={DESC_MAX} />
              <p className={styles.hint}>Shown as the grey text under the title in search results.</p>
            </label>

            <div className={styles.foot}>
              <button type="button" className={styles.done} onClick={() => setOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
