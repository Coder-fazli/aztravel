import { ClerkProvider } from '@clerk/nextjs'

// Scopes Clerk's client bundle to the sign-in route only (kept off public pages).
export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider afterSignOutUrl="/sign-in">{children}</ClerkProvider>
}
