import Link from 'next/link'
import AdminTopbar from '@/components/admin/AdminTopbar'
import styles from '../admin.module.css'
import table from './blog.module.css'

// ⚠️ BACKEND STEP (do this yourself with the guide):
// Replace this static array with real data:
//   const posts = await getBlogs()   // from lib/actions/content.ts
// and map over it below.
const posts = [
  { id: '1', title: 'Top 10 Things to Do in Baku', status: 'published', date: '12 Jun 2026' },
  { id: '2', title: 'Azerbaijani Cuisine Guide', status: 'draft', date: '10 Jun 2026' },
]

export default function AdminBlogList() {
  return (
    <>
      <AdminTopbar title="Blog" breadcrumb="Admin / Blog" />

      <div className={styles.pageHead}>
        <p style={{ fontFamily: 'var(--font-family)', color: 'var(--base-8)', fontSize: 14 }}>
          {posts.length} posts
        </p>
        <Link href="/admin/blog/new" className={styles.primaryBtn}>+ New post</Link>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={table.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th className={table.right}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td className={table.titleCell}>{p.title}</td>
                <td>
                  <span className={`${table.badge} ${p.status === 'published' ? table.published : table.draft}`}>
                    {p.status}
                  </span>
                </td>
                <td>{p.date}</td>
                <td className={table.right}>
                  <Link href={`/admin/blog/${p.id}`} className={table.action}>Edit</Link>
                  {/* Delete → BACKEND STEP: wire deleteBlog(id) */}
                  <button className={`${table.action} ${table.delete}`}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
