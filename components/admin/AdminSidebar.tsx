'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AdminSidebar.module.css'

const nav = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Tours', href: '/admin/tours' },
  { label: 'Hotels', href: '/admin/hotels' },
  { label: 'Restaurants', href: '/admin/restaurants' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Blog', href: '/admin/blog' },
  { label: 'Banners', href: '/admin/banners' },
  { label: 'Locations', href: '/admin/locations' },
  { label: 'Bookings', href: '/admin/bookings' },
  { label: 'Reviews', href: '/admin/reviews' },
  { label: 'E-visa', href: '/admin/evisa' },
  { label: 'Users', href: '/admin/users' },
]

export default function AdminSidebar() {
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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${active ? styles.active : ''}`}
            >
              <span className={styles.dot} />
              {item.label}
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
