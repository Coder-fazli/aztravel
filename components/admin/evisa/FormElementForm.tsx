'use client'

import { useState } from 'react'
import { saveFormElementFromForm } from '@/lib/actions/admin/evisaFormElements'
import styles from './FormElementForm.module.css'

type Locale = 'en' | 'es' | 'ar'
type LS = { en: string; es: string; ar: string }

const LOCALES: Locale[] = ['en', 'es', 'ar']
const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ar: 'AR' }
const TYPES = ['text', 'email', 'number', 'textarea', 'date', 'visa_date', 'checkbox', 'radio', 'radio_2', 'select', 'select_country', 'image']

function empty(): LS { return { en: '', es: '', ar: '' } }
function initLS(raw: any): LS {
  if (!raw) return empty()
  return { en: raw.en ?? '', es: raw.es ?? '', ar: raw.ar ?? '' }
}

export default function FormElementForm({ element }: { element?: any }) {
  const [lang, setLang] = useState<Locale>('en')

  const [fieldKey, setFieldKey] = useState<string>(element?.fieldKey ?? '')
  const [type, setType] = useState<string>(element?.type ?? 'text')
  const [label, setLabel] = useState<LS>(initLS(element?.label))
  const [placeholder, setPlaceholder] = useState<LS>(initLS(element?.placeholder))
  const [description, setDescription] = useState<LS>(initLS(element?.description))

  const [required, setRequired] = useState<boolean>(element?.required ?? false)
  const [isNewPerson, setIsNewPerson] = useState<boolean>(element?.isNewPerson ?? false)
  const [orderNum, setOrderNum] = useState<string>(String(element?.orderNum ?? 0))
  const [min, setMin] = useState<string>(element?.min != null ? String(element.min) : '')
  const [max, setMax] = useState<string>(element?.max != null ? String(element.max) : '')

  const [optionsJson, setOptionsJson] = useState<string>(element?.options ? JSON.stringify(element.options, null, 2) : '')
  const [conditionsJson, setConditionsJson] = useState<string>(element?.conditions ? JSON.stringify(element.conditions, null, 2) : '[]')

  function hiddenLangs(name: string, value: LS) {
    return LOCALES.filter(l => l !== lang).map(l => (
      <input key={l} type="hidden" name={`${name}_${l}`} value={value[l]} />
    ))
  }

  return (
    <form action={saveFormElementFromForm} className={styles.form}>
      {element?._id && <input type="hidden" name="id" value={element._id} />}

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
        <div className={styles.main}>
          <div className={styles.panel}>
            <div className={styles.field}>
              <span>Question ({lang.toUpperCase()})</span>
              <input
                value={label[lang]}
                onChange={e => setLabel(prev => ({ ...prev, [lang]: e.target.value }))}
                name={`label_${lang}`}
                placeholder="e.g. Full Name"
              />
            </div>
            {hiddenLangs('label', label)}

            <div className={styles.field}>
              <span>Placeholder ({lang.toUpperCase()})</span>
              <input
                value={placeholder[lang]}
                onChange={e => setPlaceholder(prev => ({ ...prev, [lang]: e.target.value }))}
                name={`placeholder_${lang}`}
              />
            </div>
            {hiddenLangs('placeholder', placeholder)}

            <div className={styles.field}>
              <span>Description / hint ({lang.toUpperCase()})</span>
              <input
                value={description[lang]}
                onChange={e => setDescription(prev => ({ ...prev, [lang]: e.target.value }))}
                name={`description_${lang}`}
                placeholder="Supports [stay_day] [validity_day] [start_date] [finish_date] for visa_date fields"
              />
            </div>
            {hiddenLangs('description', description)}
          </div>

          <div className={styles.panel}>
            <span className={styles.panelLabel}>Type-specific options (JSON)</span>
            <textarea
              className={styles.textarea}
              name="options_json"
              value={optionsJson}
              onChange={e => setOptionsJson(e.target.value)}
              placeholder='e.g. { "options": [{ "value": "tourist", "label": { "en": "Tourist" } }] }'
            />
          </div>

          <div className={styles.panel}>
            <span className={styles.panelLabel}>Conditional rules (JSON)</span>
            <textarea
              className={styles.textarea}
              name="conditions_json"
              value={conditionsJson}
              onChange={e => setConditionsJson(e.target.value)}
              placeholder='[{ "whenField": "country", "operator": "in", "values": ["EG"], "action": "price_add", "actionValue": 20 }]'
            />
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.panel}>
            <div className={styles.field}>
              <span>Field key (stable, used in stored answers)</span>
              <input name="fieldKey" value={fieldKey} onChange={e => setFieldKey(e.target.value)} placeholder="e.g. passport_number" required />
            </div>

            <div className={styles.field}>
              <span>Type</span>
              <select name="type" value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <span>Order</span>
              <input type="number" name="orderNum" value={orderNum} onChange={e => setOrderNum(e.target.value)} />
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <span>Min</span>
                <input type="number" name="min" value={min} onChange={e => setMin(e.target.value)} />
              </div>
              <div className={styles.field}>
                <span>Max</span>
                <input type="number" name="max" value={max} onChange={e => setMax(e.target.value)} />
              </div>
            </div>

            <label className={styles.checkboxRow}>
              <input type="checkbox" name="required" checked={required} onChange={e => setRequired(e.target.checked)} />
              Required
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" name="isNewPerson" checked={isNewPerson} onChange={e => setIsNewPerson(e.target.checked)} />
              Ask for every applicant (not just the first)
            </label>
          </div>

          <button type="submit" className={styles.submitBtn}>{element?._id ? 'Save changes' : 'Create question'}</button>
        </div>
      </div>
    </form>
  )
}
