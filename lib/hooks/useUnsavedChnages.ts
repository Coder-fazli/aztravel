'use client'

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'


export function useUnsavedChanges(isDirty: boolean){
    const router = useRouter()
    const [pendingUrl, setPendingUrl] = useState<string | null>(null)

    // Table close / refresh / typing a URL
    useEffect(() => {
        if (!isDirty) return
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', onBeforeUnload)
        return () => window.removeEventListener('beforeunload', onBeforeUnload)
    }, [isDirty])

   // CASE 2 — clicking any in-app link (sidebar, etc.) → intercept, show OUR modal
    useEffect(() => {
        if (!isDirty) return
        const onClick = (e: MouseEvent) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
            const link = (e.target as HTMLElement).closest('a')
            if(!link) return
            const href = link.getAttribute('href')
            if (!href || href.startsWith('http') || link.target === '_blank' || href.startsWith('#')) return

            e.preventDefault()
            setPendingUrl(href)
        }
            document.addEventListener('click', onClick, true)
            return () => document.removeEventListener('click', onClick, true)
        }, [isDirty])

      const confirm = () => {
      const url = pendingUrl
      setPendingUrl(null)
      if (url) router.push(url)
      
    }
        const cancel = () => setPendingUrl(null)

        return { isBlocked: pendingUrl !== null, confirm, cancel }
}