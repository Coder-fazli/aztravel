import Link from 'next/link'
import SeasonCard from './SeasonCard'
import ArrowIcon from '@/components/ui/ArrowIcon'
import styles from './WelcomeSection.module.css'

const desc = 'Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim.'

export default function WelcomeSection() {
  return (
    <section className={styles.section}>

      {/* HEADLINE */}
      <div className={styles.headline}>
        <div className={styles.headTexts}>
          <h2 className={styles.title}>365 Days With Azerbaijan!</h2>
          <p className={styles.subtitle}>
            Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim.
          </p>
        </div>
        <Link href="/catalog" className={styles.seeMore}>
          SEE MORE
          <ArrowIcon size={24} />
        </Link>
      </div>

      {/* CONTENT GRID */}
      <div className={styles.content}>

        {/* LEFT — tall Summer card (368 x 616) */}
        <SeasonCard
          name="Summer"
          desc={desc}
          image="/images/season-summer.jpg"
          width={368}
          height={616}
          largeDesc
        />

        {/* RIGHT COLUMN (752 wide) */}
        <div className={styles.rightCol}>
          {/* top row — Winter + Spring (368 x 300 each) */}
          <div className={styles.topRow}>
            <SeasonCard
              name="Winter"
              desc={desc}
              image="/images/season-winter.jpg"
              width={368}
              height={300}
            />
            <SeasonCard
              name="Spring"
              desc={desc}
              image="/images/season-spring.jpg"
              width={368}
              height={300}
            />
          </div>
          {/* bottom — wide Autumn card (752 x 300) */}
          <SeasonCard
            name="Autumn"
            desc={desc}
            image="/images/season-autumn.jpg"
            width={752}
            height={300}
          />
        </div>

      </div>
    </section>
  )
}
