import { ClerkProvider }   from '@clerk/nextjs'
import AdminSidebar         from '@/components/admin/AdminSidebar'
import { Toaster }          from '@/components/ui/sonner'
import { getPendingCount, getNewBookingsCount } from '@/lib/actions/bookings'
import { getEvisaPendingCount, getNewEvisaApplicationsCount } from '@/lib/actions/admin/evisaApplications'
import { cookies }          from 'next/headers'
import styles               from './admin.module.css'

// The whole admin section is mutation-heavy (create/update/delete forms that
// redirect or revalidate back to the page you were just on), and that's
// exactly the case where Next's client router cache has been seen to keep
// serving a pre-mutation render instead of picking up revalidatePath() --
// confirmed this directly for the Pages and eVisa-application status bugs:
// the database write was always correct, only the admin's own view was
// stale. Applying force-dynamic at the layout covers every admin route at
// once instead of chasing this file by file.
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
      <Toaster position="bottom-right" />
    </ClerkProvider>
  )
}
