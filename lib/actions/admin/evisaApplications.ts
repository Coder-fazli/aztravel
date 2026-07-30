'use server'

import { connectDb } from '@/lib/db/connect'
import Evisa from '@/lib/db/models/evisa/Evisa'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const plain = (d: any) => JSON.parse(JSON.stringify(d))

// one row per traveling party (grouped by applicationNumber), for the list page
export async function getApplicationsAdmin(status?: string) {
  await connectDb()
  const filter = status && status !== 'all' ? { status } : {}
  const applicants = await Evisa.find(filter).sort({ createdAt: -1 }).lean()

  const groups = new Map<string, any[]>()
  for (const a of applicants) {
    const list = groups.get(a.applicationNumber) ?? []
    list.push(a)
    groups.set(a.applicationNumber, list)
  }

  return plain(
    Array.from(groups.entries()).map(([applicationNumber, members]) => ({
      applicationNumber,
      members,
      totalPrice: members.reduce((sum, m) => sum + (m.price ?? 0), 0),
      // party-level status: everyone moves together, so the first member's
      // status/payment represents the whole application (see ApplicationStatusForm)
      status: members[0].status,
      paymentStatus: members[0].payment?.status ?? 'pending',
      createdAt: members[0].createdAt,
    })),
  )
}

export async function getApplicationDetail(applicationNumber: string) {
  await connectDb()
  const members = await Evisa.find({ applicationNumber }).sort({ applicantIndex: 1 }).lean()
  return plain(members)
}

// old system moved the whole party's status together — one dropdown, all members
export async function updateApplicationStatus(formData: FormData) {
  await connectDb()
  const applicationNumber = formData.get('applicationNumber') as string
  const status = formData.get('status') as string
  await Evisa.updateMany({ applicationNumber }, { status })
  revalidatePath(`/admin/evisa/applications/${applicationNumber}`)
  revalidatePath('/admin/evisa/applications')
}

export async function deleteApplication(formData: FormData) {
  await connectDb()
  const applicationNumber = formData.get('applicationNumber') as string
  await Evisa.deleteMany({ applicationNumber })
  revalidatePath('/admin/evisa/applications')
  redirect('/admin/evisa/applications')
}

export async function deleteApplicant(formData: FormData) {
  await connectDb()
  const id = formData.get('id') as string
  const applicationNumber = formData.get('applicationNumber') as string
  await Evisa.findByIdAndDelete(id)
  revalidatePath(`/admin/evisa/applications/${applicationNumber}`)
}

/* ── sidebar badge: mirrors getPendingCount/getNewBookingsCount in lib/actions/bookings.ts ── */

export async function getEvisaPendingCount() {
  await connectDb()
  const distinct = await Evisa.distinct('applicationNumber', { status: 'submitted' })
  return distinct.length
}

export async function getNewEvisaApplicationsCount(since: Date) {
  await connectDb()
  return Evisa.countDocuments({ createdAt: { $gt: since } })
}

export async function markEvisaApplicationsSeen() {
  const store = await cookies()
  store.set('evisa_apps_last_seen', Date.now().toString(), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}
