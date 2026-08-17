// No 'use client' -- there's no local state or event handler left in this
// component (see the note on the select below), so it can render fully on
// the server. One less place for client/server data to ever drift apart.
import { updateApplicationStatus, deleteApplication } from '@/lib/actions/admin/evisaApplications'
import DeleteButton from '@/components/admin/DeleteButton'
import styles from './ApplicationSummary.module.css'

const STATUSES = ['pending', 'confirmed', 'rejected']

function displayName(member: any) {
  const nameAnswer = (member.answers ?? []).find((a: any) => /name/i.test(a.fieldKey))
  return nameAnswer?.value || `Applicant ${member.applicantIndex}`
}

export default function ApplicationSummary({
  applicationNumber,
  members,
}: { applicationNumber: string; members: any[] }) {
  const totalPrice = members.reduce((sum, m) => sum + (m.price ?? 0), 0)
  // Deliberately uncontrolled (defaultValue, no useState/value/onChange) --
  // same pattern as the Pages status <select>, which never had this problem.
  // The controlled version here (useState mirroring members[0].status, plus
  // value=/onChange=) was the actual bug: whatever briefly desynced React's
  // state from the DOM's real selection meant the value actually submitted
  // wasn't reliably "what the admin clicked." An uncontrolled select has no
  // such indirection -- the DOM's own selection *is* what gets submitted,
  // full stop. The parent page's key={first.status} still forces a remount
  // when the real status changes, so defaultValue re-derives from fresh data
  // instead of freezing at whatever it was on first mount.
  const currentStatus = members[0]?.status ?? 'pending'

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
          <select name="status" defaultValue={currentStatus} className={styles.select}>
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
