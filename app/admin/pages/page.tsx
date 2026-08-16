import Link from 'next/link'
import { routing } from '@/i18n/routing'
import AdminTopbar from '@/components/admin/AdminTopbar'
import DeleteButton from '@/components/admin/DeleteButton'
import styles from '../admin.module.css'
import table from '../blog/blog.module.css'
import { getAllPages, getPageGroupsMap } from '@/lib/actions/pages'
import { deletePageFromForm } from '@/lib/actions/admin/pages'

// Same reasoning as the edit page: this list is landed on right after every
// create/update/delete, so it must never serve a cached pre-mutation render.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const LABELS: Record<string, string> = {
  en: '🇬🇧 English',
  es: '🇪🇸 Español',
  ar: '🇸🇦 العربية',
}

export default async function AdminPagesList({ searchParams }: {
  searchParams: Promise<{ lang?: string }>
}) {
  const { lang } = await searchParams
  const active = (routing.locales.includes(lang as any) ? lang : routing.defaultLocale) as string

  const pages = await getAllPages(active as any)
  const groups = await getPageGroupsMap()
  const otherLocales = routing.locales.filter((l) => l !== active)

  return (
    <>
      <AdminTopbar title="Pages" breadcrumb="Admin / Pages" />

      <div className={table.filters}>
        <div className={table.segment}>
          {routing.locales.map((code) => (
            <Link
              key={code}
              href={`/admin/pages?lang=${code}`}
              className={`${table.segBtn} ${active === code ? table.segActive : ''}`}
            >
              {LABELS[code] ?? code}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.pageHead}>
        <p style={{ fontFamily: 'var(--font-family)', color: 'var(--base-8)', fontSize: 14 }}>
          {pages.length} pages
        </p>
        <Link href={`/admin/pages/new?lang=${active}`} className={styles.primaryBtn}>+ New page</Link>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={table.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Translations</th>
              <th>Status</th>
              <th>Date</th>
              <th className={table.right}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, color: 'var(--base-8)' }}>No pages yet.</td></tr>
            )}
            {pages.map((p: any) => {
              const have = groups[p.translationGroupId] ?? []
              return (
                <tr key={p._id}>
                  <td className={table.titleCell}>{p.title}</td>
                  <td style={{ fontFamily: 'var(--font-family)', fontSize: 13, color: 'var(--base-8)' }}>/{p.slug}</td>
                  <td>
                    <div className={table.transWrap}>
                      {otherLocales.map((loc) =>
                        have.includes(loc) ? (
                          <span key={loc} className={`${table.transPill} ${table.transHave}`} title={`${loc} translation exists`}>
                            {loc}
                          </span>
                        ) : (
                          <Link
                            key={loc}
                            className={`${table.transPill} ${table.transAdd}`}
                            href={`/admin/pages/new?lang=${loc}&group=${p.translationGroupId}`}
                            title={`Add ${loc} translation`}
                          >
                            {loc}
                          </Link>
                        )
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`${table.badge} ${p.status === 'published' ? table.published : table.draft}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}</td>
                  <td className={table.right}>
                    <a href={`/${p.locale}/${p.slug}`} target="_blank" rel="noopener noreferrer" className={table.action}>View</a>
                    <Link href={`/admin/pages/${p._id}`} className={table.action}>Edit</Link>
                    <DeleteButton
                      fields={{ id: p._id }}
                      action={deletePageFromForm}
                      message="Delete this page? This cannot be undone."
                      className={`${table.action} ${table.delete}`}
                    />
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
