import AdminTopbar from '@/components/admin/AdminTopbar'
import CategoryForm from '@/components/admin/forms/CategoryForm'

export default function NewCategoryPage() {
  return (
    <>
      <AdminTopbar title="New Category" breadcrumb="Admin / Blog / Categories / New" />
      <CategoryForm />
    </>
  )
}
