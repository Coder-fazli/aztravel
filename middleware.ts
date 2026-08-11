import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'

const intlMiddleware = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } =  req.nextUrl
    const hostname = req.nextUrl.hostname

    // apply.azerbaijantravel.com — the public e-Visa wizard lives at /apply
    // internally. Rewritten (not redirected) so the address bar keeps
    // showing the subdomain. English-only for now — no locale routing here.
    if (hostname.startsWith('apply.') && !pathname.startsWith('/api')) {
        const url = req.nextUrl.clone()
        url.pathname = pathname === '/' ? '/apply' : `/apply${pathname}`
        console.log(`[apply-middleware] host="${hostname}" incoming="${pathname}" rewritten="${url.pathname}"`)
        return NextResponse.rewrite(url)
    }

    // azerbaijantravel.com/e-visa (and locale-prefixed variants) — bounce
    // over to the real apply subdomain instead of 404ing. Covers old
    // links/bookmarks to the path that used to exist before the subdomain.
    if (!hostname.startsWith('apply.') && /^\/(es\/|ar\/)?e-visa\/?$/.test(pathname)) {
        return NextResponse.redirect('https://apply.azerbaijantravel.com/', 301)
    }

    // Public API routes — no auth required.
    // - tripadvisor: read-only proxy, no sensitive data
    // - upload: used by the public apply wizard (passport photo) — visitors
    //   submitting a visa application are never signed in
    // - webhooks/stripe: called directly by Stripe's servers, never by a
    //   signed-in user — it authenticates itself via signature, not Clerk
    if (
        pathname.startsWith('/api/tripadvisor') ||
        pathname.startsWith('/api/upload') ||
        pathname.startsWith('/api/webhooks/stripe')
    ) {
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
        const { sessionClaims } = await auth();

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