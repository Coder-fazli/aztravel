'use client'

import { useRef, useState, useEffect } from 'react'
import styles from './ReadMore.module.css'

type Props = {
  html:      string
  className?: string
  clampPx?:  number   // max height when collapsed (default 200)
}

export default function ReadMore({ html, className = '', clampPx = 200 }: Props) {
  const ref          = useRef<HTMLDivElement>(null)
  const [expanded,   setExpanded]   = useState(false)
  const [overflows,  setOverflows]  = useState(false)

  useEffect(() => {
    if (ref.current) {
      setOverflows(ref.current.scrollHeight > clampPx + 24)
    }
  }, [clampPx, html])

  return (
    <div className={styles.wrap}>
      <div
        ref={ref}
        className={`${className} ${styles.content} ${!expanded && overflows ? styles.clamped : ''}`}
        style={!expanded && overflows ? { maxHeight: clampPx } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {overflows && !expanded && (
        <div className={styles.fadeRow}>
          <div className={styles.fade} />
          <button
            type="button"
            className={styles.btn}
            onClick={() => setExpanded(true)}
          >
            Read more
          </button>
        </div>
      )}
    </div>
  )
}
