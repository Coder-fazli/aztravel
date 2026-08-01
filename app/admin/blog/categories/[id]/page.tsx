import AdminTopbar from '@/components/admin/AdminTopbar'
import CategoryForm from '@/components/admin/forms/CategoryForm'
import { getCategoryAdmin } from '@/lib/actions/admin/categories'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await getCategoryAdmin(id)

  return (
    <>
      <AdminTopbar title={category?.name?.en || 'Edit Category'} breadcrumb="Admin / Blog / Categories / Edit" />
      <CategoryForm category={category} />
    </>
  )
}
