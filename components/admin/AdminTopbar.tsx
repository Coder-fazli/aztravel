import styles from './AdminTopbar.module.css'

type Props = {
  title: string
  breadcrumb?: string
}

export default function AdminTopbar({ title, breadcrumb }: Props) {
  return (
    <header className={styles.topbar}>
      <div className={styles.titles}>
        {breadcrumb && <span className={styles.breadcrumb}>{breadcrumb}</span>}
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.actions}>
        <input className={styles.search} type="text" placeholder="Search…" />
        {/* User menu (Clerk) goes here — backend step */}
        <span className={styles.avatar} aria-hidden="true">A</span>
      </div>
    </header>
  )
}
