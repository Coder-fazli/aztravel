'use server'
  import { redirect } from 'next/navigation'
  import { routing } from '@/i18n/routing'
  import { updateSettings } from '@/lib/actions/settings'

  export async function saveSettingsFromForm(formData: FormData){
     const get = (k: string) => (formData.get(k) as string) || ''

     const metaTitle: Record<string, string> = {}
     const metaDescription: Record<string, string> = {}
     for (const loc of routing.locales) {
       metaTitle[loc] = get(`metaTitle_${loc}`)
       metaDescription[loc] = get(`metaDescription_${loc}`)
     }

    await updateSettings({
      metaTitle,
      metaDescription,
      logo: get('logo'),
      favicon: get('favicon'),
    })
       redirect('/admin/home')
  }


  