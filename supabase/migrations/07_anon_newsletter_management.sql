-- 07_anon_newsletter_management.sql
-- Allow anonymous users to select and manage newsletter subscribers for the admin dashboard
-- Note: In a production environment, the admin dashboard should be secured behind an authentication wall.

DROP POLICY IF EXISTS "Allow anon manage subscribers" ON public.subscribers;
CREATE POLICY "Allow anon manage subscribers" 
ON public.subscribers FOR ALL 
TO anon 
USING (true)
WITH CHECK (true);
