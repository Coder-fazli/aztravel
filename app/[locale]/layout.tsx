import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSettings } from '@/lib/actions/settings'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) notFound()

  const messages = await getMessages()
  const settings = await getSettings()

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar logo={settings?.logo || undefined} />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  )
}
