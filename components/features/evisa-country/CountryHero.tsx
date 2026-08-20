import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./CountryHero.module.css";

interface CountryHeroProps {
  country: string;
  description: string;
  heroImage?: string;
  locale: string;
}

export async function CountryHero({ country, description, heroImage, locale }: CountryHeroProps) {
  const imageUrl = heroImage ?? "/images/hero-slide-1.jpg";
  const t = await getTranslations({ locale, namespace: "evisa.country" });

  return (
    <section className={styles.hero}>
      <img src={imageUrl} alt={`${country} Hero Background`} className={styles.backgroundImage} loading="lazy" />

      <nav className={styles.breadcrumb}>
        <Link href={`/${locale}`}>{t("breadcrumbHome")}</Link>
        <span className={styles.sep}>/</span>
        <Link href={`/${locale}/evisa`}>{t("breadcrumbNationality")}</Link>
        <span className={styles.sep}>/</span>
        <span>{country}</span>
      </nav>

      <h1 className={styles.title}>{country}</h1>
      <p className={styles.subtitle}>{description}</p>
    </section>
  );
}
