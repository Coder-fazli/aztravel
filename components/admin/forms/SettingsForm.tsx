'use client'

import { useState } from 'react'
import { routing } from '@/i18n/routing'
import { saveSettingsFromForm } from '@/lib/actions/admin/settings'
import CoverImageUpload from './CoverImageUpload'
import styles from './SettingsForm.module.css'

const LABELS: Record<string, string> = { en: 'English', es: 'Español', ar: 'العربية' }
const T_MAX = 60
const D_MAX = 160

type HeroSlide = {
  image: string
  title: Record<string, string>
  buttonText: Record<string, string>
  buttonLink: Record<string, string>
}

export default function SettingsForm({ settings }: { settings: any }) {
  const [dirty, setDirty] = useState(false)

  // controlled values so the Google preview updates live as you type
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const loc of routing.locales) {
      init[`metaTitle_${loc}`] = settings?.metaTitle?.[loc] ?? ''
      init[`metaDescription_${loc}`] = settings?.metaDescription?.[loc] ?? ''
    }
    return init
  })
  const set = (k: string, v: string) => {
    setVals((s) => ({ ...s, [k]: v }))
    setDirty(true)
  }

  // hero slider — array of slides (image shared; title / button text / link per language)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    Array.isArray(settings?.heroSlides) ? settings.heroSlides : []
  )
  const addSlide = () => {
    setHeroSlides((s) => [...s, { image: '', title: {}, buttonText: {}, buttonLink: {} }])
    setDirty(true)
  }
  const removeSlide = (i: number) => {
    setHeroSlides((s) => s.filter((_, idx) => idx !== i))
    setDirty(true)
  }
  const setSlideImage = (i: number, url: string) => {
    setHeroSlides((s) => s.map((sl, idx) => (idx === i ? { ...sl, image: url } : sl)))
    setDirty(true)
  }
  const setSlideField = (
    i: number,
    field: 'title' | 'buttonText' | 'buttonLink',
    loc: string,
    v: string,
  ) => {
    setHeroSlides((s) =>
      s.map((sl, idx) => (idx === i ? { ...sl, [field]: { ...sl[field], [loc]: v } } : sl)),
    )
    setDirty(true)
  }

  return (
    <form action={saveSettingsFromForm} className={styles.form}>
      {routing.locales.map((loc) => {
        const dir = loc === 'ar' ? 'rtl' : 'ltr'
        const t = vals[`metaTitle_${loc}`] ?? ''
        const d = vals[`metaDescription_${loc}`] ?? ''
        const urlPath = loc === routing.defaultLocale ? '' : `/${loc}`
        return (
          <div className={styles.panel} key={loc}>
            <span className={styles.panelLabel}>SEO — {LABELS[loc] ?? loc}</span>

            {/* live Google snippet */}
            <div className={styles.preview}>
              <div className={styles.pUrl}>azerbaijantravel.com{urlPath}</div>
              <div className={styles.pTitle}>{t || 'Your title appears here'}</div>
              <div className={styles.pDesc}>{d || 'Your meta description appears here.'}</div>
            </div>

            <label className={styles.field}>
              <div className={styles.labelRow}>
                <span>Meta title</span>
                <span className={t.length > T_MAX ? styles.over : styles.count}>{t.length} / {T_MAX}</span>
              </div>
              <input
                name={`metaTitle_${loc}`}
                dir={dir}
                value={t}
                onChange={(e) => set(`metaTitle_${loc}`, e.target.value)}
                placeholder="AzTravel — Discover Azerbaijan"
              />
            </label>

            <label className={styles.field}>
              <div className={styles.labelRow}>
                <span>Meta description</span>
                <span className={d.length > D_MAX ? styles.over : styles.count}>{d.length} / {D_MAX}</span>
              </div>
              <textarea
                name={`metaDescription_${loc}`}
                dir={dir}
                rows={3}
                value={d}
                onChange={(e) => set(`metaDescription_${loc}`, e.target.value)}
                placeholder="Plan your trip to Azerbaijan — tours, e-visa, destinations…"
              />
            </label>
          </div>
        )
      })}

      {/* ── hero slider ── */}
      <div className={styles.panel}>
        <span className={styles.panelLabel}>Hero slider</span>
        {heroSlides.length === 0 && (
          <p className={styles.hint}>
            No slides yet. Image is shared across languages; title, button text and button link are per language.
          </p>
        )}

        {heroSlides.map((slide, i) => (
          <div className={styles.slideCard} key={i}>
            <div className={styles.slideHead}>
              <strong>Slide {i + 1}</strong>
              <button type="button" className={styles.removeSlide} onClick={() => removeSlide(i)}>
                Remove
              </button>
            </div>

            <CoverImageUpload
              defaultValue={slide.image}
              onValueChange={(url) => setSlideImage(i, url)}
            />

            {routing.locales.map((loc) => {
              const dir = loc === 'ar' ? 'rtl' : 'ltr'
              return (
                <div className={styles.slideLang} key={loc}>
                  <span className={styles.langTag}>{LABELS[loc] ?? loc}</span>
                  <input
                    dir={dir}
                    value={slide.title?.[loc] ?? ''}
                    onChange={(e) => setSlideField(i, 'title', loc, e.target.value)}
                    placeholder="Slide title"
                  />
                  <div className={styles.slideRow}>
                    <input
                      dir={dir}
                      value={slide.buttonText?.[loc] ?? ''}
                      onChange={(e) => setSlideField(i, 'buttonText', loc, e.target.value)}
                      placeholder="Button text (e.g. Explore)"
                    />
                    <input
                      value={slide.buttonLink?.[loc] ?? ''}
                      onChange={(e) => setSlideField(i, 'buttonLink', loc, e.target.value)}
                      placeholder="Button link (opens in new tab)"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        <button type="button" className={styles.addSlide} onClick={addSlide}>+ Add slide</button>
      </div>

      {/* slides submit as one JSON field */}
      <input type="hidden" name="heroSlides" value={JSON.stringify(heroSlides)} readOnly />

      {/* branding */}
      <div className={styles.panel}>
        <span className={styles.panelLabel}>Logo</span>
        <CoverImageUpload name="logo" defaultValue={settings?.logo ?? ''} onChange={() => setDirty(true)} />
      </div>

      <div className={styles.panel}>
        <span className={styles.panelLabel}>Favicon</span>
        <CoverImageUpload name="favicon" defaultValue={settings?.favicon ?? ''} onChange={() => setDirty(true)} />
        <p className={styles.hint}>Square image (e.g. 512×512). PNG or ICO.</p>
      </div>

      <button type="submit" className={styles.submit} disabled={!dirty}>Save settings</button>
    </form>
  )
}
