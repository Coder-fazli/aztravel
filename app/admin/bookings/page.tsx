import { getBookings }         from '@/lib/actions/bookings'
import { updateBookingStatus } from '@/lib/actions/bookings'
import AdminTopbar             from '@/components/admin/AdminTopbar'
import styles                  from './bookings.module.css'

type SearchParams = Promise<{ status?: string }>

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
]

function statusClass(s: string) {
  if (s === 'confirmed') return styles.confirmed
  if (s === 'cancelled') return styles.cancelled
  return styles.pending
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams
  const active   = TABS.find(t => t.key === status)?.key ?? 'all'
  const bookings = await getBookings(active)

  return (
    <>
      <AdminTopbar title="Bookings" breadcrumb="Admin / Bookings" />

      <div className={styles.page}>

        {/* tabs */}
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

        {/* table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Tour</th>
                <th>Date</th>
                <th>Guest</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Booked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={9} className={styles.empty}>No bookings found.</td>
                </tr>
              )}
              {bookings.map((b: any) => (
                <tr key={b._id}>
                  <td>
                    <span className={styles.ref}>{b.bookingRef}</span>
                  </td>
                  <td className={styles.tourCell}>
                    <span className={styles.tourName}>{b.tourTitle}</span>
                    {b.timeSlot && <span className={styles.timeSlot}>{b.timeSlot}</span>}
                  </td>
                  <td>{fmtDate(b.date)}</td>
                  <td>
                    <p className={styles.guestName}>{b.guestName}</p>
                    <p className={styles.guestEmail}>{b.guestEmail}</p>
                    {b.guestPhone && <p className={styles.guestEmail}>{b.guestPhone}</p>}
                  </td>
                  <td>
                    <span>{b.adults}A{b.children > 0 ? ` · ${b.children}C` : ''}</span>
                  </td>
                  <td className={styles.price}>{b.totalPrice} {b.currency}</td>
                  <td>
                    <span className={`${styles.badge} ${statusClass(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className={styles.muted}>{fmtDate(b.createdAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      {b.status !== 'confirmed' && (
                        <form action={updateBookingStatus}>
                          <input type="hidden" name="id"     value={b._id} />
                          <input type="hidden" name="status" value="confirmed" />
                          <button type="submit" className={styles.btnConfirm}>Confirm</button>
                        </form>
                      )}
                      {b.status !== 'cancelled' && (
                        <form action={updateBookingStatus}>
                          <input type="hidden" name="id"     value={b._id} />
                          <input type="hidden" name="status" value="cancelled" />
                          <button type="submit" className={styles.btnCancel}>Cancel</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  )
}
