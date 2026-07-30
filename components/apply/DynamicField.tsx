'use client'

import { useState } from 'react'
import { resolveDescriptionPlaceholders, type VisaDateInfo } from '@/lib/evisa/dateRules'
import styles from '../../app/[locale]/apply/apply.module.css'

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

    const maxKb = element.options?.maxFileSizeKb ?? 4096
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
    return (
      <div className={styles.inputArea}>
        {header}
        {description && <span className={styles.fHint} dangerouslySetInnerHTML={{ __html: description }} />}
        <input
          className={inputClass}
          type="date"
          value={value ?? dateInfo?.defaultDate ?? ''}
          min={dateInfo?.minDate}
          max={dateInfo?.maxDate}
          onChange={e => onChange(e.target.value)}
        />
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
          <div className="ic">📷</div>
          <div className="txt">{uploading ? 'Uploading…' : value ? 'Change photo' : 'Click to upload or drag and drop'}</div>
          <div className="sub">JPG or PNG, max {Math.round((element.options?.maxFileSizeKb ?? 4096) / 1024)}MB</div>
          <input type="file" accept="image/jpeg,image/png" hidden onChange={handleFileChange} />
        </label>
        {value && <img src={value} alt={label} className={styles.uploadPreview} />}
        {error && <div className={styles.errMsg}>{error}</div>}
      </div>
    )
  }

  return null
}
