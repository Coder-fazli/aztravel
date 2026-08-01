'use client'

import { useState } from 'react'
import { saveCategoryFromForm } from '@/lib/actions/admin/categories'
import styles from './BlogForm.module.css'

type Locale = 'en' | 'es' | 'ar'
type LS = { en: string; es: string; ar: string }

const LOCALES: Locale[] = ['en', 'es', 'ar']
const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ar: 'AR' }

function empty(): LS { return { en: '', es: '', ar: '' } }
function initLS(raw: any): LS {
  if (!raw) return empty()
  return { en: raw.en ?? '', es: raw.es ?? '', ar: raw.ar ?? '' }
}
function slugify(s: string) {
  return s.toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function CategoryForm({ category }: { category?: any }) {
  const [lang, setLang] = useState<Locale>('en')
  const [name, setName] = useState<LS>(initLS(category?.name))
  const [description, setDescription] = useState<LS>(initLS(category?.description))
  const [slug, setSlug] = useState<string>(category?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState<boolean>(Boolean(category?.slug))
  const [orderNum, setOrderNum] = useState<string>(String(category?.orderNum ?? 0))

  function handleNameEn(v: string) {
    setName(prev => ({ ...prev, en: v }))
    if (!slugTouched) setSlug(slugify(v))
  }

  function hiddenLangs(field: string, value: LS) {
    return LOCALES.filter(l => l !== lang).map(l => (
      <input key={l} type="hidden" name={`${field}_${l}`} value={value[l]} />
    ))
  }

  return (
    <form action={saveCategoryFromForm} className={styles.form}>
      {category?._id && <input type="hidden" name="id" value={category._id} />}
      <input type="hidden" name="slug" value={slug} />

      <div className={styles.panel} style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          {LOCALES.map(l => (
            <button
              key={l} type="button"
              onClick={() => setLang(l)}
              style={{
                padding: '5px 14px', borderRadius: 8, border: '1.5px solid #e4e4ec',
                background: lang === l ? 'var(--primary-12)' : '#fff',
                color: lang === l ? '#fff' : 'var(--base-8)',
                fontFamily: 'var(--font-family)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {LOCALE_LABEL[l]}
            </button>
          ))}
        </div>

        <label className={styles.field}>
          <span>Name ({lang.toUpperCase()})</span>
          <input
            value={name[lang]}
            onChange={e => lang === 'en' ? handleNameEn(e.target.value) : setName(prev => ({ ...prev, [lang]: e.target.value }))}
            name={`name_${lang}`}
            placeholder="e.g. Food & Culture"
            required={lang === 'en'}
          />
        </label>
        {hiddenLangs('name', name)}

        {lang === 'en' && (
          <label className={styles.field}>
            <span>Slug</span>
            <input value={slug} onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true) }} placeholder="auto-from-name" />
          </label>
        )}

        <label className={styles.field}>
          <span>Description ({lang.toUpperCase()}) — shown on the category page</span>
          <input
            value={description[lang]}
            onChange={e => setDescription(prev => ({ ...prev, [lang]: e.target.value }))}
            name={`description_${lang}`}
          />
        </label>
        {hiddenLangs('description', description)}

        <label className={styles.field}>
          <span>Order</span>
          <input type="number" name="orderNum" value={orderNum} onChange={e => setOrderNum(e.target.value)} />
        </label>

        <div className={styles.actions}>
          <button type="submit" className={styles.submit}>{category?._id ? 'Save changes' : 'Create category'}</button>
          <a href="/admin/blog/categories" className={styles.cancel}>Cancel</a>
        </div>
      </div>
    </form>
  )
}
