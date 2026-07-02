'use client'

import { useEffect } from 'react'
import { markBookingsSeen } from '@/lib/actions/bookings'

export function MarkSeen() {
  useEffect(() => { markBookingsSeen() }, [])
  return null
}
