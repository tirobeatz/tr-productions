import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createDownloadToken } from '@/lib/download-token'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { generateBeatEmailHTML } from '@/lib/email-templates'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { beatId, licenseType, customerEmail } = await request.json()

    if (!beatId || !licenseType || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Fetch beat
    const { data: beat, error: beatError } = await supabaseAdmin
      .from('beats')
      .select('*')
      .eq('id', beatId)
      .single()

    if (beatError || !beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
    }

    // Verify this is actually a free beat
    const priceKey = `price_${licenseType === 'unlimited' ? 'stems' : licenseType}`
    const price = beat[priceKey]

    if (price === null || price === undefined) {
      return NextResponse.json({ error: 'License not available' }, { status: 400 })
    }

    if (price >= 0.50) {
      return NextResponse.json({ error: 'This beat is not free. Use regular checkout.' }, { status: 400 })
    }

    // Create order
    const orderId = `TR-FREE-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    const downloadToken = createDownloadToken(beatId, licenseType, orderId)

    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_id: orderId,
        beat_id: beatId,
        customer_email: customerEmail,
        license_type: licenseType,
        amount: 0,
        currency: 'eur',
        stripe_session_id: `free_${orderId}`,
        stripe_payment_intent: `free_${orderId}`,
        download_token: downloadToken,
        download_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      })

    if (orderError) {
      console.error('Error creating free order:', orderError)
      return NextResponse.json({ error: 'Failed to process download' }, { status: 500 })
    }

    // Send email with download link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trproductions.de'
    const downloadUrl = `${siteUrl}/purchase/success?token=${downloadToken}`

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: customerEmail,
        subject: `Your Free Beat: ${beat.title}`,
        html: generateBeatEmailHTML({
          beatTitle: beat.title,
          licenseName: licenseType === 'mp3' ? 'MP3 (Free)' : licenseType === 'wav' ? 'WAV (Free)' : 'Free Download',
          orderId,
          downloadUrl,
          expiresIn: '7 days',
          amount: '0.00',
          currency: 'EUR'
        })
      })

      await supabaseAdmin
        .from('orders')
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq('order_id', orderId)
    } catch (emailError) {
      console.error('Error sending free download email:', emailError)
    }

    // Redirect to success page
    return NextResponse.json({
      success: true,
      redirectUrl: `${siteUrl}/purchase/success?token=${downloadToken}`
    })
  } catch (error) {
    console.error('Free download error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process free download' },
      { status: 500 }
    )
  }
}
