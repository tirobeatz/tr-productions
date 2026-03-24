import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, LICENSE_DETAILS } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { generateLicensePDF } from '@/lib/license-pdf'
import { createDownloadToken } from '@/lib/download-token'
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
    console.log(`Beat order already processed for session ${session.id}, skipping`)
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
    await supabaseAdmin
      .from('beats')
      .update({ is_sold: true, sold_at: new Date().toISOString(), sold_to: customerEmail })
      .eq('id', beatId)
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
    console.log(`Service payment already processed for session ${session.id}, skipping`)
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
          booking
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

// ============================================
// EMAIL TEMPLATES
// ============================================

function emailWrapper(content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 28px; margin: 0;">
        <span style="color: #8B5CF6;">TR</span> Productions
      </h1>
    </div>
    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(5, 5, 5, 1) 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      ${content}
    </div>
    <div style="text-align: center; color: #6B7280; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">Questions? Reply to this email or contact us.</p>
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} TR Productions. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

function generateBeatEmailHTML({ beatTitle, licenseName, orderId, downloadUrl, expiresIn, amount, currency }) {
  return emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎵</div>
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Thank You for Your Purchase!</h2>
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Your beat is ready for download</p>
    </div>
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Beat</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${beatTitle}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">License</td>
          <td style="color: #8B5CF6; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${licenseName}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Order ID</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right; font-family: monospace;">${orderId}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">Total</td>
          <td style="color: #ffffff; font-size: 20px; padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">&euro;${amount}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${downloadUrl}" style="display: inline-block; background: #8B5CF6; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-weight: 600; font-size: 16px;">
        Download Your Files
      </a>
      <p style="color: #9CA3AF; font-size: 12px; margin-top: 12px;">Link expires in ${expiresIn}</p>
    </div>
    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 16px;">
      <p style="color: #A78BFA; font-size: 13px; margin: 0; line-height: 1.6;">
        📄 <strong>Your license agreement is attached to this email.</strong> Please keep it for your records.
      </p>
    </div>
  `)
}

function generateDepositEmailHTML({ serviceName, customerName, depositAmount, remainingAmount, totalPrice, serviceType, booking }) {
  const details = serviceType === 'mix'
    ? `<tr><td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Track</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${booking.track_name}</td></tr>
       <tr><td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Rush Delivery</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right;">${booking.rush_delivery ? 'Yes' : 'No'}</td></tr>`
    : `<tr><td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Date</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${booking.date}</td></tr>
       <tr><td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Hours</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right;">${booking.hours?.length || 0}h</td></tr>`

  const nextSteps = serviceType === 'mix'
    ? 'Send your files to <strong style="color: #ffffff;">mixmaster@trproductions.de</strong> or via WeTransfer. We\'ll start working on your track!'
    : 'See you at the studio! The remaining balance is due on your session day.'

  return emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 16px;">${serviceType === 'mix' ? '🎚️' : '🎙️'}</div>
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Booking Confirmed!</h2>
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Hey ${customerName}, your deposit has been received</p>
    </div>
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Service</td>
          <td style="color: #8B5CF6; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${serviceName}</td>
        </tr>
        ${details}
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">Deposit Paid</td>
          <td style="color: #10B981; font-size: 16px; padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">&euro;${depositAmount}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Remaining Balance</td>
          <td style="color: #ffffff; font-size: 16px; padding: 8px 0; text-align: right; font-weight: bold;">&euro;${remainingAmount}</td>
        </tr>
      </table>
    </div>
    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 16px;">
      <p style="color: #A78BFA; font-size: 13px; margin: 0; line-height: 1.6;">
        <strong>Next Steps:</strong> ${nextSteps}
      </p>
    </div>
  `)
}

function generateFinalPaymentEmailHTML({ serviceName, customerName, totalPrice }) {
  return emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Payment Complete!</h2>
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Hey ${customerName}, your ${serviceName.toLowerCase()} is fully paid</p>
    </div>
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Service</td>
          <td style="color: #8B5CF6; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${serviceName}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">Total Paid</td>
          <td style="color: #10B981; font-size: 20px; padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">&euro;${totalPrice}</td>
        </tr>
      </table>
    </div>
    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 16px;">
      <p style="color: #6EE7B7; font-size: 13px; margin: 0; line-height: 1.6;">
        Thank you for your business! If you have any questions, just reply to this email.
      </p>
    </div>
  `)
}

function generateInvoiceEmailHTML({ serviceName, customerName, remainingAmount, paymentUrl }) {
  return emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Final Invoice</h2>
      <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Hey ${customerName}, your remaining balance is ready</p>
    </div>
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0;">Service</td>
          <td style="color: #8B5CF6; font-size: 14px; padding: 8px 0; text-align: right; font-weight: 600;">${serviceName}</td>
        </tr>
        <tr>
          <td style="color: #9CA3AF; font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">Amount Due</td>
          <td style="color: #ffffff; font-size: 20px; padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">&euro;${remainingAmount}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${paymentUrl}" style="display: inline-block; background: #8B5CF6; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-weight: 600; font-size: 16px;">
        Pay Now
      </a>
    </div>
    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 16px;">
      <p style="color: #A78BFA; font-size: 13px; margin: 0; line-height: 1.6;">
        Click the button above to complete your payment securely via Stripe.
      </p>
    </div>
  `)
}

// Export for use in send-invoice route
export { generateInvoiceEmailHTML, emailWrapper }
