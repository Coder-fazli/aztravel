import type { Metadata } from 'next'

// Private guest utility page — block search engines at both robots.txt and
// meta-tag level so booking lookup never appears in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function MyBookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
