'use client'

import { deleteBlogFromForm } from '@/lib/actions/admin/blog'

export default function DeleteBlogButton({
  id,
  className,
}: {
  id: string
  className?: string
}) {
  return (
    <form
      action={deleteBlogFromForm}
      style={{ display: 'inline' }}
      onSubmit={(e) => {
        if (!confirm('Delete this post? This cannot be undone.')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>Delete</button>
    </form>
  )
}
