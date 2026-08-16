import AdminTopbar from '@/components/admin/AdminTopbar'
import PageForm from '@/components/admin/forms/PageForm'

export default async function NewAdminPage({ searchParams }: {
  searchParams: Promise<{ lang?: string; group?: string }>
}) {
  const { lang, group } = await searchParams
  return (
    <>
      <AdminTopbar title="New page" breadcrumb="Admin / Pages / New" />
      <PageForm locale={lang ?? 'en'} translationGroupId={group ?? ''} />
    </>
  )
}
