'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './NotificationBell.module.css'
import type { AdminEvent } from '@/lib/actions/admin/notifications'

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

export default function NotificationBell({ events }: { events: AdminEvent[] }) {
  const [open, setOpen] = useState(false)
  const count = events.length

  return (
    <div className={styles.wrap} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className={styles.bell} aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && <span className={styles.badge}>{count > 9 ? '9+' : count}</span>}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHead}>Notifications</div>
          {count === 0 ? (
            <p className={styles.empty}>You&apos;re all caught up.</p>
          ) : (
            events.map(e => (
              <Link key={e.id} href={e.href} className={styles.item}>
                <div className={styles.itemMain}>
                  <span className={styles.itemTitle}>{e.title}</span>
                  <span className={styles.itemTime}>{timeAgo(e.createdAt)}</span>
                </div>
                <span className={styles.itemSubtitle}>{e.subtitle}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
