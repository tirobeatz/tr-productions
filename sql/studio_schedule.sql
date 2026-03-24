-- Weekly studio schedule table
-- Each row represents one day of the week (0=Sunday through 6=Saturday)
CREATE TABLE IF NOT EXISTS studio_schedule (
  id BIGSERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_hour INTEGER CHECK (open_hour >= 0 AND open_hour <= 23),
  close_hour INTEGER CHECK (close_hour >= 1 AND close_hour <= 24),
  break_start INTEGER,
  break_end INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default schedule (Mon-Sat 10-22, Sunday closed)
INSERT INTO studio_schedule (day_of_week, is_open, open_hour, close_hour) VALUES
  (0, false, NULL, NULL),  -- Sunday: closed
  (1, true, 10, 22),       -- Monday
  (2, true, 10, 22),       -- Tuesday
  (3, true, 10, 22),       -- Wednesday
  (4, true, 10, 22),       -- Thursday
  (5, true, 10, 22),       -- Friday
  (6, true, 10, 22)        -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- Enable RLS
ALTER TABLE studio_schedule ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can see when studio is open)
CREATE POLICY "Public can read schedule" ON studio_schedule FOR SELECT USING (true);

-- Allow service role to manage schedule
CREATE POLICY "Service role can manage schedule" ON studio_schedule FOR ALL USING (true) WITH CHECK (true);
