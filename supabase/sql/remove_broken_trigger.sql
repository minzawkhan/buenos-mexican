-- Remove the broken trigger that uses pg_net (not available on this plan)
drop trigger if exists on_booking_created on public.bookings;
drop function if exists notify_booking_email();
drop function if exists public.notify_booking_email();
