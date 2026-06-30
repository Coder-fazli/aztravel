import { Suspense }      from 'react'
import { getTours }      from '@/lib/actions/tours'
import TourCard          from '@/components/features/tours/TourCard'
import TourCardGrid      from '@/components/features/tours/TourCardGrid'
import TourFilters       from '@/components/features/tours/TourFilters'
import ToursPagination   from '@/components/features/tours/ToursPagination'
import ViewToggle        from '@/components/features/tours/ViewToggle'
import styles            from './page.module.css'

type Params = Promise<{ locale: string }>
type SearchParams = Promise<{
  categories?: string
  priceMin?:   string
  priceMax?:   string
  durations?:  string
  dateStart?:  string
  dateEnd?:    string
  rating?:     string
  page?:       string
  limit?:      string
  view?:       string
}>

export default async function ToursPage({
  params,
  searchParams,
}: {
  params:       Params
  searchParams: SearchParams
}) {
  const { locale } = await params
  const sp         = await searchParams

  const view  = sp.view  ?? 'list'
  const page  = Number(sp.page  ?? 1)
  const limit = Number(sp.limit ?? 10)

  const { tours, total, pages } = await getTours({
    categories: sp.categories?.split(',').filter(Boolean),
    priceMin:   sp.priceMin  ? Number(sp.priceMin)  : undefined,
    priceMax:   sp.priceMax  ? Number(sp.priceMax)  : undefined,
    durations:  sp.durations?.split(',').filter(Boolean),
    dateStart:  sp.dateStart,
    dateEnd:    sp.dateEnd,
    rating:     sp.rating    ? Number(sp.rating)    : undefined,
    page,
    limit,
  })

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* ── filter sidebar ── */}
        <Suspense>
          <TourFilters />
        </Suspense>

        {/* ── content area ── */}
        <section className={styles.content}>
          {/* headline + toggle */}
          <div className={styles.headline}>
            <div className={styles.headlineText}>
              <h1 className={styles.title}>Holiday packages</h1>
              <p className={styles.subtitle}>
                Integer fringilla tellus ullamcorper ac mauris potenti amet commodo amet enim.
              </p>
            </div>
            <Suspense>
              <ViewToggle />
            </Suspense>
          </div>

          {/* tour list / grid */}
          {tours.length === 0 ? (
            <div className={styles.empty}>
              <p>No tours found for the selected filters.</p>
            </div>
          ) : view === 'grid' ? (
            <div className={styles.grid}>
              {tours.map((tour: any) => (
                <TourCardGrid
                  key={tour._id}
                  slug={tour.slug}
                  title={tour.title?.[locale] ?? tour.title?.en ?? ''}
                  excerpt={tour.excerpt?.[locale] ?? tour.excerpt?.en ?? ''}
                  image={tour.images?.[0] ?? ''}
                  rating={tour.rating?.avg ?? 0}
                  reviewCount={tour.rating?.count ?? 0}
                  priceFinal={tour.price?.final ?? 0}
                  priceOriginal={tour.price?.original ?? 0}
                  currency={tour.price?.currency ?? '$'}
                  categories={tour.categories ?? []}
                  isSpecialOffer={tour.isSpecialOffer ?? false}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className={styles.list}>
              {tours.map((tour: any) => (
                <TourCard
                  key={tour._id}
                  slug={tour.slug}
                  title={tour.title?.[locale] ?? tour.title?.en ?? ''}
                  excerpt={tour.excerpt?.[locale] ?? tour.excerpt?.en ?? ''}
                  image={tour.images?.[0] ?? ''}
                  rating={tour.rating?.avg ?? 0}
                  reviewCount={tour.rating?.count ?? 0}
                  priceFinal={tour.price?.final ?? 0}
                  priceOriginal={tour.price?.original ?? 0}
                  currency={tour.price?.currency ?? '$'}
                  categories={tour.categories ?? []}
                  isSpecialOffer={tour.isSpecialOffer ?? false}
                  bookedLast24h={tour.bookedLast24h}
                  locale={locale}
                />
              ))}
            </div>
          )}

          {/* pagination */}
          {pages > 1 && (
            <Suspense>
              <ToursPagination
                currentPage={page}
                totalPages={pages}
                limit={limit}
              />
            </Suspense>
          )}
        </section>
      </div>
    </div>
  )
}
