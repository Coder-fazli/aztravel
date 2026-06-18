import AdminTopbar from '@/components/admin/AdminTopbar'
import NotFoundContent from '@/components/NotFoundContent'

// Catches any /admin/* route that doesn't exist yet (Tours, Hotels, …) and
// renders the 404 inside the admin shell so the sidebar stays usable.
export default function AdminNotFound() {
  return (
    <>
      <AdminTopbar title="Not found" breadcrumb="Admin" />
      <NotFoundContent
        title="This section isn’t ready yet"
        message="This admin page hasn’t been built. Pick another section from the sidebar."
        homeHref="/admin"
        homeLabel="Back to dashboard"
      />
    </>
  )
}
