drop policy if exists "Allow public inserts" on public.bookings;
drop policy if exists "Allow all inserts" on public.bookings;
alter table public.bookings disable row level security;
