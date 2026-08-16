import { notFound } from 'next/navigation'
import AdminTopbar from '@/components/admin/AdminTopbar'
import PageForm from '@/components/admin/forms/PageForm'
import { getPageById } from '@/lib/actions/pages'

// revalidatePath() after a save should be enough on its own, but this route
// redirects back to itself (same dynamic segment) -- landing back on the
// exact page you just mutated is exactly the case where Next's client
// router cache has been seen to still serve a pre-mutation render. Belt and
// suspenders: never cache this route at all, always hit Mongo fresh.
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
