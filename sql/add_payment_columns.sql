-- Add payment columns to mix_requests
ALTER TABLE mix_requests
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC,
ADD COLUMN IF NOT EXISTS deposit_stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS final_stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_link_url TEXT;

-- Add payment columns to studio_bookings
ALTER TABLE studio_bookings
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC,
ADD COLUMN IF NOT EXISTS deposit_stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS final_stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_link_url TEXT;

-- Add index for faster lookups on stripe session IDs
CREATE INDEX IF NOT EXISTS idx_mix_requests_deposit_session ON mix_requests(deposit_stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_mix_requests_final_session ON mix_requests(final_stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_studio_bookings_deposit_session ON studio_bookings(deposit_stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_studio_bookings_final_session ON studio_bookings(final_stripe_session_id);
