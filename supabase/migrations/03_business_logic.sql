-- 03_business_logic.sql
-- Define functions, triggers, and automated tasks

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
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZWtsdXdkemltdHppZ3VndnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTk3ODUsImV4cCI6MjA5NDA3NTc4NX0.XjJKLgI2tG9h7C_eCgMQ24lVACHZ1TNbeInSlyMyg2g'
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

-- 3. RPC Function for atomic booking creation with concurrency control
CREATE OR REPLACE FUNCTION public.create_booking(
  p_name text,
  p_email text,
  p_date date,
  p_time time,
  p_party_size text,
  p_user_id uuid DEFAULT null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_table_id uuid;
  v_booking_id uuid;
BEGIN
  -- Find an available table for the given date, time and capacity
  SELECT id INTO v_table_id
  FROM public.tables t
  WHERE t.is_active = true
    AND t.capacity >= (regexp_replace(p_party_size, '\D', '', 'g'))::int
    AND NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.table_id = t.id
        AND b.date = p_date
        AND b.time = p_time
        AND b.status != 'cancelled'
    )
  ORDER BY t.capacity ASC
  LIMIT 1;

  IF v_table_id IS NULL THEN
    RETURN jsonb_build_object('error', 'No tables available for this time and party size');
  END IF;

  -- Insert the booking
  INSERT INTO public.bookings (
    name, email, date, time, party_size, user_id, table_id, status
  ) VALUES (
    p_name, p_email, p_date, p_time, p_party_size, p_user_id, v_table_id, 'pending'
  )
  RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'table_id', v_table_id
  );

EXCEPTION WHEN others THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
