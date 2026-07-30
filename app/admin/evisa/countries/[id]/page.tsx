import AdminTopbar from '@/components/admin/AdminTopbar'
import CountryForm from '@/components/admin/evisa/CountryForm'
import { getCountryAdmin } from '@/lib/actions/admin/evisaCountries'

export default async function EditCountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const country = await getCountryAdmin(id)

  return (
    <>
      <AdminTopbar title={country?.name?.en || 'Edit Country'} breadcrumb="Admin / E-visa / Countries / Edit" />
      <CountryForm country={country} />
    </>
  )
}
