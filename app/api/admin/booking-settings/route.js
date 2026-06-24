import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS for trusted admin writes
// Lazy-initialized to prevent crash when env vars are missing at build time
let _supabaseAdmin = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const { data, error } = await supabaseAdmin
    .from('booking_settings')
    .select('max_bookings_per_slot, updated_at')
    .eq('id', 1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const val = parseInt(body.max_bookings_per_slot, 10);

  if (!Number.isInteger(val) || val < 1 || val > 500) {
    return NextResponse.json(
      { error: 'max_bookings_per_slot must be an integer between 1 and 500' },
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const { data, error } = await supabaseAdmin
    .from('booking_settings')
    .update({ max_bookings_per_slot: val, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select('max_bookings_per_slot, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, ...data });
}
