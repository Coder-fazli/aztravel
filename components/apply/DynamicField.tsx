'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { resolveDescriptionPlaceholders, type VisaDateInfo } from '@/lib/evisa/dateRules'
import styles from '../../app/[locale]/apply/apply.module.css'

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function fromISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

type Locale = 'en' | 'es' | 'ar'

export default function DynamicField({
  element,
  value,
  onChange,
  locale,
  countries,
  dateInfo,
  error,
}: {
  element: any
  value: any
  onChange: (v: any) => void
  locale: Locale
  countries: any[]
  dateInfo?: VisaDateInfo
  error?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [calOpen, setCalOpen] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')

  const label = element.label?.[locale] || element.label?.en || element.fieldKey
  const placeholder = element.placeholder?.[locale] || element.placeholder?.en || ''
  const rawDescription = element.description?.[locale] || element.description?.en || ''
  const description = dateInfo
    ? resolveDescriptionPlaceholders(rawDescription, element.options, dateInfo)
    : rawDescription

  const inputClass = `${styles.inputText} ${error ? styles.err : ''}`

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const maxKb = element.options?.maxFileSizeKb ?? 10000
    if (file.size / 1024 > maxKb) {
      alert(`File too large. Max ${maxKb}KB`)
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok) onChange(data.url)
      else alert(data.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const header = (
    <label className={styles.fLabel}>
      {label}{element.required && <span className={styles.req}>*</span>}
    </label>
  )

  if (element.type === 'text' || element.type === 'email' || element.type === 'number') {
    const mismatch = element.type === 'email' && confirmEmail.length > 0 && confirmEmail !== (value ?? '')
    return (
      <div className={styles.inputArea}>
        {header}
        {description && <span className={styles.fHint}>{description}</span>}
        <input
          className={inputClass}
          type={element.type}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          maxLength={element.type === 'text' ? element.max : undefined}
          minLength={element.type === 'text' ? element.min : undefined}
          max={element.type === 'number' ? element.max : undefined}
          min={element.type === 'number' ? element.min : undefined}
        />
        {error && <div className={styles.errMsg}>{error}</div>}

        {element.type === 'email' && (
          <div style={{ marginTop: 14 }}>
            <label className={styles.fLabel}>Confirm email address<span className={styles.req}>*</span></label>
            <span className={styles.fHint}>Re-enter your email to avoid typos</span>
            <input
              className={`${styles.inputText} ${mismatch ? styles.err : ''}`}
              type="email"
              placeholder={placeholder}
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
            />
            {mismatch && <div className={styles.errMsg}>Email addresses do not match</div>}
          </div>
        )}
      </div>
    )
  }

  if (element.type === 'textarea') {
    return (
      <div className={styles.inputArea}>
        {header}
        {description && <span className={styles.fHint}>{description}</span>}
        <textarea className={inputClass} placeholder={placeholder} value={value ?? ''} onChange={e => onChange(e.target.value)} />
        {error && <div className={styles.errMsg}>{error}</div>}
      </div>
    )
  }

  if (element.type === 'date' || element.type === 'visa_date') {
    const currentValue = value ?? dateInfo?.defaultDate ?? ''

    return (
      <div className={styles.inputArea}>
        {header}
        {description && <span className={styles.fHint} dangerouslySetInnerHTML={{ __html: description }} />}

        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger className={inputClass} style={{ textAlign: 'left', cursor: 'pointer' }}>
            {currentValue || 'Select date'}
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8}>
            <Calendar
              mode="single"
              captionLayout="dropdown"
              defaultMonth={currentValue ? fromISODate(currentValue) : dateInfo?.minDate ? fromISODate(dateInfo.minDate) : undefined}
              selected={currentValue ? fromISODate(currentValue) : undefined}
              onSelect={(d) => { if (d) { onChange(toISODate(d)); setCalOpen(false) } }}
              disabled={(d) => (
                (dateInfo?.minDate ? d < fromISODate(dateInfo.minDate) : false) ||
                (dateInfo?.maxDate ? d > fromISODate(dateInfo.maxDate) : false)
              )}
            />
          </PopoverContent>
        </Popover>

        {element.type === 'visa_date' && dateInfo && (
          <div className={styles.visaDateWidget}>
            <div className={styles.visaStartDate}>
              <div className={styles.dateArrowBadge}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h6M6 3l3 3-3 3" /></svg>
              </div>
              <b>Start Date</b><hr />
              <span>{currentValue}</span>
            </div>
            <div className={styles.visaCenterInfo}>
              <div>{element.options?.validityDays} days</div>
              <div>validity period</div>
              <hr />
              <div>{element.options?.stayDays} days</div>
              <div>period of stay</div>
            </div>
            <div className={styles.visaFinishDate}>
              <div className={styles.dateArrowBadge}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h6M6 3l3 3-3 3" /></svg>
              </div>
              <b>Finish Date</b><hr />
              <span>{dateInfo.validityDate}</span>
            </div>
          </div>
        )}

        {error && <div className={styles.errMsg}>{error}</div>}
      </div>
    )
  }

  if (element.type === 'select' || element.type === 'radio' || element.type === 'radio_2') {
    const options = element.options?.options ?? []
    if (element.type === 'select') {
      return (
        <div className={styles.inputArea}>
          {header}
          {description && <span className={styles.fHint}>{description}</span>}
          <select className={inputClass} value={value ?? ''} onChange={e => onChange(e.target.value)}>
            <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
            {options.map((o: any) => (
              <option key={o.value} value={o.value}>{o.label?.[locale] || o.label?.en || o.value}</option>
            ))}
          </select>
          {error && <div className={styles.errMsg}>{error}</div>}
        </div>
      )
    }
    return (
      <div className={styles.inputArea}>
        {header}
        {description && <span className={styles.fHint}>{description}</span>}
        {options.map((o: any) => (
          <label key={o.value} className={styles.checkRow}>
            <input
              type="radio"
              name={element.fieldKey}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label?.[locale] || o.label?.en || o.value}
          </label>
        ))}
        {error && <div className={styles.errMsg}>{error}</div>}
      </div>
    )
  }

  if (element.type === 'checkbox') {
    const options = element.options?.options ?? []
    const selected: string[] = Array.isArray(value) ? value : []
    return (
      <div className={styles.inputArea}>
        {header}
        {description && <span className={styles.fHint}>{description}</span>}
        {options.map((o: any) => (
          <label key={o.value} className={styles.checkRow}>
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={e => onChange(e.target.checked ? [...selected, o.value] : selected.filter(v => v !== o.value))}
            />
            {o.label?.[locale] || o.label?.en || o.value}
          </label>
        ))}
        {error && <div className={styles.errMsg}>{error}</div>}
      </div>
    )
  }

  if (element.type === 'select_country') {
    return (
      <div className={styles.inputArea}>
        {header}
        {description && <span className={styles.fHint}>{description}</span>}
        <select className={inputClass} value={value ?? ''} onChange={e => onChange(e.target.value)}>
          <option value="">{placeholder || 'Select country'}</option>
          {countries.map((c: any) => (
            <option key={c.code} value={c.code}>{c.name?.[locale] || c.name?.en || c.code}</option>
          ))}
        </select>
        {error && <div className={styles.errMsg}>{error}</div>}
      </div>
    )
  }

  if (element.type === 'image') {
    return (
      <div className={styles.inputArea}>
        {header}
        {description && <span className={styles.fHint}>{description}</span>}
        <label className={styles.uploadBox}>
          <div className={styles.ic}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="16" height="12" rx="2" />
              <path d="M6 5l1.5-2h5L14 5" />
              <circle cx="10" cy="11" r="3" />
            </svg>
          </div>
          <div className={styles.txt}>{uploading ? 'Uploading…' : value ? 'Change photo' : 'Click to upload or drag and drop'}</div>
          <div className={styles.sub}>JPG, PNG, or WebP, max {Math.round((element.options?.maxFileSizeKb ?? 10000) / 1024)}MB</div>
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFileChange} />
        </label>
        {value && <img src={value} alt={label} className={styles.uploadPreview} />}
        {error && <div className={styles.errMsg}>{error}</div>}
      </div>
    )
  }

  return null
}
