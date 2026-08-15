'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  deleteApplicant,
  addApplicantDocument,
  removeApplicantDocument,
  emailApplicantDocuments,
} from '@/lib/actions/admin/evisaApplications'
import DeleteButton from '@/components/admin/DeleteButton'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import styles from './ApplicantCard.module.css'

type FieldDef = { label: { en?: string }; type: string }

function formatSentAt(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// staff uploads are stored as "<uuid>__<original-name>.<ext>" precisely so the
// admin UI can show something meaningful instead of a bare UUID
function docDisplayName(doc: string) {
  const base = doc.split('/').pop() || doc
  const m = base.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__(.+)$/i)
  return m ? m[1] : base
}
function isImageDoc(doc: string) {
  return /\.(jpe?g|png|webp)$/i.test(doc)
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
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
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

    setUploading(true)
    try {
      const form = new FormData()
      form.append('id', member._id)
      form.append('applicationNumber', applicationNumber)
      form.append('file', file)
      const result = await addApplicantDocument(form)
      if (result.ok) toast.success('File attached')
      else toast.error(result.error ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function doRemove(doc: string) {
    setRemovingDoc(doc)
    try {
      const form = new FormData()
      form.append('id', member._id)
      form.append('applicationNumber', applicationNumber)
      form.append('url', doc)
      const result = await removeApplicantDocument(form)
      if (!result.ok) toast.error(result.error ?? 'Could not remove file')
    } finally {
      setRemovingDoc(null)
    }
  }

  async function doSendEmail() {
    setSending(true)
    try {
      const form = new FormData()
      form.append('id', member._id)
      form.append('applicationNumber', applicationNumber)
      const result = await emailApplicantDocuments(form)
      if (result.ok) toast.success(`Sent to ${result.to}`)
      else toast.error(result.error ?? 'Could not send email')
    } finally {
      setSending(false)
    }
  }

  function copyEmail() {
    if (!emailAnswer?.value) return
    navigator.clipboard?.writeText(emailAnswer.value)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 1200)
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
            if (def?.type === 'email') {
              return (
                <div key={a.fieldKey} className={styles.field}>
                  <div className={styles.fieldLabel}>{label}</div>
                  <div className={styles.fieldValue}>
                    {a.value}
                    <button type="button" className={styles.copyBtn} onClick={copyEmail} title="Copy email">
                      {copiedEmail ? '✓' : '⧉'}
                    </button>
                  </div>
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
                <a className={styles.docName} href={doc} target="_blank" rel="noreferrer">
                  {isImageDoc(doc)
                    ? <img className={styles.docThumb} src={doc} alt="" />
                    : <span className={styles.docBadge}>PDF</span>}
                  {docDisplayName(doc)}
                </a>
                <button
                  type="button"
                  className={styles.docRemove}
                  onClick={() => setRemoveTarget(doc)}
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

        <div className={styles.actions}>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleAddFile} style={{ display: 'none' }} />
          <button type="button" className={styles.ghostBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <span className={styles.spinner} /> : null}
            {uploading ? 'Uploading…' : '+ Add file'}
          </button>
          {canEmailFiles && (
            <button type="button" className={`${styles.ghostBtn} ${styles.mail}`} onClick={() => setEmailConfirmOpen(true)} disabled={sending}>
              {sending ? 'Sending…' : member.emailSentAt ? '✉ Resend files to applicant' : '✉ Email files to applicant'}
            </button>
          )}
          <DeleteButton
            fields={{ id: member._id, applicationNumber }}
            action={deleteApplicant}
            message={`Delete ${name}'s application? This cannot be undone.`}
            label="🗑 Delete this applicant"
            className={`${styles.ghostBtn} ${styles.del}`}
          />
        </div>
      </div>

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove this document?"
        confirmLabel="Remove"
        destructive
        onConfirm={() => { if (removeTarget) doRemove(removeTarget) }}
      />

      <ConfirmDialog
        open={emailConfirmOpen}
        onOpenChange={setEmailConfirmOpen}
        title="Send documents to applicant?"
        description={`${member.documents?.length ?? 0} document(s) will be emailed to ${emailAnswer?.value}.`}
        confirmLabel="Send"
        onConfirm={doSendEmail}
      />
    </div>
  )
}
