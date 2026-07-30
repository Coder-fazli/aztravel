import Link from 'next/link'
import { notFound } from 'next/navigation'
import ApplicationSummary from '@/components/admin/evisa/ApplicationSummary'
import ApplicantCard from '@/components/admin/evisa/ApplicantCard'
import { getApplicationDetail } from '@/lib/actions/admin/evisaApplications'
import { getFormElementsAdmin } from '@/lib/actions/admin/evisaFormElements'
import styles from '../../evisa.module.css'

export default async function ApplicationDetailPage({
  params,
}: { params: Promise<{ applicationNumber: string }> }) {
  const { applicationNumber } = await params
  const [members, formElements] = await Promise.all([
    getApplicationDetail(applicationNumber),
    getFormElementsAdmin(),
  ])

  if (members.length === 0) notFound()

  // live join against current form-field labels/types — if a question's
  // label changes later, older applications display the new label
  const fieldMap = Object.fromEntries(formElements.map((el: any) => [el.fieldKey, { label: el.label, type: el.type }]))

  const first = members[0]

  return (
    <>
      <Link href="/admin/evisa/applications" className={styles.backLink}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        Back to Applications
      </Link>

      <div style={{ marginBottom: 24 }}>
        <span style={{ fontFamily: 'var(--font-family)', fontSize: 12, color: 'var(--base-8)' }}>
          Admin / E-visa / Applications / {applicationNumber}
        </span>
        <div className={styles.detailTop} style={{ marginTop: 4 }}>
          <h1 style={{ fontFamily: 'var(--font-family)', fontSize: 22, fontWeight: 700, color: 'var(--base-13)' }}>{applicationNumber}</h1>
          <span className={`${styles.pill} ${styles[first.payment?.status ?? 'pending']}`}>
            <span className={styles.pillDot} />{first.payment?.status ?? 'pending'}
          </span>
          <span className={`${styles.pill} ${styles[first.status] ?? styles.draft}`} style={{ textTransform: 'capitalize' }}>
            <span className={styles.pillDot} />{first.status}
          </span>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <ApplicationSummary applicationNumber={applicationNumber} members={members} />

        <div>
          {members.map((m: any) => (
            <ApplicantCard key={m._id} member={m} fieldMap={fieldMap} applicationNumber={applicationNumber} defaultOpen={members.length === 1} />
          ))}
        </div>
      </div>
    </>
  )
}
