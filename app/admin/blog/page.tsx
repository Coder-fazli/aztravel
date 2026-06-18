import Link from 'next/link'
import { routing } from '@/i18n/routing'
import AdminTopbar from '@/components/admin/AdminTopbar'
import DeleteBlogButton from '@/components/admin/DeleteBlogButton'
import styles from '../admin.module.css'
import table from './blog.module.css'
import { getAllBlogs, getBlogGroupsMap } from '@/lib/actions/content'
import { postUrl } from '@/lib/postUrl'

// Flag emoji + language name per locale. (Note: language ≠ country, but flags
// read well as tabs. Swap the flags if you prefer 🇺🇸 for en / a different
// country for ar.)
const LABELS: Record<string, string> = {
  en: '🇬🇧 English',
  es: '🇪🇸 Español',
  ar: '🇸🇦 العربية',
}


const STATUSES = [
  ['all', 'All'],
  ['published', 'Published'],
  ['draft', 'Drafts'],
] as const

export default async function AdminBlogList({ searchParams }: {
          searchParams: Promise<{ lang?: string; status?: string }>
       }) {

  const { lang, status } = await searchParams
  const active = (routing.locales.includes(lang as any) ? lang : routing.defaultLocale) as string
  const activeStatus = (['all', 'published', 'draft'].includes(status ?? '') ? status : 'all') as string

  const all = await getAllBlogs(active as any)
  const posts = activeStatus === 'all' ? all : all.filter((p: any) => p.status === activeStatus)
  const groups = await getBlogGroupsMap()

  const otherLocales = routing.locales.filter((l) => l !== active)

  return (
    <>
      <AdminTopbar title="Blog" breadcrumb="Admin / Blog"
  />

        {/* ── filter bar: language + status segmented controls ── */}
        <div className={table.filters}>
          <div className={table.segment}>
            {routing.locales.map((code) => (
              <Link
                key={code}
                href={`/admin/blog?lang=${code}&status=${activeStatus}`}
                className={`${table.segBtn} ${active === code ? table.segActive : ''}`}
              >
                {LABELS[code] ?? code}
              </Link>
            ))}
          </div>

          <div className={table.segment}>
            {STATUSES.map(([val, label]) => (
              <Link
                key={val}
                href={`/admin/blog?lang=${active}&status=${val}`}
                className={`${table.segBtn} ${activeStatus === val ? table.segActive : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.pageHead}>
          <p style={{ fontFamily: 'var(--font-family)',
  color: 'var(--base-8)', fontSize: 14 }}>
            {posts.length} posts
          </p>
          <Link href={`/admin/blog/new?lang=${active}`}
  className={styles.primaryBtn}>+ New post</Link>
        </div>

        <div className={styles.card} style={{ padding: 0,
  overflow: 'hidden' }}>
          <table className={table.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Translations</th>
                <th>Status</th>
                <th>Date</th>
                <th className={table.right}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 24, 
  color: 'var(--base-8)' }}>No posts yet.</td></tr>
              )}
              {posts.map((p: any) => {
           
           const have = groups[p.translationGroupId] ??
  []
                return (
                  <tr key={p._id}>
                    <td 
                      className={table.titleCell}>{p.title}</td>

                    {/* ── ✓ / + per other language ── */}
                    <td>
                      <div className={table.transWrap}>
                        {otherLocales.map((loc) =>
                          have.includes(loc) ? (
                            <span
                              key={loc}
                              className={`${table.transPill} ${table.transHave}`}
                              title={`${loc} translation exists`}
                            >
                              {loc}
                            </span>
                          ) : (
                            <Link
                              key={loc}
                              className={`${table.transPill} ${table.transAdd}`}
                              href={`/admin/blog/new?lang=${loc}&group=${p.translationGroupId}`}
                              title={`Add ${loc} translation`}
                            >
                              {loc}
                            </Link>
                          )
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`${table.badge} 
  ${p.status === 'published' ? table.published : 
  table.draft}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.publishedAt ? new
  Date(p.publishedAt).toLocaleDateString() : '—'}</td>
                    <td className={table.right}>
                      <a
                        href={postUrl(p.locale, p.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={table.action}
                      >View</a>
                      <Link href={`/admin/blog/${p._id}`}
  className={table.action}>Edit</Link>
                      <DeleteBlogButton id={p._id} className={`${table.action} ${table.delete}`} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
    </>
  )
}
