'use client'

import { useState } from 'react'
import { deleteApplicant } from '@/lib/actions/admin/evisaApplications'
import styles from './ApplicantCard.module.css'

type FieldDef = { label: { en?: string }; type: string }

export default function ApplicantCard({
  member,
  fieldMap,
  applicationNumber,
  defaultOpen = true,
}: {
  member: any
  fieldMap: Record<string, FieldDef>
  applicationNumber: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  const nameAnswer = (member.answers ?? []).find((a: any) => /name/i.test(a.fieldKey))
  const emailAnswer = (member.answers ?? []).find((a: any) => fieldMap[a.fieldKey]?.type === 'email')
  const name = nameAnswer?.value || `Applicant ${member.applicantIndex}`
  const hasFiles = (member.documents ?? []).length > 0
  const canEmailFiles = Boolean(emailAnswer) && hasFiles

  return (
    <div className={`${styles.card} ${open ? '' : styles.collapsed}`}>
      <button type="button" className={styles.head} onClick={() => setOpen(o => !o)}>
        <span className={styles.name}>
          <span className={styles.idx}>{member.applicantIndex}</span>
          {name}
        </span>
        <span className={styles.right}>
          <span className={styles.amount}>${member.price}</span>
          <svg className={styles.chev} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </button>

      <div className={styles.body}>
        <div className={styles.fieldGrid}>
          {(member.answers ?? []).map((a: any) => {
            const def = fieldMap[a.fieldKey]
            const label = def?.label?.en || a.fieldKey
            if (def?.type === 'image') {
              return (
                <div key={a.fieldKey} className={styles.field}>
                  <div className={styles.fieldLabel}>{label}</div>
                  <img
                    className={styles.thumb}
                    src={`/uploads/passports/${a.value}`}
                    alt={label}
                    onClick={() => window.open(`/uploads/passports/${a.value}`, '_blank')}
                  />
                </div>
              )
            }
            return (
              <div key={a.fieldKey} className={styles.field}>
                <div className={styles.fieldLabel}>{label}</div>
                <div className={styles.fieldValue}>{Array.isArray(a.value) ? a.value.join(', ') : String(a.value ?? '—')}</div>
              </div>
            )
          })}
        </div>

        {hasFiles && (
          <div className={styles.docsBlock}>
            <div className={styles.fieldLabel} style={{ marginBottom: 10 }}>Attached documents</div>
            {member.documents.map((doc: string) => (
              <div key={doc} className={styles.docRow}>
                <span className={styles.docName}>📄 {doc}</span>
                <button type="button" className={styles.docRemove}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn}>+ Add file</button>
          {canEmailFiles && (
            <button type="button" className={`${styles.ghostBtn} ${styles.mail}`}>✉ Email files to applicant</button>
          )}
          <form
            action={deleteApplicant}
            onSubmit={e => { if (!confirm(`Delete ${name}'s application?`)) e.preventDefault() }}
          >
            <input type="hidden" name="id" value={member._id} />
            <input type="hidden" name="applicationNumber" value={applicationNumber} />
            <button type="submit" className={`${styles.ghostBtn} ${styles.del}`}>🗑 Delete this applicant</button>
          </form>
        </div>
      </div>
    </div>
  )
}
