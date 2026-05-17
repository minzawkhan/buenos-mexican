-- 01_schema.sql
-- Define tables, indexes, and initial seed data

-- 1. Tables Table
CREATE TABLE IF NOT EXISTS public.tables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  capacity int NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Customers Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  party_size text NOT NULL,
  status text DEFAULT 'pending',
  user_id uuid REFERENCES auth.users,
  table_id uuid REFERENCES public.tables,
  created_at timestamptz DEFAULT now()
);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_table_id ON public.bookings(table_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON public.bookings(date, time);

-- 5. Seed Initial Tables
INSERT INTO public.tables (name, capacity) VALUES
('Table 1', 2),
('Table 2', 2),
('Table 3', 4),
('Table 4', 4),
('Table 5', 6),
('Table 6', 6),
('Window Table 1', 2),
('Window Table 2', 2),
('VIP Booth', 8)
ON CONFLICT DO NOTHING;
