import Link from 'next/link'
import AdminTopbar from '@/components/admin/AdminTopbar'
import DeleteCountryButton from '@/components/admin/evisa/DeleteCountryButton'
import { getCountriesAdmin } from '@/lib/actions/admin/evisaCountries'
import adminStyles from '../../admin.module.css'
import styles from '../evisa.module.css'

export default async function CountriesPage() {
  const countries = await getCountriesAdmin()

  return (
    <>
      <AdminTopbar title="Countries" breadcrumb="Admin / E-visa / Countries" />

      <div className={adminStyles.pageHead}>
        <p style={{ fontFamily: 'var(--font-family)', color: 'var(--base-8)', fontSize: 14 }}>
          {countries.length} countr{countries.length !== 1 ? 'ies' : 'y'}
        </p>
        <Link href="/admin/evisa/countries/new" className={adminStyles.primaryBtn}>+ New country</Link>
      </div>

      <div className={adminStyles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr><th>Country</th><th>Code</th><th>Eligible</th><th>Pricing</th><th className={styles.right}>Actions</th></tr>
            </thead>
            <tbody>
              {countries.length === 0 && (
                <tr><td colSpan={5} className={styles.empty}>No countries yet — add the first one.</td></tr>
              )}
              {countries.map((c: any) => (
                <tr key={c._id}>
                  <td>
                    <div className={styles.flagName}>
                      {c.flag && <span className={styles.flag}>{c.flag}</span>}
                      <span className={styles.titleCell}>{c.name?.en || c.code}</span>
                    </div>
                  </td>
                  <td>{c.code}</td>
                  <td>
                    <span className={`${styles.pill} ${c.eligible ? styles.approved : styles.rejected}`}>
                      <span className={styles.pillDot} />{c.eligible ? 'Eligible' : 'Not eligible'}
                    </span>
                  </td>
                  <td>
                    {c.pricing?.length > 0 ? (
                      <div className={styles.chips}>
                        {c.pricing.map((p: any, i: number) => (
                          <span key={i} className={styles.chip}>{p.key} ${p.price}</span>
                        ))}
                      </div>
                    ) : '—'}
                  </td>
                  <td className={styles.right}>
                    <Link href={`/admin/evisa/countries/${c._id}`} className={styles.action}>Edit</Link>
                    <DeleteCountryButton id={c._id} className={`${styles.action} ${styles.delete}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
