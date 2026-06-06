import SectionHeadline from './SectionHeadline'
import FaqItem from './FaqItem'
import styles from './FaqSection.module.css'

const answer =
  'Voist is an AI-powered platform that transforms customer service through automated transcripts, emotion analysis, AI-powered scoring, and call intent identification.'

const faqs = [
  { q: 'What can you explore in Azerbaijan?', a: answer },
  { q: 'Place proceduralize buy-in must ballpark economy moments so flesh red-flag. Q1 back reference eow info activities.', a: answer },
  { q: 'Closest savvy define game die manage beef six stand. Email encourage existing at uat office charts.', a: answer },
  { q: 'Boil pushback important calculator pole. Beforehand up today request anyway later.', a: answer },
  { q: 'Manager incompetent community we wanted zoom usabiltiy base performance. Only whistles yet first mifflin hanging turn club shower dangerous.', a: answer },
  { q: 'Beef reinvent elephant happenings I boys emails this. Bells fit comes canatics incompetent we mint cause guys identify.', a: answer },
  { q: 'Assassin next please wiggle ladder make hard people. Explore cadence goalposts whatever must board.', a: answer },
]

/* Home Section 09 — Frequently asked questions (accordion) */
export default function FaqSection() {
  return (
    <section className={styles.section}>
      <SectionHeadline
        title="Frequently asked questions"
        subtitle="Integer fringilla tellus ullamcorper ac mauris potenti amet commodo  amet enim."
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
