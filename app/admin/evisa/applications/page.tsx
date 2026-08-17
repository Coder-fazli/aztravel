import Link from 'next/link'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { MarkEvisaSeen } from '@/components/admin/evisa/MarkEvisaSeen'
import { getApplicationsAdmin } from '@/lib/actions/admin/evisaApplications'
import adminStyles from '../../admin.module.css'
import styles from '../evisa.module.css'

const STATUSES = ['pending', 'confirmed', 'rejected'] as const

function displayName(member: any) {
  const nameAnswer = (member.answers ?? []).find((a: any) => /name/i.test(a.fieldKey))
  return nameAnswer?.value || `Applicant ${member.applicantIndex}`
}

export default async function ApplicationsPage({
  searchParams,
}: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const active = (STATUSES.includes(status as any) ? status : 'all') as string

  const all = await getApplicationsAdmin()
  const applications = active === 'all' ? all : all.filter((a: any) => a.status === active)

  const stats = Object.fromEntries(STATUSES.map(s => [s, all.filter((a: any) => a.status === s).length]))

  return (
    <>
      <MarkEvisaSeen />
      <AdminTopbar title="Applications" breadcrumb="Admin / E-visa / Applications" />

      <div className={styles.statRow}>
        {STATUSES.map(s => (
          <div key={s} className={styles.statCard}>
            <div className={styles.statLabel} style={{ textTransform: 'capitalize' }}>{s}</div>
            <div className={styles.statValue}>{stats[s]}</div>
          </div>
        ))}
      </div>

      <div className={styles.filters}>
        <div className={styles.segment}>
          <Link href="/admin/evisa/applications" className={`${styles.segBtn} ${active === 'all' ? styles.segActive : ''}`}>All</Link>
          {STATUSES.map(s => (
            <Link
              key={s}
              href={`/admin/evisa/applications?status=${s}`}
              className={`${styles.segBtn} ${active === s ? styles.segActive : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div className={adminStyles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Application #</th><th>Applicant</th><th>Country</th><th>Visa Type</th>
                <th>Price</th><th>Payment</th><th>Status</th><th className={styles.right}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 && (
                <tr><td colSpan={8} className={styles.empty}>No applications in this status.</td></tr>
              )}
              {applications.map((a: any) => {
                const first = a.members[0]
                return (
                  <tr key={a.applicationNumber}>
                    <td className={styles.titleCell}>{a.applicationNumber}</td>
                    <td>
                      {displayName(first)}
                      {a.members.length > 1 && <div className={styles.subCell}>+{a.members.length - 1} more</div>}
                    </td>
                    <td>{first.country}</td>
                    <td style={{ textTransform: 'capitalize' }}>{first.visaType}</td>
                    <td>${a.totalPrice}</td>
                    <td>
                      <span className={`${styles.pill} ${styles[a.paymentStatus] ?? styles.pending}`}>
                        <span className={styles.pillDot} />{a.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.pill} ${styles[a.status] ?? styles.pending}`}>
                        <span className={styles.pillDot} />{a.status}
                      </span>
                    </td>
                    <td className={styles.right}>
                      <Link href={`/admin/evisa/applications/${a.applicationNumber}`} className={styles.action}>View</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
