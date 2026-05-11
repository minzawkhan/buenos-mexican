-- 1. Create table
create table if not exists public.bookings (id uuid default gen_random_uuid() primary key, name text not null, email text not null, date date not null, time time not null, party_size text not null, status text default 'pending', created_at timestamptz default now());
