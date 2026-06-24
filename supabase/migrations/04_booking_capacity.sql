-- 04_booking_capacity.sql
-- Update create_booking RPC to check capacity, prevent double-bookings, and suggest fallback times
-- Key features:
--   • FOR UPDATE SKIP LOCKED prevents race conditions on concurrent bookings
--   • Smart allocation assigns smallest available table matching party size
--   • Alternative times are sorted by proximity to the originally requested time

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
  v_party_int int;
  v_current_bookings int;
  v_max_bookings int := 10; -- Max bookings allowed per time slot on any given day
  
  -- Operating hours for alternative suggestions (17:00 to 00:30)
  v_operating_hours time[] := ARRAY[
    '17:00'::time, '17:30'::time, '18:00'::time, '18:30'::time, '19:00'::time,
    '19:30'::time, '20:00'::time, '20:30'::time, '21:00'::time, '21:30'::time,
    '22:00'::time, '22:30'::time, '23:00'::time, '23:30'::time, '00:00'::time, '00:30'::time
  ];
  v_alt_time time;
  v_alt_table_id uuid;
  v_alt_bookings int;
  v_suggested_times text[] := ARRAY[]::text[];

  -- For proximity-sorted alternative time generation
  v_sorted_alternatives time[] := ARRAY[]::time[];
  v_later_idx int;
  v_earlier_idx int;
  v_req_idx int;
  v_oh_len int;
BEGIN
  v_party_int := (regexp_replace(p_party_size, '\D', '', 'g'))::int;

  -- 1. Check total booking count for the slot
  SELECT COUNT(*)
  INTO v_current_bookings
  FROM public.bookings b
  WHERE b.date = p_date AND b.time = p_time AND b.status != 'cancelled';

  -- 2. Find the smallest available table with row-level locking
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

  -- Fallback: If no exclusive table is found but booking limit is not reached, assign any matching active table (sharing allowed)
  IF v_table_id IS NULL THEN
    SELECT t.id INTO v_table_id
    FROM public.tables t
    WHERE t.is_active = true
      AND t.capacity >= v_party_int
    ORDER BY t.capacity ASC
    LIMIT 1;
  END IF;

  -- Defensive Fallback: If still no table, assign any active table
  IF v_table_id IS NULL THEN
    SELECT t.id INTO v_table_id
    FROM public.tables t
    WHERE t.is_active = true
    LIMIT 1;
  END IF;

  -- 3. If total booking count is >= 10 OR no table is available at all, it's FULL
  IF v_current_bookings >= v_max_bookings OR v_table_id IS NULL THEN
    
    -- Build a proximity-sorted list of alternative times
    -- Find the index of the requested time in operating_hours
    v_oh_len := array_length(v_operating_hours, 1);
    v_req_idx := NULL;
    FOR i IN 1..v_oh_len LOOP
      IF v_operating_hours[i] = p_time THEN
        v_req_idx := i;
        EXIT;
      END IF;
    END LOOP;

    -- If the requested time isn't in operating hours, fall back to sequential order
    IF v_req_idx IS NULL THEN
      v_sorted_alternatives := v_operating_hours;
    ELSE
      -- Interleave: pick next later slot, then next earlier slot, alternating
      -- This produces alternatives closest to the requested time first
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

    -- Generate up to 4 available fallback times from the sorted list
    FOREACH v_alt_time IN ARRAY v_sorted_alternatives LOOP
      IF array_length(v_suggested_times, 1) >= 4 THEN
         EXIT;
      END IF;

      -- Skip the exact same time
      IF v_alt_time = p_time THEN
        CONTINUE;
      END IF;

      -- Check total bookings for alternative time
      SELECT COUNT(*)
      INTO v_alt_bookings
      FROM public.bookings b
      WHERE b.date = p_date AND b.time = v_alt_time AND b.status != 'cancelled';

      -- Check table availability for alternative time
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

      -- Fallback to sharing table for alt time if needed
      IF v_alt_table_id IS NULL THEN
        SELECT id INTO v_alt_table_id
        FROM public.tables t
        WHERE t.is_active = true
          AND t.capacity >= v_party_int
        ORDER BY t.capacity ASC
        LIMIT 1;
      END IF;

      -- If booking limit is fine (< 10) and a table is found, add to suggestions
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

  -- 4. Insert the booking atomically
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

-- 5. Exception handling with distinct codes for race condition collisions
EXCEPTION 
  WHEN unique_violation THEN
    -- A concurrent transaction managed to insert for the same table/slot
    -- Return a distinct error so the API can respond with HTTP 409
    RETURN jsonb_build_object(
      'error', 'DOUBLE_BOOKING_CONFLICT',
      'message', 'This slot was just taken by another customer. Please try again.'
    );
  WHEN others THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
