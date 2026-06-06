import Link from 'next/link'
import styles from './CatalogCard.module.css'

type Props = {
  title: string
  desc:  string
  image: string
  href:  string
}

/* "Things to do" card — photo + overlay, centred title+desc, corner arrow,
   and an "Explore" button that slides up on hover. 368×300. */
export default function CatalogCard({ title, desc, image, href }: Props) {
  return (
    <Link href={href} className={styles.card}>
      <img src={image} alt={title} className={styles.img} />
      <span className={styles.overlay} aria-hidden="true" />

      <span className={styles.iconBtn} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.arrow}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      </span>

      <div className={styles.text}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{desc}</p>
      </div>

      <span className={styles.exploreBtn} aria-hidden="true">Explore</span>
    </Link>
  )
}
