-- 00_init.sql
-- Enable required extensions and set database configurations

-- 1. Enable pg_net for Edge Function calls via HTTP
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- 2. Enable pg_cron for automated tasks (e.g., database cleanup)
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;

-- 3. Set the Supabase Anon Key for use in triggers
-- Replace 'YOUR_ANON_KEY' with your actual anon key if running manually
ALTER DATABASE postgres SET "app.supabase_anon_key" = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZWtsdXdkemltdHppZ3VndnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTk3ODUsImV4cCI6MjA5NDA3NTc4NX0.XjJKLgI2tG9h7C_eCgMQ24lVACHZ1TNbeInSlyMyg2g';
