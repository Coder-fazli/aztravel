import AdminTopbar from '@/components/admin/AdminTopbar'
import styles from './admin.module.css'

// NOTE: numbers are placeholders. BACKEND STEP: replace with real counts,
// e.g. await Blog.countDocuments(), Tour.countDocuments(), etc.
const stats = [
  { label: 'Blog posts', value: '1' },
  { label: 'Tours', value: '0' },
  { label: 'Bookings', value: '0' },
  { label: 'Pending reviews', value: '0' },
]

export default function AdminDashboard() {
  return (
    <>
      <AdminTopbar title="Dashboard" breadcrumb="Admin" />

      <div className={styles.statGrid}>
        {stats.map((s) => (
          <div key={s.label} className={`${styles.card} ${styles.stat}`}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <p style={{ fontFamily: 'var(--font-family)', color: 'var(--base-8)' }}>
          Welcome to the AzTravel admin. Pick a section from the sidebar to manage content.
        </p>
      </div>
    </>
  )
}
