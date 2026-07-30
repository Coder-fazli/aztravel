'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AdminSidebar.module.css'
import SidebarIcon from './SidebarIcons'

const navTop = [
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
]

const evisaSub = [
  { label: 'Form Elements', href: '/admin/evisa' },
  { label: 'Countries', href: '/admin/evisa/countries' },
  { label: 'Applications', href: '/admin/evisa/applications' },
]

const navBottom = [
  { label: 'Users', href: '/admin/users', icon: 'users' },
]

export default function AdminSidebar({
  pendingBookings = 0,
  hasNewBookings  = false,
  pendingEvisa    = 0,
  hasNewEvisa     = false,
}: {
  pendingBookings?: number
  hasNewBookings?:  boolean
  pendingEvisa?:    number
  hasNewEvisa?:     boolean
}) {
  const pathname = usePathname()

  function renderItem(item: { label: string; href: string; icon: string }) {
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
  }

  return (
    <aside className={styles.sidebar}>
      <Link href="/admin" className={styles.brand}>
        <span className={styles.brandMark}>AZ</span>
        <span className={styles.brandName}>Admin Panel</span>
      </Link>

      <nav className={styles.nav}>
        {navTop.map(renderItem)}

        <div className={styles.navGroup}>
          <span className={styles.navGroupLabel}>E-Visa</span>
          {evisaSub.map((item) => {
            const active =
              item.href === '/admin/evisa'
                ? pathname === '/admin/evisa'
                : pathname.startsWith(item.href)
            const isApplications = item.href === '/admin/evisa/applications'
            const showDot = isApplications && hasNewEvisa && !active
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navSub} ${active ? styles.navSubActive : ''}`}
              >
                {showDot && <span className={styles.newPulse} title="New applications since you last checked" />}
                <span className={styles.subDot} />
                {item.label}
                {isApplications && pendingEvisa > 0 && (
                  <span className={`${styles.badge} ${styles.navBadge} ${active ? styles.badgeActive : ''}`} title="Applications awaiting review">
                    {pendingEvisa > 99 ? '99+' : pendingEvisa}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {navBottom.map(renderItem)}
      </nav>

      <div className={styles.help}>
        <p className={styles.helpTitle}>Need help?</p>
        <p className={styles.helpText}>Check the project docs or ping the team.</p>
      </div>
    </aside>
  )
}
