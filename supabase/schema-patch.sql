-- ============================================
-- Aastha Support — Schema Patch
-- Run AFTER the base schema.sql
-- Adds missing columns and tables that the application code expects.
-- Safe to run multiple times (all statements are idempotent).
-- ============================================

-- 1. Add missing columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Add missing 'amount' column to booking_payments (code inserts into 'amount')
-- The schema has base_amount, processing_fee, total_amount but the booking code
-- uses a simplified 'amount' field. Add it as an alias.
ALTER TABLE public.booking_payments ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2);
ALTER TABLE public.booking_payments ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';

-- 3. Add missing indexes for pooja_bookings
CREATE INDEX IF NOT EXISTS idx_pooja_bookings_user_id ON public.pooja_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_pooja_bookings_status ON public.pooja_bookings(status);
CREATE INDEX IF NOT EXISTS idx_pooja_bookings_booking_number ON public.pooja_bookings(booking_number);

-- Notify schema cache reload
NOTIFY pgrst, 'reload schema';
