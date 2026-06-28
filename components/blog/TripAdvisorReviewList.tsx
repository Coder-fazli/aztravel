'use client'

import { useState } from 'react'
import TripAdvisorReviewCard from './TripAdvisorReviewCard'
import styles from './TripAdvisorBlock.module.css'

const INITIAL = 2

export default function TripAdvisorReviewList({ reviews }: { reviews: any[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? reviews : reviews.slice(0, INITIAL)
  const hasMore = reviews.length > INITIAL

  return (
    <>
      <div className={styles.reviewGrid}>
        {visible.map((r: any, i: number) => (
          <TripAdvisorReviewCard key={r.id ?? i} review={r} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className={styles.showAllBtn}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? 'Show less ↑'
            : `Show all ${reviews.length} reviews ↓`}
        </button>
      )}
    </>
  )
}
