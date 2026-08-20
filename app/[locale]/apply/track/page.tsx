'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import styles from '../apply.module.css'

export default function TrackApplicationPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'es' | 'ar' }>
}) {
  const { locale } = use(params)
  const router = useRouter()
  const t = useTranslations('apply.track')
  const [ref, setRef] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = ref.trim()
    if (!q) {
      setError(t('errorEmpty'))
      return
    }
    setError('')
    router.push(`/${locale}/apply/status/${encodeURIComponent(q)}`)
  }

  return (
    <div className={styles.page} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.container}>
        <div className={styles.card} style={{ maxWidth: 480, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{t('title')}</h1>
          <p style={{ color: 'var(--base-9)', marginBottom: 24, fontSize: 14 }}>{t('description')}</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder={t('placeholder')}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                border: '1px solid var(--base-5)', fontSize: 15, marginBottom: 8,
              }}
            />
            {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button
              type="submit"
              style={{
                width: '100%', padding: '14px 0', borderRadius: 999, border: 'none',
                background: 'var(--brand-orange, #E8671A)', color: 'white', fontWeight: 700,
                fontSize: 15, cursor: 'pointer', marginTop: 8,
              }}
            >
              {t('submit')}
            </button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--base-8)', marginTop: 20 }}>{t('hint')}</p>
        </div>
      </div>
    </div>
  )
}
