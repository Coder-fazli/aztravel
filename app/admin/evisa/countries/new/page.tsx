import AdminTopbar from '@/components/admin/AdminTopbar'
import CountryForm from '@/components/admin/evisa/CountryForm'

export default function NewCountryPage() {
  return (
    <>
      <AdminTopbar title="New Country" breadcrumb="Admin / E-visa / Countries / New" />
      <CountryForm />
    </>
  )
}
