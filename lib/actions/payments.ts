'use server'

import { headers } from 'next/headers'
import { connectDb } from '@/lib/db/connect'
import Evisa from '@/lib/db/models/evisa/Evisa'
import { stripe } from '@/lib/payments/stripe'

export async function createCheckoutSession(applicationNumber: string) {
  await connectDb()

  const applicants = await Evisa.find({ applicationNumber }).lean()
  if (applicants.length === 0)
    throw new Error('Application not found')

  const totalPrice = applicants.reduce((sum, a: any) => sum + a.price, 0)

  const host = (await headers()).get('host')
  const baseUrl = `https://${host}`

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
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

  return session.url
}
