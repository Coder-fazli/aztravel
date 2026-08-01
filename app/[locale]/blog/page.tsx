import type { Metadata } from 'next'
import Link from 'next/link'
import SectionHeadline from '@/components/features/home/SectionHeadline'
import BlogCard from '@/components/features/home/BlogCard'
import GetInTouchSection from '@/components/features/home/GetInTouchSection'
import { getBlogs, getCategories } from '@/lib/actions/content'
import { postUrl } from '@/lib/postUrl'
import { tiptapText } from '@/lib/tiptapText'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Azerbaijan Travel Blog — Tips, Guides & Destinations | AzTravel',
    description: 'Read our Azerbaijan travel blog — best places to visit, travel tips, cultural guides, food recommendations and itinerary ideas.',
  }
}

export default async function BlogArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [posts, categories] = await Promise.all([
    getBlogs(locale as any), // published posts in this language
    getCategories(),
  ])

  return (
    <>
      <section className={styles.grid}>
        <img src="/images/blog/arrow-curve.svg" alt="" className={styles.arrow} aria-hidden="true" />

        <SectionHeadline
          watermark="Learn more about"
          title="Learn more about Azerbaijan!"
          subtitle="Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim."
        />

        {categories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {categories.map((c: any) => (
              <Link
                key={c._id}
                href={`/${locale}/blog/category/${c.slug}`}
                style={{
                  padding: '7px 16px', borderRadius: 999, border: '1.5px solid var(--base-5)',
                  fontFamily: 'var(--font-family)', fontSize: 13, fontWeight: 600, color: 'var(--base-9)',
                }}
              >
                {c.name?.[locale] || c.name?.en || c.slug}
              </Link>
            ))}
          </div>
        )}

        <div className={styles.cards}>
          {posts.length === 0 && (
            <p style={{ color: 'var(--base-8)' }}>No posts published yet.</p>
          )}
          {posts.map((p: any) => (
            <BlogCard
              key={p._id}
              title={p.title}
              desc={tiptapText(p.content, 120)}
              image={p.coverImage || '/images/blog-1.jpg'}
              date={p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ''}
              readTime={p.readTime ? `${p.readTime} min read` : ''}
              href={postUrl(locale, p.slug)}
              categories={(p.categories ?? []).map((c: any) => ({ name: c.name?.[locale] || c.name?.en || c.slug, slug: c.slug }))}
            />
          ))}
        </div>
      </section>

      <GetInTouchSection />
    </>
  )
}
