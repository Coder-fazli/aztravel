import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SectionHeadline from '@/components/features/home/SectionHeadline'
import BlogCard from '@/components/features/home/BlogCard'
import GetInTouchSection from '@/components/features/home/GetInTouchSection'
import RichContent from '@/components/blog/RichContent'
import { getBlogBySlug, getBlogTranslations, getBlogs } from '@/lib/actions/content'
import { tiptapText } from '@/lib/tiptapText'
import { postUrl } from '@/lib/postUrl'
import { SITE_URL } from '@/lib/site'
import styles from './page.module.css'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const loc = (['en', 'es', 'ar'].includes(locale) ? locale : 'en') as 'en' | 'es' | 'ar'
  const post = await getBlogBySlug(slug, loc)
  if (!post) return {}

  const title = post.metaTitle || post.title
  const description = post.metaDescription || tiptapText(post.content, 160)

  // hreflang alternates from the post's translation siblings
  const siblings = await getBlogTranslations(post.translationGroupId)
  const languages = Object.fromEntries(
    siblings.map((s: any) => [s.locale, `${SITE_URL}${postUrl(s.locale, s.slug)}`])
  )

  return {
    title,
    description,
    robots: (post.noindex || post.nofollow) ? {
      index:  !post.noindex,
      follow: !post.nofollow,
    } : undefined,
    alternates: {
      canonical: post.canonicalUrl || `${SITE_URL}${postUrl(locale, slug)}`,
      languages,
    },
    openGraph: {
      title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

const reviews = [
  { text: 'Pole native incompetent run slipstream about pivot highlights. Recap pin 30,000ft do policy welcome space busy alpha. Opportunity viral responsible are exploratory.', name: 'Brandon Franci', role: 'CEO Universal', avatar: '/images/dest-1.jpg' },
  { text: "Fured calculator q1 would my accountable. Well brainstorming gmail but underlying up solutions driver's break. Productive group back here based production.", name: 'Carla Calzoni', role: 'CEO Universal', avatar: '/images/dest-2.jpg' },
  { text: 'Caught closing other meeting t-shaped digital launch customer. Weaponize pants moving savvy fruit pivot be. Alarming manager key anyway tomorrow.', name: 'Marcus Culhane', role: 'CEO Universal', avatar: '/images/dest-3.jpg' },
]

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" />
    </svg>
  )
}
function PlayIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
}
function FbIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z" /></svg> }
function IgIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg> }
function TtIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 3c.3 2.3 1.7 3.9 4 4v2.8c-1.4 0-2.8-.4-4-1.1v5.9a5.6 5.6 0 11-5.6-5.6c.3 0 .6 0 .9.1v2.9a2.7 2.7 0 102 2.6V3H16z" /></svg> }
function StarIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" /></svg> }
function PlusIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> }

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loc = (['en', 'es', 'ar'].includes(locale) ? locale : 'en') as 'en' | 'es' | 'ar'

  const post = await getBlogBySlug(slug, loc)
  if (!post) notFound()
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''

  const allPosts = await getBlogs(loc)
  const related = allPosts
    .filter((p: any) => p.slug !== slug)
    .slice(0, 3)
    .map((p: any) => ({
      title:    p.title,
      desc:     tiptapText(p.excerpt, 120),
      image:    p.coverImage || '/images/blog-1.jpg',
      date:     p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      readTime: p.readTime ? `${p.readTime} min read` : '',
      href:     postUrl(loc, p.slug),
    }))

  const canonicalUrl = post.canonicalUrl || `${SITE_URL}${postUrl(loc, slug)}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: tiptapText(post.excerpt || post.content, 160),
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    author: {
      '@type': 'Organization',
      name: 'AzTravel',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AzTravel',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  }

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className={styles.article}>
        {/* header */}
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <img src="/images/blog/arrow-curve.svg" alt="" className={styles.curve} aria-hidden="true" />
            <h1 className={styles.title} dir={loc === 'ar' ? 'rtl' : 'ltr'}>{post.title}</h1>
            {post.categories?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {post.categories.map((c: any) => (
                  <a
                    key={c.slug}
                    href={`/${loc}/blog/category/${c.slug}`}
                    style={{
                      padding: '3px 10px', borderRadius: 999, background: 'var(--secondary-4)',
                      color: 'var(--secondary-13)', fontFamily: 'var(--font-family)', fontSize: 11, fontWeight: 700,
                    }}
                  >
                    {c.name?.[loc] || c.name?.en || c.slug}
                  </a>
                ))}
              </div>
            )}
            <div className={styles.meta}>
              {date && (
                <span className={styles.metaItem}>
                  <img src="/images/blog/calendar-icon.svg" alt="" className={styles.metaIcon} /> {date}
                </span>
              )}
              {post.readTime ? (
                <span className={styles.metaItem}><ClockIcon /> {post.readTime} min read</span>
              ) : null}
            </div>
          </div>
          {post.coverImage && (
            <img src={post.coverImage} alt={post.coverImageAlt || post.title} className={styles.hero} />
          )}
        </header>

        {/* article body (rich text from the editor) */}
        <RichContent doc={post.content} className={styles.body} />

        {/* share */}
        <div className={styles.share}>
          <span className={styles.shareLabel}>Share on:</span>
          <div className={styles.shareIcons}>
            <a href="#" aria-label="Facebook"><FbIcon /></a>
            <a href="#" aria-label="Instagram"><IgIcon /></a>
            <a href="#" aria-label="TikTok"><TtIcon /></a>
          </div>
        </div>
      </article>

      {/* reviews */}
      <section className={styles.reviews}>
        <div className={styles.reviewsHead}>
          <div className={styles.reviewsTitles}>
            <h2 className={styles.reviewsTitle}>Reviews</h2>
            <p className={styles.reviewsSub}>Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim.</p>
          </div>
          <a href="#" className={styles.addReview}><PlusIcon /> ADD YOUR REVIEW</a>
        </div>
        <div className={styles.reviewCards}>
          {reviews.map((r, i) => (
            <div key={i} className={styles.reviewCard}>
              <p className={styles.reviewText}>{r.text}</p>
              <div className={styles.client}>
                <img src={r.avatar} alt="" className={styles.avatar} />
                <div className={styles.clientName}><b>{r.name}</b><span>{r.role}</span></div>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, s) => <StarIcon key={s} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* related blogs — only rendered when real posts exist */}
      {related.length > 0 && (
        <section className={styles.related}>
          <SectionHeadline watermark="Learn more about" title="See related blogs" subtitle="More travel guides and tips from Azerbaijan." />
          <div className={styles.relatedCards}>
            {related.map((p: any, i: number) => <BlogCard key={i} {...p} />)}
          </div>
        </section>
      )}

      <GetInTouchSection />
    </div>
  )
}
