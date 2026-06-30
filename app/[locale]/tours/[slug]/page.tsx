import { notFound }       from 'next/navigation'
import { getTourBySlug }  from '@/lib/actions/tours'
import TourGallery        from '@/components/features/tours/TourGallery'
import BookingWidget      from '@/components/features/tours/BookingWidget'
import styles             from './page.module.css'

type Params       = Promise<{ locale: string; slug: string }>

const CATEGORY_LABELS: Record<string, string> = {
  'multi-day':       'Multi day',
  'day-trip':        'Day trip',
  'guided':          'Guided tour',
  'history-culture': 'History & Culture',
  'nature':          'Nature',
  'adventure':       'Adventure',
}

const TAG_COLORS: Record<string, string> = {
  'multi-day':       'var(--secondary-13)',
  'day-trip':        'var(--secondary-13)',
  'guided':          'var(--error-13)',
  'history-culture': 'var(--error-13)',
  'nature':          'var(--error-13)',
  'adventure':       'var(--error-13)',
}

export default async function TourDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params
  const tour = await getTourBySlug(slug) as any

  if (!tour) notFound()

  const t   = (field: any) => field?.[locale] ?? field?.en ?? ''
  const loc = tour.location as any
  const guide = tour.guide as any

  // Serialize dates for client component
  const availableDates = (tour.availableDates ?? []).map((d: Date) =>
    new Date(d).toISOString()
  )
  const timeSlots = (tour.timeSlots ?? []).map((s: any) => ({
    date:      new Date(s.date).toISOString(),
    times:     s.times ?? [],
    spotsLeft: s.spotsLeft ?? 99,
  }))

  return (
    <div className={styles.page}>

      {/* ── FULL WIDTH: header + gallery ── */}
      <div className={styles.fullWidth}>
        <header className={styles.header}>
          <div className={styles.tags}>
            {tour.isSpecialOffer && (
              <span className={styles.tag} style={{ background: 'var(--primary-13)' }}>
                Special offer
              </span>
            )}
            {(tour.categories ?? []).map((cat: string) => (
              <span key={cat} className={styles.tag}
                style={{ background: TAG_COLORS[cat] ?? 'var(--base-8)' }}>
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>

          <h1 className={styles.title}>{t(tour.title)}</h1>

          <div className={styles.meta}>
            {tour.rating?.avg > 0 && (
              <span className={styles.metaItem}>
                <StarIcon />
                <strong>{tour.rating.avg.toFixed(1)}</strong>
                <span className={styles.metaMuted}>· {tour.rating.count} reviews</span>
              </span>
            )}
            {guide && (
              <span className={styles.metaItem}>
                <GuideIcon />
                <span>by {guide.name}</span>
                {guide.languages?.length > 0 && (
                  <span className={styles.metaMuted}>
                    · {guide.languages.join(', ')}
                  </span>
                )}
              </span>
            )}
            {tour.duration?.value && (
              <span className={styles.metaItem}>
                <ClockIcon />
                <span>{tour.duration.value} {tour.duration.unit}</span>
              </span>
            )}
            {loc && (
              <span className={styles.metaItem}>
                <PinIcon />
                <span>{typeof loc.name === 'object' ? t(loc.name) : loc.name}</span>
              </span>
            )}
          </div>
        </header>

        <TourGallery images={tour.images ?? []} title={t(tour.title)} />
      </div>

      {/* ── TWO COLUMN: content + sidebar ── */}
      <div className={styles.layout}>
        <main className={styles.main}>

          {/* highlights — collapsible */}
          {tour.highlights?.length > 0 && (
            <details className={styles.accordion}>
              <summary className={styles.accordionTitle}>
                Highlights
                <ChevronIcon />
              </summary>
              <div className={styles.accordionBody}>
                <div className={styles.highlights}>
                  {tour.highlights.map((h: any, i: number) => (
                    <div key={i} className={styles.highlight}>
                      <CheckIcon />
                      <span>{t(h)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          )}

          {/* inclusions / exclusions — collapsible */}
          {(tour.inclusions?.length > 0 || tour.exclusions?.length > 0) && (
            <details className={styles.accordion}>
              <summary className={styles.accordionTitle}>
                Package Features
                <ChevronIcon />
              </summary>
              <div className={styles.accordionBody}>
                <div className={styles.inExGrid}>
                  {tour.inclusions?.length > 0 && (
                    <div>
                      <h3 className={styles.inExTitle}>Include Features</h3>
                      <ul className={styles.inExList}>
                        {tour.inclusions.map((item: any, i: number) => (
                          <li key={i} className={styles.inExItem}>
                            <span className={styles.inExIconInclude}><IncludeIcon /></span>
                            <span>{t(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tour.exclusions?.length > 0 && (
                    <div>
                      <h3 className={styles.inExTitle}>Exclude Features</h3>
                      <ul className={styles.inExList}>
                        {tour.exclusions.map((item: any, i: number) => (
                          <li key={i} className={styles.inExItem}>
                            <span className={styles.inExIconExclude}><ExcludeIcon /></span>
                            <span>{t(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </details>
          )}

          {/* description */}
          {t(tour.description) && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Tour details</h2>
              <div
                className={styles.richText}
                dangerouslySetInnerHTML={{ __html: t(tour.description) }}
              />
            </section>
          )}

          {/* itinerary */}
          {tour.itinerary?.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Itinerary</h2>
              <ol className={styles.itinerary}>
                {tour.itinerary.map((step: any, i: number) => (
                  <li key={i} className={styles.itineraryStep}>
                    <span className={styles.itineraryDay}>Day {i + 1}</span>
                    <div>
                      <p className={styles.itineraryTitle}>{t(step.title)}</p>
                      <p className={styles.itineraryDesc}>{t(step.description)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* join conditions */}
          {t(tour.conditions) && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Join conditions</h2>
              <div
                className={styles.richText}
                dangerouslySetInnerHTML={{ __html: t(tour.conditions) }}
              />
            </section>
          )}
          </main>

          {/* ── RIGHT STICKY SIDEBAR ── */}
          <aside className={styles.sidebar}>
            <BookingWidget
              priceFinal={tour.price?.final ?? 0}
              priceOriginal={tour.price?.original ?? 0}
              currency={tour.price?.currency ?? '$'}
              capacityMax={tour.capacity?.max ?? 20}
              availableDates={availableDates}
              timeSlots={timeSlots}
              cancellationFree={tour.cancellationPolicy?.free ?? false}
              cancellationHours={tour.cancellationPolicy?.hoursNotice ?? 24}
              payLater={tour.payLater ?? false}
              bookedLast24h={tour.bookedLast24h ?? 0}
            />
          </aside>
        </div>
    </div>
  )
}

/* ── inline SVG icons ── */
function StarIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="#ef6445"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/></svg>
}
function GuideIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="5.5" r="2.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>
}
function ClockIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6"/><polyline points="8 5 8 8 10 9.5"/></svg>
}
function PinIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 1.5c2.5 0 4.5 2 4.5 4.5 0 3-4.5 8-4.5 8S3.5 9 3.5 6c0-2.5 2-4.5 4.5-4.5z"/><circle cx="8" cy="6" r="1.5"/></svg>
}
function ChevronIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 6.5 9 11.5 14 6.5"/></svg>
}
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--primary-13)" strokeWidth="1.8"><circle cx="8" cy="8" r="6.5" strokeWidth="1.4"/><polyline points="5 8.5 7 10.5 11 6"/></svg>
}
function IncludeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" stroke="#3b82f6" strokeWidth="1.5"/>
      <polyline points="6.5 11 9.5 14 15.5 8" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ExcludeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" stroke="#ef4444" strokeWidth="1.5"/>
      <line x1="7" y1="7" x2="15" y2="15" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="15" y1="7" x2="7" y2="15" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
