'use client'

import { deleteTourFromForm } from '@/lib/actions/admin/tours'

export default function DeleteTourButton({ id, className }: { id: string; className?: string }) {
  return (
    <form
      action={deleteTourFromForm}
      style={{ display: 'inline' }}
      onSubmit={e => {
        if (!confirm('Delete this tour? This cannot be undone.')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>Delete</button>
    </form>
  )
}
