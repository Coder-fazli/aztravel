'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import styles from './BookingWidget.module.css'

type TimeSlot = {
  date:      string   // ISO date string
  times:     string[]
  spotsLeft: number
}

type Props = {
  priceFinal:    number
  priceOriginal: number
  currency:      string
  capacityMax:   number
  availableDates: string[]   // ISO strings
  timeSlots:      TimeSlot[]
  cancellationFree:    boolean
  cancellationHours:   number
  payLater:            boolean
  bookedLast24h:       number
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BookingWidget({
  priceFinal, priceOriginal, currency, capacityMax,
  availableDates, timeSlots,
  cancellationFree, cancellationHours, payLater, bookedLast24h,
}: Props) {
  const [guests,       setGuests]       = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [calOpen,      setCalOpen]      = useState(false)
  const [guestOpen,    setGuestOpen]    = useState(false)

  const availSet = new Set(availableDates.map(d => new Date(d).toDateString()))

  const isAvailable = (date: Date) => {
    if (date < new Date(new Date().setHours(0,0,0,0))) return false
    return availSet.has(date.toDateString())
  }

  const slotForDate = selectedDate
    ? timeSlots.find(s => isSameDay(new Date(s.date), selectedDate))
    : null

  const total = guests * priceFinal

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date)
    setSelectedTime(null)
    setCalOpen(false)
  }

  return (
    <div className={styles.widget}>
      {/* urgency badge */}
      {bookedLast24h > 5 && (
        <div className={styles.urgency}>Usually sells out</div>
      )}

      {/* price */}
      <div className={styles.priceRow}>
        <span className={styles.priceFrom}>from</span>
        <span className={styles.price}>{priceFinal}{currency}</span>
        <span className={styles.priceOriginal}>{priceOriginal}{currency}</span>
        <span className={styles.priceLabel}>/person</span>
      </div>

      {/* guest picker */}
      <div className={styles.field}>
        <Popover open={guestOpen} onOpenChange={setGuestOpen}>
          <PopoverTrigger className={styles.fieldBtn}>
            <GuestsIcon />
            <span>Adults × {guests}</span>
            <ChevronIcon open={guestOpen} />
          </PopoverTrigger>
          <PopoverContent className={styles.guestPopover} align="start" sideOffset={4}>
            <div className={styles.guestRow}>
              <div>
                <p className={styles.guestType}>Adults</p>
                <p className={styles.guestAge}>Age: 18 and over</p>
              </div>
              <div className={styles.counter}>
                <button
                  className={styles.counterBtn}
                  onClick={() => setGuests(g => Math.max(1, g - 1))}
                  disabled={guests <= 1}
                >−</button>
                <span className={styles.counterVal}>{guests}</span>
                <button
                  className={styles.counterBtn}
                  onClick={() => setGuests(g => Math.min(capacityMax || 20, g + 1))}
                  disabled={guests >= (capacityMax || 20)}
                >+</button>
              </div>
            </div>
            <button className={styles.continueBtn} onClick={() => setGuestOpen(false)}>
              Continue
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* date picker */}
      <div className={styles.field}>
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger className={styles.fieldBtn}>
            <CalendarIcon />
            <span>{selectedDate ? formatDate(selectedDate) : 'Select date'}</span>
            <ChevronIcon open={calOpen} />
          </PopoverTrigger>
          <PopoverContent className={styles.calPopover} align="start" sideOffset={4}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => !isAvailable(date)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* time slots — shown after date picked */}
      {selectedDate && slotForDate && (
        <div className={styles.slots}>
          <p className={styles.slotsLabel}>Choose start time</p>
          {slotForDate.spotsLeft <= 5 && slotForDate.spotsLeft > 0 && (
            <span className={styles.spotsLeft}>Only {slotForDate.spotsLeft} spots left</span>
          )}
          <div className={styles.slotBtns}>
            {slotForDate.times.map(t => (
              <button
                key={t}
                className={`${styles.slotBtn} ${selectedTime === t ? styles.slotBtnActive : ''}`}
                onClick={() => setSelectedTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* total */}
      {selectedDate && (
        <div className={styles.total}>
          <span className={styles.totalBreak}>{guests} × {priceFinal}{currency}</span>
          <span className={styles.totalPrice}>{total}{currency}</span>
        </div>
      )}

      {/* CTA */}
      <button className={styles.cta} disabled={!selectedDate}>
        {selectedDate ? 'Book now' : 'Check availability'}
      </button>

      {/* perks */}
      <div className={styles.perks}>
        {cancellationFree && (
          <div className={styles.perk}>
            <CheckIcon />
            <span>Free cancellation up to {cancellationHours}h before</span>
          </div>
        )}
        {payLater && (
          <div className={styles.perk}>
            <CheckIcon />
            <span>Book now, pay later</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── inline icons ── */
function GuestsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="3" />
      <path d="M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="13" rx="2.5" />
      <line x1="2" y1="7.5" x2="16" y2="7.5" />
      <line x1="6" y1="1.5" x2="6" y2="4.5" />
      <line x1="12" y1="1.5" x2="12" y2="4.5" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginLeft: 'auto', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
      <polyline points="3 6 8 11 13 6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--primary-13)"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6.5" stroke="var(--primary-13)" strokeWidth="1.4" />
      <polyline points="5 8.5 7 10.5 11 6" />
    </svg>
  )
}
