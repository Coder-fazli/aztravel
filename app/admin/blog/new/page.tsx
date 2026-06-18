import AdminTopbar from '@/components/admin/AdminTopbar'
import BlogForm from '@/components/admin/forms/BlogForm'

export default async function NewBlogPage({ searchParams, }: {
    searchParams: Promise<{ lang?: string; group?: string
  }> 
}) {
  const { lang, group } = await searchParams
  return (
    <>
      <AdminTopbar title="New post" breadcrumb="Admin / Blog / New" />
      <BlogForm locale={lang ?? 'en'} translationGroupId={group ?? ''} />
    </> 
  )
}
