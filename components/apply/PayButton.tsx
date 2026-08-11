'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createCheckoutSession } from '@/lib/actions/payments'
import styles from '../../app/[locale]/apply/apply.module.css'

export default function PayButton({
  applicationNumber,
  locale,
}: {
  applicationNumber: string
  locale?: 'en' | 'es' | 'ar'
}) {
  const t = useTranslations('apply.pay')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const url = await createCheckoutSession(applicationNumber, locale)
      if (url) {
        window.location.href = url
      } else {
        setError(t('error'))
        setLoading(false)
      }
    } catch {
      setError(t('error'))
      setLoading(false)
    }
  }

  return (
    <>
      <button className={styles.payBtn} onClick={handlePay} disabled={loading}>
        {loading ? t('redirecting') : t('proceed')}
      </button>
      {error && <div className={styles.errMsg}>{error}</div>}
    </>
  )
}
