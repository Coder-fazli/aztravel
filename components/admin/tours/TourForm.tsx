'use client'

import { useState } from 'react'
import { saveTourFromForm }    from '@/lib/actions/admin/tours'
import RichTextEditor          from '@/components/admin/forms/RichTextEditor'
import GalleryImageUpload      from './GalleryImageUpload'
import AvailableDatesPicker    from './AvailableDatesPicker'
import styles from './TourForm.module.css'

type Locale = 'en' | 'es' | 'ar'
type LS     = { en: string; es: string; ar: string }
type Step   = { title: LS; description: LS }

const LOCALES: Locale[]              = ['en', 'es', 'ar']
const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ar: 'AR' }
const CATEGORIES = ['multi-day','day-trip','guided','history-culture','nature','adventure']

function empty(): LS { return { en: '', es: '', ar: '' } }

function slugify(s: string) {
  return s.toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
}

function initLS(raw: any): LS {
  if (!raw) return empty()
  if (typeof raw === 'string') return { en: raw, es: '', ar: '' }
  return { en: raw.en ?? '', es: raw.es ?? '', ar: raw.ar ?? '' }
}

export default function TourForm({ tour }: { tour?: any }) {
  const [lang, setLang] = useState<Locale>('en')

  // ── localized text ──
  const [title,      setTitle]      = useState<LS>(initLS(tour?.title))
  const [slug,       setSlug]       = useState<string>(tour?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState<boolean>(Boolean(tour?.slug))

  // ── localized arrays ──
  const [highlights, setHighlights] = useState<LS[]>((tour?.highlights ?? []).map(initLS))
  const [inclusions, setInclusions] = useState<LS[]>((tour?.inclusions ?? []).map(initLS))
  const [exclusions, setExclusions] = useState<LS[]>((tour?.exclusions ?? []).map(initLS))
  const [itinerary,  setItinerary]  = useState<Step[]>(
    (tour?.itinerary ?? []).map((s: any) => ({
      title:       initLS(s?.title),
      description: initLS(s?.description),
    }))
  )

  // ── sidebar ──
  const [status,     setStatus]    = useState<string>(tour?.status ?? 'draft')
  const [categories, setCats]      = useState<string[]>(tour?.categories ?? [])
  const [priceOrig,  setPriceOrig] = useState<string>(String(tour?.price?.original ?? ''))
  const [priceFin,   setPriceFin]  = useState<string>(String(tour?.price?.final ?? ''))
  const [priceCur,   setPriceCur]  = useState<string>(tour?.price?.currency ?? 'USD')
  const [durVal,     setDurVal]    = useState<string>(String(tour?.duration?.value ?? ''))
  const [durUnit,    setDurUnit]   = useState<string>(tour?.duration?.unit ?? 'hours')
  const [capMin,     setCapMin]    = useState<string>(String(tour?.capacity?.min ?? ''))
  const [capMax,     setCapMax]    = useState<string>(String(tour?.capacity?.max ?? ''))
  const [isSpecial,  setIsSpecial] = useState<boolean>(tour?.isSpecialOffer ?? false)
  const [payLater,   setPayLater]  = useState<boolean>(tour?.payLater ?? false)
  const [canFree,    setCanFree]   = useState<boolean>(tour?.cancellationPolicy?.free ?? false)
  const [canHours,   setCanHours]  = useState<string>(String(tour?.cancellationPolicy?.hoursNotice ?? 24))
  const [location,   setLocation]  = useState<string>(String(tour?.location ?? ''))
  const [guide,      setGuide]     = useState<string>(String(tour?.guide ?? ''))
  const defaultAvailDates: string[] = (tour?.availableDates ?? []).map(
    (d: any) => new Date(d).toISOString().slice(0, 10)
  )

  // ── helpers ──
  function handleTitle(v: string) {
    setTitle(prev => ({ ...prev, [lang]: v }))
    if (!slugTouched && lang === 'en') setSlug(slugify(v))
  }

  function toggleCat(cat: string) {
    setCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  function updateLS(setter: React.Dispatch<React.SetStateAction<LS[]>>, i: number, v: string) {
    setter(prev => prev.map((item, idx) => idx === i ? { ...item, [lang]: v } : item))
  }

  function addLS(setter: React.Dispatch<React.SetStateAction<LS[]>>) {
    setter(prev => [...prev, empty()])
  }

  function removeLS(setter: React.Dispatch<React.SetStateAction<LS[]>>, i: number) {
    setter(prev => prev.filter((_, idx) => idx !== i))
  }

  // inactive-language hidden inputs for simple text fields
  function hiddenLangs(name: string, value: LS) {
    return LOCALES.filter(l => l !== lang).map(l => (
      <input key={l} type="hidden" name={`${name}_${l}`} value={value[l]} />
    ))
  }

  return (
    <form action={saveTourFromForm} className={styles.form}>
      {tour?._id && <input type="hidden" name="id" value={tour._id} />}

      {/* serialized array state */}
      <input type="hidden" name="highlights_json" value={JSON.stringify(highlights)} />
      <input type="hidden" name="inclusions_json" value={JSON.stringify(inclusions)} />
      <input type="hidden" name="exclusions_json" value={JSON.stringify(exclusions)} />
      <input type="hidden" name="itinerary_json"  value={JSON.stringify(itinerary)}  />

      {/* ── language tabs ── */}
      <div className={styles.langTabs}>
        {LOCALES.map(l => (
          <button
            key={l} type="button"
            className={`${styles.langTab} ${lang === l ? styles.langActive : ''}`}
            onClick={() => setLang(l)}
          >
            {LOCALE_LABEL[l]}
          </button>
        ))}
        <span className={styles.langHint}>Editing {lang.toUpperCase()} content</span>
      </div>

      <div className={styles.layout}>

        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className={styles.main}>

          {/* Title + slug */}
          <div className={styles.panel}>
            <input
              className={styles.titleInput}
              placeholder={`Tour title (${lang.toUpperCase()})`}
              value={title[lang]}
              onChange={e => handleTitle(e.target.value)}
              name={`title_${lang}`}
            />
            {hiddenLangs('title', title)}

            {lang === 'en' ? (
              <div className={styles.field}>
                <span>Slug</span>
                <input
                  name="slug"
                  value={slug}
                  onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true) }}
                  placeholder="auto-from-title"
                />
              </div>
            ) : (
              <input type="hidden" name="slug" value={slug} />
            )}
          </div>

          {/* Description — TipTap rich editor, one per language */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Description</span>
            {LOCALES.map(l => (
              <div key={l} style={{ display: lang === l ? 'block' : 'none' }}>
                <RichTextEditor
                  name={`description_${l}`}
                  defaultValue={tour?.description?.[l] ?? ''}
                  placeholder={`Tour description (${l.toUpperCase()})`}
                  dir={l === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelLabel}>Highlights</span>
              <button type="button" className={styles.addBtn} onClick={() => addLS(setHighlights)}>+ Add</button>
            </div>
            {highlights.map((h, i) => (
              <div key={i} className={styles.listRow}>
                <input
                  className={styles.listInput}
                  placeholder={`Highlight (${lang.toUpperCase()})`}
                  value={h[lang]}
                  onChange={e => updateLS(setHighlights, i, e.target.value)}
                />
                <button type="button" className={styles.removeBtn} onClick={() => removeLS(setHighlights, i)}>✕</button>
              </div>
            ))}
            {highlights.length === 0 && <p className={styles.empty}>No highlights — click Add.</p>}
          </div>

          {/* Inclusions */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelLabel}>Included</span>
              <button type="button" className={styles.addBtn} onClick={() => addLS(setInclusions)}>+ Add</button>
            </div>
            {inclusions.map((item, i) => (
              <div key={i} className={styles.listRow}>
                <input
                  className={styles.listInput}
                  placeholder={`Included item (${lang.toUpperCase()})`}
                  value={item[lang]}
                  onChange={e => updateLS(setInclusions, i, e.target.value)}
                />
                <button type="button" className={styles.removeBtn} onClick={() => removeLS(setInclusions, i)}>✕</button>
              </div>
            ))}
            {inclusions.length === 0 && <p className={styles.empty}>No inclusions yet.</p>}
          </div>

          {/* Exclusions */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelLabel}>Not included</span>
              <button type="button" className={styles.addBtn} onClick={() => addLS(setExclusions)}>+ Add</button>
            </div>
            {exclusions.map((item, i) => (
              <div key={i} className={styles.listRow}>
                <input
                  className={styles.listInput}
                  placeholder={`Excluded item (${lang.toUpperCase()})`}
                  value={item[lang]}
                  onChange={e => updateLS(setExclusions, i, e.target.value)}
                />
                <button type="button" className={styles.removeBtn} onClick={() => removeLS(setExclusions, i)}>✕</button>
              </div>
            ))}
            {exclusions.length === 0 && <p className={styles.empty}>No exclusions yet.</p>}
          </div>

          {/* Itinerary */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelLabel}>Itinerary</span>
              <button
                type="button" className={styles.addBtn}
                onClick={() => setItinerary(prev => [...prev, { title: empty(), description: empty() }])}
              >
                + Add day
              </button>
            </div>
            {itinerary.map((step, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepHead}>
                  <span className={styles.stepDay}>Day {i + 1}</span>
                  <button type="button" className={styles.removeBtn}
                    onClick={() => setItinerary(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                </div>
                <input
                  className={styles.listInput}
                  placeholder={`Title (${lang.toUpperCase()})`}
                  value={step.title[lang]}
                  onChange={e => {
                    const v = e.target.value
                    setItinerary(prev => prev.map((s, idx) =>
                      idx === i ? { ...s, title: { ...s.title, [lang]: v } } : s
                    ))
                  }}
                />
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder={`Description (${lang.toUpperCase()})`}
                  value={step.description[lang]}
                  onChange={e => {
                    const v = e.target.value
                    setItinerary(prev => prev.map((s, idx) =>
                      idx === i ? { ...s, description: { ...s.description, [lang]: v } } : s
                    ))
                  }}
                />
              </div>
            ))}
            {itinerary.length === 0 && <p className={styles.empty}>No itinerary steps yet.</p>}
          </div>

          {/* Gallery images */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Gallery images</span>
            <GalleryImageUpload
              name="images"
              defaultValue={tour?.images ?? []}
            />
          </div>
        </div>

        {/* ══════════ RIGHT SIDEBAR ══════════ */}
        <div className={styles.sidebar}>

          {/* Publish */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Status</span>
            <select name="status" className={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <div className={styles.actions}>
              <button type="submit" className={styles.submit}>
                {tour ? 'Save changes' : 'Create tour'}
              </button>
              <a href="/admin/tours" className={styles.cancel}>Cancel</a>
            </div>
          </div>

          {/* Price */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Price</span>
            <div className={styles.row2}>
              <div className={styles.field}>
                <span>Original</span>
                <input type="number" name="price_original" min={0} step={0.01}
                  value={priceOrig} onChange={e => setPriceOrig(e.target.value)} />
              </div>
              <div className={styles.field}>
                <span>Final</span>
                <input type="number" name="price_final" min={0} step={0.01}
                  value={priceFin} onChange={e => setPriceFin(e.target.value)} />
              </div>
            </div>
            <div className={styles.field}>
              <span>Currency</span>
              <select name="price_currency" className={styles.select} value={priceCur} onChange={e => setPriceCur(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="AZN">AZN</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Duration + Capacity */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Duration</span>
            <div className={styles.row2}>
              <div className={styles.field}>
                <span>Value</span>
                <input type="number" name="duration_value" min={1}
                  value={durVal} onChange={e => setDurVal(e.target.value)} />
              </div>
              <div className={styles.field}>
                <span>Unit</span>
                <select name="duration_unit" className={styles.select} value={durUnit} onChange={e => setDurUnit(e.target.value)}>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <span className={styles.panelLabel} style={{ marginTop: 4 }}>Capacity</span>
            <div className={styles.row2}>
              <div className={styles.field}>
                <span>Min guests</span>
                <input type="number" name="capacity_min" min={1}
                  value={capMin} onChange={e => setCapMin(e.target.value)} />
              </div>
              <div className={styles.field}>
                <span>Max guests</span>
                <input type="number" name="capacity_max" min={1}
                  value={capMax} onChange={e => setCapMax(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Categories</span>
            <input type="hidden" name="categories" value={categories.join(',')} />
            <div className={styles.catPills}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.catPill} ${categories.includes(cat) ? styles.catPillActive : ''}`}
                  onClick={() => toggleCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Options</span>
            <label className={styles.toggle}>
              <input type="checkbox" name="isSpecialOffer" checked={isSpecial} onChange={e => setIsSpecial(e.target.checked)} />
              <span>Special offer</span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" name="payLater" checked={payLater} onChange={e => setPayLater(e.target.checked)} />
              <span>Pay later</span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" name="cancellation_free" checked={canFree} onChange={e => setCanFree(e.target.checked)} />
              <span>Free cancellation</span>
            </label>
            {canFree && (
              <div className={styles.field}>
                <span>Hours notice</span>
                <input type="number" name="cancellation_hours" min={0}
                  value={canHours} onChange={e => setCanHours(e.target.value)} />
              </div>
            )}
          </div>

          {/* Location + Guide */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>References</span>
            <div className={styles.field}>
              <span>Location ID</span>
              <input name="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="MongoDB ObjectId" />
            </div>
            <div className={styles.field}>
              <span>Guide ID</span>
              <input name="guide" value={guide} onChange={e => setGuide(e.target.value)} placeholder="MongoDB ObjectId" />
            </div>
          </div>

          {/* Available Dates */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>Available Dates</span>
            <AvailableDatesPicker
              name="availableDates"
              defaultValue={defaultAvailDates}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
