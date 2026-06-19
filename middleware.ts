import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'

const intlMiddleware = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } =  req.nextUrl

    // These must NOT be localized by next-intl (it would rewrite e.g.
    // /api/upload → /en/api/upload, or /sign-in → /en/sign-in, and break them).
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/sign-in') ||
        pathname.startsWith('/sign-up')
    ) {
        return NextResponse.next()
    }

    if (pathname.startsWith('/admin')) {
        const { userId, sessionClaims } = await auth();

        // 🔎 DEBUG — remove later. Prints to the dev-server terminal.
        console.log('[admin gate] userId:', userId, '| metadata:', sessionClaims?.metadata)

        // signed in but not an admin/operator → bounce home
        const role = (sessionClaims?.metadata as { role?: string })?.role
        if (!['admin', 'operator'].includes(role ?? '')) {
            return NextResponse.redirect(new URL('/', req.url))
        }

        return NextResponse.next()
    }
    return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals, SEO metadata routes, and all static files, unless found in search params
    '/((?!_next|robots\\.txt|sitemap\\.xml|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/(.*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};