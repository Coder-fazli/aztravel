import { UserButton } from '@clerk/nextjs'
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
        {/* Clerk user menu — avatar + dropdown with Sign out */}
        <UserButton />
      </div>
    </header>
  )
}
