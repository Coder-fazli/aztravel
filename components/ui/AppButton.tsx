import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'white' | 'secondary' | 'glass'
type Size = 'md' | 'lg' | 'xl'

type Props = {
  children: ReactNode
  variant?: Variant
  size?: Size
  href?: string
  icon?: ReactNode
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
}

// Project's Figma button (primary / white / secondary / glass · md / lg / xl)
// with the hover "shine" sweep. Renders a Link when `href` is set, else a button.
export default function AppButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  icon,
  className = '',
  onClick,
  type = 'button',
}: Props) {
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`.trim()
  const inner = (
    <>
      <span>{children}</span>
      {icon && <span className={styles.icon}>{icon}</span>}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {inner}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} onClick={onClick}>
      {inner}
    </button>
  )
}
