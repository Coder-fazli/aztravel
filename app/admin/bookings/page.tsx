import { getBookings }  from '@/lib/actions/bookings'
import AdminTopbar      from '@/components/admin/AdminTopbar'
import { BookingsList } from './BookingsList'
import { MarkSeen }     from './MarkSeen'
import styles           from './bookings.module.css'

type SearchParams = Promise<{ status?: string }>

const TABS = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default async function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams
  const active     = TABS.find(t => t.key === status)?.key ?? 'all'
  const bookings   = await getBookings(active)

  return (
    <>
      <AdminTopbar title="Bookings" breadcrumb="Admin / Bookings" />
      <MarkSeen />

      <div className={styles.page}>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <a
              key={t.key}
              href={`/admin/bookings?status=${t.key}`}
              className={`${styles.tab} ${active === t.key ? styles.tabActive : ''}`}
            >
              {t.label}
            </a>
          ))}
        </div>

        <BookingsList bookings={bookings} />
      </div>
    </>
  )
}
