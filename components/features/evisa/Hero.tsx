"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, FileText, Search, Zap, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./Hero.module.css";

type HeroProps = {
  locale: string;
};

const SLIDES = ["/images/hero-slide-1.jpg", "/images/hero-slide-2.jpg", "/images/hero-slide-3.jpg"];

export function EvisaHero({ locale }: HeroProps) {
  const t = useTranslations("evisa.hero");
  const [cur, setCur] = useState(0);
  const leavingRef = useRef<HTMLDivElement | null>(null);

  const goTo = (next: number) => {
    const el = leavingRef.current;
    if (el) {
      const tx = getComputedStyle(el).transform;
      el.style.transform = tx;
      setTimeout(() => { if (el) el.style.transform = ""; }, 1700);
    }
    setCur(next);
  };

  useEffect(() => {
    const t = setInterval(() => goTo((cur + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  return (
    <section className={styles.section}>
      {SLIDES.map((src, i) => (
        <div
          key={src}
          ref={i === cur ? leavingRef : null}
          className={`${styles.slide} ${i === cur ? styles.active : styles.inactive}`}
        >
          <div className={styles.backgroundPicture}>
            <Image
              src={src}
              alt={`Azerbaijan scenic backdrop slide ${i + 1}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className={styles.backgroundImage}
              quality={75}
            />
          </div>
        </div>
      ))}

      <div className={styles.overlay} />

      <div className={styles.content}>
        <p className={styles.label}>{t("label")}</p>

        <h1 className={styles.title}>{t("title")}</h1>

        <div className={styles.ctaContainer}>
          <div className={styles.buttonsRow}>
            <a href="https://apply.azerbaijantravel.com/" target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
              <FileText size={18} />
              {t("applyButton")}
              <ArrowRight size={17} strokeWidth={2.5} />
            </a>

            <a href={`/${locale}/my-bookings`} className={styles.secondaryButton}>
              <Search size={18} />
              {t("trackButton")}
            </a>
          </div>

          <div className={styles.speedBar}>
            <div className={styles.speedOption}>
              <div className={`${styles.speedIcon} ${styles.urgentIcon}`}>
                <Zap size={18} fill="white" />
              </div>
              <div className={styles.speedText}>
                <p className={styles.speedLabel}>{t("urgentLabel")}</p>
                <p className={styles.speedValue}>{t("urgentTime")}</p>
              </div>
            </div>

            <div className={styles.speedDivider} />

            <div className={styles.speedOption}>
              <div className={`${styles.speedIcon} ${styles.standardIcon}`}>
                <Clock size={18} fill="white" />
              </div>
              <div className={styles.speedText}>
                <p className={styles.speedLabel}>{t("standardLabel")}</p>
                <p className={styles.speedValue}>{t("standardTime")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dotsContainer}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`${styles.dot} ${i === cur ? styles.active : ""}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className={styles.bottomFade} />
    </section>
  );
}
