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

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      // Idempotency check: skip if this Stripe session was already processed
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('order_id')
        .eq('stripe_session_id', session.id)
        .single()

      if (existingOrder) {
        console.log(`Webhook already processed for session ${session.id}, skipping`)
        return NextResponse.json({ received: true, duplicate: true })
      }

      const beatId = session.metadata.beat_id
      const licenseType = session.metadata.license_type
      const customerEmail = session.customer_email || session.customer_details?.email
      const beatTitle = session.metadata.beat_title

      // Generate unique order ID
      const orderId = `TR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

      // Create download token (valid for 7 days)
      const downloadToken = createDownloadToken(beatId, licenseType, orderId)

      // Get beat details
      const { data: beat } = await supabaseAdmin
        .from('beats')
        .select('*')
        .eq('id', beatId)
        .single()

      // Store order in database
      const { data: order, error: orderError } = await supabaseAdmin
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
      }

      // If exclusive license, mark beat as sold
      if (licenseType === 'exclusive') {
        await supabaseAdmin
          .from('beats')
          .update({
            is_sold: true,
            sold_at: new Date().toISOString(),
            sold_to: customerEmail
          })
          .eq('id', beatId)
      }

      // Generate license PDF
      const licenseDetails = LICENSE_DETAILS[licenseType]
      const licensePdfBuffer = await generateLicensePDF({
        orderId,
        beatTitle: beat?.title || beatTitle,
        licenseType: licenseDetails.name,
        customerEmail,
        purchaseDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        streams: licenseDetails.streams,
        creditRequired: licenseDetails.credit,
        exclusive: licenseDetails.exclusive,
        files: licenseDetails.files
      })

      // Build download URL (points to success page with token)
      const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/purchase/success?token=${downloadToken}`

      // Send confirmation email with Resend
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: customerEmail,
          subject: `Your Beat Purchase: ${beat?.title || beatTitle}`,
          html: generateEmailHTML({
            beatTitle: beat?.title || beatTitle,
            licenseName: licenseDetails.name,
            orderId,
            downloadUrl,
            expiresIn: '7 days',
            amount: (session.amount_total / 100).toFixed(2),
            currency: session.currency.toUpperCase()
          }),
          attachments: [
            {
              filename: `License_${orderId}.pdf`,
              content: licensePdfBuffer.toString('base64')
            }
          ]
        })

        // Update order with email sent status
        await supabaseAdmin
          .from('orders')
          .update({ email_sent: true, email_sent_at: new Date().toISOString() })
          .eq('order_id', orderId)

      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the webhook, just log the error
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

function generateEmailHTML({ beatTitle, licenseName, orderId, downloadUrl, expiresIn, amount, currency }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 28px; margin: 0;">
        <span style="color: #8B5CF6;">TR</span> Productions
      </h1>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(5, 5, 5, 1) 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 24px;">

      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎵</div>
        <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">Thank You for Your Purchase!</h2>
        <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Your beat is ready for download</p>
      </div>

      <!-- Order Details -->
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
            <td style="color: #ffffff; font-size: 20px; padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">€${amount}</td>
          </tr>
        </table>
      </div>

      <!-- Download Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${downloadUrl}" style="display: inline-block; background: #8B5CF6; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-weight: 600; font-size: 16px;">
          Download Your Files
        </a>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 12px;">
          Link expires in ${expiresIn}
        </p>
      </div>

      <!-- License Note -->
      <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 16px;">
        <p style="color: #A78BFA; font-size: 13px; margin: 0; line-height: 1.6;">
          📄 <strong>Your license agreement is attached to this email.</strong> Please keep it for your records. It outlines the terms of use for your purchased beat.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #6B7280; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">Questions? Reply to this email or contact us.</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} TR Productions. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
  `
}
