import Button from '@/components/ui/Button'
import styles from './CityCard.module.css'

type Props = {
  name:  string
  desc:  string
  image: string
  links: string[]
  href:  string
}

export default function CityCard({ name, desc, image, links, href }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.imgWrap}>
        <img src={image} alt={name} className={styles.img} />
      </div>
      <div className={styles.text}>
        <div className={styles.inner}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.desc}>{desc}</p>
          <div className={styles.links}>
            {links.map((l, i) => (
              <a key={i} href="#">{l}</a>
            ))}
          </div>
        </div>
        <Button href={href} variant="primary" size="md">See the place</Button>
      </div>
    </div>
  )
}
