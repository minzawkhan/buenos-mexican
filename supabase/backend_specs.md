# Backend Specifications

## Overview
The backend for Buenos Mexican Cuisine is built on **Supabase**, utilizing PostgreSQL for data storage, Row Level Security (RLS) for access control, and Edge Functions for external integrations (Email, LINE, Google Sheets).

## Database Migrations
The database is structured using consolidated migration files for better maintainability:

1.  **[00_init.sql](file:///c:/Buenos%20Mexican/supabase/migrations/00_init.sql)**: Extension initialization and global settings.
2.  **[01_schema.sql](file:///c:/Buenos%20Mexican/supabase/migrations/01_schema.sql)**: Core tables (`tables`, `customers`, `bookings`) and indexes.
3.  **[02_security.sql](file:///c:/Buenos%20Mexican/supabase/migrations/02_security.sql)**: RLS policies and access control.
4.  **[03_business_logic.sql](file:///c:/Buenos%20Mexican/supabase/migrations/03_business_logic.sql)**: Database functions, triggers, and RPC logic.

## Database Schema

### `public.bookings`
Stores all table reservation requests.

| Column | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | `gen_random_uuid()` | Unique identifier |
| `name` | `text` | - | Customer full name |
| `email` | `text` | - | Customer email address |
| `date` | `date` | - | Reservation date |
| `time` | `time` | - | Reservation time |
| `party_size` | `text` | - | Number of guests |
| `status` | `text` | `'pending'` | Current status: `pending`, `confirmed`, `cancelled` |
| `created_at` | `timestamptz` | `now()` | Timestamp of creation |

## Security (RLS)
- **Insert**: Allowed for `anon` users (public website form).
- **Select/Update/Delete**: Restricted to authenticated admin users (staff/admin role).

## Triggers & Automation

### `on_booking_created`
- **Type**: `AFTER INSERT OR UPDATE`
- **Condition**: Fires when a new row is added or when the `status` column is updated.
- **Action**: Calls the `send-booking-email` Edge Function with the full record payload.

## Edge Functions

### `send-booking-email`
Handles external notifications based on booking events.
- **Email (Resend)**: Sends status-specific emails to the customer.
- **LINE (Bot)**: Sends push notifications to the restaurant manager.
- **Google Sheets**: Syncs reservation data for offline management/analytics.

## Environment Variables
- `RESEND_API_KEY`: API key for email delivery.
- `LINE_CHANNEL_ACCESS_TOKEN`: Token for LINE Messaging API.
- `LINE_MANAGER_USER_ID`: Recipient ID for manager alerts.
- `GOOGLE_SHEET_WEBHOOK_URL`: Target for data sync.
