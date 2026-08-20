import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CountryHero } from "@/components/features/evisa-country/CountryHero";
import { InfoCards } from "@/components/features/evisa-country/InfoCards";
import { CountryContent } from "@/components/features/evisa-country/CountryContent";
import { getPublicCountries, getPublicCountryBySlug } from "@/lib/actions/evisa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const country = await getPublicCountryBySlug(slug);
  const name = country?.name?.[locale] || country?.name?.en || slug;

  return {
    title: `${name} e-Visa for Azerbaijan — Apply Online | AzTravel`,
    description: `Apply for the Azerbaijan e-Visa as a ${name} citizen. Fast, secure, official online application.`,
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

  return (
    <main>
      <CountryHero
        country={name}
        description={t("heroDescription", { country: name })}
        locale={locale}
      />
      <InfoCards cards={infoCards} />
      <CountryContent
        country={name}
        overview={t("overview", { country: name, fee })}
        fee={fee}
        applyLink={applyLink}
        sidebarCountries={sidebarCountries}
        locale={locale}
      />
    </main>
  );
}
