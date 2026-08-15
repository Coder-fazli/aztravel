import { UserButton } from '@clerk/nextjs'
import NotificationBell from '@/components/admin/NotificationBell'
import { getRecentAdminEvents } from '@/lib/actions/admin/notifications'
import styles from './AdminTopbar.module.css'

type Props = {
  title: string
  breadcrumb?: string
}

export default async function AdminTopbar({ title, breadcrumb }: Props) {
  let events: Awaited<ReturnType<typeof getRecentAdminEvents>> = []
  try {
    events = await getRecentAdminEvents()
  } catch {}

  return (
    <header className={styles.topbar}>
      <div className={styles.titles}>
        {breadcrumb && <span className={styles.breadcrumb}>{breadcrumb}</span>}
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.actions}>
        <input className={styles.search} type="text" placeholder="Search…" />
        <NotificationBell events={events} />
        {/* Clerk user menu — avatar + dropdown with Sign out */}
        <UserButton />
      </div>
    </header>
  )
}
