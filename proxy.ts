import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse, type NextRequest } from 'next/server'

const intlMiddleware = createIntlMiddleware(routing);

// The apply.* subdomain has no visible locale prefix in its URLs (by design
// — "apply.azerbaijantravel.com/status/AZ-..." not ".../es/status/AZ-...").
// So the visitor's language preference has to come from somewhere other than
// the path: an explicit ?lang= override (the language switcher uses this),
// then a previously-set cookie (so the choice sticks across the Stripe
// redirect round-trip), then the browser's Accept-Language header.
const SUPPORTED_LOCALES: readonly string[] = routing.locales

function detectApplyLocale(req: NextRequest): string {
    const queryLocale = req.nextUrl.searchParams.get('lang')
    if (queryLocale && SUPPORTED_LOCALES.includes(queryLocale)) return queryLocale

    const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale

    const acceptLanguage = req.headers.get('accept-language') ?? ''
    for (const part of acceptLanguage.split(',')) {
        const code = part.trim().split(';')[0].split('-')[0].toLowerCase()
        if (SUPPORTED_LOCALES.includes(code)) return code
    }

    return routing.defaultLocale
}

export default clerkMiddleware(async (auth, req) => {
    const { pathname } =  req.nextUrl
    // req.nextUrl.hostname reflects this self-hosted server's own bind
    // address ("localhost"), not the domain the visitor actually used —
    // nginx forwards the real Host header, so read it from there instead.
    const hostname = req.headers.get('host') ?? req.nextUrl.hostname

    // apply.azerbaijantravel.com — the public e-Visa wizard lives at /apply
    // internally. Rewritten (not redirected) so the address bar keeps
    // showing the subdomain.
    //
    // The locale prefix here is required, not decorative: every page under
    // app/[locale]/ is wrapped by a layout that does
    // `if (!routing.locales.includes(locale)) notFound()`. Since this rewrite
    // bypasses next-intl's own middleware entirely (this whole branch returns
    // before ever reaching it below), nothing else supplies that locale
    // segment. Without it, [locale] has no valid value, so nested routes
    // (e.g. /apply/status/[applicationNumber]) 404 in that layout guard.
    if (hostname.startsWith('apply.') && !pathname.startsWith('/api')) {
        const detectedLocale = detectApplyLocale(req)
        const url = req.nextUrl.clone()
        url.pathname = pathname === '/' ? `/${detectedLocale}/apply` : `/${detectedLocale}/apply${pathname}`
        url.searchParams.delete('lang')
        console.log(`[apply-middleware] host="${hostname}" incoming="${pathname}" locale="${detectedLocale}" rewritten="${url.pathname}"`)
        const res = NextResponse.rewrite(url)
        // Persist the choice for a year so it survives the trip to Stripe and
        // back, and so a manual language switch sticks on the next visit.
        res.cookies.set('NEXT_LOCALE', detectedLocale, { maxAge: 60 * 60 * 24 * 365, path: '/' })
        return res
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