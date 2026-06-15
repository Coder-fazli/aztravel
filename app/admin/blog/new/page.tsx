import AdminTopbar from '@/components/admin/AdminTopbar'
import BlogForm from '@/components/admin/forms/BlogForm'

export default function NewBlogPage() {
  return (
    <>
      <AdminTopbar title="New post" breadcrumb="Admin / Blog / New" />
      <BlogForm />
    </>
  )
}
