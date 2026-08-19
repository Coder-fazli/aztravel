import { notFound } from "next/navigation";
import { CountryHero } from "@/components/features/evisa-country/CountryHero";
import { InfoCards } from "@/components/features/evisa-country/InfoCards";
import { CountryContent } from "@/components/features/evisa-country/CountryContent";
import { getPublicCountries, getPublicCountryByCode } from "@/lib/actions/evisa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  const country = await getPublicCountryByCode(code);
  const name = country?.name?.[locale] || country?.name?.en || code.toUpperCase();

  return {
    title: `${name} e-Visa for Azerbaijan — Apply Online | AzTravel`,
    description: `Apply for the Azerbaijan e-Visa as a ${name} citizen. Fast, secure, official online application.`,
  };
}

export default async function CountryVisaPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  const [country, allCountries] = await Promise.all([
    getPublicCountryByCode(code),
    getPublicCountries(),
  ]);

  if (!country) notFound();

  const name = country.name?.[locale] || country.name?.en || code.toUpperCase();
  const fee = country.baseFee || 69;
  const applyLink = `https://apply.azerbaijantravel.com/?country=${country.code}`;

  const infoCards = [
    { label: "Processing Time", value: "3 Business Days" },
    { label: "Stay Duration", value: "Up to 30 Days" },
    { label: "Urgent Service", value: "3 Hours" },
    { label: "Entry Type", value: "Single Entry" },
  ];

  const sidebarCountries = allCountries
    .filter((c: any) => c.code !== country.code)
    .slice(0, 30)
    .map((c: any) => ({ name: c.name?.[locale] || c.name?.en || c.code, code: c.code }));

  return (
    <main>
      <CountryHero
        country={name}
        description={`Everything ${name} citizens need to know about applying for the Azerbaijan e-Visa online.`}
        locale={locale}
      />
      <InfoCards cards={infoCards} />
      <CountryContent
        country={name}
        overview={`${name} citizens need a visa to travel to Azerbaijan. The easiest way is to apply online for the Azerbaijan e-Visa — issued within 3 business days, allowing a 30-day stay, for $${fee} USD. No embassy visit required.`}
        fee={fee}
        applyLink={applyLink}
        sidebarCountries={sidebarCountries}
      />
    </main>
  );
}
