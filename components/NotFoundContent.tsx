import Link from 'next/link'
import Image from 'next/image'
import styles from './NotFoundContent.module.css'

export default function NotFoundContent({
  title = 'Page not found',
  message = "This page doesn't exist (or isn't built yet). Let's get you back on track.",
  homeHref = '/',
  homeLabel = 'Go back home',
}: {
  title?: string
  message?: string
  homeHref?: string
  homeLabel?: string
}) {
  return (
    <div className={styles.wrap}>
      <Image
        src="/images/404-illustration.jpg"
        alt=""
        width={440}
        height={343}
        className={styles.art}
        priority
      />
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      <Link href={homeHref} className={styles.btn}>{homeLabel}</Link>
    </div>
  )
}
