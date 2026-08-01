import AdminTopbar from '@/components/admin/AdminTopbar'
import BlogForm from '@/components/admin/forms/BlogForm'
import { getCategoriesAdmin } from '@/lib/actions/admin/categories'

export default async function NewBlogPage({ searchParams, }: {
    searchParams: Promise<{ lang?: string; group?: string
  }>
}) {
  const { lang, group } = await searchParams
  const categories = await getCategoriesAdmin()
  return (
    <>
      <AdminTopbar title="New post" breadcrumb="Admin / Blog / New" />
      <BlogForm locale={lang ?? 'en'} translationGroupId={group ?? ''} categories={categories} />
    </>
  )
}
