'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import styles from './AvailableDatesPicker.module.css'

type Props = {
  /** form field name — submits YYYY-MM-DD lines, same as before */
  name?: string
  defaultValue?: string[]   // YYYY-MM-DD strings
}

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10)
}

function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function AvailableDatesPicker({ name, defaultValue = [] }: Props) {
  const [selected, setSelected] = useState<Date[]>(
    defaultValue.filter(Boolean).map(parseYMD)
  )

  const serialized = selected.map(toYMD).join('\n')

  function handleSelect(days: Date[] | undefined) {
    setSelected(days ?? [])
  }

  function removeDate(ymd: string) {
    setSelected(prev => prev.filter(d => toYMD(d) !== ymd))
  }

  function clearAll() {
    setSelected([])
  }

  return (
    <div className={styles.wrap}>
      {name && (
        <input type="hidden" name={name} value={serialized} readOnly />
      )}

      <div className={styles.calendarWrap}>
        <Calendar
          mode="multiple"
          selected={selected}
          onSelect={handleSelect}
          disabled={{ before: new Date() }}
        />
      </div>

      {selected.length > 0 && (
        <div className={styles.pills}>
          <div className={styles.pillsHeader}>
            <span className={styles.pillsCount}>{selected.length} date{selected.length !== 1 ? 's' : ''} selected</span>
            <button type="button" className={styles.clearBtn} onClick={clearAll}>
              Clear all
            </button>
          </div>
          <div className={styles.pillsList}>
            {[...selected]
              .sort((a, b) => a.getTime() - b.getTime())
              .map(d => {
                const ymd = toYMD(d)
                return (
                  <span key={ymd} className={styles.pill}>
                    {ymd}
                    <button
                      type="button"
                      className={styles.pillRemove}
                      onClick={() => removeDate(ymd)}
                    >
                      ×
                    </button>
                  </span>
                )
              })}
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <p className={styles.empty}>Click days on the calendar to add available dates.</p>
      )}
    </div>
  )
}
