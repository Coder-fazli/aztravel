'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import styles from './TourFilters.module.css'

const CATEGORIES = [
  { value: 'multi-day',       label: 'Multi day' },
  { value: 'day-trip',        label: 'Day trip' },
  { value: 'guided',          label: 'Guided tours' },
  { value: 'history-culture', label: 'History & Culture' },
  { value: 'nature',          label: 'Nature' },
  { value: 'adventure',       label: 'Adventure' },
]

const DURATIONS = [
  { value: '1-3',  label: '1-3 days' },
  { value: '4-7',  label: '4-7 days' },
  { value: '8-14', label: '8-14 days' },
]

const STARS = [1, 2, 3, 4, 5]

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"
      fill={filled ? '#ef6445' : 'none'}
      stroke={filled ? '#ef6445' : '#d9d9d9'}
      strokeWidth="1.4">
      <path d="M12 2l2.7 5.5 6 .9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6L3.3 8.4l6-.9z" />
    </svg>
  )
}

export default function TourFilters() {
  const router     = useRouter()
  const pathname   = usePathname()
  const searchParams = useSearchParams()

  function getList(key: string) {
    return searchParams.get(key)?.split(',').filter(Boolean) ?? []
  }

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  function toggleList(key: string, value: string) {
    const current = getList(key)
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    update(key, next.length ? next.join(',') : null)
  }

  const activeCategories = getList('categories')
  const activeDurations  = getList('durations')
  const activeRating     = Number(searchParams.get('rating') ?? 0)
  const priceMin         = searchParams.get('priceMin') ?? ''
  const priceMax         = searchParams.get('priceMax') ?? ''
  const dateStart        = searchParams.get('dateStart') ?? ''
  const dateEnd          = searchParams.get('dateEnd') ?? ''

  return (
    <aside className={styles.sidebar}>

      {/* ── Category ── */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Category</p>
        <div className={styles.checkList}>
          {CATEGORIES.map(cat => {
            const checked = activeCategories.includes(cat.value)
            return (
              <button
                key={cat.value}
                className={`${styles.checkItem} ${checked ? styles.checkItemActive : ''}`}
                onClick={() => toggleList('categories', cat.value)}
              >
                <span className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}>
                  {checked && <CheckIcon />}
                </span>
                <span className={styles.checkLabel}>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Price ── */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Price</p>
        <div className={styles.priceInputs}>
          <input
            type="number"
            placeholder="Min."
            className={styles.priceInput}
            value={priceMin}
            onChange={e => update('priceMin', e.target.value || null)}
          />
          <input
            type="number"
            placeholder="Max."
            className={styles.priceInput}
            value={priceMax}
            onChange={e => update('priceMax', e.target.value || null)}
          />
        </div>
        {/* orange range slider — maps to priceMax */}
        <div className={styles.sliderWrap}>
          <div
            className={styles.sliderTrack}
            style={{
              '--fill': `${(((Number(priceMax) || 8000) - 500) / (8000 - 500)) * 100}%`,
            } as React.CSSProperties}
          />
          <input
            type="range"
            min={500}
            max={8000}
            step={50}
            value={Number(priceMax) || 8000}
            className={styles.sliderInput}
            onChange={e => update('priceMax', e.target.value)}
          />
        </div>
        <div className={styles.sliderHint}>
          <span>Min: 500</span>
          <span>Max: 8000</span>
        </div>
      </div>

      {/* ── Duration ── */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Duration</p>
        <div className={styles.checkList}>
          {DURATIONS.map(dur => {
            const checked = activeDurations.includes(dur.value)
            return (
              <button
                key={dur.value}
                className={`${styles.checkItem} ${checked ? styles.checkItemActive : ''}`}
                onClick={() => toggleList('durations', dur.value)}
              >
                <span className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}>
                  {checked && <CheckIcon />}
                </span>
                <span className={styles.checkLabel}>{dur.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Dates ── */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Dates</p>
        <div className={styles.priceInputs}>
          <div className={styles.dateInput}>
            <input
              type="date"
              className={styles.dateField}
              value={dateStart}
              onChange={e => update('dateStart', e.target.value || null)}
            />
            <span className={styles.dateLabel}>{dateStart ? '' : 'Start'}</span>
            <CalendarIcon />
          </div>
          <div className={styles.dateInput}>
            <input
              type="date"
              className={styles.dateField}
              value={dateEnd}
              onChange={e => update('dateEnd', e.target.value || null)}
            />
            <span className={styles.dateLabel}>{dateEnd ? '' : 'End'}</span>
            <CalendarIcon />
          </div>
        </div>
      </div>

      {/* ── Rating ── */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>Rating</p>
        <div className={styles.stars}>
          {STARS.map(n => (
            <button
              key={n}
              className={styles.starBtn}
              onClick={() => update('rating', activeRating === n ? null : String(n))}
              aria-label={`${n} stars`}
            >
              <StarIcon filled={n <= activeRating} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Clear all ── */}
      {searchParams.toString() && (
        <button className={styles.clearBtn} onClick={() => router.push(pathname)}>
          Clear all filters
        </button>
      )}
    </aside>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1.5 5 4 7.5 8.5 2" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5d739d"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3.5" width="16" height="15" rx="3" />
      <line x1="2" y1="8" x2="18" y2="8" />
      <line x1="6.5" y1="2" x2="6.5" y2="5" />
      <line x1="13.5" y1="2" x2="13.5" y2="5" />
    </svg>
  )
}
