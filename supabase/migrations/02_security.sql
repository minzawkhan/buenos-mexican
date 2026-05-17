-- 02_security.sql
-- Enable RLS and define access policies

-- 1. Enable RLS on all tables
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 2. Bookings Policies
DROP POLICY IF EXISTS "Allow public inserts" ON public.bookings;
CREATE POLICY "Allow public inserts" 
ON public.bookings FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
CREATE POLICY "Customers can view own bookings" 
ON public.bookings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can manage all bookings" ON public.bookings;
CREATE POLICY "Staff can manage all bookings" 
ON public.bookings FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'staff')
  )
);

-- 3. Tables Policies
DROP POLICY IF EXISTS "Tables are viewable by everyone" ON public.tables;
CREATE POLICY "Tables are viewable by everyone" 
ON public.tables FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Staff can manage tables" ON public.tables;
CREATE POLICY "Staff can manage tables" 
ON public.tables FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'staff')
  )
);

-- 4. Customers Policies
DROP POLICY IF EXISTS "Customers can manage own profile" ON public.customers;
CREATE POLICY "Customers can manage own profile" 
ON public.customers FOR ALL 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can view all customers" ON public.customers;
CREATE POLICY "Staff can view all customers" 
ON public.customers FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'staff')
  )
);
