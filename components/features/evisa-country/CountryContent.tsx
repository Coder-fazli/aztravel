import { getTranslations } from "next-intl/server";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sidebar } from "./Sidebar";
import styles from "./CountryContent.module.css";

interface SidebarCountry { name: string; code: string; slug: string; }

interface CountryContentProps {
  country: string;
  overview: string;
  fee: number;
  applyLink: string;
  sidebarCountries: SidebarCountry[];
  locale: string;
}

export async function CountryContent({ country, overview, fee, applyLink, sidebarCountries, locale }: CountryContentProps) {
  const t = await getTranslations({ locale, namespace: "evisa.country" });
  const v = { country, fee };

  const faqs = [
    { q: t("faqNeedVisaQ", v), a: t("faqNeedVisaA", v) },
    { q: t("faqTimeQ", v), a: t("faqTimeA", v) },
    { q: t("faqDocsQ", v), a: t("faqDocsA", v) },
    { q: t("faqCostQ", v), a: t("faqCostA", v) },
    { q: t("faqStayQ", v), a: t("faqStayA", v) },
    { q: t("faqExtendQ", v), a: t("faqExtendA", v) },
  ];

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc", v) },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
    { title: t("step4Title"), desc: t("step4Desc", v) },
    { title: t("step5Title"), desc: t("step5Desc") },
  ];

  return (
    <div className={styles.layout}>
      <main>
        <div className={styles.overview}>
          <p className={styles.overviewTitle}>ℹ️ {t("quickOverview")}</p>
          <p className={styles.overviewText}>{overview}</p>
        </div>

        <article className={styles.content}>
          <h2>{t("needVisaTitle", v)}</h2>
          <p>{t("needVisaBody", v)}</p>

          <h2>{t("evisaForTitle", v)}</h2>
          <p>{t("evisaForBody", v)}</p>
          <ul>
            <li>{t("bullet1")}</li>
            <li>{t("bullet2")}</li>
            <li>{t("bullet3", v)}</li>
            <li>{t("bullet4")}</li>
          </ul>

          <h2>{t("requirementsTitle", v)}</h2>
          <p>{t("requirementsIntro")}</p>
          <ul>
            <li>{t("req1", v)}</li>
            <li>{t("req2")}</li>
            <li>{t("req3")}</li>
            <li>{t("req4")}</li>
          </ul>

          <h2>{t("validityTitle")}</h2>
          <p>{t("validityBody")}</p>

          <h2>{t("costTitle", v)}</h2>
          <p>{t("costBody", v)}</p>
        </article>

        <h2 className={styles.faqTitle}>❓ {t("faqTitle")}</h2>
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

        <h2 className={styles.stepsTitle}>📋 {t("stepsTitle")}</h2>
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
