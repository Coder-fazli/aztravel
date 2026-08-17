'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Link, usePathname as useLocalePathname, useRouter as useLocaleRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import GlobeIcon from '@/components/ui/GlobeIcon'
import { SITE_URL } from '@/lib/site'
import styles from './Navbar.module.css'

type NavItem = { label: string; href: string; visible: boolean }

const LOCALES: { code: 'en' | 'es' | 'ar'; short: string; name: string }[] = [
  { code: 'en', short: 'En', name: 'English' },
  { code: 'es', short: 'Es', name: 'Español' },
  { code: 'ar', short: 'Ar', name: 'العربية' },
]

const DEFAULT_NAV: NavItem[] = [
  { label: 'Home',       href: '/',           visible: true },
  { label: 'Tours',      href: '/tours',      visible: true },
  { label: 'Catalog',    href: '/catalog',    visible: true },
  { label: 'Rent a car', href: '/rent-a-car', visible: true },
  { label: 'E-visa',     href: 'https://apply.azerbaijantravel.com/', visible: true },
  { label: 'Blog',       href: '/blog',       visible: true },
  { label: 'Shop',       href: '/shops',      visible: true },
]

export default function Navbar({ logo, navItems, isApplySubdomain = false }: { logo?: string; navItems?: NavItem[]; isApplySubdomain?: boolean }) {
  const navLinks = (navItems?.length ? navItems : DEFAULT_NAV).filter(x => x.visible)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langWrapRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const locale   = useLocale()

  const localePathname = useLocalePathname()
  const localeRouter    = useLocaleRouter()
  const currentLocale   = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  function switchLocale(code: string) {
    localeRouter.replace(localePathname, { locale: code })
    setLangOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close mobile drawer on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // close language dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (langWrapRef.current && !langWrapRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const isHome      = (pathname === '/' || pathname === `/${locale}`) && !isApplySubdomain
  const transparent = isHome && !scrolled

  return (
    <nav className={`${styles.navbar} ${transparent ? styles.transparent : styles.solid}`}>

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topLinks}>
          <a href="#" className={styles.topLink}>For companies</a>
          {/* Absolute URL to the main domain, no locale prefix -- see the
              same note in Footer.tsx. This navbar also renders on
              apply.azerbaijantravel.com, where a relative "/en/terms" 404s
              (that subdomain's own rewrite prepends /apply to it). */}
          <a href={`${SITE_URL}/terms`} target="_blank" rel="noopener noreferrer" className={styles.topLink}>Terms &amp; Conditions</a>
          <a href={`${SITE_URL}/privacy`} target="_blank" rel="noopener noreferrer" className={styles.topLink}>Privacy policy</a>
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

        {/* LOGO — icon (44x44) + text wordmark (87x30, hidden on mobile).
            On the apply subdomain, "/" is the e-Visa wizard root, not the
            real homepage -- a relative Link there just reloads the wizard.
            Send it to the actual homepage on the main domain instead. */}
        {isApplySubdomain ? (
          <a href={SITE_URL} className={styles.logo}>
            <img src={logo || '/images/nav-logo-icon.svg'} alt="Azerbaijan Travel" className={styles.logoIcon} />
            <img src={transparent ? '/images/nav-logo-text.svg' : '/images/nav-logo-text-dark.svg'} alt="" className={styles.logoText} />
          </a>
        ) : (
          <Link href="/" className={styles.logo}>
            <img src={logo || '/images/nav-logo-icon.svg'} alt="Azerbaijan Travel" className={styles.logoIcon} />
            <img src={transparent ? '/images/nav-logo-text.svg' : '/images/nav-logo-text-dark.svg'} alt="" className={styles.logoText} />
          </Link>
        )}

        {/* MENU — desktop */}
        <div className={styles.menuList}>
          {navLinks.map(link => {
            const isActive = pathname === link.href || pathname === `/${locale}${link.href}`
            // Same fix as the logo above: on the apply subdomain, "/" isn't
            // the homepage, it's the wizard root -- send "Home" to the real
            // homepage on the main domain instead of reloading the wizard.
            if (isApplySubdomain && link.href === '/') {
              return (
                <a key={link.href} href={SITE_URL} className={styles.menuItem}>
                  <p>{link.label}</p>
                </a>
              )
            }
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
          <div className={styles.langWrap} ref={langWrapRef}>
            <button
              type="button"
              className={styles.langBtn}
              onClick={() => setLangOpen(o => !o)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <GlobeIcon />
              <p>{currentLocale.short}</p>
            </button>

            {langOpen && (
              <ul className={styles.langMenu} role="listbox">
                {LOCALES.map(l => (
                  <li key={l.code}>
                    <button
                      type="button"
                      className={`${styles.langOption} ${l.code === locale ? styles.langOptionActive : ''}`}
                      onClick={() => switchLocale(l.code)}
                      role="option"
                      aria-selected={l.code === locale}
                    >
                      {l.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
