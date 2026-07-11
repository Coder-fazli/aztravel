import Button from '@/components/ui/AppButton'
import styles from './VisaSection.module.css'

/* Home Section 05 — "Get your Azerbaijan visa online"
   Full-bleed Baku skyline band with centered CTA + two e-visa buttons. */
export default function VisaSection() {
  return (
    <section className={styles.section}>
      <img src="/images/visa-bg.jpg" alt="" className={styles.bg} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.inner}>
          <img src="/images/visa-airplane.svg" alt="" className={styles.airplane} aria-hidden="true" />

          <h2 className={styles.heading}>
            {/* decorative scribble accents flank the heading */}
            <img src="/images/visa-scribble-left.png" alt="" className={styles.scribbleLeft} aria-hidden="true" />
            <img src="/images/visa-scribble-right.png" alt="" className={styles.scribbleRight} aria-hidden="true" />
            Get your <b>Azerbaijan</b> <b>visa</b> online
          </h2>

          <div className={styles.subtitle}>
            <p>
              Citizens of most countries can obtain an <b>Azerbaijan e-visa</b> in under 3 business
              days through ASAN Visa — the official online platform. No embassy visit required.
            </p>
            <p>
              Need to travel sooner? Our <b>urgent e-visa</b> service processes your application
              in as little as 3 hours — so you can book your flight and sort the paperwork on the same day.
            </p>
          </div>
        </div>

        <div className={styles.buttons}>
          <Button href="/visa/urgent" variant="primary" size="lg">Urgent e-visa</Button>
          <Button href="/visa/standard" variant="glass" size="lg">Standart e-visa</Button>
        </div>
      </div>

      {/* giant watermark peeking from the bottom into the next section */}
      <span className={styles.watermark} aria-hidden="true">Top destinations</span>
    </section>
  )
}
