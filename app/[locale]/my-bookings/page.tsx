'use client'

import { useState, useTransition } from 'react'
import { getBookingsByEmail }       from '@/lib/actions/bookings'
import styles from './page.module.css'

const STATUS_LABEL: Record<string, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default function MyBookingsPage() {
  const [email,   setEmail]   = useState('')
  const [results, setResults] = useState<any[] | null>(null)
  const [searched, setSearched] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = email.trim()
    if (!q) return
    startTransition(async () => {
      const data = await getBookingsByEmail(q)
      setResults(data)
      setSearched(q)
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heading}>Find your bookings</h1>
        <p className={styles.sub}>Enter the email address you used when booking to see all your trips.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={styles.input}
          />
          <button type="submit" className={styles.btn} disabled={isPending}>
            {isPending ? 'Searching…' : 'Find bookings'}
          </button>
        </form>
      </div>

      {results !== null && (
        <div className={styles.results}>
          {results.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No bookings found</p>
              <p className={styles.emptySub}>
                We couldn't find any bookings for <strong>{searched}</strong>.
                Double-check the email you used when booking, or{' '}
                <a href="mailto:info@azerbaijantravel.com" className={styles.link}>contact us</a>.
              </p>
            </div>
          ) : (
            <>
              <p className={styles.resultsLabel}>
                {results.length} booking{results.length !== 1 ? 's' : ''} for <strong>{searched}</strong>
              </p>
              <div className={styles.cards}>
                {results.map((b: any) => (
                  <div key={b._id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.ref}>{b.bookingRef}</span>
                      <span className={`${styles.status} ${styles[b.status]}`}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </div>

                    <p className={styles.tourName}>{b.tourTitle}</p>

                    <div className={styles.cardMeta}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaKey}>Date</span>
                        <span className={styles.metaVal}>{fmtDate(b.date)}</span>
                      </div>
                      {b.timeSlot && (
                        <div className={styles.metaRow}>
                          <span className={styles.metaKey}>Time</span>
                          <span className={styles.metaVal}>{b.timeSlot}</span>
                        </div>
                      )}
                      <div className={styles.metaRow}>
                        <span className={styles.metaKey}>Guests</span>
                        <span className={styles.metaVal}>
                          {b.adults} Adult{b.adults !== 1 ? 's' : ''}
                          {b.children > 0 ? ` · ${b.children} Child${b.children !== 1 ? 'ren' : ''}` : ''}
                        </span>
                      </div>
                      <div className={`${styles.metaRow} ${styles.metaRowTotal}`}>
                        <span className={styles.metaKey}>Total</span>
                        <span className={styles.totalVal}>{b.totalPrice} {b.currency}</span>
                      </div>
                    </div>

                    {b.status === 'pending' && (
                      <p className={styles.cardNote}>
                        Your booking is pending confirmation. We'll email you shortly.
                      </p>
                    )}
                    {b.status === 'confirmed' && (
                      <p className={`${styles.cardNote} ${styles.cardNoteGreen}`}>
                        Your booking is confirmed. See you there!
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
