import SectionHeadline from './SectionHeadline'
import BlogCard from './BlogCard'
import { getBlogs } from '@/lib/actions/content'
import { tiptapText } from '@/lib/tiptapText'
import styles from './LearnMoreSection.module.css'

function formatDate(date: Date | string | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function LearnMoreSection({ locale }: { locale: string }) {
  const allPosts = await getBlogs(locale as any)
  const posts = allPosts.slice(0, 3)

  return (
    <section className={styles.section}>
      <SectionHeadline
        watermark="Learn more about"
        title="Your Azerbaijan Travel Guide"
        subtitle="Visa tips, destination guides, local culture and practical advice — everything to help you travel smarter."
        seeMoreHref="/blog"
      />

      {posts.length > 0 ? (
        <div className={styles.cards}>
          {posts.map((p: any) => (
            <BlogCard
              key={p._id?.toString()}
              title={p.title}
              desc={tiptapText(p.excerpt, 120)}
              image={p.coverImage || '/images/blog-1.jpg'}
              date={formatDate(p.publishedAt)}
              readTime={p.readTime ? `${p.readTime} min read` : '5 min read'}
              href={`/${locale}/blog/${p.slug}`}
            />
          ))}
        </div>
      ) : (
        <div className={styles.cards}>
          {/* no published posts yet — placeholder cards */}
          {[1, 2, 3].map(i => (
            <BlogCard
              key={i}
              title="Coming soon — travel guides for Azerbaijan"
              desc="Our team is writing in-depth destination guides, visa tips and local insights. Check back soon."
              image={`/images/blog-${i}.jpg`}
              date=""
              readTime=""
              href="/blog"
            />
          ))}
        </div>
      )}
    </section>
  )
}
