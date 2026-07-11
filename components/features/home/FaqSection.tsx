import SectionHeadline from './SectionHeadline'
import FaqItem from './FaqItem'
import styles from './FaqSection.module.css'

const faqs = [
  {
    q: 'Do I need a visa to visit Azerbaijan?',
    a: 'Most nationalities can apply for an Azerbaijan e-visa online via the ASAN Visa portal. The standard visa is processed in 3 business days; urgent processing takes as little as 3 hours. Citizens of a small number of countries may visit visa-free — check the ASAN Visa website or ask our team.',
  },
  {
    q: 'What is the best time to visit Azerbaijan?',
    a: 'Spring (April–June) and autumn (September–November) offer the most comfortable weather for sightseeing. Summer is ideal for Caspian beach trips and mountain hikes. Winter brings skiing in Shahdag. Azerbaijan genuinely has something to offer year-round.',
  },
  {
    q: 'What are the top places to visit in Azerbaijan?',
    a: "Baku's Old City (a UNESCO World Heritage Site), the Heydar Aliyev Centre, Gobustan's mud volcanoes and rock carvings, the Khan's Palace in Sheki, Lahij village, and the Seven Beauties waterfall in Gabala are among the most visited. Our tour packages cover all of them.",
  },
  {
    q: 'Is Azerbaijan safe for tourists?',
    a: "Azerbaijan is generally considered safe for tourists. Baku in particular is a modern, well-policed city. Standard travel precautions apply — keep an eye on your belongings in crowded bazaars, and check your government's travel advisory before visiting border regions.",
  },
  {
    q: 'What currency is used in Azerbaijan?',
    a: 'The Azerbaijani Manat (AZN) is the local currency. ATMs are widely available in Baku and major cities. Cards are accepted in hotels, restaurants, and shops, but carrying some cash is recommended for bazaars, rural areas, and smaller towns.',
  },
  {
    q: 'How many days do I need to see Azerbaijan?',
    a: 'A focused Baku city tour takes 3–4 days. A full country itinerary covering Baku, Sheki, Gabala, Ganja, and Gobustan comfortably fills 10–14 days. Our team can build a custom tour package for any duration.',
  },
  {
    q: "What's included in your Azerbaijan tour packages?",
    a: 'Our packages typically include airport transfers, hotel accommodation, a professional English-speaking guide, entrance fees to key sites, and daily breakfast. e-Visa assistance is available as an add-on. Every tour can be tailored to your group size and interests.',
  },
]

/* Home Section 09 — Frequently asked questions (accordion) */
export default function FaqSection() {
  return (
    <section className={styles.section}>
      <SectionHeadline
        title="Frequently asked questions"
        subtitle="Everything you need to know before you travel to Azerbaijan — answered."
        seeMoreHref="/faq"
      />

      <div className={styles.list}>
        {faqs.map((f, i) => (
          <FaqItem key={i} question={f.q} answer={f.a} defaultOpen={i === 0} />
        ))}
      </div>
    </section>
  )
}
