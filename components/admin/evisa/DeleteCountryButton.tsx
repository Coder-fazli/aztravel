'use client'

import { deleteCountryFromForm } from '@/lib/actions/admin/evisaCountries'

export default function DeleteCountryButton({ id, className }: { id: string; className?: string }) {
  return (
    <form
      action={deleteCountryFromForm}
      style={{ display: 'inline' }}
      onSubmit={e => {
        if (!confirm('Delete this country? This cannot be undone.')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>Delete</button>
    </form>
  )
}
