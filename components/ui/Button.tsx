import Link from 'next/link'
import ArrowIcon from './ArrowIcon'
import styles from './Button.module.css'

type Variant = 'primary' | 'white' | 'secondary' | 'glass'
type Size    = 'md' | 'lg' | 'xl'

type Props = {
  children:   React.ReactNode
  href?:      string
  onClick?:   () => void
  variant?:   Variant
  size?:      Size
  /** show the right arrow icon (default true) */
  arrow?:     boolean
  /** optional custom left icon */
  iconLeft?:  React.ReactNode
  className?: string
  type?:      'button' | 'submit'
  ariaLabel?: string
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  arrow = true,
  iconLeft,
  className = '',
  type = 'button',
  ariaLabel,
}: Props) {
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`

  const inner = (
    <>
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      <span>{children}</span>
      {arrow && (
        <span className={styles.icon}>
          <ArrowIcon size={size === 'md' ? 20 : 24} />
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {inner}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={cls} aria-label={ariaLabel}>
      {inner}
    </button>
  )
}
