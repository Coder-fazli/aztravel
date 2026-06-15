import AdminSidebar from '@/components/admin/AdminSidebar'
import styles from './admin.module.css'

// ⚠️ BACKEND STEP (do this yourself with the guide):
// Gate this layout with Clerk so only admin/operator roles get in, e.g.
//   const { userId } = await auth()
//   if (!userId) redirect('/sign-in')
//   ...check role...
// For now the admin UI is open so we can build the screens.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
