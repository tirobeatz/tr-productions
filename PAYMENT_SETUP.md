# Payment System Setup Guide

This guide walks you through setting up the payment system for TR Productions beat store.

## Overview

The payment system includes:
- **Stripe** for secure payment processing
- **Resend** for sending emails with download links
- **Supabase** for storing orders and file downloads
- **PDFKit** for generating license agreements

---

## 1. Install Required Packages

Run this command in your project directory:

```bash
npm install stripe resend pdfkit
```

---

## 2. Environment Variables

Add these to your `.env.local` file:

```env
# ===================
# STRIPE
# ===================
# Get these from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ===================
# RESEND (Email)
# ===================
# Get this from https://resend.com/api-keys
RESEND_API_KEY=re_xxx
FROM_EMAIL=TR Productions <hello@trproductions.de>

# ===================
# SUPABASE
# ===================
# You should already have these
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
# Get service role key from Supabase Dashboard > Settings > API
SUPABASE_SERVICE_ROLE_KEY=xxx

# ===================
# SITE URL
# ===================
NEXT_PUBLIC_SITE_URL=https://trproductions.de

# ===================
# DOWNLOAD TOKEN
# ===================
# Generate a random string for signing download tokens
DOWNLOAD_TOKEN_SECRET=your-random-secret-key-here
```

---

## 3. Supabase Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  license_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'eur',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  download_token TEXT,
  download_expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_download_token ON orders(download_token);

-- Add columns to beats table for file URLs (if not already present)
ALTER TABLE beats ADD COLUMN IF NOT EXISTS wav_url TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS stems_url TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS sold_to TEXT;

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role has full access to orders"
  ON orders
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (customer_email = auth.jwt() ->> 'email');
```

---

## 4. Stripe Webhook Setup

### For Local Development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
4. Copy the webhook secret shown and add to `.env.local`

### For Production (Vercel):

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://trproductions.de/api/webhook`
4. Select event: `checkout.session.completed`
5. Copy the signing secret to your Vercel environment variables

---

## 5. Resend Setup

1. Create account at https://resend.com
2. Verify your domain (Settings > Domains)
3. Create API key (API Keys > Create API Key)
4. Add to environment variables

---

## 6. Supabase Storage Setup

### Create Buckets:

1. Go to Supabase Dashboard > Storage
2. Create buckets:
   - `beats-mp3` - For MP3 files
   - `beats-wav` - For WAV files
   - `beats-stems` - For stems ZIP files

### Set Bucket Policies:

For each bucket, add this policy to allow authenticated downloads:

```sql
-- Allow public read access for beat files
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('beats-mp3', 'beats-wav', 'beats-stems'));

-- Allow service role to create signed URLs
CREATE POLICY "Service role upload access"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

### Upload Files:

When adding beats via admin panel, upload:
- MP3 to `beats-mp3/[beat-id].mp3`
- WAV to `beats-wav/[beat-id].wav`
- Stems to `beats-stems/[beat-id]_stems.zip`

Store the URLs in the `beats` table:
- `audio_url` - MP3 URL
- `wav_url` - WAV URL
- `stems_url` - Stems URL

---

## 7. Testing

### Test Card Numbers:

| Card | Number |
|------|--------|
| Success | 4242 4242 4242 4242 |
| Decline | 4000 0000 0000 0002 |
| 3D Secure | 4000 0027 6000 3184 |

Use any future expiry date and any 3-digit CVC.

### Test Flow:

1. Go to `/beats`
2. Click "Buy" on any beat
3. Select a license
4. Enter test email
5. Click "Proceed to Checkout"
6. Use test card number
7. Complete payment
8. Check:
   - Redirect to success page
   - Email received with download link
   - Order in Supabase `orders` table
   - Beat marked as sold (if exclusive)

---

## 8. File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.js      # Creates Stripe checkout session
│   │   ├── webhook/
│   │   │   └── route.js      # Handles Stripe webhook events
│   │   └── download/
│   │       └── route.js      # Serves file downloads
│   ├── beats/
│   │   └── page.js           # Beat store with checkout
│   └── purchase/
│       └── success/
│           └── page.js       # Success/download page
├── lib/
│   ├── stripe.js             # Stripe client & license details
│   ├── resend.js             # Resend email client
│   ├── supabase.js           # Client-side Supabase
│   ├── supabase-server.js    # Server-side Supabase (service role)
│   ├── license-pdf.js        # PDF license generator
│   └── download-token.js     # Secure download token utils
```

---

## 9. Going Live

When ready for production:

1. **Stripe:**
   - Switch to live API keys
   - Set up live webhook endpoint
   - Complete Stripe account verification

2. **Resend:**
   - Verify production domain
   - Use production API key

3. **Vercel:**
   - Add all environment variables to Vercel project settings
   - Ensure `NEXT_PUBLIC_SITE_URL` is your production URL

4. **Test:**
   - Make a real $1 test purchase
   - Verify entire flow works
   - Refund the test purchase

---

## Troubleshooting

### Webhook not receiving events:
- Check webhook URL is correct
- Verify webhook secret matches
- Check Stripe webhook logs

### Email not sending:
- Verify Resend API key
- Check domain verification
- Look at Resend logs

### Download link expired:
- Default expiry is 7 days
- Customer can contact you for new link

### PDF not generating:
- Check PDFKit is installed
- Verify server has enough memory

---

## Support

Questions? Contact: support@trproductions.de
