'use client'

import styles from './FilterButton.module.css'

function FunnelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h14l-5.5 6.5V15l-3-1.5V9.5z" />
    </svg>
  )
}

export const TOGGLE_TOUR_FILTERS_EVENT = 'toggle-tour-filters'

export default function FilterButton() {
  return (
    <button
      type="button"
      className={styles.btn}
      onClick={() => window.dispatchEvent(new Event(TOGGLE_TOUR_FILTERS_EVENT))}
    >
      <FunnelIcon />
      <span>Filter</span>
    </button>
  )
}
