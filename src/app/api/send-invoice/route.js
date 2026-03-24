import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { generateInvoiceEmailHTML } from '@/app/api/webhook/route'

export async function POST(request) {
  try {
    const { serviceType, bookingId } = await request.json()

    if (!serviceType || !bookingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['mix', 'studio'].includes(serviceType)) {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
    }

    const table = serviceType === 'mix' ? 'mix_requests' : 'studio_bookings'

    // Fetch booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.payment_status === 'fully_paid') {
      return NextResponse.json({ error: 'Booking is already fully paid' }, { status: 400 })
    }

    if (booking.payment_status !== 'deposit_paid') {
      return NextResponse.json({ error: 'Deposit has not been paid yet' }, { status: 400 })
    }

    // Calculate remaining amount
    const remainingAmount = booking.total_price - (booking.deposit_amount || 0)

    if (remainingAmount <= 0) {
      return NextResponse.json({ error: 'No remaining balance' }, { status: 400 })
    }

    const serviceName = serviceType === 'mix' ? 'Mix & Master' : 'Studio Session'

    // Create a Stripe checkout session for the final payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: booking.email,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${serviceName} — Final Payment`,
            description: `Remaining balance for your ${serviceName.toLowerCase()} booking.`,
          },
          unit_amount: Math.round(remainingAmount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?type=${serviceType}&payment=final`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${serviceType === 'mix' ? 'mixing' : 'studio'}`,
      metadata: {
        service_type: serviceType,
        booking_id: bookingId,
        payment_type: 'final',
        total_price: booking.total_price.toString(),
        remaining_amount: remainingAmount.toString()
      }
    })

    // Update booking with payment link
    await supabaseAdmin
      .from(table)
      .update({
        payment_status: 'invoice_sent',
        payment_link_url: session.url
      })
      .eq('id', bookingId)

    // Send invoice email
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.email,
        subject: `Final Invoice: ${serviceName} — €${remainingAmount.toFixed(2)} Due`,
        html: generateInvoiceEmailHTML({
          serviceName,
          customerName: booking.name,
          remainingAmount: remainingAmount.toFixed(2),
          paymentUrl: session.url
        })
      })
    } catch (emailError) {
      console.error('Error sending invoice email:', emailError)
      // Don't fail the request, link is still created
    }

    return NextResponse.json({
      success: true,
      paymentUrl: session.url,
      amount: remainingAmount
    })
  } catch (error) {
    console.error('Send invoice error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
