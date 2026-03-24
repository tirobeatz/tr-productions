import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, LICENSE_DETAILS } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { generateLicensePDF } from '@/lib/license-pdf'
import { createDownloadToken } from '@/lib/download-token'
import {
  generateBeatEmailHTML,
  generateDepositEmailHTML,
  generateFinalPaymentEmailHTML
} from '@/lib/email-templates'
import crypto from 'crypto'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const metadata = session.metadata || {}

      // Route to appropriate handler based on metadata
      if (metadata.service_type) {
        await handleServicePayment(session, metadata)
      } else if (metadata.beat_id) {
        await handleBeatPurchase(session, metadata)
      }
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object
      const paymentIntent = charge.payment_intent

      // Check if this was a beat order
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('stripe_payment_intent', paymentIntent)
        .single()

      if (order) {
        // Mark order as refunded
        await supabaseAdmin
          .from('orders')
          .update({ status: 'refunded' })
          .eq('order_id', order.order_id)

        // If exclusive beat, mark as available again
        if (order.license_type === 'exclusive') {
          await supabaseAdmin
            .from('beats')
            .update({ is_sold: false, sold_at: null, sold_to: null })
            .eq('id', order.beat_id)
        }
      }

      // Check if this was a service payment - find by payment intent in stripe session
      // We need to look up the session by payment intent
      try {
        const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent, limit: 1 })
        if (sessions.data.length > 0) {
          const sessionMeta = sessions.data[0].metadata
          if (sessionMeta?.service_type) {
            const table = sessionMeta.service_type === 'mix' ? 'mix_requests' : 'studio_bookings'
            const bookingId = sessionMeta.booking_id

            if (sessionMeta.payment_type === 'deposit') {
              await supabaseAdmin.from(table).update({ payment_status: 'refunded', deposit_amount: 0 }).eq('id', bookingId)
            } else if (sessionMeta.payment_type === 'final') {
              await supabaseAdmin.from(table).update({ payment_status: 'deposit_paid' }).eq('id', bookingId)
            }
          }
        }
      } catch (e) {
        console.error('Error processing service refund:', e)
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object
      const metadata = session.metadata || {}

      // If an exclusive beat checkout expired, no action needed since we don't lock at checkout time
      // If a service invoice expired, revert status back
      if (metadata.service_type && metadata.payment_type === 'final') {
        const table = metadata.service_type === 'mix' ? 'mix_requests' : 'studio_bookings'
        await supabaseAdmin
          .from(table)
          .update({ payment_status: 'deposit_paid', payment_link_url: null })
          .eq('id', metadata.booking_id)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// ============================================
// BEAT PURCHASE HANDLER (existing flow)
// ============================================
async function handleBeatPurchase(session, metadata) {
  // Idempotency check
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('order_id')
    .eq('stripe_session_id', session.id)
    .single()

  if (existingOrder) {
    // Already processed, skip
    return
  }

  const beatId = metadata.beat_id
  const licenseType = metadata.license_type
  const customerEmail = session.customer_email || session.customer_details?.email
  const beatTitle = metadata.beat_title

  const orderId = `TR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
  const downloadToken = createDownloadToken(beatId, licenseType, orderId)

  const { data: beat } = await supabaseAdmin
    .from('beats')
    .select('*')
    .eq('id', beatId)
    .single()

  const { error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      order_id: orderId,
      beat_id: beatId,
      customer_email: customerEmail,
      license_type: licenseType,
      amount: session.amount_total / 100,
      currency: session.currency,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      download_token: downloadToken,
      download_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    return
  }

  if (licenseType === 'exclusive') {
    // Atomic update: only mark as sold if not already sold (prevents race condition)
    const { data: updated, error: soldError } = await supabaseAdmin
      .from('beats')
      .update({ is_sold: true, sold_at: new Date().toISOString(), sold_to: customerEmail })
      .eq('id', beatId)
      .eq('is_sold', false)
      .select()
      .single()

    if (soldError || !updated) {
      // Beat was already sold by another concurrent purchase - refund this payment
      console.error(`Race condition detected: exclusive beat ${beatId} already sold, session ${session.id} needs refund`)

      // Mark the order as needing refund so admin can handle it
      await supabaseAdmin
        .from('orders')
        .update({ status: 'needs_refund', notes: `Race condition: beat was already sold to another customer` })
        .eq('order_id', orderId)

      return
    }
  }

  const licenseDetails = LICENSE_DETAILS[licenseType]
  const licensePdfBuffer = await generateLicensePDF({
    orderId,
    beatTitle: beat?.title || beatTitle,
    licenseType: licenseDetails.name,
    customerEmail,
    purchaseDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    streams: licenseDetails.streams,
    creditRequired: licenseDetails.credit,
    exclusive: licenseDetails.exclusive,
    files: licenseDetails.files
  })

  const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/purchase/success?token=${downloadToken}`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Your Beat Purchase: ${beat?.title || beatTitle}`,
      html: generateBeatEmailHTML({
        beatTitle: beat?.title || beatTitle,
        licenseName: licenseDetails.name,
        orderId,
        downloadUrl,
        expiresIn: '7 days',
        amount: (session.amount_total / 100).toFixed(2),
        currency: session.currency.toUpperCase()
      }),
      attachments: [{
        filename: `License_${orderId}.pdf`,
        content: licensePdfBuffer.toString('base64')
      }]
    })

    await supabaseAdmin
      .from('orders')
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq('order_id', orderId)
  } catch (emailError) {
    console.error('Error sending email:', emailError)
  }
}

// ============================================
// SERVICE PAYMENT HANDLER (deposit + final)
// ============================================
async function handleServicePayment(session, metadata) {
  const serviceType = metadata.service_type
  const bookingId = metadata.booking_id
  const paymentType = metadata.payment_type // 'deposit' or 'final'
  const customerEmail = session.customer_email || session.customer_details?.email

  const table = serviceType === 'mix' ? 'mix_requests' : 'studio_bookings'

  // Idempotency: check if this session was already processed
  const sessionField = paymentType === 'deposit' ? 'deposit_stripe_session_id' : 'final_stripe_session_id'
  const { data: existing } = await supabaseAdmin
    .from(table)
    .select('id')
    .eq(sessionField, session.id)
    .single()

  if (existing) {
    // Already processed, skip
    return
  }

  if (paymentType === 'deposit') {
    // Update booking with deposit info
    const { error } = await supabaseAdmin
      .from(table)
      .update({
        payment_status: 'deposit_paid',
        deposit_amount: session.amount_total / 100,
        deposit_stripe_session_id: session.id
      })
      .eq('id', bookingId)

    if (error) {
      console.error('Error updating booking deposit:', error)
      return
    }

    // Fetch booking details for email
    const { data: booking } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', bookingId)
      .single()

    // Send deposit confirmation email
    try {
      const serviceName = serviceType === 'mix' ? 'Mix & Master' : 'Studio Session'
      const depositAmount = (session.amount_total / 100).toFixed(2)
      const remainingAmount = (booking.total_price - session.amount_total / 100).toFixed(2)

      await resend.emails.send({
        from: FROM_EMAIL,
        to: customerEmail,
        subject: `Booking Confirmed: ${serviceName} — Deposit Received`,
        html: generateDepositEmailHTML({
          serviceName,
          customerName: booking.name,
          depositAmount,
          remainingAmount,
          totalPrice: booking.total_price.toFixed(2),
          serviceType,
          booking,
          uploadUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/upload?type=${serviceType}&id=${bookingId}`
        })
      })
    } catch (emailError) {
      console.error('Error sending deposit email:', emailError)
    }

  } else if (paymentType === 'final') {
    // Update booking with final payment info
    const { error } = await supabaseAdmin
      .from(table)
      .update({
        payment_status: 'fully_paid',
        final_stripe_session_id: session.id
      })
      .eq('id', bookingId)

    if (error) {
      console.error('Error updating final payment:', error)
      return
    }

    // Fetch booking for email
    const { data: booking } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', bookingId)
      .single()

    // Send payment complete email
    try {
      const serviceName = serviceType === 'mix' ? 'Mix & Master' : 'Studio Session'

      await resend.emails.send({
        from: FROM_EMAIL,
        to: customerEmail,
        subject: `Payment Complete: ${serviceName} — Fully Paid`,
        html: generateFinalPaymentEmailHTML({
          serviceName,
          customerName: booking.name,
          totalPrice: booking.total_price.toFixed(2)
        })
      })
    } catch (emailError) {
      console.error('Error sending final payment email:', emailError)
    }
  }
}
