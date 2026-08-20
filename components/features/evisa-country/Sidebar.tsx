import { getTranslations } from "next-intl/server";
import styles from "./Sidebar.module.css";

interface SidebarCountry {
  name: string;
  code: string;
  slug: string;
}

export async function Sidebar({ applyLink, countries = [], locale }: { applyLink: string; countries?: SidebarCountry[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "evisa.country" });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.applyCard}>
        <span className={styles.applyIcon}>📋</span>
        <h3 className={styles.applyTitle}>{t("readyToApply")}</h3>
        <p className={styles.applyDesc}>{t("readyToApplyDesc")}</p>
        <a href={applyLink} target="_blank" rel="noopener noreferrer" className={styles.applyBtn}>{t("applyNow")}</a>
      </div>

      {countries.length > 0 && (
        <div className={styles.natCard}>
          <div className={styles.natHeader}>🌍 {t("otherCountries")}</div>
          <ul className={styles.natList}>
            {countries.map((c) => (
              <li key={c.slug}>
                <a href={`/${locale}/visa/${c.slug}`} className={styles.natItem}>
                  <img
                    src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                    alt={c.name}
                    className={styles.natFlag}
                  />
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
