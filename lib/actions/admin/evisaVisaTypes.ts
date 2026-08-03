'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { connectDb } from '@/lib/db/connect'
import Settings from '@/lib/db/models/Settings'

const plain = (d: any) => JSON.parse(JSON.stringify(d))

export async function getVisaTypesAdmin() {
  await connectDb()
  const settings = await Settings.findOne({ key: 'site' }).lean() as any
  return plain(settings?.evisaVisaTypes ?? [])
}

export async function saveVisaTypesFromForm(formData: FormData) {
  await connectDb()
  const raw = (formData.get('visaTypes_json') as string) || '[]'
  let visaTypes: any[] = []
  try { visaTypes = JSON.parse(raw) } catch {}

  await Settings.findOneAndUpdate(
    { key: 'site' },
    { $set: { evisaVisaTypes: visaTypes } },
    { upsert: true },
  )

  revalidatePath('/admin/evisa/visa-types')
  revalidatePath('/apply')
  redirect('/admin/evisa/visa-types')
}
