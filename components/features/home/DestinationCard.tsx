import Link from 'next/link'
import ArrowIcon from '@/components/ui/ArrowIcon'
import styles from './DestinationCard.module.css'

type Props = {
  title: string
  image: string
  href:  string
}

/* Section 06 slider card — photo + overlay, bottom title, corner arrow,
   and a "Click to view" CTA that slides up on hover. */
export default function DestinationCard({ title, image, href }: Props) {
  return (
    <Link href={href} className={styles.card}>
      <img src={image} alt={title} className={styles.img} />
      <span className={styles.overlay} aria-hidden="true" />

      <span className={styles.iconBtn} aria-hidden="true">
        <ArrowIcon size={24} />
      </span>

      <h3 className={styles.title}>{title}</h3>

      <span className={styles.cta} aria-hidden="true">Click to view</span>
    </Link>
  )
}
