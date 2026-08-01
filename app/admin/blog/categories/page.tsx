import Link from 'next/link'
import AdminTopbar from '@/components/admin/AdminTopbar'
import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton'
import { getCategoriesAdmin } from '@/lib/actions/admin/categories'
import styles from '../../admin.module.css'
import table from '../blog.module.css'

export default async function AdminCategoriesList() {
  const categories = await getCategoriesAdmin()

  return (
    <>
      <AdminTopbar title="Blog Categories" breadcrumb="Admin / Blog / Categories" />

      <div style={{ marginBottom: 16 }}>
        <Link href="/admin/blog" style={{ fontFamily: 'var(--font-family)', fontSize: 13, fontWeight: 600, color: 'var(--base-8)' }}>← Back to posts</Link>
      </div>

      <div className={styles.pageHead}>
        <p style={{ fontFamily: 'var(--font-family)', color: 'var(--base-8)', fontSize: 14 }}>
          {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
        </p>
        <Link href="/admin/blog/categories/new" className={styles.primaryBtn}>+ New category</Link>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={table.table}>
          <thead>
            <tr><th>Name</th><th>Slug</th><th>Order</th><th className={table.right}>Actions</th></tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 24, color: 'var(--base-8)' }}>No categories yet.</td></tr>
            )}
            {categories.map((c: any) => (
              <tr key={c._id}>
                <td className={table.titleCell}>{c.name?.en || c.slug}</td>
                <td>{c.slug}</td>
                <td>{c.orderNum}</td>
                <td className={table.right}>
                  <Link href={`/admin/blog/categories/${c._id}`} className={table.action}>Edit</Link>
                  <DeleteCategoryButton id={c._id} className={`${table.action} ${table.delete}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
