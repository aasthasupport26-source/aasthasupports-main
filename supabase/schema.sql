-- ============================================
-- Aastha Support - Complete Unified Database Schema
-- Run this script in the Supabase SQL Editor
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Enums & Types
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_mode AS ENUM ('online', 'in_person');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status_enum AS ENUM (
    'Draft', 'Pending Payment', 'Paid', 'Confirmed', 'Pandit Assigned',
    'Scheduled', 'Completed', 'Prasad Shipped', 'Delivered', 'Cancelled', 'Refunded'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('Pending', 'Authorized', 'Captured', 'Failed', 'Refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE media_type_enum AS ENUM ('Photo', 'Video', 'Live Recording', 'Invoice');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Users & Roles Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 2. Temples Table
CREATE TABLE IF NOT EXISTS public.temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  state VARCHAR(255),
  description TEXT,
  image VARCHAR(1024),
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Pujas / Poojas Table
CREATE TABLE IF NOT EXISTS public.pujas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES public.temples(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  base_price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  image_url TEXT,
  pandit_name TEXT,
  pandit_info TEXT,
  location TEXT,
  timing_info TEXT,
  benefits TEXT,
  includes TEXT,
  shopify_product_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alias view or table public.poojas for backward compatibility
CREATE TABLE IF NOT EXISTS public.poojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 60,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category TEXT,
  image_url TEXT,
  pandit_name TEXT,
  pandit_info TEXT,
  location TEXT,
  timing_info TEXT,
  benefits TEXT,
  includes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puja_id UUID NOT NULL REFERENCES public.pujas(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  video BOOLEAN DEFAULT false,
  photo BOOLEAN DEFAULT false,
  prasad BOOLEAN DEFAULT false,
  live_call BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  shopify_variant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Pooja Bookings Table (Primary operational table)
CREATE TABLE IF NOT EXISTS public.pooja_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  devotee_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  gotra TEXT,
  pooja_type TEXT NOT NULL,
  preferred_date DATE,
  sankalp TEXT,
  notes TEXT,
  amount NUMERIC(10, 2),
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Legacy / Detailed Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  gotra VARCHAR(100),
  dob DATE,
  birth_time TIME,
  birth_place VARCHAR(255),
  rashi VARCHAR(100),
  nakshatra VARCHAR(100),
  temple_id UUID REFERENCES public.temples(id),
  puja_id UUID REFERENCES public.pujas(id),
  package_id UUID REFERENCES public.packages(id),
  booking_date DATE NOT NULL,
  time_slot VARCHAR(100),
  special_wish TEXT,
  video_required BOOLEAN DEFAULT false,
  photo_required BOOLEAN DEFAULT false,
  live_required BOOLEAN DEFAULT false,
  prasad_required BOOLEAN DEFAULT false,
  prasad_address TEXT,
  booking_status booking_status_enum DEFAULT 'Draft',
  assigned_pandit UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Booking Members / Sankalp Members Table
CREATE TABLE IF NOT EXISTS public.booking_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  relation VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sankalp_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.pooja_bookings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Booking Payments Table
CREATE TABLE IF NOT EXISTS public.booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  base_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  processing_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  gst DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  gateway VARCHAR(50) NOT NULL DEFAULT 'razorpay',
  gateway_order_id VARCHAR(255),
  gateway_payment_id VARCHAR(255),
  gateway_signature VARCHAR(512),
  status payment_status_enum DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Settings
INSERT INTO public.settings (key, value, description)
VALUES 
  ('processing_fee_percent', '2.0', 'Convenience fee added to cover payment gateway charges'),
  ('currency', 'INR', 'Default transaction currency'),
  ('default_gateway', 'razorpay', 'Default payment gateway')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pujas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pooja_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Service Role Policies (Full access)
DROP POLICY IF EXISTS "Service role access users" ON public.users;
CREATE POLICY "Service role access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access temples" ON public.temples;
CREATE POLICY "Service role access temples" ON public.temples FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access pujas" ON public.pujas;
CREATE POLICY "Service role access pujas" ON public.pujas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access pooja_bookings" ON public.pooja_bookings;
CREATE POLICY "Service role access pooja_bookings" ON public.pooja_bookings FOR ALL USING (true) WITH CHECK (true);

-- Public Read Policies
DROP POLICY IF EXISTS "Public read temples" ON public.temples;
CREATE POLICY "Public read temples" ON public.temples FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public read pujas" ON public.pujas;
CREATE POLICY "Public read pujas" ON public.pujas FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public read packages" ON public.packages;
CREATE POLICY "Public read packages" ON public.packages FOR SELECT USING (true);

-- Trigger Function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_temples_updated_at ON public.temples;
CREATE TRIGGER update_temples_updated_at BEFORE UPDATE ON public.temples FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pujas_updated_at ON public.pujas;
CREATE TRIGGER update_pujas_updated_at BEFORE UPDATE ON public.pujas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pooja_bookings_updated_at ON public.pooja_bookings;
CREATE TRIGGER update_pooja_bookings_updated_at BEFORE UPDATE ON public.pooja_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notify Schema Cache Reload
NOTIFY pgrst, 'reload schema';
