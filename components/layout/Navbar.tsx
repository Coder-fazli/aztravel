'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import GlobeIcon from '@/components/ui/GlobeIcon'
import styles from './Navbar.module.css'

const navLinks = [
  { label: 'Home',       href: '/' },
  { label: 'Tours',      href: '/tours' },
  { label: 'Catalog',    href: '/catalog' },
  { label: 'Rent a car', href: '/rent-a-car' },
  { label: 'E-visa',     href: '/e-visa' },
  { label: 'Blog',       href: '/blog' },
  { label: 'Shop',       href: '/shops' },
]

export default function Navbar({ logo }: { logo?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const locale   = useLocale()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close mobile drawer on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isHome      = pathname === '/' || pathname === `/${locale}`
  const transparent = isHome && !scrolled

  return (
    <nav className={`${styles.navbar} ${transparent ? styles.transparent : styles.solid}`}>

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topLinks}>
          <a href="#" className={styles.topLink}>For companies</a>
          <a href="#" className={styles.topLink}>Terms &amp; Conditions</a>
          <a href="#" className={styles.topLink}>Privacy policy</a>
        </div>
        <div className={styles.topRight}>
          <div className={styles.topRightItem}>
            <img src="/images/icon-ebook.svg" alt="" />
            <p>E-books</p>
          </div>
          <div className={styles.topRightItem}>
            <img src="/images/icon-heart.svg" alt="" />
            <p>My favorites</p>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div className={styles.mainNav}>

        {/* LOGO — icon (44x44) + text wordmark (87x30, hidden on mobile) */}
        <Link href="/" className={styles.logo}>
          <img src={logo || '/images/nav-logo-icon.svg'} alt="Azerbaijan Travel" className={styles.logoIcon} />
          <img src={transparent ? '/images/nav-logo-text.svg' : '/images/nav-logo-text-dark.svg'} alt="" className={styles.logoText} />
        </Link>

        {/* MENU — desktop */}
        <div className={styles.menuList}>
          {navLinks.map(link => {
            const isActive = pathname === link.href || pathname === `/${locale}${link.href}`
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
              >
                <p>{link.label}</p>
              </Link>
            )
          })}
        </div>

        {/* RIGHT BUTTONS */}
        <div className={styles.rightBtns}>
          <button className={styles.langBtn}>
            <GlobeIcon />
            <p>En</p>
          </button>
          <Link href="/ai" className={styles.aiBtn}>
            <img src="/images/icon-ai.svg" alt="" />
            <p className={styles.aiLabel}>AI Travel Agent</p>
          </Link>

          {/* HAMBURGER — mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span className={`${styles.burgerBar} ${menuOpen ? styles.burgerOpen1 : ''}`} />
            <span className={`${styles.burgerBar} ${menuOpen ? styles.burgerHide : ''}`} />
            <span className={`${styles.burgerBar} ${menuOpen ? styles.burgerOpen3 : ''}`} />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        {navLinks.map(link => {
          const isActive = pathname === link.href || pathname === `/${locale}${link.href}`
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.drawerItem} ${isActive ? styles.drawerActive : ''}`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
