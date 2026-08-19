import Link from "next/link";
import styles from "./CountryHero.module.css";

interface CountryHeroProps {
  country: string;
  description: string;
  heroImage?: string;
  locale: string;
}

export function CountryHero({ country, description, heroImage, locale }: CountryHeroProps) {
  const imageUrl = heroImage ?? "/images/hero-slide-1.jpg";

  return (
    <section className={styles.hero}>
      <img src={imageUrl} alt={`${country} Hero Background`} className={styles.backgroundImage} loading="lazy" />

      <nav className={styles.breadcrumb}>
        <Link href={`/${locale}`}>Home</Link>
        <span className={styles.sep}>/</span>
        <Link href={`/${locale}/evisa`}>Visa by Nationality</Link>
        <span className={styles.sep}>/</span>
        <span>{country}</span>
      </nav>

      <h1 className={styles.title}>{country}</h1>
      <p className={styles.subtitle}>{description}</p>
    </section>
  );
}
