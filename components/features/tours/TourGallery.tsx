import styles from './TourGallery.module.css'

type Props = {
  images: string[]
  title:  string
}

export default function TourGallery({ images, title }: Props) {
  const filled = [...images, ...Array(5).fill('')].slice(0, 5)
  const extra  = Math.max(0, images.length - 5)

  return (
    <div className={styles.gallery}>
      {/* row 1 — 2 images */}
      <div className={styles.row1}>
        <div className={styles.imgWrap}>
          <img src={filled[0] || '/images/tour-placeholder.jpg'} alt={title} className={styles.img} />
        </div>
        <div className={styles.imgWrap}>
          <img src={filled[1] || '/images/tour-placeholder.jpg'} alt="" className={styles.img} />
        </div>
      </div>

      {/* row 2 — 3 images, last has overlay */}
      <div className={styles.row2}>
        <div className={styles.imgWrap}>
          <img src={filled[2] || '/images/tour-placeholder.jpg'} alt="" className={styles.img} />
        </div>
        <div className={styles.imgWrap}>
          <img src={filled[3] || '/images/tour-placeholder.jpg'} alt="" className={styles.img} />
        </div>
        <div className={styles.imgWrap}>
          <img src={filled[4] || '/images/tour-placeholder.jpg'} alt="" className={styles.img} />
          {extra > 0 && (
            <div className={styles.overlay}>
              <span className={styles.overlayCount}>{extra}+</span>
              <span className={styles.overlayLabel}>More images</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
