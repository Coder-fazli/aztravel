'use server'

import { connectDb }      from '@/lib/db/connect'
import Booking            from '@/lib/db/models/Booking'
import Tour               from '@/lib/db/models/Tour'
import { sendBookingConfirmation } from '@/lib/email/bookingConfirmation'
import { revalidatePath } from 'next/cache'
import { cookies }        from 'next/headers'

function generateRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `AZT-${year}-${rand}`
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/* ── CREATE BOOKING ── */
export async function createBooking(formData: FormData) {
  await connectDb()

  const tourId     = formData.get('tourId')     as string
  const date       = formData.get('date')       as string
  const timeSlot   = formData.get('timeSlot')   as string
  const adults     = Number(formData.get('adults')   ?? 1)
  const children   = Number(formData.get('children') ?? 0)
  const guestName  = (formData.get('guestName')  as string).trim()
  const guestEmail = (formData.get('guestEmail') as string).trim().toLowerCase()
  const guestPhone = (formData.get('guestPhone') as string | null)?.trim() ?? ''
  const notes      = (formData.get('notes')      as string | null)?.trim() ?? ''

  // fetch tour for price + title
  const tour = await Tour.findById(tourId).lean() as any
  if (!tour) throw new Error('Tour not found')

  const tourTitle  = tour.title?.en ?? tour.title ?? 'Tour'
  const tourSlug   = tour.slug ?? ''
  const unitPrice  = tour.price?.final ?? 0
  const currency   = tour.price?.currency ?? 'USD'
  const totalPrice = (adults + children) * unitPrice

  const bookingRef = generateRef()

  await Booking.create({
    bookingRef,
    tour:       tourId,
    tourTitle,
    tourSlug,
    date:       new Date(date),
    timeSlot:   timeSlot ?? '',
    adults,
    children,
    totalPrice,
    currency,
    guestName,
    guestEmail,
    guestPhone,
    notes,
    status: 'pending',
  })

  // send confirmation email (non-blocking — don't let email failure break booking)
  try {
    await sendBookingConfirmation({
      to:         guestEmail,
      guestName,
      bookingRef,
      tourTitle,
      date:       formatDate(new Date(date)),
      timeSlot:   timeSlot ?? '',
      adults,
      children,
      totalPrice,
      currency,
    })
  } catch (e) {
    console.error('Confirmation email failed:', e)
  }

  revalidatePath('/admin/bookings')

  return { ok: true, bookingRef, tourTitle, totalPrice, currency }
}

/* ── ADMIN: GET ALL BOOKINGS ── */
export async function getBookings(status?: string) {
  await connectDb()
  const filter = status && status !== 'all' ? { status } : {}
  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .lean()
  return JSON.parse(JSON.stringify(bookings))
}

/* ── ADMIN: PENDING COUNT ── */
export async function getPendingCount() {
  await connectDb()
  return Booking.countDocuments({ status: 'pending' })
}

/* ── GUEST: LOOKUP BY EMAIL ── */
export async function getBookingsByEmail(email: string) {
  await connectDb()
  const bookings = await Booking.find({ guestEmail: email.toLowerCase().trim() })
    .sort({ date: -1 })
    .lean()
  return JSON.parse(JSON.stringify(bookings))
}

/* ── ADMIN: MARK BOOKINGS SEEN ── */
export async function markBookingsSeen() {
  const store = await cookies()
  store.set('bookings_last_seen', Date.now().toString(), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}

/* ── ADMIN: NEW BOOKINGS COUNT (since last seen) ── */
export async function getNewBookingsCount(since: Date) {
  await connectDb()
  return Booking.countDocuments({ createdAt: { $gt: since } })
}

/* ── ADMIN: UPDATE STATUS ── */
export async function updateBookingStatus(formData: FormData) {
  await connectDb()
  const id     = formData.get('id')     as string
  const status = formData.get('status') as string
  await Booking.findByIdAndUpdate(id, { status })
  revalidatePath('/admin/bookings')
}
