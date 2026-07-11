import Link from 'next/link'
import SeasonCard from './SeasonCard'
import ArrowIcon from '@/components/ui/ArrowIcon'
import styles from './WelcomeSection.module.css'

const seasonDescs: Record<string, string> = {
  Summer: 'Sun-drenched Caspian beaches, rooftop cafés in the Old City, and mountain resorts under clear skies.',
  Winter: 'Ski resorts in Shahdag, steaming teahouses in the bazaars, and the warmth of Azerbaijani hospitality.',
  Spring: 'Orchards in bloom, Novruz celebrations in full colour, and mild weather perfect for city walks.',
  Autumn: 'Golden forests in Lahij and Sheki, harvest festivals, and the most comfortable temperatures of the year.',
}

export default function WelcomeSection() {
  return (
    <section className={styles.section}>

      {/* HEADLINE */}
      <div className={styles.headline}>
        <div className={styles.headTexts}>
          <h2 className={styles.title}>Azerbaijan in Every Season — Always Worth the Journey</h2>
          <p className={styles.subtitle}>
            From Baku&rsquo;s skyline in winter to Gabala&rsquo;s forests in autumn — Azerbaijan offers a completely different experience every time you visit. Pick your season, we&rsquo;ll handle the rest.
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
          desc={seasonDescs.Summer}
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
              desc={seasonDescs.Winter}
              image="/images/season-winter.jpg"
              width={368}
              height={300}
            />
            <SeasonCard
              name="Spring"
              desc={seasonDescs.Spring}
              image="/images/season-spring.jpg"
              width={368}
              height={300}
            />
          </div>
          {/* bottom — wide Autumn card (752 x 300) */}
          <SeasonCard
            name="Autumn"
            desc={seasonDescs.Autumn}
            image="/images/season-autumn.jpg"
            width={752}
            height={300}
          />
        </div>

      </div>
    </section>
  )
}
