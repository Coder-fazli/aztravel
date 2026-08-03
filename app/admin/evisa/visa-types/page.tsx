import AdminTopbar from '@/components/admin/AdminTopbar'
import VisaTypesForm from '@/components/admin/evisa/VisaTypesForm'
import { getVisaTypesAdmin } from '@/lib/actions/admin/evisaVisaTypes'

export default async function VisaTypesPage() {
  const visaTypes = await getVisaTypesAdmin()

  return (
    <>
      <AdminTopbar title="Visa Types" breadcrumb="Admin / E-visa / Visa Types" />
      <VisaTypesForm visaTypes={visaTypes} />
    </>
  )
}
