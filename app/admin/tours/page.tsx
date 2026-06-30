import Link             from 'next/link'
import AdminTopbar      from '@/components/admin/AdminTopbar'
import DeleteTourButton from '@/components/admin/tours/DeleteTourButton'
import { getToursAdmin } from '@/lib/actions/admin/tours'
import styles from '../admin.module.css'
import table  from './tours.module.css'

const STATUSES = [
  ['all',      'All'],
  ['active',   'Active'],
  ['draft',    'Draft'],
  ['archived', 'Archived'],
] as const

export default async function AdminToursList({
  searchParams,
}: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const active = (['all','active','draft','archived'].includes(status ?? '') ? status : 'all') as string

  const all   = await getToursAdmin()
  const tours = active === 'all' ? all : all.filter((t: any) => t.status === active)

  return (
    <>
      <AdminTopbar title="Tours" breadcrumb="Admin / Tours" />

      <div className={table.filters}>
        <div className={table.segment}>
          {STATUSES.map(([val, label]) => (
            <Link
              key={val}
              href={`/admin/tours?status=${val}`}
              className={`${table.segBtn} ${active === val ? table.segActive : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.pageHead}>
        <p style={{ fontFamily: 'var(--font-family)', color: 'var(--base-8)', fontSize: 14 }}>
          {tours.length} tour{tours.length !== 1 ? 's' : ''}
        </p>
        <Link href="/admin/tours/new" className={styles.primaryBtn}>+ New tour</Link>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={table.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Categories</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Status</th>
              <th className={table.right}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 24, color: 'var(--base-8)' }}>No tours yet.</td>
              </tr>
            )}
            {tours.map((t: any) => (
              <tr key={t._id}>
                <td className={table.titleCell}>{t.title?.en || '—'}</td>
                <td>
                  <div className={table.cats}>
                    {(t.categories ?? []).map((c: string) => (
                      <span key={c} className={table.cat}>{c}</span>
                    ))}
                  </div>
                </td>
                <td className={table.priceCell}>
                  {t.price?.final ? (
                    <>
                      <strong>{t.price.final}</strong>{' '}
                      <span>{t.price.currency}</span>
                      {t.price.original > t.price.final && (
                        <s>{t.price.original}</s>
                      )}
                    </>
                  ) : '—'}
                </td>
                <td>{t.duration?.value ? `${t.duration.value} ${t.duration.unit}` : '—'}</td>
                <td>
                  <span className={`${table.badge} ${table[t.status as 'active'|'draft'|'archived'] ?? ''}`}>
                    {t.status}
                  </span>
                </td>
                <td className={table.right}>
                  <a
                    href={`/en/tours/${t.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={table.action}
                  >
                    View
                  </a>
                  <Link href={`/admin/tours/${t._id}`} className={table.action}>Edit</Link>
                  <DeleteTourButton id={t._id} className={`${table.action} ${table.delete}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
