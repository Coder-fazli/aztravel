'use client'

import { useTransition } from 'react'
import { useRouter }     from 'next/navigation'
import { updateBookingStatus } from '@/lib/actions/bookings'
import styles from './bookings.module.css'

function fmtFull(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
}
function fmtShort(d: string) {
  return new Date(d).toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function BookingDrawer({
  booking,
  onClose,
  onStatusChange,
}: {
  booking: any
  onClose: () => void
  onStatusChange: (status: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleAction(status: string) {
    const fd = new FormData()
    fd.set('id', booking._id)
    fd.set('status', status)
    startTransition(async () => {
      await updateBookingStatus(fd)
      onStatusChange(status)
      router.refresh()
    })
  }

  const statusCls = booking.status === 'confirmed'
    ? styles.confirmed
    : booking.status === 'cancelled'
    ? styles.cancelled
    : styles.pending

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />

      <div className={styles.drawer}>
        {/* header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderLeft}>
            <p className={styles.drawerRef}>{booking.bookingRef}</p>
            <span className={`${styles.badge} ${statusCls}`}>{booking.status}</span>
          </div>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.drawerBody}>

          {/* tour */}
          <div className={styles.drawerSection}>
            <p className={styles.drawerLabel}>Tour</p>
            <p className={styles.drawerTourName}>{booking.tourTitle}</p>
            <div className={styles.drawerRows}>
              <div className={styles.drawerRow}>
                <span className={styles.drawerRowKey}>Date</span>
                <span className={styles.drawerRowVal}>{fmtFull(booking.date)}</span>
              </div>
              {booking.timeSlot && (
                <div className={styles.drawerRow}>
                  <span className={styles.drawerRowKey}>Time</span>
                  <span className={styles.drawerRowVal}>{booking.timeSlot}</span>
                </div>
              )}
              <div className={styles.drawerRow}>
                <span className={styles.drawerRowKey}>Guests</span>
                <span className={styles.drawerRowVal}>
                  {booking.adults} Adult{booking.adults !== 1 ? 's' : ''}
                  {booking.children > 0 ? ` · ${booking.children} Child${booking.children !== 1 ? 'ren' : ''}` : ''}
                </span>
              </div>
              <div className={styles.drawerRow}>
                <span className={styles.drawerRowKey}>Total</span>
                <span className={`${styles.drawerRowVal} ${styles.drawerPrice}`}>
                  {booking.totalPrice} {booking.currency}
                </span>
              </div>
            </div>
          </div>

          {/* guest */}
          <div className={styles.drawerSection}>
            <p className={styles.drawerLabel}>Guest</p>
            <p className={styles.drawerGuestName}>{booking.guestName}</p>
            <div className={styles.drawerRows}>
              <div className={styles.drawerRow}>
                <span className={styles.drawerRowKey}>Email</span>
                <a href={`mailto:${booking.guestEmail}`} className={styles.drawerLink}>
                  {booking.guestEmail}
                </a>
              </div>
              {booking.guestPhone && (
                <div className={styles.drawerRow}>
                  <span className={styles.drawerRowKey}>Phone</span>
                  <a href={`tel:${booking.guestPhone}`} className={styles.drawerLink}>
                    {booking.guestPhone}
                  </a>
                </div>
              )}
            </div>
            {booking.notes && (
              <div className={styles.drawerNotes}>
                <p className={styles.drawerNotesLabel}>Notes from guest</p>
                <p className={styles.drawerNotesText}>{booking.notes}</p>
              </div>
            )}
          </div>

          <p className={styles.drawerMeta}>Booked {fmtShort(booking.createdAt)}</p>
        </div>

        {/* footer actions */}
        <div className={styles.drawerFooter}>
          {booking.status !== 'confirmed' && (
            <button
              className={styles.drawerBtnConfirm}
              onClick={() => handleAction('confirmed')}
              disabled={isPending}
            >
              {isPending ? '…' : 'Confirm booking'}
            </button>
          )}
          {booking.status !== 'cancelled' && (
            <button
              className={styles.drawerBtnCancel}
              onClick={() => handleAction('cancelled')}
              disabled={isPending}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  )
}
