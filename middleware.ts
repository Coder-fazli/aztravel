import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'

const intlMiddleware = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } =  req.nextUrl
    if (pathname.startsWith('/admin')) {
        const { sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role

        if (!role || !['admin', 'operator'].includes(role as string)) {
           return NextResponse.redirect(new URL('/', req.url))
    }    }
    return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/(.*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};