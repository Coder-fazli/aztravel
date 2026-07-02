'use client'

import { useState }      from 'react'
import { BookingDrawer } from './BookingDrawer'
import styles            from './bookings.module.css'

function statusCls(s: string) {
  if (s === 'confirmed') return styles.confirmed
  if (s === 'cancelled') return styles.cancelled
  return styles.pending
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function BookingsList({ bookings }: { bookings: any[] }) {
  const [selected, setSelected] = useState<any>(null)

  function handleStatusChange(status: string) {
    setSelected((prev: any) => prev ? { ...prev, status } : null)
  }

  return (
    <>
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
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.empty}>No bookings found.</td>
              </tr>
            )}
            {bookings.map((b: any) => (
              <tr
                key={b._id}
                className={`${styles.row} ${selected?._id === b._id ? styles.rowSelected : ''}`}
                onClick={() => setSelected(b)}
              >
                <td><span className={styles.ref}>{b.bookingRef}</span></td>
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
                  {b.adults}A{b.children > 0 ? ` · ${b.children}C` : ''}
                </td>
                <td className={styles.price}>{b.totalPrice} {b.currency}</td>
                <td>
                  <span className={`${styles.badge} ${statusCls(b.status)}`}>
                    {b.status}
                  </span>
                </td>
                <td className={styles.muted}>{fmtDate(b.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  )
}
