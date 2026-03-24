import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  }

  // Test Stripe import
  try {
    const Stripe = (await import('stripe')).default
    checks.stripe_import = 'OK'
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
    checks.stripe_init = 'OK'
  } catch (e) {
    checks.stripe_error = e.message
  }

  // Test Supabase import
  try {
    const { createClient } = await import('@supabase/supabase-js')
    checks.supabase_import = 'OK'
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    checks.supabase_init = 'OK'
  } catch (e) {
    checks.supabase_error = e.message
  }

  return NextResponse.json(checks)
}
