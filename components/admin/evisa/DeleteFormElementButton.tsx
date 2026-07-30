'use client'

import { deleteFormElementFromForm } from '@/lib/actions/admin/evisaFormElements'

export default function DeleteFormElementButton({ id, className }: { id: string; className?: string }) {
  return (
    <form
      action={deleteFormElementFromForm}
      style={{ display: 'inline' }}
      onSubmit={e => {
        if (!confirm('Delete this question? This cannot be undone.')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>Delete</button>
    </form>
  )
}
