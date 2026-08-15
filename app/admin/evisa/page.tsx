import Link from 'next/link'
import AdminTopbar from '@/components/admin/AdminTopbar'
import DeleteButton from '@/components/admin/DeleteButton'
import { getFormElementsAdmin, deleteFormElementFromForm } from '@/lib/actions/admin/evisaFormElements'
import adminStyles from '../admin.module.css'
import styles from './evisa.module.css'

export default async function FormElementsPage() {
  const elements = await getFormElementsAdmin()

  return (
    <>
      <AdminTopbar title="Form Elements" breadcrumb="Admin / E-visa / Form Elements" />

      <div className={adminStyles.pageHead}>
        <p style={{ fontFamily: 'var(--font-family)', color: 'var(--base-8)', fontSize: 14 }}>
          {elements.length} question{elements.length !== 1 ? 's' : ''}
        </p>
        <Link href="/admin/evisa/new" className={adminStyles.primaryBtn}>+ New question</Link>
      </div>

      <div className={adminStyles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th><th>Question</th><th>Type</th><th>Required</th><th>Applies to</th><th className={styles.right}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {elements.length === 0 && (
                <tr><td colSpan={6} className={styles.empty}>No form questions yet — add the first one.</td></tr>
              )}
              {elements.map((el: any) => (
                <tr key={el._id}>
                  <td>{el.orderNum}</td>
                  <td>
                    <div className={styles.titleCell}>{el.label?.en || el.fieldKey}</div>
                    {el.conditions?.length > 0 && (
                      <div className={styles.condNote}>⚡ {el.conditions.length} condition{el.conditions.length !== 1 ? 's' : ''}</div>
                    )}
                  </td>
                  <td><span className={`${styles.pill} ${styles.type}`}>{el.type}</span></td>
                  <td>
                    <span className={`${styles.pill} ${el.required ? styles.req : styles.opt}`}>
                      {el.required ? 'Required' : 'Optional'}
                    </span>
                  </td>
                  <td>{el.isNewPerson ? 'Every applicant' : 'Primary applicant'}</td>
                  <td className={styles.right}>
                    <Link href={`/admin/evisa/${el._id}`} className={styles.action}>Edit</Link>
                    <DeleteButton
                      fields={{ id: el._id }}
                      action={deleteFormElementFromForm}
                      message="Delete this question? This cannot be undone."
                      className={`${styles.action} ${styles.delete}`}
                    />
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
