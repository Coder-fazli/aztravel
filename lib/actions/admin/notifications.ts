'use server'

import { cookies } from 'next/headers'
import { connectDb } from '@/lib/db/connect'
import Booking from '@/lib/db/models/Booking'
import Evisa from '@/lib/db/models/evisa/Evisa'

export type AdminEvent = {
  id: string
  title: string
  subtitle: string
  href: string
  createdAt: string
}

const LIMIT = 8

// Feeds the header notification bell: everything new since the admin last
// visited bookings / evisa applications (same "last seen" cookies the
// sidebar's dot indicators already use), merged and sorted by recency.
export async function getRecentAdminEvents(): Promise<AdminEvent[]> {
  await connectDb()
  const store = await cookies()

  const bookingsSinceRaw = store.get('bookings_last_seen')?.value
  const bookingsSince = bookingsSinceRaw ? new Date(Number(bookingsSinceRaw)) : new Date(0)
  const evisaSinceRaw = store.get('evisa_apps_last_seen')?.value
  const evisaSince = evisaSinceRaw ? new Date(Number(evisaSinceRaw)) : new Date(0)

  const [newBookings, newEvisaRaw] = await Promise.all([
    Booking.find({ createdAt: { $gt: bookingsSince } })
      .sort({ createdAt: -1 }).limit(LIMIT)
      .select('guestName tourTitle createdAt').lean(),
    // over-fetch and dedupe below -- a party of N applicants creates N Evisa
    // docs at once, and we only want one notification per application
    Evisa.find({ createdAt: { $gt: evisaSince } })
      .sort({ createdAt: -1 }).limit(LIMIT * 3)
      .select('applicationNumber answers createdAt').lean(),
  ])

  const bookingEvents: AdminEvent[] = newBookings.map((b: any) => ({
    id: `booking-${b._id}`,
    title: 'New booking',
    subtitle: `${b.guestName} — ${b.tourTitle}`,
    href: '/admin/bookings',
    createdAt: b.createdAt.toISOString(),
  }))

  const seenApps = new Set<string>()
  const evisaEvents: AdminEvent[] = []
  for (const e of newEvisaRaw as any[]) {
    if (seenApps.has(e.applicationNumber) || evisaEvents.length >= LIMIT) continue
    seenApps.add(e.applicationNumber)
    const nameAnswer = (e.answers ?? []).find((a: any) => /name/i.test(a.fieldKey))
    evisaEvents.push({
      id: `evisa-${e._id}`,
      title: 'New e-Visa application',
      subtitle: nameAnswer ? `${e.applicationNumber} — ${nameAnswer.value}` : e.applicationNumber,
      href: `/admin/evisa/applications/${e.applicationNumber}`,
      createdAt: e.createdAt.toISOString(),
    })
  }

  return [...bookingEvents, ...evisaEvents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, LIMIT)
}
