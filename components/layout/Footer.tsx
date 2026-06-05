import styles from './Footer.module.css'

const footerLinks = [
  {
    title: 'About',
    items: [
      { label: 'About us',  href: '#' },
      { label: 'Blog',      href: '#' },
      { label: 'Careers',   href: '#' },
      { label: 'Jobs',      href: '#' },
      { label: 'In Press',  href: '#' },
    ],
  },
  {
    title: 'About',
    items: [
      { label: 'About us',  href: '#' },
      { label: 'Blog',      href: '#' },
      { label: 'Careers',   href: '#' },
      { label: 'Jobs',      href: '#' },
      { label: 'In Press',  href: '#' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Contact us',   href: '#' },
      { label: 'Online Chat',  href: '#' },
      { label: 'Whatsapp',     href: '#' },
      { label: 'Telegram',     href: '#' },
      { label: 'Ticketing',    href: '#' },
    ],
  },
  {
    title: 'FAQ',
    items: [
      { label: 'Account',           href: '#' },
      { label: 'Manage Deliveries', href: '#' },
      { label: 'Orders',            href: '#' },
      { label: 'Payments',          href: '#' },
      { label: 'Returns',           href: '#' },
    ],
  },
  {
    title: 'About',
    items: [
      { label: 'About us',  href: '#' },
      { label: 'Blog',      href: '#' },
      { label: 'Careers',   href: '#' },
      { label: 'Jobs',      href: '#' },
      { label: 'In Press',  href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* MAIN CONTENT */}
        <div className={styles.content}>

          {/* LOGO + TAGLINE */}
          {/* Figma: w-271px */}
          <div className={styles.logoCol}>
            {/* Figma: w-112px h-44px */}
            <img
              src="/images/logo.svg"
              alt="Azerbaijan Travel"
              className={styles.logoImg}
            />
            {/* Figma: Poppins Regular 12px, white */}
            <p className={styles.tagline}>
              Cras ipsum fames diam vitae nec pellentesque id id. Cursus id libero diam amet
            </p>
          </div>

          {/* LINK COLUMNS */}
          {/* Figma: w-753px, gap-24px */}
          <div className={styles.links}>
            {footerLinks.map((col, i) => (
              <div key={i} className={styles.menuCol}>
                {/* Figma: Poppins Bold 12px */}
                <p className={styles.menuTitle}>{col.title}</p>
                {/* Figma: gap-16px, Poppins Regular 10px, opacity 0.89 */}
                <div className={styles.menuItems}>
                  {col.items.map(item => (
                    <a key={item.label} href={item.href}>{item.label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* BOTTOM BAR */}
        {/* Figma: border-t rgba(255,255,255,0.3), py-16px */}
        <div className={styles.bottom}>
          {/* Figma: Poppins Regular 10px, white */}
          <p className={styles.copyright}>
            All rights Reserved @2025. Azerbaijan Travel
          </p>
          {/* Figma: gap-8px, icons 16x16px, opacity 0.7 */}
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook" className={styles.socialIcon}>
              <img src="/images/icon-facebook.svg" alt="Facebook" />
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialIcon}>
              <img src="/images/icon-instagram.svg" alt="Instagram" />
            </a>
            <a href="#" aria-label="TikTok" className={styles.socialIcon}>
              <img src="/images/icon-tiktok.svg" alt="TikTok" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
