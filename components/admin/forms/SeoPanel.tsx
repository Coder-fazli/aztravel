'use client'

import { useState } from 'react'
import styles from './SeoPanel.module.css'
import { postUrl } from '@/lib/postUrl'

const TITLE_MAX = 60
const DESC_MAX  = 160

type Props = {
  locale:                  string
  postTitle:               string
  onSlugChange:            (v: string) => void
  slug:                    string
  defaultMetaTitle?:       string
  defaultMetaDescription?: string
  defaultNoindex?:         boolean
  defaultNofollow?:        boolean
  defaultCanonical?:       string
  onChange?:               () => void
}

function Meter({ len, max }: { len: number; max: number }) {
  const pct   = Math.min(100, (len / max) * 100)
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
  defaultMetaTitle       = '',
  defaultMetaDescription = '',
  defaultNoindex         = false,
  defaultNofollow        = false,
  defaultCanonical       = '',
  onChange,
}: Props) {
  const [metaTitle, setMetaTitle] = useState(defaultMetaTitle)
  const [metaDesc,  setMetaDesc]  = useState(defaultMetaDescription)
  const [noindex,   setNoindex]   = useState(defaultNoindex)
  const [nofollow,  setNofollow]  = useState(defaultNofollow)
  const [canonical, setCanonical] = useState(defaultCanonical)
  const [open,      setOpen]      = useState(false)
  const [tab,       setTab]       = useState<'snippet' | 'advanced'>('snippet')

  const path         = postUrl(locale, slug || 'post-slug')
  const url          = `aztravel.com${path}`
  const previewTitle = metaTitle || postTitle || 'Your post title appears here'
  const previewDesc  = metaDesc  || 'Add a meta description to control how this post looks in Google search results.'

  return (
    <>
      {/* hidden inputs — always submitted with the form */}
      <input type="hidden" name="metaTitle"       value={metaTitle} />
      <input type="hidden" name="metaDescription" value={metaDesc} />
      <input type="hidden" name="noindex"         value={noindex   ? 'true' : 'false'} />
      <input type="hidden" name="nofollow"        value={nofollow  ? 'true' : 'false'} />
      <input type="hidden" name="canonicalUrl"    value={canonical} />

      {/* sidebar preview */}
      <GooglePreview url={url} title={previewTitle} desc={previewDesc} />

      {/* robots warning badge */}
      {noindex && (
        <div className={styles.robotsBadge}>
          <span className={styles.robotsDot} />
          noindex — hidden from search engines
        </div>
      )}

      <button type="button" className={styles.editBtn} onClick={() => setOpen(true)}>
        Edit SEO
      </button>

      {/* modal */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            {/* sticky header */}
            <div className={styles.head}>
              <h3 className={styles.title}>SEO</h3>
              <button type="button" className={styles.close} onClick={() => setOpen(false)}>×</button>
            </div>

            {/* tabs */}
            <div className={styles.modalTabs}>
              <button
                type="button"
                className={`${styles.modalTab} ${tab === 'snippet'  ? styles.modalTabActive : ''}`}
                onClick={() => setTab('snippet')}
              >
                Snippet
              </button>
              <button
                type="button"
                className={`${styles.modalTab} ${tab === 'advanced' ? styles.modalTabActive : ''}`}
                onClick={() => setTab('advanced')}
              >
                Advanced
              </button>
            </div>

            {/* ── SNIPPET TAB ── */}
            {tab === 'snippet' && (
              <>
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
                  <div className={styles.labelRow}><span>Permalink</span></div>
                  <div className={styles.permalink}>
                    <input
                      className={styles.slugInput}
                      value={slug}
                      onChange={(e) => onSlugChange(e.target.value)}
                      placeholder="post-slug"
                    />
                  </div>
                  <p className={styles.hint}>Lowercase, words joined by hyphens.</p>
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
              </>
            )}

            {/* ── ADVANCED TAB ── */}
            {tab === 'advanced' && (
              <div className={styles.advanced}>
                <p className={styles.advancedSection}>Robots</p>

                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={noindex}
                    onChange={(e) => { setNoindex(e.target.checked); onChange?.() }}
                  />
                  <div>
                    <span className={styles.checkLabel}>No index</span>
                    <p className={styles.checkHint}>
                      Adds <code>noindex</code> — hides this page from Google and other search engines.
                    </p>
                  </div>
                </label>

                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={nofollow}
                    onChange={(e) => { setNofollow(e.target.checked); onChange?.() }}
                  />
                  <div>
                    <span className={styles.checkLabel}>No follow</span>
                    <p className={styles.checkHint}>
                      Adds <code>nofollow</code> — tells search engines not to follow links on this page.
                    </p>
                  </div>
                </label>

                <p className={styles.advancedSection} style={{ marginTop: 24 }}>Canonical URL</p>
                <label className={styles.field}>
                  <input
                    value={canonical}
                    placeholder="https://azerbaijantravel.com/en/blog/your-post"
                    onChange={(e) => { setCanonical(e.target.value); onChange?.() }}
                  />
                  <p className={styles.hint}>
                    Leave blank to use the default URL for this page. Set this if the same content exists at multiple URLs.
                  </p>
                </label>
              </div>
            )}

            <div className={styles.foot}>
              <button type="button" className={styles.done} onClick={() => setOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
