'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AdminSidebar.module.css'
import SidebarIcon from './SidebarIcons'

const nav = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Home page', href: '/admin/home', icon: 'home' },
  { label: 'Tours', href: '/admin/tours', icon: 'tours' },
  { label: 'Hotels', href: '/admin/hotels', icon: 'hotels' },
  { label: 'Restaurants', href: '/admin/restaurants', icon: 'restaurants' },
  { label: 'Events', href: '/admin/events', icon: 'events' },
  { label: 'Blog', href: '/admin/blog', icon: 'blog' },
  { label: 'Media', href: '/admin/media', icon: 'media' },
  { label: 'Banners', href: '/admin/banners', icon: 'banners' },
  { label: 'Locations', href: '/admin/locations', icon: 'locations' },
  { label: 'Bookings', href: '/admin/bookings', icon: 'bookings' },
  { label: 'Reviews', href: '/admin/reviews', icon: 'reviews' },
  { label: 'E-visa', href: '/admin/evisa', icon: 'evisa' },
  { label: 'Users', href: '/admin/users', icon: 'users' },
]

export default function AdminSidebar({
  pendingBookings = 0,
  hasNewBookings  = false,
}: {
  pendingBookings?: number
  hasNewBookings?:  boolean
}) {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <Link href="/admin" className={styles.brand}>
        <span className={styles.brandMark}>AZ</span>
        <span className={styles.brandName}>Admin Panel</span>
      </Link>

      <nav className={styles.nav}>
        {nav.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          const isBookings = item.href === '/admin/bookings'
          const showDot    = isBookings && hasNewBookings && !active
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${active ? styles.active : ''}`}
            >
              <span className={styles.iconWrap}>
                <SidebarIcon name={item.icon} className={styles.icon} />
                {showDot && <span className={styles.dot} />}
              </span>
              {item.label}
              {isBookings && pendingBookings > 0 && (
                <span className={`${styles.badge} ${active ? styles.badgeActive : ''}`}>
                  {pendingBookings > 99 ? '99+' : pendingBookings}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={styles.help}>
        <p className={styles.helpTitle}>Need help?</p>
        <p className={styles.helpText}>Check the project docs or ping the team.</p>
      </div>
    </aside>
  )
}
