import AdminTopbar from '@/components/admin/AdminTopbar'
import FormElementForm from '@/components/admin/evisa/FormElementForm'

export default function NewFormElementPage() {
  return (
    <>
      <AdminTopbar title="New Question" breadcrumb="Admin / E-visa / Form Elements / New" />
      <FormElementForm />
    </>
  )
}
