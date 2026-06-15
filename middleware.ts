import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'

const intlMiddleware = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } =  req.nextUrl
    if (pathname.startsWith('/admin')) {
        // ⚠️ TEMP: admin auth disabled while building the UI.
        // RESTORE the role check below before launch!
        // const { sessionClaims } = await auth();
        // const role = (sessionClaims?.metadata as { role?: string })?.role
        // if (!role || !['admin', 'operator'].includes(role as string)) {
        //     return NextResponse.redirect(new URL('/', req.url))
        // }
        
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