'use client'

import { useState } from 'react'
import { updateApplicationStatus, deleteApplication } from '@/lib/actions/admin/evisaApplications'
import DeleteButton from '@/components/admin/DeleteButton'
import styles from './ApplicationSummary.module.css'

const STATUSES = ['draft', 'submitted', 'processing', 'approved', 'rejected']

function displayName(member: any) {
  const nameAnswer = (member.answers ?? []).find((a: any) => /name/i.test(a.fieldKey))
  return nameAnswer?.value || `Applicant ${member.applicantIndex}`
}

export default function ApplicationSummary({
  applicationNumber,
  members,
}: { applicationNumber: string; members: any[] }) {
  const totalPrice = members.reduce((sum, m) => sum + (m.price ?? 0), 0)
  const [status, setStatus] = useState(members[0]?.status ?? 'draft')

  return (
    <div className={styles.card}>
      <div>
        {members.map(m => (
          <div key={m._id} className={styles.row}>
            <span>Applicant {m.applicantIndex} — {displayName(m)}</span>
            <strong>${m.price}</strong>
          </div>
        ))}
      </div>

      <hr className={styles.hr} />

      <div>
        <div className={styles.totalLabel}>Total price</div>
        <div className={styles.totalValue}>${totalPrice}</div>
      </div>

      <hr className={styles.hr} />

      <form action={updateApplicationStatus}>
        <input type="hidden" name="applicationNumber" value={applicationNumber} />
        <div className={styles.field}>
          <span>Application status</span>
          <select name="status" value={status} onChange={e => setStatus(e.target.value)} className={styles.select}>
            {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
          </select>
        </div>
        <button type="submit" className={styles.updateBtn}>Update status</button>
      </form>

      <hr className={styles.hr} />

      <DeleteButton
        fields={{ applicationNumber }}
        action={deleteApplication}
        message="Delete the entire application (all applicants)? This cannot be undone."
        label="Delete entire application"
        className={styles.dangerBtn}
      />
    </div>
  )
}
