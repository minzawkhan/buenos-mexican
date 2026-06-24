-- 06_anon_booking_management.sql
-- Allow anonymous users to manage bookings for the admin dashboard
-- Note: In a production environment, the admin dashboard should be secured behind an authentication wall.

DROP POLICY IF EXISTS "Allow anon update bookings" ON public.bookings;
CREATE POLICY "Allow anon update bookings" 
ON public.bookings FOR UPDATE 
TO anon 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete bookings" ON public.bookings;
CREATE POLICY "Allow anon delete bookings" 
ON public.bookings FOR DELETE 
TO anon 
USING (true);

DROP POLICY IF EXISTS "Allow anon select bookings" ON public.bookings;
CREATE POLICY "Allow anon select bookings" 
ON public.bookings FOR SELECT 
TO anon 
USING (true);
