import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SectionHeadline from '@/components/features/home/SectionHeadline'
import BlogCard from '@/components/features/home/BlogCard'
import GetInTouchSection from '@/components/features/home/GetInTouchSection'
import { getBlogsByCategory } from '@/lib/actions/content'
import { postUrl } from '@/lib/postUrl'
import { tiptapText } from '@/lib/tiptapText'
import styles from '../../page.module.css'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const { category } = await getBlogsByCategory(slug, locale as any)
  if (!category) return {}
  const name = category.name?.[locale] || category.name?.en || category.slug
  return {
    title: `${name} — Azerbaijan Travel Blog | AzTravel`,
    description: category.description?.[locale] || category.description?.en || `Posts about ${name} on the AzTravel blog.`,
  }
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const { category, posts } = await getBlogsByCategory(slug, locale as any)
  if (!category) notFound()

  const name = category.name?.[locale] || category.name?.en || category.slug
  const description = category.description?.[locale] || category.description?.en || ''

  return (
    <>
      <section className={styles.grid}>
        <SectionHeadline
          watermark="Category"
          title={name}
          subtitle={description || `All posts about ${name}.`}
        />

        <div className={styles.cards}>
          {posts.length === 0 && (
            <p style={{ color: 'var(--base-8)' }}>No posts in this category yet.</p>
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
