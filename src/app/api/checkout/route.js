import { NextResponse } from 'next/server'
import { stripe, LICENSE_DETAILS } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { beatId, licenseType, customerEmail } = await request.json()

    // Validate inputs
    if (!beatId || !licenseType || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate license type
    if (!LICENSE_DETAILS[licenseType]) {
      return NextResponse.json(
        { error: 'Invalid license type' },
        { status: 400 }
      )
    }

    // Fetch beat from database
    const { data: beat, error: beatError } = await supabase
      .from('beats')
      .select('*')
      .eq('id', beatId)
      .single()

    if (beatError || !beat) {
      return NextResponse.json(
        { error: 'Beat not found' },
        { status: 404 }
      )
    }

    // Check if beat is sold (for exclusive purchases)
    if (beat.is_sold && licenseType === 'exclusive') {
      return NextResponse.json(
        { error: 'This beat has already been sold exclusively' },
        { status: 400 }
      )
    }

    // Get price based on license type
    const priceKey = `price_${licenseType === 'unlimited' ? 'stems' : licenseType}`
    const price = beat[priceKey]

    if (!price) {
      return NextResponse.json(
        { error: 'Price not available for this license' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${beat.title} - ${LICENSE_DETAILS[licenseType].name}`,
              description: LICENSE_DETAILS[licenseType].description,
              images: beat.image_url ? [beat.image_url] : [],
              metadata: {
                beat_id: beatId,
                license_type: licenseType
              }
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/beats`,
      metadata: {
        beat_id: beatId,
        license_type: licenseType,
        beat_title: beat.title
      }
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
