'use client'

import { useState } from 'react'
import { createCheckoutSession } from '@/lib/actions/payments'
import styles from '../../app/[locale]/apply/apply.module.css'

export default function PayButton({ applicationNumber }: { applicationNumber: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const url = await createCheckoutSession(applicationNumber)
      if (url) {
        window.location.href = url
      } else {
        setError('Could not start payment. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Could not start payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <button className={styles.payBtn} onClick={handlePay} disabled={loading}>
        {loading ? 'Redirecting to payment…' : 'Proceed to Payment'}
      </button>
      {error && <div className={styles.errMsg}>{error}</div>}
    </>
  )
}
