'use client'

import { deleteCategoryFromForm } from '@/lib/actions/admin/categories'

export default function DeleteCategoryButton({ id, className }: { id: string; className?: string }) {
  return (
    <form
      action={deleteCategoryFromForm}
      style={{ display: 'inline' }}
      onSubmit={e => {
        if (!confirm('Delete this category? Posts using it will keep their reference but show no category.')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>Delete</button>
    </form>
  )
}
