'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import styles from './ViewToggle.module.css'

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" />
      <rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5" />
      <rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="1" y1="4.5" x2="17" y2="4.5" />
      <line x1="1" y1="9" x2="17" y2="9" />
      <line x1="1" y1="13.5" x2="17" y2="13.5" />
    </svg>
  )
}

export default function ViewToggle() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const view         = searchParams.get('view') ?? 'list'

  function setView(v: 'grid' | 'list') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', v)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={styles.toggle}>
      <button
        className={`${styles.btn} ${view === 'grid' ? styles.btnActive : ''}`}
        onClick={() => setView('grid')}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
      >
        <GridIcon />
      </button>
      <button
        className={`${styles.btn} ${view === 'list' ? styles.btnActive : ''}`}
        onClick={() => setView('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
      >
        <ListIcon />
      </button>
    </div>
  )
}
