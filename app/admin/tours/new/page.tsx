import AdminTopbar from '@/components/admin/AdminTopbar'
import TourForm    from '@/components/admin/tours/TourForm'

export default function NewTourPage() {
  return (
    <>
      <AdminTopbar title="New Tour" breadcrumb="Admin / Tours / New" />
      <TourForm />
    </>
  )
}
