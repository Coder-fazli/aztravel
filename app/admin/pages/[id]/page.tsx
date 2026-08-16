import { notFound } from 'next/navigation'
import AdminTopbar from '@/components/admin/AdminTopbar'
import PageForm from '@/components/admin/forms/PageForm'
import { getPageById } from '@/lib/actions/pages'

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const page = await getPageById(id)
  if (!page) notFound()

  return (
    <>
      <AdminTopbar title="Edit page" breadcrumb="Admin / Pages / Edit" />
      <PageForm
        page={page}
        locale={page.locale}
        translationGroupId={page.translationGroupId}
      />
    </>
  )
}
