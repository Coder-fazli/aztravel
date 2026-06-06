import Link from 'next/link'
import styles from './GetInTouchSection.module.css'

const socials = [
  { icon: '/images/social-fb.svg', label: 'Facebook',  href: '#' },
  { icon: '/images/social-ig.svg', label: 'Instagram', href: '#' },
  { icon: '/images/social-tt.svg', label: 'TikTok',    href: '#' },
]

const links = [
  { title: 'Visit our blogs',   sub: 'Visit our latest blogs', href: '/blog' },
  { title: 'Visit bot Layla',   sub: 'Visit our latest blogs', href: '/lala' },
  { title: 'Ask your question', sub: 'Visit our latest blogs', href: '/faq' },
  { title: 'Onether link',      sub: 'Visit our latest blogs', href: '#' },
]

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="7.5" y1="16.5" x2="16.5" y2="7.5" />
      <polyline points="8 7.5 16.5 7.5 16.5 16" />
    </svg>
  )
}

/* Home Section 10 — "Get in touch" blue CTA card */
export default function GetInTouchSection() {
  return (
    <section className={styles.section}>
      <div className={styles.grayBand} aria-hidden="true" />
      <span className={styles.watermark} aria-hidden="true">Get in touch</span>

      <div className={styles.card}>
        <img src="/images/getintouch-swirl.svg" alt="" className={styles.swirl} aria-hidden="true" />

        <div className={styles.top}>
          <h2 className={styles.heading}>Follow us on <b>social media</b></h2>
          <div className={styles.socials}>
            {socials.map(s => (
              <Link key={s.label} href={s.href} className={styles.socialBtn} aria-label={s.label}>
                <img src={s.icon} alt="" />
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.links}>
          {links.map(l => (
            <Link key={l.title} href={l.href} className={styles.linkCard}>
              <div className={styles.linkText}>
                <span className={styles.linkTitle}>{l.title}</span>
                <span className={styles.linkSub}>{l.sub}</span>
              </div>
              <span className={styles.linkArrow}><ArrowUpRight /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
