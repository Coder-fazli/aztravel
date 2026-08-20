import styles from "./Sidebar.module.css";

interface SidebarCountry {
  name: string;
  code: string;
  slug: string;
}

export function Sidebar({ applyLink, countries = [], locale }: { applyLink: string; countries?: SidebarCountry[]; locale: string }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.applyCard}>
        <span className={styles.applyIcon}>📋</span>
        <h3 className={styles.applyTitle}>Ready to Apply?</h3>
        <p className={styles.applyDesc}>Start your Azerbaijan e-Visa application now and get approved fast.</p>
        <a href={applyLink} target="_blank" rel="noopener noreferrer" className={styles.applyBtn}>Apply Now</a>
      </div>

      {countries.length > 0 && (
        <div className={styles.natCard}>
          <div className={styles.natHeader}>🌍 Other Countries</div>
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
