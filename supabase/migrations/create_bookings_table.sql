-- Step 1: Create the bookings table
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  date date not null,
  time time not null,
  party_size text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.bookings enable row level security;

-- Allow public inserts (anon key from the website form)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'bookings' and policyname = 'Allow public inserts'
  ) then
    execute 'create policy "Allow public inserts" on public.bookings for insert to anon with check (true)';
  end if;
end$$;

-- Enable pg_net extension (needed to call HTTP from Postgres)
create extension if not exists pg_net schema extensions;

-- Step 2: Create the trigger function that calls our edge function
create or replace function public.notify_booking_email()
returns trigger language plpgsql security definer as $$
declare
  payload jsonb;
begin
  payload := jsonb_build_object(
    'type',    'INSERT',
    'table',   'bookings',
    'schema',  'public',
    'record',  row_to_json(NEW)::jsonb
  );

  perform extensions.http_post(
    url     := 'https://tgekluwdzimtzigugvvw.supabase.co/functions/v1/send-booking-email',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
    ),
    body    := payload
  );

  return NEW;
end;
$$;

-- Step 3: Attach the trigger to bookings table
drop trigger if exists on_booking_created on public.bookings;
create trigger on_booking_created
  after insert on public.bookings
  for each row execute function public.notify_booking_email();
