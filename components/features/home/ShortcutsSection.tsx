import Link from 'next/link'
import styles from './ShortcutsSection.module.css'

const shortcuts = [
  { label: 'Get visa',     icon: '/images/sc-airplane.svg', href: '/e-visa' },
  { label: 'Where to stay', icon: '/images/sc-hotel.svg',    href: '/hotels' },
  { label: 'Top Places',    icon: '/images/sc-board.svg',    href: '/destinations' },
  { label: 'Train tickets', icon: '/images/sc-train.svg',    href: '/tours' },
  { label: 'Photo points',  icon: '/images/sc-camera.svg',   href: '/catalog' },
]

export default function ShortcutsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {shortcuts.map(s => (
          <Link key={s.label} href={s.href} className={styles.pill}>
            <span className={styles.icon}>
              <img src={s.icon} alt="" />
            </span>
            <span className={styles.label}>{s.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
