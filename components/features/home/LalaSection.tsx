import Button from '@/components/ui/Button'
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
            Try our new AI agent <b>Lala!</b>
          </h2>
          <p className={styles.desc}>
            In venenatis tincidunt tristique ipsum. Interdum tristique eu blandit ultrices
            justo at tortor ut. Fermentum nunc nulla <b>adipiscing</b> cum vitae mattis.
            Iaculis <b>pharetra</b> ac tristique dapibus.
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
