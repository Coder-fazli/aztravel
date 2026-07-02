'use client'

import { useState } from 'react'
import { routing } from '@/i18n/routing'
import { saveSettingsFromForm } from '@/lib/actions/admin/settings'
import CoverImageUpload from './CoverImageUpload'
import styles from './SettingsForm.module.css'

const LABELS: Record<string, string> = { en: 'English', es: 'Español', ar: 'العربية' }
const T_MAX = 60
const D_MAX = 160

const DEFAULT_LOGO    = '/images/nav-logo-icon.svg'
const DEFAULT_FAVICON = '/favicon.ico'

type NavItem = { label: string; href: string; visible: boolean }

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'Home',       href: '/',           visible: true },
  { label: 'Tours',      href: '/tours',      visible: true },
  { label: 'Catalog',    href: '/catalog',    visible: true },
  { label: 'Rent a car', href: '/rent-a-car', visible: true },
  { label: 'E-visa',     href: '/e-visa',     visible: true },
  { label: 'Blog',       href: '/blog',       visible: true },
  { label: 'Shop',       href: '/shops',      visible: true },
]

type HeroSlide = {
  image: string
  title: Record<string, string>
  buttonText: Record<string, string>
  buttonLink: Record<string, string>
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { image: '/images/hero-slide-1.jpg', title: { en: 'Enjoy exploring Azerbaijan and its nature!' }, buttonText: { en: 'Explore' }, buttonLink: { en: '/tours' } },
  { image: '/images/hero-slide-2.jpg', title: { en: 'Everything you search for is here, hurry up!' }, buttonText: { en: 'Explore' }, buttonLink: { en: '/tours' } },
  { image: '/images/hero-slide-3.jpg', title: { en: 'Azerbaijani culture, music, cuisine is waiting.' }, buttonText: { en: 'Explore' }, buttonLink: { en: '/tours' } },
]

export default function SettingsForm({ settings }: { settings: any }) {
  const [dirty,       setDirty]      = useState(false)
  const [activeLoc,   setActiveLoc]  = useState<string>(routing.defaultLocale)
  const [sliderOpen,  setSliderOpen] = useState(false)
  const [seoTab,      setSeoTab]     = useState<'snippet' | 'advanced'>('snippet')
  const [noindex,     setNoindex]    = useState<boolean>(settings?.robotsNoindex  ?? false)
  const [nofollow,    setNofollow]   = useState<boolean>(settings?.robotsNofollow ?? false)
  const [canonical,   setCanonical]  = useState<string>(settings?.canonicalUrl    ?? '')

  const [navItems, setNavItems] = useState<NavItem[]>(
    Array.isArray(settings?.navItems) && settings.navItems.length
      ? settings.navItems
      : DEFAULT_NAV_ITEMS
  )

  const toggleNav    = (i: number) => { setNavItems(v => v.map((x, idx) => idx === i ? { ...x, visible: !x.visible } : x)); setDirty(true) }
  const setNavLabel  = (i: number, val: string) => { setNavItems(v => v.map((x, idx) => idx === i ? { ...x, label: val } : x)); setDirty(true) }
  const setNavHref   = (i: number, val: string) => { setNavItems(v => v.map((x, idx) => idx === i ? { ...x, href: val } : x)); setDirty(true) }
  const removeNav    = (i: number) => { setNavItems(v => v.filter((_, idx) => idx !== i)); setDirty(true) }
  const addNav       = () => { setNavItems(v => [...v, { label: '', href: '/', visible: true }]); setDirty(true) }
  const moveNav      = (i: number, dir: -1 | 1) => {
    setNavItems(v => {
      const a = [...v]
      const j = i + dir
      if (j < 0 || j >= a.length) return a
      ;[a[i], a[j]] = [a[j], a[i]]
      return a
    })
    setDirty(true)
  }

  // controlled meta values (all locales) so the preview updates live + all submit
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

  // hero slider — seeded with the current hardcoded slides when none saved yet
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    Array.isArray(settings?.heroSlides) && settings.heroSlides.length
      ? settings.heroSlides
      : DEFAULT_HERO_SLIDES
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

  // active-locale meta (for the tabbed SEO panel)
  const dir = activeLoc === 'ar' ? 'rtl' : 'ltr'
  const t = vals[`metaTitle_${activeLoc}`] ?? ''
  const d = vals[`metaDescription_${activeLoc}`] ?? ''
  const urlPath = activeLoc === routing.defaultLocale ? '' : `/${activeLoc}`

  return (
    <form action={saveSettingsFromForm} className={styles.form}>
      {/* ── SEO (one panel, language tabs) ── */}
      <div className={styles.panel}>
        <span className={styles.panelLabel}>SEO</span>

        {/* snippet / advanced mode tabs */}
        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${seoTab === 'snippet'  ? styles.tabActive : ''}`} onClick={() => setSeoTab('snippet')}>Snippet</button>
          <button type="button" className={`${styles.tab} ${seoTab === 'advanced' ? styles.tabActive : ''}`} onClick={() => setSeoTab('advanced')}>Advanced</button>
        </div>

        {seoTab === 'snippet' && (
          <>
            {/* language tabs */}
            <div className={styles.tabs}>
              {routing.locales.map((loc) => (
                <button type="button" key={loc}
                  className={`${styles.tab} ${activeLoc === loc ? styles.tabActive : ''}`}
                  onClick={() => setActiveLoc(loc)}
                >
                  {LABELS[loc] ?? loc}
                </button>
              ))}
            </div>

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
              <input dir={dir} value={t} onChange={(e) => set(`metaTitle_${activeLoc}`, e.target.value)} placeholder="AzTravel — Discover Azerbaijan" />
            </label>

            <label className={styles.field}>
              <div className={styles.labelRow}>
                <span>Meta description</span>
                <span className={d.length > D_MAX ? styles.over : styles.count}>{d.length} / {D_MAX}</span>
              </div>
              <textarea dir={dir} rows={3} value={d} onChange={(e) => set(`metaDescription_${activeLoc}`, e.target.value)} placeholder="Plan your trip to Azerbaijan — tours, e-visa, destinations…" />
            </label>
          </>
        )}

        {seoTab === 'advanced' && (
          <div className={styles.advancedSeo}>
            <p className={styles.advancedSeoSection}>Robots</p>

            <label className={styles.checkRow}>
              <input type="checkbox" className={styles.checkbox} checked={noindex}
                onChange={(e) => { setNoindex(e.target.checked); setDirty(true) }} />
              <div>
                <span className={styles.checkLabel}>No index</span>
                <p className={styles.checkHint}>Adds <code>noindex</code> — hides the home page from search engines.</p>
              </div>
            </label>

            <label className={styles.checkRow}>
              <input type="checkbox" className={styles.checkbox} checked={nofollow}
                onChange={(e) => { setNofollow(e.target.checked); setDirty(true) }} />
              <div>
                <span className={styles.checkLabel}>No follow</span>
                <p className={styles.checkHint}>Adds <code>nofollow</code> — tells crawlers not to follow links from the home page.</p>
              </div>
            </label>

            <p className={styles.advancedSeoSection} style={{ marginTop: 20 }}>Canonical URL</p>
            <label className={styles.field}>
              <input value={canonical} placeholder="https://azerbaijantravel.com/"
                onChange={(e) => { setCanonical(e.target.value); setDirty(true) }} />
              <p className={styles.hint}>Leave blank to use the default. Only set if you have duplicate content issues.</p>
            </label>
          </div>
        )}

        {/* hidden inputs — every language's value + robots */}
        {routing.locales.flatMap((loc) => [
          <input key={`mt-${loc}`}  type="hidden" name={`metaTitle_${loc}`}       value={vals[`metaTitle_${loc}`] ?? ''}        readOnly />,
          <input key={`md-${loc}`}  type="hidden" name={`metaDescription_${loc}`} value={vals[`metaDescription_${loc}`] ?? ''}  readOnly />,
        ])}
        <input type="hidden" name="robotsNoindex"  value={noindex  ? 'true' : 'false'} readOnly />
        <input type="hidden" name="robotsNofollow" value={nofollow ? 'true' : 'false'} readOnly />
        <input type="hidden" name="canonicalUrl"   value={canonical}                   readOnly />
      </div>

      {/* ── hero slider ── */}
      <div className={styles.panel}>
        <button
          type="button"
          className={styles.collapseToggle}
          onClick={() => setSliderOpen(o => !o)}
        >
          <span className={styles.panelLabel}>Hero slider</span>
          <span className={`${styles.collapseChevron} ${sliderOpen ? styles.collapseChevronOpen : ''}`}>›</span>
        </button>

        {sliderOpen && (
          <div className={styles.collapseBody}>
            {heroSlides.length === 0 && (
              <p className={styles.hint}>
                No slides yet. Image is shared across languages; title, button text and link are per language.
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
                  const ldir = loc === 'ar' ? 'rtl' : 'ltr'
                  return (
                    <div className={styles.slideLang} key={loc}>
                      <span className={styles.langTag}>{LABELS[loc] ?? loc}</span>
                      <input
                        dir={ldir}
                        value={slide.title?.[loc] ?? ''}
                        onChange={(e) => setSlideField(i, 'title', loc, e.target.value)}
                        placeholder="Slide title"
                      />
                      <div className={styles.slideRow}>
                        <input
                          dir={ldir}
                          value={slide.buttonText?.[loc] ?? ''}
                          onChange={(e) => setSlideField(i, 'buttonText', loc, e.target.value)}
                          placeholder="Button text (e.g. Explore)"
                        />
                        <input
                          value={slide.buttonLink?.[loc] ?? ''}
                          onChange={(e) => setSlideField(i, 'buttonLink', loc, e.target.value)}
                          placeholder="Button link (e.g. /tours)"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

            <button type="button" className={styles.addSlide} onClick={addSlide}>+ Add slide</button>
          </div>
        )}
      </div>

      {/* slides submit as one JSON field */}
      <input type="hidden" name="heroSlides" value={JSON.stringify(heroSlides)} readOnly />

      {/* ── navigation menu ── */}
      <div className={styles.panel}>
        <span className={styles.panelLabel}>Navigation menu</span>

        <div className={styles.navList}>
          {navItems.map((item, i) => (
            <div key={i} className={`${styles.navRow} ${!item.visible ? styles.navRowHidden : ''}`}>
              <div className={styles.navMoveCol}>
                <button type="button" className={styles.navMove} onClick={() => moveNav(i, -1)} disabled={i === 0} title="Move up">↑</button>
                <button type="button" className={styles.navMove} onClick={() => moveNav(i, 1)}  disabled={i === navItems.length - 1} title="Move down">↓</button>
              </div>
              <input
                className={styles.navInput}
                value={item.label}
                onChange={(e) => setNavLabel(i, e.target.value)}
                placeholder="Label"
              />
              <input
                className={`${styles.navInput} ${styles.navHrefInput}`}
                value={item.href}
                onChange={(e) => setNavHref(i, e.target.value)}
                placeholder="/path"
              />
              <label className={styles.navToggle} title={item.visible ? 'Visible' : 'Hidden'}>
                <input type="checkbox" checked={item.visible} onChange={() => toggleNav(i)} />
                <span className={styles.navToggleSlider} />
              </label>
              <button type="button" className={styles.navRemove} onClick={() => removeNav(i)} title="Remove">×</button>
            </div>
          ))}
        </div>

        <button type="button" className={styles.addSlide} onClick={addNav}>+ Add menu item</button>
        <input type="hidden" name="navItems" value={JSON.stringify(navItems)} readOnly />
      </div>

      {/* branding */}
      <div className={styles.panel}>
        <span className={styles.panelLabel}>Logo</span>
        <CoverImageUpload name="logo" compact defaultValue={settings?.logo || DEFAULT_LOGO} onChange={() => setDirty(true)} />
      </div>

      <div className={styles.panel}>
        <span className={styles.panelLabel}>Favicon</span>
        <CoverImageUpload name="favicon" compact defaultValue={settings?.favicon || DEFAULT_FAVICON} onChange={() => setDirty(true)} />
        <p className={styles.hint}>Square image (e.g. 512×512). PNG or ICO.</p>
      </div>

      <button type="submit" className={styles.submit} disabled={!dirty}>Save settings</button>
    </form>
  )
}
