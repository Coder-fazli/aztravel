import BlogHeroSlider from '@/components/features/blog/BlogHeroSlider'
import SectionHeadline from '@/components/features/home/SectionHeadline'
import BlogCard from '@/components/features/home/BlogCard'
import GetInTouchSection from '@/components/features/home/GetInTouchSection'
import { getBlogs } from '@/lib/actions/content'
import { postUrl } from '@/lib/postUrl'
import { tiptapText } from '@/lib/tiptapText'
import styles from './page.module.css'

export default async function BlogArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const posts = await getBlogs(locale as any) // published posts in this language

  // top few posts feed the hero slider (falls back to defaults if none)
  const heroSlides = posts.slice(0, 5).map((p: any) => ({
    title: p.title,
    image: p.coverImage || '/images/blog/slide-1.jpg',
    href: postUrl(locale, p.slug),
    desc: tiptapText(p.content, 160),
  }))

  return (
    <>
      <BlogHeroSlider slides={heroSlides} />

      <section className={styles.grid}>
        <img src="/images/blog/arrow-curve.svg" alt="" className={styles.arrow} aria-hidden="true" />

        <SectionHeadline
          watermark="Learn more about"
          title="Learn more about Azerbaijan!"
          subtitle="Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim."
        />

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
            />
          ))}
        </div>
      </section>

      <GetInTouchSection />
    </>
  )
}
