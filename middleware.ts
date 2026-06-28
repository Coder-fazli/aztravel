import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'

const intlMiddleware = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } =  req.nextUrl

    // Public API routes — no auth required (read-only proxies, no sensitive data).
    if (pathname.startsWith('/api/tripadvisor')) {
        return NextResponse.next()
    }

    // Private API routes — must be signed in.
    // Return JSON 401 (not a redirect) so fetch() callers get a proper error.
    if (pathname.startsWith('/api')) {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.next()
    }

    // sign-in / sign-up must NOT be localized by next-intl.
    if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
        return NextResponse.next()
    }

    if (pathname.startsWith('/admin')) {
        const { userId, sessionClaims } = await auth();

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