import ApplyWizard from '@/components/apply/ApplyWizard'
import { getPublicFormElements, getPublicCountries, getVisaTypes } from '@/lib/actions/evisa'

export const metadata = {
  title: 'Apply for Azerbaijan e-Visa',
  description: 'Apply for your Azerbaijan e-Visa online in a few minutes.',
}

export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { locale } = await params
  const { type } = await searchParams

  const [formElements, countries, visaTypes] = await Promise.all([
    getPublicFormElements(),
    getPublicCountries(),
    getVisaTypes(),
  ])

  return (
    <ApplyWizard
      formElements={formElements}
      countries={countries}
      visaTypes={visaTypes}
      locale={locale as 'en' | 'es' | 'ar'}
      initialVisaType={type}
    />
  )
}
