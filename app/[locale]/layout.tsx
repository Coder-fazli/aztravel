import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
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
  // Navbar's "transparent over a dark hero" treatment is keyed off pathname
  // === '/' -- true both for the real homepage AND for the apply.* subdomain's
  // root (its e-Visa wizard root, rewritten from "/" by proxy.ts), which has
  // no hero image at all. Same class of bug as the earlier apply-subdomain
  // hostname fix: read the real Host header server-side rather than trust
  // client-side path matching to know which page this actually is.
  const hostname = (await headers()).get('host') ?? ''
  const isApplySubdomain = hostname.startsWith('apply.')

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar logo={settings?.logo || undefined} navItems={settings?.navItems || undefined} isApplySubdomain={isApplySubdomain} />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  )
}
