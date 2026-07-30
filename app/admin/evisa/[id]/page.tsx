import AdminTopbar from '@/components/admin/AdminTopbar'
import FormElementForm from '@/components/admin/evisa/FormElementForm'
import { getFormElementAdmin } from '@/lib/actions/admin/evisaFormElements'

export default async function EditFormElementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const element = await getFormElementAdmin(id)

  return (
    <>
      <AdminTopbar title={element?.label?.en || 'Edit Question'} breadcrumb="Admin / E-visa / Form Elements / Edit" />
      <FormElementForm element={element} />
    </>
  )
}
