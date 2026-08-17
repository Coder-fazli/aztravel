import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { stripe } from '@/lib/payments/stripe'
import { connectDb } from '@/lib/db/connect'
import Evisa from '@/lib/db/models/evisa/Evisa'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const applicationNumber = session.client_reference_id

    if (applicationNumber) {
      await connectDb()
      await Evisa.updateMany(
        { applicationNumber },
        {
          $set: {
            'payment.status': 'paid',
            'payment.transactionId': session.payment_intent as string,
            'payment.paidAt': new Date(),
            status: 'pending',
          },
        },
      )
    }
  }

  return NextResponse.json({ received: true })
}
