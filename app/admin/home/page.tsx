import AdminTopbar from '@/components/admin/AdminTopbar'
import SettingsForm from '@/components/admin/forms/SettingsForm'
import { getSettings } from '@/lib/actions/settings'

export default async function AdminHomePage() {
  const settings = await getSettings()
  return (
    <>
      <AdminTopbar title="Home page" breadcrumb="Admin / Home page" />
      <SettingsForm settings={settings} />
    </>
  )
}
