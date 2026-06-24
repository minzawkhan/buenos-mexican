-- 08_email_tracking.sql
-- Create email tracking tables for Resend and Supabase

-- 1. Create email_blasts table
CREATE TABLE IF NOT EXISTS public.email_blasts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  html_content text NOT NULL,
  status text NOT NULL DEFAULT 'sending', -- 'sending', 'completed', 'failed'
  total_sent integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- 2. Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blast_id uuid REFERENCES public.email_blasts(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  resend_id text UNIQUE,
  status text NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'bounced'
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Add status column to subscribers table
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.email_blasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- For email_blasts
DROP POLICY IF EXISTS "Allow anon manage email_blasts" ON public.email_blasts;
CREATE POLICY "Allow anon manage email_blasts" 
ON public.email_blasts FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- For email_logs
DROP POLICY IF EXISTS "Allow anon manage email_logs" ON public.email_logs;
CREATE POLICY "Allow anon manage email_logs" 
ON public.email_logs FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Add tables to Supabase Realtime Publication
-- This allows the frontend to listen to progress updates and webhook status changes in real-time
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_blasts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_logs;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Ignore if tables are already in the publication
END $$;
