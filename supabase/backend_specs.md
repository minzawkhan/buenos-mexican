# Backend Specifications — Buenos Mexican

## Overview

The backend is built on **Supabase** (PostgreSQL + Realtime + Auth + Edge Functions). All booking logic runs inside a single PostgreSQL RPC function for atomicity. External notifications are handled by a Deno Edge Function triggered asynchronously via `pg_net`.

---

## Database Schema

Single source of truth: **`supabase/schema.sql`**

Run this file in Supabase SQL Editor to build the full database from scratch.

---

### Tables

#### `public.tables`
Physical restaurant tables available for assignment.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `name` | `text` | Table label (e.g. "Window Table 1") |
| `capacity` | `int` | Max guests |
| `is_active` | `boolean` | Whether table is in service |
| `created_at` | `timestamptz` | — |

Seeded with 9 tables (capacity 2–8). Duplicate set exists from initial migration; use `is_active = true` for all queries.

---

#### `public.bookings`
All reservation records.

| Column | Type | Default | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `name` | `text` | — | Customer full name |
| `email` | `text` | — | Customer email |
| `phone` | `text` | — | Customer phone |
| `date` | `date` | — | Reservation date |
| `time` | `time` | — | Reservation time |
| `party_size` | `text` | — | e.g. `"2 People"` |
| `user_id` | `uuid` | `null` | Auth user reference (optional) |
| `table_id` | `uuid` | — | Assigned table FK |
| `status` | `text` | `'pending'` | `pending` / `confirmed` / `cancelled` |
| `created_at` | `timestamptz` | `now()` | — |

---

#### `public.booking_settings`
Single-row configuration table (id = 1).

| Column | Type | Description |
|:---|:---|:---|
| `id` | `int` | Always 1 |
| `max_bookings_per_slot` | `int` | **Daily cap** — total bookings allowed per calendar day across all time slots |
| `updated_at` | `timestamptz` | Last modified |

> This is a **daily cap**, not a per-slot cap. The `create_booking` RPC counts `WHERE date = p_date` (not `AND time = p_time`).

---

#### `public.booking_attempts`
Audit log of every booking API call, regardless of outcome.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `booking_id` | `uuid` | FK to booking (successful attempts only) |
| `customer_name` | `text` | — |
| `email` | `text` | Used by the Supabase rate limiter layer |
| `db_status` | `text` | e.g. `✅ 201 Created`, `❌ Bot Blocked (Honeypot)` |
| `realtime_sync` | `text` | Pipeline status label |
| `line_notification` | `text` | Pipeline status label |
| `created_at` | `timestamptz` | Used for 5-minute rate limit window |

---

#### `public.subscribers`
Newsletter VIP subscribers.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `email` | `text` | Unique subscriber email |
| `is_active` | `boolean` | `false` = unsubscribed or hard bounced |
| `status` | `text` | `subscribed` / `bounced` / `failed` |
| `created_at` | `timestamptz` | — |

---

#### `public.email_blasts`
Newsletter campaign records.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `subject` | `text` | Email subject line |
| `html_content` | `text` | Full HTML body |
| `status` | `text` | `draft` / `sending` / `completed` |
| `total_count` | `int` | Total recipients |
| `delivered_count` | `int` | Confirmed delivered |
| `failed_count` | `int` | Bounced or failed |
| `sent_at` | `timestamptz` | When send started |
| `created_at` | `timestamptz` | — |

---

#### `public.email_logs`
Per-recipient delivery log for each campaign.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `blast_id` | `uuid` | FK to `email_blasts` |
| `subscriber_id` | `uuid` | FK to `subscribers` |
| `resend_id` | `text` | Resend message ID (used for webhook matching) |
| `status` | `text` | `sent` / `delivered` / `bounced` / `failed` |
| `error_message` | `text` | Bounce/failure reason |
| `updated_at` | `timestamptz` | Last webhook update |

---

## RPC: `public.create_booking`

The core booking function. Runs entirely in PostgreSQL for atomicity.

### Signature

```sql
create_booking(
  p_name        text,
  p_email       text,
  p_phone       text,
  p_date        date,
  p_time        time,
  p_party_size  text,
  p_user_id     uuid DEFAULT null
) RETURNS jsonb
```

### Logic

1. Read `max_bookings_per_slot` from `booking_settings` (default 10 if missing).
2. Parse party size integer from `p_party_size` string.
3. Pre-compute a proximity-sorted time array starting from `p_time` (later times first, then earlier, alternating outward).
4. Count total non-cancelled bookings for `p_date`.
5. **If daily cap reached** → scan next 7 days. For each day under cap, iterate the proximity-sorted times looking for a table with `capacity >= party_size`. Return up to 4 `{date, time}` suggestions as `suggested_slots`.
6. **If cap not reached** → find a table using `FOR UPDATE SKIP LOCKED`.
   - Falls back to any active table with sufficient capacity if no exclusive slot is available.
   - Falls back again to any active table if party size can't be matched.
7. **If no table found at requested time** → suggest nearby times on the same day (same proximity sort).
8. **If table found** → `INSERT` booking, return `{success, booking_id, table_id}`.

### Return Shape

```json
// Success
{ "success": true, "booking_id": "uuid", "table_id": "uuid" }

// Day full — cross-day suggestions
{
  "error": "TIME_SLOT_FULL",
  "message": "Ay caramba! ...",
  "suggested_slots": [
    { "date": "2026-06-27", "time": "19:00" },
    { "date": "2026-06-27", "time": "19:30" }
  ]
}

// Time slot full — same-day suggestions
{
  "error": "TIME_SLOT_FULL",
  "message": "Oof! Every table is taken at this time...",
  "suggested_slots": [
    { "date": "2026-06-25", "time": "18:30" }
  ]
}

// Exception
{ "error": "SQLERRM message" }
```

---

## Security (RLS)

| Table | anon | authenticated |
|:---|:---|:---|
| `bookings` | INSERT only | Full CRUD |
| `booking_attempts` | INSERT only | SELECT |
| `booking_settings` | SELECT only | UPDATE |
| `subscribers` | INSERT only | Full CRUD |
| `email_blasts` | — | Full CRUD |
| `email_logs` | — | Full CRUD |

---

## Triggers

### `on_booking_created`
- **Type**: `AFTER INSERT OR UPDATE ON public.bookings`
- **Condition**: Fires on insert, or when `status` changes.
- **Action**: Calls `notify_booking_email()` which uses `pg_net` to POST the booking record to the `send-booking-email` Edge Function asynchronously.

---

## Edge Function: `send-booking-email`

**Location**: `supabase/functions/send-booking-email/index.ts`  
**Runtime**: Deno (deployed on Supabase global edge)

Handles three notification channels based on booking status:

| Channel | Trigger | Payload |
|:---|:---|:---|
| **Resend email** | Any status | Status-specific HTML email to customer |
| **LINE Push** | Any status | Summary card to manager's LINE chat |
| **Google Sheets** | `confirmed` only | Append row via Apps Script webhook |

Google Sheets sync is restricted to confirmed bookings only to avoid polluting the sheet with unreviewed requests.

**Secrets required** (set via `supabase secrets set`):
```
RESEND_API_KEY
LINE_CHANNEL_ACCESS_TOKEN
LINE_MANAGER_USER_ID
GOOGLE_SHEET_WEBHOOK_URL
```

---

## API Routes

### `POST /api/bookings`

Booking submission pipeline:

1. In-memory rate check: 5 requests / 30s per IP
2. Supabase rate check: 3 attempts / 5 min per email (queries `booking_attempts`)
3. Monday closed-day check (returns 400 if `date.getDay() === 1`)
4. Honeypot check: `website` field must be empty
5. Cloudflare Turnstile verification
6. `create_booking` RPC call
7. Log result to `booking_attempts`

### `GET/POST /api/admin/booking-settings`

Read or update `max_bookings_per_slot` in `booking_settings`. Admin dashboard only.

### `POST /api/newsletter/send`

Throttled batch send to all active subscribers. Reads `subscribers WHERE is_active = true`, creates an `email_blasts` record, sends via Resend, and logs each send to `email_logs`.

### `POST /api/email-webhook`

Resend webhook receiver. Maps Resend event types to local statuses:
- `email.delivered` → `delivered`
- `email.bounced` → `bounced` (hard: deactivate subscriber; soft: keep active)
- `email.failed` → `failed` (deactivate subscriber)

Updates `email_logs` and `email_blasts` counters.

### `GET/POST /api/unsubscribe`

GET: Renders an HTML unsubscribe confirmation page.  
POST: Sets `is_active = false` and `status = 'unsubscribed'` for the subscriber matching the token.

---

## Auth

**Package**: `@supabase/ssr`

`lib/supabase.js` uses `createBrowserClient` which stores the Supabase session in cookies (not localStorage). This allows `proxy.js` to read and verify the session server-side on every request to `/admin/*`.

`proxy.js` (Next.js 16 equivalent of middleware):
- Uses `createServerClient` from `@supabase/ssr`
- Calls `supabase.auth.getUser()` to verify the JWT from cookies
- Unauthenticated → redirect to `/admin/login`
- Authenticated at `/admin/login` → redirect to `/admin`
