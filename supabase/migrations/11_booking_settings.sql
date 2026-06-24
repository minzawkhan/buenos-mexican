-- 11_booking_settings.sql
-- Dynamic booking capacity managed via Admin Dashboard

-- 1. Singleton settings table (always exactly one row: id = 1)
CREATE TABLE IF NOT EXISTS public.booking_settings (
  id integer PRIMARY KEY DEFAULT 1,
  max_bookings_per_slot integer NOT NULL DEFAULT 10,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT booking_settings_singleton CHECK (id = 1)
);

-- 2. Seed default row
INSERT INTO public.booking_settings (id, max_bookings_per_slot)
VALUES (1, 10)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS — anyone can read (needed by admin dashboard fetch), only service role can write
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_read_booking_settings" ON public.booking_settings;
CREATE POLICY "allow_read_booking_settings" ON public.booking_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_service_role_update_booking_settings" ON public.booking_settings;
CREATE POLICY "allow_service_role_update_booking_settings" ON public.booking_settings
  FOR UPDATE USING (auth.role() = 'service_role');

-- 4. Replace create_booking RPC — reads limit dynamically from booking_settings
CREATE OR REPLACE FUNCTION public.create_booking(
  p_name text,
  p_email text,
  p_phone text,
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
  v_party_int int;
  v_current_bookings int;
  v_max_bookings int;

  v_operating_hours time[] := ARRAY[
    '17:00'::time, '17:30'::time, '18:00'::time, '18:30'::time, '19:00'::time,
    '19:30'::time, '20:00'::time, '20:30'::time, '21:00'::time, '21:30'::time,
    '22:00'::time, '22:30'::time, '23:00'::time, '23:30'::time, '00:00'::time, '00:30'::time
  ];
  v_alt_time time;
  v_alt_table_id uuid;
  v_alt_bookings int;
  v_suggested_times text[] := ARRAY[]::text[];

  v_sorted_alternatives time[] := ARRAY[]::time[];
  v_later_idx int;
  v_earlier_idx int;
  v_req_idx int;
  v_oh_len int;
BEGIN
  -- Fetch limit dynamically; fall back to 10 if table is missing or empty
  SELECT max_bookings_per_slot INTO v_max_bookings
  FROM public.booking_settings
  WHERE id = 1;

  IF v_max_bookings IS NULL THEN
    v_max_bookings := 10;
  END IF;

  v_party_int := (regexp_replace(p_party_size, '\D', '', 'g'))::int;

  -- 1. Count existing non-cancelled bookings for the requested slot
  SELECT COUNT(*)
  INTO v_current_bookings
  FROM public.bookings b
  WHERE b.date = p_date AND b.time = p_time AND b.status != 'cancelled';

  -- 2. Find smallest available table with row-level locking
  SELECT t.id INTO v_table_id
  FROM public.tables t
  WHERE t.is_active = true
    AND t.capacity >= v_party_int
    AND NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.table_id = t.id
        AND b.date = p_date
        AND b.time = p_time
        AND b.status != 'cancelled'
    )
  ORDER BY t.capacity ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- Fallback: allow table sharing if no exclusive table found
  IF v_table_id IS NULL THEN
    SELECT t.id INTO v_table_id
    FROM public.tables t
    WHERE t.is_active = true
      AND t.capacity >= v_party_int
    ORDER BY t.capacity ASC
    LIMIT 1;
  END IF;

  -- Defensive fallback: any active table
  IF v_table_id IS NULL THEN
    SELECT t.id INTO v_table_id
    FROM public.tables t
    WHERE t.is_active = true
    LIMIT 1;
  END IF;

  -- 3. Slot full — build proximity-sorted alternative times
  IF v_current_bookings >= v_max_bookings OR v_table_id IS NULL THEN

    v_oh_len := array_length(v_operating_hours, 1);
    v_req_idx := NULL;
    FOR i IN 1..v_oh_len LOOP
      IF v_operating_hours[i] = p_time THEN
        v_req_idx := i;
        EXIT;
      END IF;
    END LOOP;

    IF v_req_idx IS NULL THEN
      v_sorted_alternatives := v_operating_hours;
    ELSE
      v_later_idx := v_req_idx + 1;
      v_earlier_idx := v_req_idx - 1;
      WHILE (v_later_idx <= v_oh_len OR v_earlier_idx >= 1) LOOP
        IF v_later_idx <= v_oh_len THEN
          v_sorted_alternatives := array_append(v_sorted_alternatives, v_operating_hours[v_later_idx]);
          v_later_idx := v_later_idx + 1;
        END IF;
        IF v_earlier_idx >= 1 THEN
          v_sorted_alternatives := array_append(v_sorted_alternatives, v_operating_hours[v_earlier_idx]);
          v_earlier_idx := v_earlier_idx - 1;
        END IF;
      END LOOP;
    END IF;

    FOREACH v_alt_time IN ARRAY v_sorted_alternatives LOOP
      IF array_length(v_suggested_times, 1) >= 4 THEN EXIT; END IF;
      IF v_alt_time = p_time THEN CONTINUE; END IF;

      SELECT COUNT(*) INTO v_alt_bookings
      FROM public.bookings b
      WHERE b.date = p_date AND b.time = v_alt_time AND b.status != 'cancelled';

      SELECT id INTO v_alt_table_id
      FROM public.tables t
      WHERE t.is_active = true
        AND t.capacity >= v_party_int
        AND NOT EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.table_id = t.id
            AND b.date = p_date
            AND b.time = v_alt_time
            AND b.status != 'cancelled'
        )
      ORDER BY t.capacity ASC
      LIMIT 1;

      IF v_alt_table_id IS NULL THEN
        SELECT id INTO v_alt_table_id
        FROM public.tables t
        WHERE t.is_active = true
          AND t.capacity >= v_party_int
        ORDER BY t.capacity ASC
        LIMIT 1;
      END IF;

      IF v_alt_table_id IS NOT NULL AND v_alt_bookings < v_max_bookings THEN
        v_suggested_times := array_append(v_suggested_times, to_char(v_alt_time, 'HH24:MI'));
      END IF;
    END LOOP;

    RETURN jsonb_build_object(
      'error', 'TIME_SLOT_FULL',
      'message', 'We apologize, but the restaurant is fully booked at your requested time slot. We truly appreciate your understanding and respect your interest in dining with us!',
      'suggested_times', v_suggested_times
    );
  END IF;

  -- 4. Insert booking atomically
  INSERT INTO public.bookings (
    name, email, phone, date, time, party_size, user_id, table_id, status
  ) VALUES (
    p_name, p_email, p_phone, p_date, p_time, p_party_size, p_user_id, v_table_id, 'pending'
  )
  RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'table_id', v_table_id
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'error', 'DOUBLE_BOOKING_CONFLICT',
      'message', 'This slot was just taken by another customer. Please try again.'
    );
  WHEN others THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
