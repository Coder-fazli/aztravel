'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import styles from './ToursPagination.module.css'

type Props = {
  currentPage: number
  totalPages:  number
  limit:       number
}

const LIMIT_OPTIONS = [10, 20, 50]

function ChevronDoubleLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="7 2 3 6 7 10" />
      <polyline points="11 2 7 6 11 10" />
    </svg>
  )
}
function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="8 2 4 6 8 10" />
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 2 8 6 4 10" />
    </svg>
  )
}
function ChevronDoubleRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="5 2 9 6 5 10" />
      <polyline points="1 2 5 6 1 10" />
    </svg>
  )
}

function buildPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, '...', total]
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default function ToursPagination({ currentPage, totalPages, limit }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  function goTo(page: number) {
    if (page < 1 || page > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  function setLimit(value: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', String(value))
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages = buildPages(currentPage, totalPages)

  return (
    <div className={styles.bar}>
      {/* page buttons */}
      <div className={styles.pages}>
        <button className={styles.navBtn} onClick={() => goTo(1)} disabled={currentPage === 1} aria-label="First page">
          <ChevronDoubleLeft />
        </button>
        <button className={styles.navBtn} onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">
          <ChevronLeft />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className={styles.dots}>...</span>
          ) : (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
              onClick={() => goTo(p as number)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button className={styles.navBtn} onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">
          <ChevronRight />
        </button>
        <button className={styles.navBtn} onClick={() => goTo(totalPages)} disabled={currentPage === totalPages} aria-label="Last page">
          <ChevronDoubleRight />
        </button>
      </div>

      {/* visible row count */}
      <div className={styles.rowCount}>
        <span className={styles.rowLabel}>Visible row count:</span>
        <div className={styles.limitSelect}>
          <span className={styles.limitValue}>{limit}</span>
          <select
            className={styles.limitField}
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            aria-label="Rows per page"
          >
            {LIMIT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#595959"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="2 4 6 8 10 4" />
          </svg>
        </div>
      </div>
    </div>
  )
}
