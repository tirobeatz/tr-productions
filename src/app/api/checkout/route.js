import { NextResponse } from 'next/server'

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'https://trproductions.de'
}

export async function POST(request) {
  try {
    // Check env vars before importing anything
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY)' }, { status: 500 })
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
    }

    // Dynamic imports to avoid module-level crashes
    const Stripe = (await import('stripe')).default
    const { createClient } = await import('@supabase/supabase-js')

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const body = await request.json()

    // Route to service checkout if serviceType is present
    if (body.serviceType) {
      return handleServiceCheckout(stripe, body)
    }

    return handleBeatCheckout(stripe, supabaseAdmin, body)
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

const LICENSE_DETAILS = {
  mp3: { name: 'MP3 Lease', description: 'MP3 file with up to 50,000 streams. 20% publishing split to producer.' },
  wav: { name: 'WAV Lease', description: 'WAV + MP3 files with up to 100,000 streams. 20% publishing split to producer.' },
  unlimited: { name: 'Stems License', description: 'WAV + MP3 + Stems with up to 250,000 streams. 20% publishing split to producer.' },
  exclusive: { name: 'Exclusive Rights', description: 'Full exclusive ownership. 20% publishing split to producer.' }
}

async function handleBeatCheckout(stripe, supabaseAdmin, { beatId, licenseType, customerEmail }) {
  if (!beatId || !licenseType || !customerEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!LICENSE_DETAILS[licenseType]) {
    return NextResponse.json({ error: 'Invalid license type' }, { status: 400 })
  }

  const { data: beat, error: beatError } = await supabaseAdmin
    .from('beats')
    .select('*')
    .eq('id', beatId)
    .single()

  if (beatError || !beat) {
    return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
  }

  if (beat.is_sold && licenseType === 'exclusive') {
    return NextResponse.json({ error: 'This beat has already been sold exclusively' }, { status: 400 })
  }

  const priceKey = `price_${licenseType === 'unlimited' ? 'stems' : licenseType}`
  const price = beat[priceKey]

  if (!price) {
    return NextResponse.json({ error: 'Price not available for this license' }, { status: 400 })
  }

  if (licenseType === 'exclusive') {
    const { data: reservedBeat } = await supabaseAdmin
      .from('beats')
      .select('id')
      .eq('id', beatId)
      .eq('is_sold', false)
      .single()

    if (!reservedBeat) {
      return NextResponse.json({ error: 'This beat has already been sold exclusively' }, { status: 400 })
    }
  }

  const siteUrl = getSiteUrl()

  const sessionConfig = {
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${beat.title} - ${LICENSE_DETAILS[licenseType].name}`,
          description: LICENSE_DETAILS[licenseType].description,
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${siteUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/beats`,
    metadata: {
      beat_id: beatId,
      license_type: licenseType,
      beat_title: beat.title
    }
  }

  if (beat.image_url && beat.image_url.startsWith('https://')) {
    sessionConfig.line_items[0].price_data.product_data.images = [beat.image_url]
  }

  const session = await stripe.checkout.sessions.create(sessionConfig)
  return NextResponse.json({ sessionId: session.id, url: session.url })
}

async function handleServiceCheckout(stripe, { serviceType, bookingId, customerEmail, totalPrice, serviceName }) {
  if (!serviceType || !bookingId || !customerEmail || !totalPrice) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['mix', 'studio'].includes(serviceType)) {
    return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
  }

  const depositAmount = Math.round(totalPrice / 2)
  const siteUrl = getSiteUrl()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${serviceName || (serviceType === 'mix' ? 'Mix & Master' : 'Studio Session')} - 50% Deposit`,
          description: serviceType === 'mix'
            ? 'Mix & Master - 50% deposit. Remaining balance due upon delivery.'
            : 'Studio Session - 50% deposit. Remaining balance due on session day.',
        },
        unit_amount: Math.round(depositAmount * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${siteUrl}/booking/success?type=${serviceType}&id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/${serviceType === 'mix' ? 'mixing' : 'studio'}`,
    metadata: {
      service_type: serviceType,
      booking_id: bookingId,
      payment_type: 'deposit',
      total_price: totalPrice.toString(),
      deposit_amount: depositAmount.toString()
    }
  })

  return NextResponse.json({ sessionId: session.id, url: session.url })
}
