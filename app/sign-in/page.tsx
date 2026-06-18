import { Component as AnimatedLogin } from '@/components/ui/animated-characters-login-page'

// UI only for now — the form still uses the component's mock auth.
// We'll wire Clerk into this together (replace the submit handler).
export default function SignInPage() {
  return <AnimatedLogin />
}
