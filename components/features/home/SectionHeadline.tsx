import Link from 'next/link'
import ArrowIcon from '@/components/ui/ArrowIcon'
import styles from './SectionHeadline.module.css'

type Props = {
  title:      string
  subtitle?:  string
  watermark?: string
  seeMoreHref?: string
}

export default function SectionHeadline({ title, subtitle, watermark, seeMoreHref }: Props) {
  return (
    <div className={styles.headline}>
      {watermark && <span className={styles.watermark}>{watermark}</span>}

      <div className={styles.texts}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {seeMoreHref && (
        <Link href={seeMoreHref} className={styles.seeMore}>
          SEE MORE
          <ArrowIcon size={24} />
        </Link>
      )}
    </div>
  )
}
