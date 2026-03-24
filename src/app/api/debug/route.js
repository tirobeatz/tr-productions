import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  }
  return NextResponse.json(checks)
}

export async function POST(request) {
  try {
    // Step 1: Parse body
    const body = await request.json()
    const step1 = 'body parsed'

    // Step 2: Import Stripe
    const Stripe = (await import('stripe')).default
    const step2 = 'stripe imported'

    // Step 3: Init Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
    const step3 = 'stripe initialized'

    // Step 4: Import Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const step4 = 'supabase imported'

    // Step 5: Init Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const step5 = 'supabase initialized'

    // Step 6: Query beat
    let step6 = 'skipped'
    let beat = null
    if (body.beatId) {
      const { data, error } = await supabaseAdmin
        .from('beats')
        .select('id, title, price_mp3, price_wav, price_stems, price_exclusive, image_url, is_sold')
        .eq('id', body.beatId)
        .single()
      step6 = error ? `error: ${error.message}` : `found: ${data?.title}`
      beat = data
    }

    // Step 7: Try creating Stripe session
    let step7 = 'skipped'
    if (beat && body.licenseType && body.customerEmail) {
      const priceKey = `price_${body.licenseType === 'unlimited' ? 'stems' : body.licenseType}`
      const price = beat[priceKey]
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trproductions.de'

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          customer_email: body.customerEmail,
          line_items: [{
            price_data: {
              currency: 'eur',
              product_data: {
                name: `${beat.title} - Test`,
              },
              unit_amount: Math.round((price || 1) * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${siteUrl}/beats`,
          cancel_url: `${siteUrl}/beats`,
          metadata: { beat_id: body.beatId, license_type: body.licenseType }
        })
        step7 = `session created: ${session.id}`
      } catch (stripeErr) {
        step7 = `stripe error: ${stripeErr.message}`
      }
    }

    return NextResponse.json({
      step1, step2, step3, step4, step5, step6, step7,
      beatId: body.beatId,
      licenseType: body.licenseType,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message, stack: error.stack?.split('\n').slice(0, 5) }, { status: 500 })
  }
}
