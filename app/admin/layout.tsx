import { ClerkProvider }   from '@clerk/nextjs'
import AdminSidebar         from '@/components/admin/AdminSidebar'
import { getPendingCount, getNewBookingsCount } from '@/lib/actions/bookings'
import { cookies }          from 'next/headers'
import styles               from './admin.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let pendingBookings = 0
  let hasNewBookings  = false
  try {
    pendingBookings = await getPendingCount()
    const store     = await cookies()
    const lastSeen  = store.get('bookings_last_seen')?.value
    const since     = lastSeen ? new Date(Number(lastSeen)) : new Date(0)
    hasNewBookings  = (await getNewBookingsCount(since)) > 0
  } catch {}

  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <div className={styles.shell}>
        <AdminSidebar pendingBookings={pendingBookings} hasNewBookings={hasNewBookings} />
        <main className={styles.main}>{children}</main>
      </div>
    </ClerkProvider>
  )
}
