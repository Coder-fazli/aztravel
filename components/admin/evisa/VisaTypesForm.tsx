'use client'

import { useState } from 'react'
import { saveVisaTypesFromForm } from '@/lib/actions/admin/evisaVisaTypes'
import styles from './FormElementForm.module.css'

export default function VisaTypesForm({ visaTypes }: { visaTypes: any[] }) {
  const [json, setJson] = useState(
    visaTypes.length
      ? JSON.stringify(visaTypes, null, 2)
      : JSON.stringify([
          { key: 'standard', label: { en: 'Standard' }, surcharge: 60 },
          { key: 'urgent', label: { en: 'Urgent' }, surcharge: 120 },
        ], null, 2),
  )

  return (
    <form action={saveVisaTypesFromForm} className={styles.form}>
      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.panel}>
            <span className={styles.panelLabel}>
              Global visa types (JSON) — same surcharge for every country, added on top of each country's base fee
            </span>
            <textarea
              className={styles.textarea}
              name="visaTypes_json"
              value={json}
              onChange={e => setJson(e.target.value)}
              rows={12}
            />
          </div>
        </div>

        <div className={styles.sidebar}>
          <button type="submit" className={styles.submitBtn}>Save visa types</button>
        </div>
      </div>
    </form>
  )
}
