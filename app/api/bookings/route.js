import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// In-memory rate limiter Map: IP -> array of timestamps
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // Clean up expired entries across all IPs in the Map
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter(t => t > oneMinuteAgo);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, valid);
    }
  }

  // Check rate limit for this IP
  const userTimestamps = rateLimitMap.get(ip) || [];
  const activeTimestamps = userTimestamps.filter(t => t > oneMinuteAgo);

  if (activeTimestamps.length >= 3) {
    return true;
  }

  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);
  return false;
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
  if (!token) return false;

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`,
    });

    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.error('Turnstile verification request error:', err);
    return false;
  }
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    // 1. Rate Limiting Check
    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          error: 'Too many booking requests. Please wait a minute before trying again.',
          message: 'Too many booking requests. Please wait a minute before trying again.'
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, date, time, partySize, website, turnstileToken } = body;

    // 2. Honeypot Validation
    if (website) {
      console.warn(`[Bot Blocked] Honeypot filled by IP ${ip}. website = "${website}"`);
      await supabase.from('booking_attempts').insert([{
        customer_name: name || 'Bot Attempt',
        email: email || '',
        db_status: '❌ Bot Blocked (Honeypot)',
        realtime_sync: '➖ Skipped',
        line_notification: '➖ Skipped'
      }]);
      return NextResponse.json({
        success: true,
        booking_id: 'mock-bot-id-success',
        table_id: 'mock-bot-table-id'
      });
    }

    // 3. Turnstile Verification
    const isHuman = await verifyTurnstile(turnstileToken, ip);
    if (!isHuman) {
      await supabase.from('booking_attempts').insert([{
        customer_name: name || 'Verification Failed',
        email: email || '',
        db_status: '❌ Security Check Failed',
        realtime_sync: '➖ Skipped',
        line_notification: '➖ Skipped'
      }]);
      return NextResponse.json(
        { 
          error: 'Security check failed. Please refresh the page and try again.',
          message: 'Security check failed. Please refresh the page and try again.'
        },
        { status: 400 }
      );
    }

    // 4. Database Insertion
    const { data, error } = await supabase.rpc('create_booking', {
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_date: date,
      p_time: time,
      p_party_size: partySize,
    });

    if (error || (data && data.error)) {
      const errString = error?.message || data?.error || '';
      const message = data?.message || errString;
      const suggestedTimes = data?.suggested_times || [];
      
      const isConflict = 
        error?.status === 409 || 
        error?.code === '23505' ||
        errString.toLowerCase().includes('duplicate') ||
        errString.toLowerCase().includes('conflict') ||
        errString.toLowerCase().includes('unique constraint') ||
        message.toLowerCase().includes('duplicate') ||
        message.toLowerCase().includes('conflict') ||
        message.toLowerCase().includes('unique constraint');

      await supabase.from('booking_attempts').insert([{
        customer_name: name,
        email: email,
        db_status: isConflict ? '❌ 409 Slot Conflict' : `❌ Error: ${errString || message}`,
        realtime_sync: '➖ Skipped',
        line_notification: '➖ Skipped'
      }]);

      return NextResponse.json(
        { error: errString, message, suggested_times: suggestedTimes },
        { status: isConflict ? 409 : 400 }
      );
    }

    // Log successful booking
    await supabase.from('booking_attempts').insert([{
      booking_id: data.booking_id,
      customer_name: name,
      email: email,
      db_status: '✅ 201 Created',
      realtime_sync: '✅ Success',
      line_notification: '⏳ Sending...'
    }]);

    return NextResponse.json({
      success: true,
      booking_id: data.booking_id,
      table_id: data.table_id
    });

  } catch (err) {
    console.error('Booking API handler error:', err);
    const isConflict = 
      err?.status === 409 || 
      err?.code === '23505' ||
      err?.message?.toLowerCase().includes('duplicate') ||
      err?.message?.toLowerCase().includes('conflict') ||
      err?.message?.toLowerCase().includes('unique constraint');
      
    // Log unexpected errors
    try {
      const body = await request.clone().json().catch(() => ({}));
      await supabase.from('booking_attempts').insert([{
        customer_name: body.name || 'Unknown',
        email: body.email || '',
        db_status: `❌ 500 Error: ${err?.message || 'Unexpected'}`,
        realtime_sync: '➖ Skipped',
        line_notification: '➖ Skipped'
      }]);
    } catch (_) {}

    return NextResponse.json(
      { 
        error: err?.message || 'An unexpected error occurred. Please try again or call us directly.',
        message: err?.message || 'An unexpected error occurred. Please try again or call us directly.'
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}
