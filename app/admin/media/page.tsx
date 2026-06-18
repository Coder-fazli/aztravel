import AdminTopbar from '@/components/admin/AdminTopbar'
import MediaManager from '@/components/admin/MediaManager'

export default function AdminMediaPage() {
  return (
    <>
      <AdminTopbar title="Media" breadcrumb="Admin / Media" />
      <MediaManager />
    </>
  )
}
