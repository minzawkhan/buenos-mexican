-- 03_business_logic.sql
-- Define functions, triggers, and automated tasks
-- NOTE: The create_booking RPC is defined in 04_booking_capacity.sql

-- 1. Function to notify edge function via HTTP post
CREATE OR REPLACE FUNCTION public.notify_booking_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'type',    TG_OP,
    'table',   TG_TABLE_NAME,
    'schema',  TG_TABLE_SCHEMA,
    'record',  row_to_json(NEW)::jsonb
  );

  PERFORM net.http_post(
    url     := 'https://tgekluwdzimtzigugvvw.supabase.co/functions/v1/send-booking-email',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
    ),
    body    := payload
  );

  RETURN NEW;
END;
$$;

-- 2. Trigger for booking notifications
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
CREATE TRIGGER on_booking_created
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_booking_email();

