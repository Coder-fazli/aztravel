import Link from "next/link";
import { getBanner } from "@/lib/actions/content";
import styles from './PromoBanner.module.css'

type Props = { bannerKey: string; locale?: 'en' | 'es' | 'ar' }

export default async function PromoBanner({ bannerKey, locale = 'en' }: Props) {
  const banner = await getBanner(bannerKey)
  if (!banner) return null

  const pick = (f: any) => f?.[locale] || f?.en || ''

  return (
    <section
      className={`${styles.banner} ${styles[banner.variant as 'blue' | 'orange'] ?? ''}`}
      style={{
        ...(banner.backgroundColor ? { background: banner.backgroundColor } : {}),
        ...(banner.backgroundImage
          ? { backgroundImage: `url(${banner.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {}),
      }}
    >
      <img src="/images/getintouch-swirl.svg" alt="" className={styles.swirl} aria-hidden="true" />

      <div className={styles.texts}>
        <h2 className={styles.title}>{pick(banner.title)}</h2>
        {pick(banner.subtitle) && <p className={styles.subtitle}>{pick(banner.subtitle)}</p>}
      </div>

      {banner.buttons?.length > 0 && (
        <div className={styles.buttons}>
          {banner.buttons.map((b: any, i: number) => (
            <Link
              key={i}
              href={b.href || '#'}
              className={`${styles.btn} ${i === 0 ? styles.btnPrimary : styles.btnGlass}`}
            >
              {pick(b.label)}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
