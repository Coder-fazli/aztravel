'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './TourGallery.module.css'

type Props = {
  images: string[]
  title:  string
}

export default function TourGallery({ images, title }: Props) {
  const filled = [...images, ...Array(5).fill('')].slice(0, 5)
  const extra  = Math.max(0, images.length - 5)
  const all    = images.length > 0 ? images : ['/images/tour-placeholder.jpg']

  const [open,  setOpen]  = useState(false)
  const [index, setIndex] = useState(0)

  const prev = useCallback(() => setIndex(i => (i - 1 + all.length) % all.length), [all.length])
  const next = useCallback(() => setIndex(i => (i + 1) % all.length), [all.length])
  const close = useCallback(() => setOpen(false), [])

  function open_at(i: number) {
    setIndex(i)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, prev, next, close])

  // lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div className={styles.gallery}>
        {/* row 1 — 2 images */}
        <div className={styles.row1}>
          {[0, 1].map(i => (
            <button key={i} type="button" className={styles.imgWrap} onClick={() => open_at(i)}>
              <img src={filled[i] || '/images/tour-placeholder.jpg'} alt={i === 0 ? title : ''} className={styles.img} />
            </button>
          ))}
        </div>

        {/* row 2 — 3 images, last has overlay */}
        <div className={styles.row2}>
          {[2, 3, 4].map(i => (
            <button key={i} type="button" className={styles.imgWrap} onClick={() => open_at(i)}>
              <img src={filled[i] || '/images/tour-placeholder.jpg'} alt="" className={styles.img} />
              {i === 4 && extra > 0 && (
                <div className={styles.overlay}>
                  <span className={styles.overlayCount}>{extra}+</span>
                  <span className={styles.overlayLabel}>More images</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── lightbox ── */}
      {open && (
        <div className={styles.lightbox} onClick={close}>
          {/* counter */}
          <span className={styles.counter}>{index + 1} / {all.length}</span>

          {/* close */}
          <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close">×</button>

          {/* image */}
          <div className={styles.lightboxImg} onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={all[index]} alt={`${title} — ${index + 1}`} />
          </div>

          {/* prev */}
          {all.length > 1 && (
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={e => { e.stopPropagation(); prev() }}
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          {/* next */}
          {all.length > 1 && (
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={e => { e.stopPropagation(); next() }}
              aria-label="Next"
            >
              ›
            </button>
          )}

          {/* thumbnail strip */}
          {all.length > 1 && (
            <div className={styles.strip} onClick={e => e.stopPropagation()}>
              {all.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={`${styles.stripThumb} ${i === index ? styles.stripActive : ''}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
