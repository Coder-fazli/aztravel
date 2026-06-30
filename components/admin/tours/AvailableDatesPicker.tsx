'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import styles from './AvailableDatesPicker.module.css'

type Props = {
  name?: string
  defaultValue?: string[]
}

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10)
}

function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function AvailableDatesPicker({ name, defaultValue = [] }: Props) {
  const [open,     setOpen]     = useState(false)
  const [selected, setSelected] = useState<Date[]>(
    defaultValue.filter(Boolean).map(parseYMD)
  )

  const serialized = selected.map(toYMD).join('\n')

  function removeDate(ymd: string) {
    setSelected(prev => prev.filter(d => toYMD(d) !== ymd))
  }

  function clearAll() {
    setSelected([])
  }

  const label = selected.length === 0
    ? 'Select dates'
    : `${selected.length} date${selected.length !== 1 ? 's' : ''} selected`

  return (
    <div className={styles.wrap}>
      {name && <input type="hidden" name={name} value={serialized} readOnly />}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className={styles.trigger}>
          <CalIcon />
          <span>{label}</span>
          <ChevronIcon open={open} />
        </PopoverTrigger>
        <PopoverContent className={styles.popover} align="start" sideOffset={6}>
          <Calendar
            mode="multiple"
            selected={selected}
            onSelect={days => setSelected(days ?? [])}
            disabled={{ before: new Date() }}
          />
          <div className={styles.popoverFooter}>
            <button type="button" className={styles.clearBtn} onClick={clearAll} disabled={selected.length === 0}>
              Clear all
            </button>
            <button type="button" className={styles.doneBtn} onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className={styles.pillsList}>
          {[...selected]
            .sort((a, b) => a.getTime() - b.getTime())
            .map(d => {
              const ymd = toYMD(d)
              return (
                <span key={ymd} className={styles.pill}>
                  {ymd}
                  <button type="button" className={styles.pillRemove} onClick={() => removeDate(ymd)}>×</button>
                </span>
              )
            })}
        </div>
      )}
    </div>
  )
}

function CalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="12" height="11" rx="1.5"/>
      <line x1="1.5" y1="6" x2="13.5" y2="6"/>
      <line x1="4.5" y1="1" x2="4.5" y2="4"/>
      <line x1="10.5" y1="1" x2="10.5" y2="4"/>
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginLeft: 'auto', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
      <polyline points="2 5 7 10 12 5"/>
    </svg>
  )
}
