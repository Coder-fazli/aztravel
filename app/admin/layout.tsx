import { ClerkProvider } from '@clerk/nextjs'
import AdminSidebar      from '@/components/admin/AdminSidebar'
import { getPendingCount } from '@/lib/actions/bookings'
import styles            from './admin.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let pendingBookings = 0
  try { pendingBookings = await getPendingCount() } catch {}

  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <div className={styles.shell}>
        <AdminSidebar pendingBookings={pendingBookings} />
        <main className={styles.main}>{children}</main>
      </div>
    </ClerkProvider>
  )
}
