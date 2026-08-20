import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CountryHero } from "@/components/features/evisa-country/CountryHero";
import { InfoCards } from "@/components/features/evisa-country/InfoCards";
import { CountryContent } from "@/components/features/evisa-country/CountryContent";
import { getPublicCountries, getPublicCountryBySlug } from "@/lib/actions/evisa";
import { SITE_URL } from "@/lib/site";

function localizedUrl(locale: string, path: string) {
  return locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const country = await getPublicCountryBySlug(slug);
  const name = country?.name?.[locale] || country?.name?.en || slug;
  const path = `/visa/${slug}`;

  return {
    title: `${name} e-Visa for Azerbaijan — Apply Online | AzTravel`,
    description: `Apply for the Azerbaijan e-Visa as a ${name} citizen. Fast, secure, official online application.`,
    alternates: {
      canonical: localizedUrl(locale, path),
      languages: {
        en: localizedUrl("en", path),
        es: localizedUrl("es", path),
        ar: localizedUrl("ar", path),
        "x-default": localizedUrl("en", path),
      },
    },
  };
}

export default async function CountryVisaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [country, allCountries, t] = await Promise.all([
    getPublicCountryBySlug(slug),
    getPublicCountries(),
    getTranslations({ locale, namespace: "evisa.country" }),
  ]);

  if (!country) notFound();

  const name = country.name?.[locale] || country.name?.en || slug;
  const fee = country.baseFee || 69;
  const applyLink = "https://apply.azerbaijantravel.com/";
  const v = { country: name, fee };

  const infoCards = [
    { label: t("infoProcessingTime"), value: t("infoProcessingValue") },
    { label: t("infoStayDuration"), value: t("infoStayValue") },
    { label: t("infoUrgent"), value: t("infoUrgentValue") },
    { label: t("infoEntryType"), value: t("infoEntryValue") },
  ];

  const sidebarCountries = allCountries
    .filter((c: any) => c.slug !== country.slug)
    .slice(0, 30)
    .map((c: any) => ({ name: c.name?.[locale] || c.name?.en || c.code, code: c.code, slug: c.slug }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { q: t("faqNeedVisaQ", v), a: t("faqNeedVisaA", v) },
      { q: t("faqTimeQ", v), a: t("faqTimeA", v) },
      { q: t("faqDocsQ", v), a: t("faqDocsA", v) },
      { q: t("faqCostQ", v), a: t("faqCostA", v) },
      { q: t("faqStayQ", v), a: t("faqStayA", v) },
      { q: t("faqExtendQ", v), a: t("faqExtendA", v) },
    ].map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Azerbaijan e-Visa for ${name} Citizens`,
    description: t("overview", v),
    provider: { "@type": "Organization", name: "AzTravel", url: SITE_URL },
    areaServed: name,
    offers: {
      "@type": "Offer",
      price: String(fee),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CountryHero
        country={name}
        description={t("heroDescription", { country: name })}
        locale={locale}
      />
      <InfoCards cards={infoCards} />
      <CountryContent
        country={name}
        overview={t("overview", v)}
        fee={fee}
        applyLink={applyLink}
        sidebarCountries={sidebarCountries}
        locale={locale}
      />
    </main>
  );
}
