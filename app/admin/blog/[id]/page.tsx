import { notFound } from 'next/navigation'
import AdminTopbar from '@/components/admin/AdminTopbar'
import BlogForm from '@/components/admin/forms/BlogForm'
import { getBlogById } from '@/lib/actions/content'

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getBlogById(id)
  if (!post) notFound()

  return (
    <>
      <AdminTopbar title="Edit post" breadcrumb="Admin / Blog / Edit" />
      <BlogForm
        post={post}
        locale={post.locale}
        translationGroupId={post.translationGroupId}
      />
    </>
  )
}
