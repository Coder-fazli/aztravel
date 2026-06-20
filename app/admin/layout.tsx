import { ClerkProvider } from '@clerk/nextjs'
import AdminSidebar from '@/components/admin/AdminSidebar'
import styles from './admin.module.css'

// Clerk only loads here (admin) and on /sign-in — NOT on public pages — so the
// ~228 KiB Clerk bundle isn't shipped to the homepage/blog/etc.
// (Access control itself is enforced server-side in middleware.ts.)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <div className={styles.shell}>
        <AdminSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </ClerkProvider>
  )
}
