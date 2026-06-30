import { notFound }     from 'next/navigation'
import AdminTopbar      from '@/components/admin/AdminTopbar'
import TourForm         from '@/components/admin/tours/TourForm'
import { getTourAdmin } from '@/lib/actions/admin/tours'

type Params = Promise<{ id: string }>

export default async function EditTourPage({ params }: { params: Params }) {
  const { id }  = await params
  const tour    = await getTourAdmin(id)
  if (!tour) notFound()

  return (
    <>
      <AdminTopbar
        title="Edit Tour"
        breadcrumb={`Admin / Tours / ${tour.title?.en || id}`}
      />
      <TourForm tour={tour} />
    </>
  )
}
