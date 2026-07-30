import { ClerkProvider }   from '@clerk/nextjs'
import AdminSidebar         from '@/components/admin/AdminSidebar'
import { getPendingCount, getNewBookingsCount } from '@/lib/actions/bookings'
import { getEvisaPendingCount, getNewEvisaApplicationsCount } from '@/lib/actions/admin/evisaApplications'
import { cookies }          from 'next/headers'
import styles               from './admin.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let pendingBookings = 0
  let hasNewBookings  = false
  let pendingEvisa    = 0
  let hasNewEvisa     = false
  try {
    const store    = await cookies()

    pendingBookings = await getPendingCount()
    const bookingsSince = store.get('bookings_last_seen')?.value
    hasNewBookings  = (await getNewBookingsCount(bookingsSince ? new Date(Number(bookingsSince)) : new Date(0))) > 0

    pendingEvisa = await getEvisaPendingCount()
    const evisaSince = store.get('evisa_apps_last_seen')?.value
    hasNewEvisa  = (await getNewEvisaApplicationsCount(evisaSince ? new Date(Number(evisaSince)) : new Date(0))) > 0
  } catch {}

  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <div className={styles.shell}>
        <AdminSidebar
          pendingBookings={pendingBookings}
          hasNewBookings={hasNewBookings}
          pendingEvisa={pendingEvisa}
          hasNewEvisa={hasNewEvisa}
        />
        <main className={styles.main}>{children}</main>
      </div>
    </ClerkProvider>
  )
}
