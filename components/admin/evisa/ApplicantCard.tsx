'use client'

import { useRef, useState } from 'react'
import {
  deleteApplicant,
  addApplicantDocument,
  removeApplicantDocument,
  emailApplicantDocuments,
} from '@/lib/actions/admin/evisaApplications'
import styles from './ApplicantCard.module.css'

type FieldDef = { label: { en?: string }; type: string }

function formatSentAt(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

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
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [removingDoc, setRemovingDoc] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const nameAnswer = (member.answers ?? []).find((a: any) => /name/i.test(a.fieldKey))
  const emailAnswer = (member.answers ?? []).find((a: any) => fieldMap[a.fieldKey]?.type === 'email')
  const name = nameAnswer?.value || `Applicant ${member.applicantIndex}`
  const hasFiles = (member.documents ?? []).length > 0
  const canEmailFiles = Boolean(emailAnswer) && hasFiles

  async function handleAddFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // so picking the same file again still fires onChange
    if (!file) return

    setNotice(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('id', member._id)
      form.append('applicationNumber', applicationNumber)
      form.append('file', file)
      const result = await addApplicantDocument(form)
      setNotice(result.ok ? { ok: true, text: 'File attached' } : { ok: false, text: result.error ?? 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(doc: string) {
    if (!confirm('Remove this document?')) return
    setNotice(null)
    setRemovingDoc(doc)
    try {
      const form = new FormData()
      form.append('id', member._id)
      form.append('applicationNumber', applicationNumber)
      form.append('url', doc)
      const result = await removeApplicantDocument(form)
      if (!result.ok) setNotice({ ok: false, text: result.error ?? 'Could not remove file' })
    } finally {
      setRemovingDoc(null)
    }
  }

  async function handleEmail() {
    if (!confirm(`Send ${member.documents.length} document(s) to ${emailAnswer?.value}?`)) return
    setNotice(null)
    setSending(true)
    try {
      const form = new FormData()
      form.append('id', member._id)
      form.append('applicationNumber', applicationNumber)
      const result = await emailApplicantDocuments(form)
      setNotice(result.ok ? { ok: true, text: `Sent to ${result.to}` } : { ok: false, text: result.error ?? 'Could not send email' })
    } finally {
      setSending(false)
    }
  }

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
                    src={a.value}
                    alt={label}
                    onClick={() => window.open(a.value, '_blank')}
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
                <a className={styles.docName} href={doc} target="_blank" rel="noreferrer">📄 {doc.split('/').pop()}</a>
                <button
                  type="button"
                  className={styles.docRemove}
                  onClick={() => handleRemove(doc)}
                  disabled={removingDoc === doc}
                >
                  {removingDoc === doc ? 'Removing…' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}

        {member.emailSentAt && (
          <div className={styles.sentNote}>✓ Sent {formatSentAt(member.emailSentAt)} to {member.emailSentTo}</div>
        )}

        {notice && (
          <div className={notice.ok ? styles.noticeOk : styles.noticeErr}>{notice.text}</div>
        )}

        <div className={styles.actions}>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleAddFile} style={{ display: 'none' }} />
          <button type="button" className={styles.ghostBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : '+ Add file'}
          </button>
          {canEmailFiles && (
            <button type="button" className={`${styles.ghostBtn} ${styles.mail}`} onClick={handleEmail} disabled={sending}>
              {sending ? 'Sending…' : member.emailSentAt ? '✉ Resend files to applicant' : '✉ Email files to applicant'}
            </button>
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
