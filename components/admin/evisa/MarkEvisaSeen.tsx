'use client'

import { useEffect } from 'react'
import { markEvisaApplicationsSeen } from '@/lib/actions/admin/evisaApplications'

export function MarkEvisaSeen() {
  useEffect(() => { markEvisaApplicationsSeen() }, [])
  return null
}
