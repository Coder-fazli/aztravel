import BlogHeroSlider from '@/components/features/blog/BlogHeroSlider'
import SectionHeadline from '@/components/features/home/SectionHeadline'
import BlogCard from '@/components/features/home/BlogCard'
import GetInTouchSection from '@/components/features/home/GetInTouchSection'
import styles from './page.module.css'

// TODO: swap this static list for `await getBlogs()` once posts are seeded.
const title = 'Ut in tristique id tempor odio ultricies facilisis varius...'
const desc = 'Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim.'
const images = ['/images/blog-1.jpg', '/images/blog-2.jpg', '/images/blog-3.jpg']

const posts = Array.from({ length: 9 }, (_, i) => ({
  title,
  desc,
  image: images[i % images.length],
  date: '29 Avq 2022',
  readTime: '5 min read',
  href: `/blog/post-${i + 1}`,
}))

export default function BlogArchivePage() {
  return (
    <>
      <BlogHeroSlider />

      <section className={styles.grid}>
        <img src="/images/blog/arrow-curve.svg" alt="" className={styles.arrow} aria-hidden="true" />

        <SectionHeadline
          watermark="Learn more about"
          title="Learn more about Azerbaijan!"
          subtitle="Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim."
        />

        <div className={styles.cards}>
          {posts.map((p, i) => (
            <BlogCard key={i} {...p} />
          ))}
        </div>
      </section>

      <GetInTouchSection />
    </>
  )
}
