-- 12_authenticated_booking_management.sql
-- Grant authenticated (logged-in admin) users the same booking access as anon.
-- Previously only anon policies existed; after Supabase auth login the client
-- uses the authenticated role, so queries were silently blocked by RLS.

DROP POLICY IF EXISTS "Allow authenticated select bookings" ON public.bookings;
CREATE POLICY "Allow authenticated select bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated update bookings" ON public.bookings;
CREATE POLICY "Allow authenticated update bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete bookings" ON public.bookings;
CREATE POLICY "Allow authenticated delete bookings"
ON public.bookings FOR DELETE
TO authenticated
USING (true);
