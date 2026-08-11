'use server'

import { headers } from 'next/headers'
import { connectDb } from '@/lib/db/connect'
import Evisa from '@/lib/db/models/evisa/Evisa'
import { stripe } from '@/lib/payments/stripe'

// Stripe's own Checkout page is separately localized from our site -- it
// needs its own `locale` param or it just guesses from the browser,
// independent of whatever language the applicant was actually using here.
const STRIPE_LOCALES: Record<string, 'en' | 'es' | 'ar'> = { en: 'en', es: 'es', ar: 'ar' }

export async function createCheckoutSession(applicationNumber: string, locale?: string) {
  await connectDb()

  const applicants = await Evisa.find({ applicationNumber }).lean()
  if (applicants.length === 0)
    throw new Error('Application not found')

  const totalPrice = applicants.reduce((sum, a: any) => sum + a.price, 0)

  const hdrs = await headers()
  const host = hdrs.get('host')
  // x-forwarded-host is what a reverse proxy (Cloudflare, nginx) sets to the
  // original public hostname the browser actually requested -- if it
  // disagrees with `host`, something between the browser and this server is
  // rewriting the Host header, which would explain a wrong redirect URL.
  console.log(`[create-checkout-session] host="${host}" x-forwarded-host="${hdrs.get('x-forwarded-host')}" applicationNumber="${applicationNumber}"`)
  const baseUrl = `https://${host}`

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    locale: (locale && STRIPE_LOCALES[locale]) || 'auto',
    client_reference_id: applicationNumber,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Azerbaijan eVisa — Application #${applicationNumber}`,
        },
        unit_amount: Math.round(totalPrice * 100),
      },
      quantity: 1,
    }],
    // No "/apply" prefix here -- the apply.* subdomain's middleware already
    // prepends it to every path on that hostname. Adding it again here would
    // produce "/apply/apply/status/..." and 404.
    success_url: `${baseUrl}/status/${applicationNumber}?paid=1`,
    cancel_url: `${baseUrl}/status/${applicationNumber}?paid=0`,
  })

  console.log(`[create-checkout-session] success_url="${baseUrl}/status/${applicationNumber}?paid=1"`)

  return session.url
}
