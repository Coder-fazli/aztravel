'use server'

import { connectDb } from '@/lib/db/connect'
import Evisa from '@/lib/db/models/evisa/Evisa'
import FormElement from '@/lib/db/models/evisa/FormElement'
import { sendApplicantDocuments } from '@/lib/email/evisaDocuments'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { unlink, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

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

/* ── staff-attached documents (e.g. the issued visa) + emailing them to the applicant ── */

// Deliberately separate from app/api/upload/route.ts: that endpoint is public,
// unauthenticated, rate-limited, and images-only (built for the applicant's
// own passport photo). This one is only reachable via a Server Action posted
// to /admin/*, which middleware.ts already gates on the admin/operator role —
// and it has to accept PDFs, since an issued e-Visa is almost always a PDF.
const MAX_BYTES = 20 * 1024 * 1024 // 20MB — Resend caps a whole email at 40MB

function detectDocType(buffer: Buffer): { mime: string; ext: string } | null {
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { mime: 'application/pdf', ext: 'pdf' } // "%PDF"
  }
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mime: 'image/jpeg', ext: 'jpg' }
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
  ) {
    return { mime: 'image/png', ext: 'png' }
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // "RIFF"
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50   // "WEBP"
  ) {
    return { mime: 'image/webp', ext: 'webp' }
  }
  return null
}

// staff attaches an extra file to an applicant's record — separate from
// whatever the applicant uploaded themselves via the wizard
export async function addApplicantDocument(formData: FormData) {
  await connectDb()
  const id = formData.get('id') as string
  const applicationNumber = formData.get('applicationNumber') as string
  const file = formData.get('file')
  if (!id || !(file instanceof File)) return { ok: false, error: 'No file provided' }
  if (file.size > MAX_BYTES) return { ok: false, error: `File too large (max ${MAX_BYTES / (1024 * 1024)}MB)` }

  const buffer = Buffer.from(await file.arrayBuffer())
  const detected = detectDocType(buffer)
  if (!detected) return { ok: false, error: 'Please upload a PDF, JPG, PNG, or WebP file' }

  const filename = `${randomUUID()}.${detected.ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'evisa-documents')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)

  const url = `/uploads/evisa-documents/${filename}`
  await Evisa.findByIdAndUpdate(id, { $addToSet: { documents: url } })
  revalidatePath(`/admin/evisa/applications/${applicationNumber}`)
  return { ok: true }
}

export async function removeApplicantDocument(formData: FormData) {
  await connectDb()
  const id = formData.get('id') as string
  const applicationNumber = formData.get('applicationNumber') as string
  const url = formData.get('url') as string
  if (!id || !url) return { ok: false, error: 'Missing file' }

  await Evisa.findByIdAndUpdate(id, { $pull: { documents: url } })

  // best-effort disk cleanup -- a file already gone shouldn't block the removal
  try {
    await unlink(path.join(process.cwd(), 'public', url))
  } catch {}

  revalidatePath(`/admin/evisa/applications/${applicationNumber}`)
  return { ok: true }
}

// sends every document currently attached to this applicant to the email
// they themselves submitted on the form -- never a manually-typed address,
// so there's no way to misfire someone's visa to the wrong inbox
export async function emailApplicantDocuments(formData: FormData) {
  await connectDb()
  const id = formData.get('id') as string
  const applicationNumber = formData.get('applicationNumber') as string

  const member = await Evisa.findById(id).lean() as any
  if (!member) return { ok: false, error: 'Applicant not found' }
  if (!member.documents?.length) return { ok: false, error: 'No documents attached yet' }

  const emailFields = await FormElement.find({ type: 'email' }).select('fieldKey').lean()
  const emailKeys = new Set(emailFields.map((f: any) => f.fieldKey))
  const emailAnswer = (member.answers ?? []).find((a: any) => emailKeys.has(a.fieldKey))
  const to = emailAnswer?.value as string | undefined
  if (!to) return { ok: false, error: 'This applicant has no email on file' }

  const nameAnswer = (member.answers ?? []).find((a: any) => /name/i.test(a.fieldKey))
  const name = nameAnswer?.value || `Applicant ${member.applicantIndex}`

  try {
    await sendApplicantDocuments({ to, name, applicationNumber, documents: member.documents })
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Failed to send email' }
  }

  await Evisa.findByIdAndUpdate(id, { emailSentAt: new Date(), emailSentTo: to })
  revalidatePath(`/admin/evisa/applications/${applicationNumber}`)
  return { ok: true, to }
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
