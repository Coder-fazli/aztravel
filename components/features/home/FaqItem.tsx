'use client'

import { useState } from 'react'
import styles from './FaqItem.module.css'

type Props = {
  question:    string
  answer:      string
  defaultOpen?: boolean
}

export default function FaqItem({ question, answer, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <button
      type="button"
      className={`${styles.item} ${open ? styles.open : ''}`}
      onClick={() => setOpen(o => !o)}
      aria-expanded={open}
    >
      <div className={styles.text}>
        <span className={styles.question}>{question}</span>
        <div className={styles.answerWrap}>
          <div className={styles.answerInner}>
            <p className={styles.answer}>{answer}</p>
          </div>
        </div>
      </div>

      {/* plus → minus: the vertical bar collapses when open */}
      <span className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="12" y1="5" x2="12" y2="19" className={styles.vBar} />
        </svg>
      </span>
    </button>
  )
}
