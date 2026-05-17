// @ts-nocheck
/// <reference lib="deno.ns" />

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = 'Buenos Mexican Cuisine <onboarding@resend.dev>';

// LINE Config
const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
const LINE_MANAGER_USER_ID = Deno.env.get('LINE_MANAGER_USER_ID');

// Google Sheets Config
const GOOGLE_SHEET_WEBHOOK_URL = Deno.env.get('GOOGLE_SHEET_WEBHOOK_URL'); // Easier for low-code sync

interface Booking {
  name: string;
  email: string;
  date: string;
  time: string;
  party_size: string | number;
  status: string;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  record: Booking;
  old_record?: Booking;
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const booking = payload.record;

    if (!booking) {
      return new Response(JSON.stringify({ error: 'No booking record found' }), { status: 400 });
    }

    const { name, email, date, time, party_size, status } = booking;
    const isUpdate = payload.type === 'UPDATE';

    // Format date
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format time (HH:MM from "HH:MM:SS")
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const formattedTime = `${h12}:${minutes} ${ampm}`;

    // Define content based on status
    let subject = '';
    let statusHeadline = '';
    let statusIcon = '';
    let statusColor = '';
    let message = '';

    if (status === 'confirmed') {
      subject = `✅ Booking Confirmed — ${formattedDate} at ${formattedTime}`;
      statusHeadline = 'Your Table is Confirmed!';
      statusIcon = '✅';
      statusColor = '#33691E'; // Green
      message = "Your reservation is all set — we can't wait to host you!";
    } else if (status === 'cancelled') {
      subject = `❌ Booking Cancelled — Buenos Mexican Cuisine`;
      statusHeadline = 'Reservation Cancelled';
      statusIcon = '❌';
      statusColor = '#8B1C1C'; // Red
      message = "We're sorry to hear you can't make it. Your reservation has been successfully cancelled.";
    } else {
      subject = `🕒 Booking Received — ${formattedDate} at ${formattedTime}`;
      statusHeadline = 'Reservation Received';
      statusIcon = '🕒';
      statusColor = '#f97316'; // Orange
      message = "We've received your booking request! Our team will review it and confirm your table shortly.";
    }

    // 1. Send Email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusHeadline} — Buenos Mexican Cuisine</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4ecd8;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:40px auto;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(62,39,35,0.18);">
          <div style="background-color:#3E2723;padding:36px 40px 28px;text-align:center;">
            <div style="font-size:1.8rem;color:#ffffff;letter-spacing:1px;font-weight:900;">Buenos Mexican Cuisine</div>
          </div>
          <div style="background-color:${statusColor};padding:14px 40px;text-align:center;">
            <p style="color:#ffffff;margin:0;font-weight:700;font-size:1rem;">${statusIcon} &nbsp; ${statusHeadline}</p>
          </div>
          <div style="background:#ffffff;padding:40px;">
            <p style="font-size:1.15rem;color:#3E2723;margin:0 0 6px;">Hello, <strong>${name}</strong>! 🌮</p>
            <p style="color:#5D4037;line-height:1.75;margin:0 0 32px;">${message}</p>
            
            <div style="background:#f4ecd8;border-radius:12px;padding:28px;border-left:5px solid #8B1C1C;margin-bottom:28px;">
              <p style="font-size:1rem;font-weight:700;color:#8B1C1C;margin:0 0 18px;text-transform:uppercase;">📋 Reservation Details</p>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;">👤 Name</td><td style="text-align:right;">${name}</td></tr>
                <tr><td style="padding:8px 0;">📅 Date</td><td style="text-align:right;">${formattedDate}</td></tr>
                <tr><td style="padding:8px 0;">🕐 Time</td><td style="text-align:right;">${formattedTime}</td></tr>
                <tr><td style="padding:8px 0;">👥 Guests</td><td style="text-align:right;">${party_size}</td></tr>
                <tr><td style="padding:8px 0;">📍 Status</td><td style="text-align:right; font-weight: bold; color: ${statusColor};">${status.toUpperCase()}</td></tr>
              </table>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: subject,
        html: emailHtml,
      }),
    });

    // 2. Send LINE Notification
    if (LINE_CHANNEL_ACCESS_TOKEN && LINE_MANAGER_USER_ID) {
      const lineMessage = isUpdate 
        ? `🔄 Booking Updated!\n\n👤 Name: ${name}\n📍 New Status: ${status.toUpperCase()}\n📅 Date: ${date}\n🕐 Time: ${formattedTime}`
        : `🔔 New Booking Alert!\n\n👤 Name: ${name}\n📅 Date: ${date}\n🕐 Time: ${formattedTime}\n👥 Guests: ${party_size}\n📧 Email: ${email}`;

      await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: LINE_MANAGER_USER_ID,
          messages: [{ type: 'text', text: lineMessage }],
        }),
      }).catch(err => console.error('LINE Notification Error:', err));
    }

    // 3. Sync to Google Sheets (Only on INSERT or meaningful updates)
    if (GOOGLE_SHEET_WEBHOOK_URL) {
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          operation: payload.type,
          ...booking,
          formatted_time: formattedTime,
          formatted_date: formattedDate
        }),
      }).catch(err => console.error('Google Sheets Sync Error:', err));
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

