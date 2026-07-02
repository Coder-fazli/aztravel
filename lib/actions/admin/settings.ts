'use server'

import { redirect }        from 'next/navigation'
import { routing }         from '@/i18n/routing'
import { updateSettings }  from '@/lib/actions/settings'

export async function saveSettingsFromForm(formData: FormData) {
  const get = (k: string) => (formData.get(k) as string) || ''

  const metaTitle: Record<string, string>       = {}
  const metaDescription: Record<string, string> = {}
  for (const loc of routing.locales) {
    metaTitle[loc]       = get(`metaTitle_${loc}`)
    metaDescription[loc] = get(`metaDescription_${loc}`)
  }

  // parse hero slides from the hidden JSON field
  let heroSlides: any[] = []
  try {
    const raw = get('heroSlides')
    if (raw) heroSlides = JSON.parse(raw)
  } catch {}

  // parse nav items
  let navItems: any[] = []
  try {
    const raw = get('navItems')
    if (raw) navItems = JSON.parse(raw)
  } catch {}

  await updateSettings({
    metaTitle,
    metaDescription,
    logo:           get('logo'),
    favicon:        get('favicon'),
    heroSlides,
    robotsNoindex:  get('robotsNoindex')  === 'true',
    robotsNofollow: get('robotsNofollow') === 'true',
    canonicalUrl:   get('canonicalUrl'),
    navItems,
  })

  redirect('/admin/home')
}
