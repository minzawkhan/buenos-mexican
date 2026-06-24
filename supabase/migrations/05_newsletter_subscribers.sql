-- 05_newsletter_subscribers.sql
-- Create subscribers table and security policies

CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to subscribe (insert)
DROP POLICY IF EXISTS "Allow public to subscribe" ON public.subscribers;
CREATE POLICY "Allow public to subscribe" 
ON public.subscribers FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow public to update their own subscription status (unsubscribe) via email lookup
-- Note: Usually this requires an unauthenticated endpoint to update status.
-- We will allow updates if the email matches. To prevent abuse, a secure token is usually better, 
-- but for MVP, we allow public updates based on email matching (or via Edge Function with service key).
-- Let's rely on the Edge Function/API Route (using service_role key) to handle unsubscribes, 
-- so public update policy is not needed if using server-side logic.
-- So we only allow staff to select/update.

DROP POLICY IF EXISTS "Staff can manage subscribers" ON public.subscribers;
CREATE POLICY "Staff can manage subscribers" 
ON public.subscribers FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'staff')
  )
);
