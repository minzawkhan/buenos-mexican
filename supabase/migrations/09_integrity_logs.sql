-- 09_integrity_logs.sql
-- Database tables to monitor system integrity and logs

-- 1. Create booking_attempts table
CREATE TABLE IF NOT EXISTS public.booking_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid,
  customer_name text NOT NULL,
  email text,
  db_status text NOT NULL, -- e.g. '✅ 201 Created', '❌ 409 Slot Conflict', '❌ 500 Error'
  realtime_sync text NOT NULL, -- e.g. '✅ Success', '➖ Skipped'
  line_notification text NOT NULL, -- e.g. '✅ Sent (200 OK)', '❌ Failed (401)', '➖ Skipped', '⏳ Sending...'
  created_at timestamptz DEFAULT now()
);

-- 2. Create vip_signup_attempts table
CREATE TABLE IF NOT EXISTS public.vip_signup_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  status text NOT NULL, -- e.g. 'Success', '409 Duplicate', 'Failed: ...'
  created_at timestamptz DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.booking_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_signup_attempts ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for booking_attempts
DROP POLICY IF EXISTS "Allow anon manage booking_attempts" ON public.booking_attempts;
CREATE POLICY "Allow anon manage booking_attempts" 
ON public.booking_attempts FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 5. Create Policies for vip_signup_attempts
DROP POLICY IF EXISTS "Allow anon manage vip_signup_attempts" ON public.vip_signup_attempts;
CREATE POLICY "Allow anon manage vip_signup_attempts" 
ON public.vip_signup_attempts FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Register tables with Supabase Realtime
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_attempts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vip_signup_attempts;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Ignore if already registered
END $$;
