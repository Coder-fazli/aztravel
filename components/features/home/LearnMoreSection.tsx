import SectionHeadline from './SectionHeadline'
import BlogCard from './BlogCard'
import styles from './LearnMoreSection.module.css'

const desc = 'Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim.'
const title = 'Ut in tristique id tempor odio ultricies facilisis varius...'

const posts = [
  { title, desc, image: '/images/blog-1.jpg', date: '29 Avq 2022', readTime: '5 min read', href: '/blog/1' },
  { title, desc, image: '/images/blog-2.jpg', date: '29 Avq 2022', readTime: '5 min read', href: '/blog/2' },
  { title, desc, image: '/images/blog-3.jpg', date: '29 Avq 2022', readTime: '5 min read', href: '/blog/3' },
]

export default function LearnMoreSection() {
  return (
    <section className={styles.section}>
      <SectionHeadline
        watermark="Learn more about"
        title="Learn more about Azerbaijan!"
        subtitle="Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim."
        seeMoreHref="/blog"
      />

      <div className={styles.cards}>
        {posts.map((p, i) => (
          <BlogCard key={i} {...p} />
        ))}
      </div>
    </section>
  )
}
