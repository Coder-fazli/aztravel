'use client'

import { useState } from 'react'
import { saveCountryFromForm } from '@/lib/actions/admin/evisaCountries'
import styles from './FormElementForm.module.css'

type Locale = 'en' | 'es' | 'ar'
type LS = { en: string; es: string; ar: string }

const LOCALES: Locale[] = ['en', 'es', 'ar']
const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ar: 'AR' }

function empty(): LS { return { en: '', es: '', ar: '' } }
function initLS(raw: any): LS {
  if (!raw) return empty()
  return { en: raw.en ?? '', es: raw.es ?? '', ar: raw.ar ?? '' }
}

export default function CountryForm({ country }: { country?: any }) {
  const [lang, setLang] = useState<Locale>('en')

  const [code, setCode] = useState<string>(country?.code ?? '')
  const [flag, setFlag] = useState<string>(country?.flag ?? '')
  const [name, setName] = useState<LS>(initLS(country?.name))
  const [eligible, setEligible] = useState<boolean>(country?.eligible ?? true)
  const [orderNum, setOrderNum] = useState<string>(String(country?.orderNum ?? 0))

  const [baseFee, setBaseFee] = useState<string>(String(country?.baseFee ?? 0))
  const [conditionsJson, setConditionsJson] = useState<string>(
    country?.conditions ? JSON.stringify(country.conditions, null, 2) : '[]',
  )

  function hiddenLangs(field: string, value: LS) {
    return LOCALES.filter(l => l !== lang).map(l => (
      <input key={l} type="hidden" name={`${field}_${l}`} value={value[l]} />
    ))
  }

  return (
    <form action={saveCountryFromForm} className={styles.form}>
      {country?._id && <input type="hidden" name="id" value={country._id} />}

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
              <span>Country name ({lang.toUpperCase()})</span>
              <input
                value={name[lang]}
                onChange={e => setName(prev => ({ ...prev, [lang]: e.target.value }))}
                name={`name_${lang}`}
                placeholder="e.g. Egypt"
              />
            </div>
            {hiddenLangs('name', name)}
          </div>

          <div className={styles.panel}>
            <span className={styles.panelLabel}>Base fee</span>
            <div className={styles.field}>
              <span>This country's flat visa fee — the selected visa type's surcharge (set in General Settings) is added on top</span>
              <input type="number" name="baseFee" value={baseFee} onChange={e => setBaseFee(e.target.value)} min={0} />
            </div>
          </div>

          <div className={styles.panel}>
            <span className={styles.panelLabel}>Conditional rules (JSON)</span>
            <textarea
              className={styles.textarea}
              name="conditions_json"
              value={conditionsJson}
              onChange={e => setConditionsJson(e.target.value)}
              placeholder='[{ "whenField": "visaType", "operator": "equals", "values": ["urgent"], "action": "price_add", "actionValue": 30 }]'
            />
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.panel}>
            <div className={styles.row2}>
              <div className={styles.field}>
                <span>ISO code</span>
                <input name="code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="EG" maxLength={2} required />
              </div>
              <div className={styles.field}>
                <span>Flag emoji</span>
                <input name="flag" value={flag} onChange={e => setFlag(e.target.value)} placeholder="🇪🇬" />
              </div>
            </div>

            <div className={styles.field}>
              <span>Order</span>
              <input type="number" name="orderNum" value={orderNum} onChange={e => setOrderNum(e.target.value)} />
            </div>

            <label className={styles.checkboxRow}>
              <input type="checkbox" name="eligible" checked={eligible} onChange={e => setEligible(e.target.checked)} />
              Eligible to apply
            </label>
          </div>

          <button type="submit" className={styles.submitBtn}>{country?._id ? 'Save changes' : 'Create country'}</button>
        </div>
      </div>
    </form>
  )
}
