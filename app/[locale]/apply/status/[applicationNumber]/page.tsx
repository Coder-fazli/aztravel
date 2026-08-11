import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { connectDb } from '@/lib/db/connect'
import Evisa from '@/lib/db/models/evisa/Evisa'
import PayButton from '@/components/apply/PayButton'
import styles from '../../apply.module.css'

// Same reasoning as the main apply page: payment.status here is only ever
// correct if this always re-reads the database, never a cached render --
// someone landing on this page mid-payment needs the real current status,
// not whatever it was the first time this route was ever visited.
export const dynamic = 'force-dynamic'

export default async function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'es' | 'ar'; applicationNumber: string }>
}) {
  const { locale, applicationNumber } = await params
  const t = await getTranslations('apply.status')
  console.log(`[status-page] reached with applicationNumber="${applicationNumber}"`)

  await connectDb()
  const applicants = await Evisa.find({ applicationNumber }).lean()
  console.log(`[status-page] found ${applicants.length} applicant record(s) for "${applicationNumber}"`)

  if (applicants.length === 0) notFound()

  const totalPrice = applicants.reduce((sum, a: any) => sum + a.price, 0)
  // Only the webhook (app/api/webhooks/stripe/route.ts) ever sets this to
  // 'paid' -- never trust a ?paid=1 in the URL, that's cosmetic only.
  const isPaid = applicants.every((a: any) => a.payment?.status === 'paid')

  return (
    <div className={styles.page} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.container}>
        <div className={styles.card} style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className={styles.successBanner}>
            <div className={styles.successIcon}>{isPaid ? '✓' : '⏳'}</div>
            <div>
              <div className={styles.successTitle}>
                {isPaid ? t('confirmedTitle') : t('pendingTitle')}
              </div>
              <div className={styles.successSub}>
                {isPaid ? t('confirmedBody') : t('pendingBody')}
              </div>
            </div>
            <div className={styles.confRefBadge}>#{applicationNumber}</div>
          </div>

          <div className={styles.priceRow}>
            <div className={styles.priceRowLbl}>{t('totalPrice')}</div>
            <div className={styles.priceRowVal}>${totalPrice}</div>
          </div>

          {!isPaid && <PayButton applicationNumber={applicationNumber} locale={locale} />}
        </div>
      </div>
    </div>
  )
}
