'use client'

import { useState, useTransition } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { createBooking } from '@/lib/actions/bookings'
import styles from './BookingWidget.module.css'

type TimeSlot = {
  date:      string
  times:     string[]
  spotsLeft: number
}

type Props = {
  tourId:              string
  priceFinal:          number
  priceOriginal:       number
  currency:            string
  capacityMax:         number
  availableDates:      string[]
  timeSlots:           TimeSlot[]
  cancellationFree:    boolean
  cancellationHours:   number
  payLater:            boolean
  bookedLast24h:       number
}

type Step = 'select' | 'checkout' | 'confirmed'
type BookingResult = { bookingRef: string; tourTitle: string; totalPrice: number; currency: string }

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export default function BookingWidget({
  tourId,
  priceFinal, priceOriginal, currency, capacityMax,
  availableDates, timeSlots,
  cancellationFree, cancellationHours, payLater, bookedLast24h,
}: Props) {
  const [step,          setStep]         = useState<Step>('select')
  const [result,        setResult]       = useState<BookingResult | null>(null)
  const [isPending,     startTransition] = useTransition()
  const [formError,     setFormError]    = useState('')

  const [adults,        setAdults]        = useState(1)
  const [children,      setChildren]      = useState(0)
  const [draftAdults,   setDraftAdults]   = useState(1)
  const [draftChildren, setDraftChildren] = useState(0)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [calOpen,      setCalOpen]      = useState(false)
  const [guestOpen,    setGuestOpen]    = useState(false)

  const availSet = new Set(availableDates.map(d => new Date(d).toDateString()))
  const isAvailable = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return false
    return availSet.has(date.toDateString())
  }

  const slotForDate = selectedDate
    ? timeSlots.find(s => isSameDay(new Date(s.date), selectedDate))
    : null

  const totalGuests = adults + children
  const total       = totalGuests * priceFinal

  const guestLabel = totalGuests === 1 ? '1 guest' : `${totalGuests} guests`
  const maxReached  = draftAdults + draftChildren >= (capacityMax || 20)

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date)
    setSelectedTime(null)
    setCalOpen(false)
  }

  function openGuests() {
    setDraftAdults(adults)
    setDraftChildren(children)
    setGuestOpen(true)
  }

  function applyGuests() {
    setAdults(draftAdults)
    setChildren(draftChildren)
    setGuestOpen(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.currentTarget)
    fd.set('tourId',   tourId)
    fd.set('date',     selectedDate!.toISOString())
    fd.set('timeSlot', selectedTime ?? '')
    fd.set('adults',   String(adults))
    fd.set('children', String(children))
    startTransition(async () => {
      try {
        const res = await createBooking(fd)
        setResult(res)
        setStep('confirmed')
      } catch {
        setFormError('Something went wrong. Please try again.')
      }
    })
  }

  /* ── CONFIRMED SCREEN ── */
  if (step === 'confirmed' && result) {
    return (
      <div className={styles.widget}>
        <div className={styles.confirmedIcon}>✓</div>
        <h3 className={styles.confirmedTitle}>Booking Confirmed!</h3>
        <p className={styles.confirmedRef}>{result.bookingRef}</p>
        <p className={styles.confirmedText}>
          A confirmation has been sent to your email. We'll be in touch shortly.
        </p>
        <div className={styles.confirmedSummary}>
          <span>{result.tourTitle}</span>
          <span className={styles.confirmedPrice}>{result.totalPrice} {result.currency}</span>
        </div>
      </div>
    )
  }

  /* ── CHECKOUT FORM ── */
  if (step === 'checkout') {
    return (
      <div className={styles.widget}>
        <button type="button" className={styles.backBtn} onClick={() => setStep('select')}>
          ← Back
        </button>
        <h3 className={styles.checkoutTitle}>Your details</h3>
        <div className={styles.checkoutSummary}>
          <span>{selectedDate?.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
          <span>{adults + children} guest{adults + children !== 1 ? 's' : ''}</span>
          <span className={styles.checkoutPrice}>{(adults + children) * priceFinal} {currency}</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.checkoutForm}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Full name *</label>
            <input name="guestName" required className={styles.formInput} placeholder="Your name" />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Email *</label>
            <input name="guestEmail" type="email" required className={styles.formInput} placeholder="your@email.com" />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Phone</label>
            <input name="guestPhone" type="tel" className={styles.formInput} placeholder="+994 ..." />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Notes</label>
            <textarea name="notes" className={styles.formTextarea} rows={2} placeholder="Any special requests?" />
          </div>
          {formError && <p className={styles.formError}>{formError}</p>}
          <button type="submit" className={styles.ctaPrimary} disabled={isPending}>
            {isPending ? 'Submitting…' : 'Confirm booking'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className={styles.widget}>

      {/* urgency */}
      {bookedLast24h > 5 && (
        <div className={styles.urgency}>🔥 Usually sells out</div>
      )}

      {/* price */}
      <div className={styles.priceBlock}>
        <span className={styles.priceFrom}>from</span>
        <div className={styles.priceRow}>
          <span className={styles.price}>{priceFinal}{currency}</span>
          {priceOriginal > priceFinal && (
            <span className={styles.priceOriginal}>{priceOriginal}{currency}</span>
          )}
          <span className={styles.priceLabel}>/person</span>
        </div>
      </div>

      {/* date + guests — side by side in bordered container */}
      <div className={styles.selectors}>

        {/* date */}
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger className={styles.selectorBtn}>
            <CalendarIcon />
            <span>{selectedDate ? formatDate(selectedDate) : 'Select date'}</span>
          </PopoverTrigger>
          <PopoverContent className={styles.calPopover} align="start" sideOffset={8}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(d) => !isAvailable(d)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <span className={styles.selectorDivider} />

        {/* guests */}
        <Popover
          open={guestOpen}
          onOpenChange={(o) => { if (o) openGuests(); else setGuestOpen(false) }}
        >
          <PopoverTrigger className={styles.selectorBtn}>
            <GuestsIcon />
            <span>{guestLabel}</span>
          </PopoverTrigger>
          <PopoverContent className={styles.guestPopover} align="end" sideOffset={8}>

            <p className={styles.guestHint}>
              You can select up to {capacityMax || 20} travelers in total.
            </p>

            {/* adults */}
            <div className={styles.guestRow}>
              <div>
                <p className={styles.guestType}>Adults</p>
                <p className={styles.guestAge}>Age 13+</p>
              </div>
              <div className={styles.counter}>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => setDraftAdults(v => Math.max(1, v - 1))}
                  disabled={draftAdults <= 1}
                >−</button>
                <span className={styles.counterVal}>{draftAdults}</span>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => setDraftAdults(v => v + 1)}
                  disabled={maxReached}
                >+</button>
              </div>
            </div>

            {/* children */}
            <div className={styles.guestRow}>
              <div>
                <p className={styles.guestType}>Children</p>
                <p className={styles.guestAge}>Age 3 − 12</p>
              </div>
              <div className={styles.counter}>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => setDraftChildren(v => Math.max(0, v - 1))}
                  disabled={draftChildren <= 0}
                >−</button>
                <span className={styles.counterVal}>{draftChildren}</span>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => setDraftChildren(v => v + 1)}
                  disabled={maxReached}
                >+</button>
              </div>
            </div>

            <button type="button" className={styles.applyBtn} onClick={applyGuests}>
              Apply
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* time slots */}
      {selectedDate && slotForDate && (
        <div className={styles.slots}>
          {slotForDate.spotsLeft <= 5 && slotForDate.spotsLeft > 0 && (
            <span className={styles.spotsLeft}>Only {slotForDate.spotsLeft} spots left</span>
          )}
          <div className={styles.slotBtns}>
            {slotForDate.times.map(t => (
              <button
                key={t}
                type="button"
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
          <span className={styles.totalBreak}>
            {adults} Adult{adults !== 1 ? 's' : ''}
            {children > 0 ? ` + ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
            {' × '}{priceFinal}{currency}
          </span>
          <span className={styles.totalPrice}>{total}{currency}</span>
        </div>
      )}

      {/* CTAs */}
      <button
        type="button"
        className={styles.ctaPrimary}
        disabled={!selectedDate}
        onClick={() => selectedDate && setStep('checkout')}
      >
        {selectedDate ? 'Book now' : 'Check availability'}
      </button>

      <button type="button" className={styles.ctaSecondary}>
        Make enquiry
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

function CalendarIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="13" height="12" rx="2"/>
      <line x1="2" y1="7" x2="15" y2="7"/>
      <line x1="5.5" y1="1.5" x2="5.5" y2="4.5"/>
      <line x1="11.5" y1="1.5" x2="11.5" y2="4.5"/>
    </svg>
  )
}
function GuestsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="5" r="2.5"/>
      <path d="M1 15c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>
      <circle cx="12" cy="5" r="2" strokeWidth="1.3"/>
      <path d="M14.5 14c0-2-1.5-3.5-3-4" strokeWidth="1.3"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--primary-13)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="2 7 5.5 10.5 12 3.5"/>
\    </svg>
  )
}
