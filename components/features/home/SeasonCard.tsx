import Link from 'next/link'
import styles from './SeasonCard.module.css'

type Props = {
  name:     string
  desc:     string
  image:    string
  width:    number
  height:   number
  largeDesc?: boolean
}

export default function SeasonCard({ name, desc, image, width, height, largeDesc }: Props) {
  return (
    <div className={styles.card} style={{ width, height }}>
      <img src={image} alt={name} className={styles.cardBg} />
      <div className={styles.overlay} />

      {/* icon button top-right — thin right arrow, rotates to up-right on hover */}
      <Link href="/catalog" className={styles.iconBtn} aria-label={`Explore ${name}`}>
        <svg className={styles.arrowSvg} width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      </Link>

      {/* season text */}
      <div className={styles.text}>
        <h3 className={styles.name}>{name}</h3>
        <p className={`${styles.desc} ${largeDesc ? styles.descLarge : ''}`}>{desc}</p>
      </div>

      {/* explore button — slides up on hover */}
      <Link href="/catalog" className={styles.exploreBtn}>
        Explore
      </Link>
    </div>
  )
}
