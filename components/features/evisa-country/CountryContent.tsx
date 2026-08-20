import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sidebar } from "./Sidebar";
import styles from "./CountryContent.module.css";

interface FAQ { q: string; a: string; }
interface Step { title: string; desc: string; }
interface SidebarCountry { name: string; code: string; slug: string; }

interface CountryContentProps {
  country: string;
  overview: string;
  fee: number;
  applyLink: string;
  sidebarCountries: SidebarCountry[];
  locale: string;
}

export function CountryContent({ country, overview, fee, applyLink, sidebarCountries, locale }: CountryContentProps) {
  const faqs: FAQ[] = [
    {
      q: `Do ${country} citizens need a visa for Azerbaijan?`,
      a: `Yes. ${country} passport holders need a visa to enter Azerbaijan, but ${country} citizens can apply for the Azerbaijan e-Visa entirely online — no embassy visit required.`,
    },
    {
      q: "How long does the Azerbaijan e-Visa take to process?",
      a: "Standard processing takes 3 business days. Urgent processing is available for an extra fee and is typically ready within 3 hours.",
    },
    {
      q: `What documents do ${country} citizens need to apply?`,
      a: "A passport valid for at least 6 months beyond your intended stay, a digital passport-style photo, a valid email address, and a card for payment.",
    },
    {
      q: `How much does the Azerbaijan e-Visa cost for ${country} citizens?`,
      a: `The current fee for ${country} citizens is $${fee} USD, covering government and processing charges.`,
    },
    {
      q: "How long can I stay in Azerbaijan on an e-Visa?",
      a: "The e-Visa allows a single entry with a stay of up to 30 days, and is valid for 90 days from the date of issue.",
    },
    {
      q: "Can I extend my Azerbaijan e-Visa?",
      a: "No, the e-Visa cannot be extended online. For a longer stay you'll need a new visa or to contact the State Migration Service of Azerbaijan directly.",
    },
  ];

  const steps: Step[] = [
    { title: "Check Your Eligibility", desc: `Confirm ${country} passport holders qualify for the Azerbaijan e-Visa — most nationalities do.` },
    { title: "Prepare Your Documents", desc: "Have your valid passport, a digital photo, and a payment card ready before you start." },
    { title: "Fill Out the Application", desc: "Complete the online form with your personal and travel details — it takes about 5 minutes." },
    { title: "Pay the Visa Fee", desc: `Pay the $${fee} USD fee securely online with a credit or debit card.` },
    { title: "Receive Your e-Visa", desc: "Your approved e-Visa arrives by email, usually within 3 business days (or 3 hours for urgent processing)." },
  ];

  return (
    <div className={styles.layout}>
      <main>
        <div className={styles.overview}>
          <p className={styles.overviewTitle}>ℹ️ Quick Overview</p>
          <p className={styles.overviewText}>{overview}</p>
        </div>

        <article className={styles.content}>
          <h2>Do {country} Citizens Need a Visa for Azerbaijan?</h2>
          <p>
            Yes — {country} passport holders must obtain a visa before traveling to Azerbaijan. The good news is that{" "}
            {country} citizens are eligible for the <strong>Azerbaijan e-Visa</strong>, which can be obtained entirely
            online without visiting an embassy or consulate.
          </p>

          <h2>Azerbaijan e-Visa for {country} Citizens</h2>
          <p>
            The <strong>Azerbaijan e-Visa for {country}</strong> nationals is a single-entry electronic travel
            authorization, covering tourism, business, and transit purposes.
          </p>
          <ul>
            <li>Apply online from anywhere, no embassy visit required</li>
            <li>Receive your e-Visa by email in as little as 3 hours (urgent) or 3 business days (standard)</li>
            <li>Fee: ${fee} USD, all processing charges included</li>
            <li>Valid for a single entry, stay up to 30 days</li>
          </ul>

          <h2>Requirements for {country} Citizens</h2>
          <p>Before applying, make sure you have the following ready:</p>
          <ul>
            <li>Valid {country} passport (at least 6 months validity beyond your stay)</li>
            <li>A valid email address to receive your e-Visa</li>
            <li>A credit or debit card for payment</li>
            <li>A digital passport-style photo</li>
          </ul>

          <h2>Validity &amp; Entry Rules</h2>
          <p>
            The Azerbaijan e-Visa is valid for 90 days from the date of issue, allowing a single entry with a maximum
            stay of 30 days per visit.
          </p>

          <h2>Cost of the Azerbaijan e-Visa for {country} Citizens</h2>
          <p>
            The standard processing fee is <strong>${fee} USD</strong>, covering government and processing charges.
          </p>
        </article>

        <h2 className={styles.faqTitle}>❓ Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-gray-200 rounded-xl bg-white px-6 shadow-sm">
              <AccordionTrigger className="cursor-pointer text-[17px] font-semibold hover:no-underline py-5 text-left" style={{ color: "#1a1a2e" }}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-[16px] leading-relaxed text-gray-500 pb-4">{faq.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <h2 className={styles.stepsTitle}>📋 How to Apply: Step-by-Step Guide</h2>
        <div>
          {steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{i + 1}</div>
              <div className={styles.stepBody}>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className={styles.sidebarCol}>
        <Sidebar applyLink={applyLink} countries={sidebarCountries} locale={locale} />
      </div>
    </div>
  );
}
