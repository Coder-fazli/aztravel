import Button from '@/components/ui/AppButton'
import styles from './LalaSection.module.css'

export default function LalaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.banner}>

        {/* striped pattern behind robot */}
        <img src="/images/lala-stripes.svg" alt="" className={styles.stripes} />

        {/* LEFT — text + CTA */}
        <div className={styles.content}>
          <h2 className={styles.title}>
            Have questions about travelling to Azerbaijan? Ask <b>Lala!</b>
          </h2>
          <p className={styles.desc}>
            Lala is your AI travel assistant — powered by local expertise. Ask about <b>visa requirements</b>,
            best time to visit, what to pack, or hidden gems off the tourist trail.
            Available <b>24/7</b>, answers in seconds.
          </p>
          <Button href="/ai" variant="white" size="md">Ask Lala</Button>
        </div>

        {/* RIGHT — robot */}
        <img src="/images/lala-robot.png" alt="Lala AI agent" className={styles.robot} />

        {/* decorative curved arrow */}
        <img src="/images/lala-arrow.svg" alt="" className={styles.curveArrow} />
      </div>
    </section>
  )
}
