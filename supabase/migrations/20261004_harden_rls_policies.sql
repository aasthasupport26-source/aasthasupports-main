-- ============================================================================
-- RLS HARDENING — run this in the Supabase SQL editor (or supabase db push)
-- ============================================================================
-- WHY THIS EXISTS:
-- supabase/schema.sql creates policies like
--   CREATE POLICY "Service role access users" ON public.users
--     FOR ALL USING (true) WITH CHECK (true);
-- A policy with no `TO <role>` clause applies to anon/authenticated too, so
-- these four policies turned RLS into a NO-OP: anyone with the public anon
-- key could read every user (incl. password_hash), every booking (names,
-- phones, gotra, sankalp), and UPDATE any row — including setting their own
-- is_admin = true. The 20260831 RLS migration added stricter policies but
-- never dropped these permissive ones.
--
-- This migration drops them and re-creates least-privilege policies. All
-- server code uses the service-role key, so service_role policies keep every
-- server function working unchanged.
-- ============================================================================

-- ─── 1. Drop the permissive base-schema policies (the actual vulnerability) ──

DROP POLICY IF EXISTS "Service role access users" ON public.users;
DROP POLICY IF EXISTS "Service role access temples" ON public.temples;
DROP POLICY IF EXISTS "Service role access pujas" ON public.pujas;
DROP POLICY IF EXISTS "Service role access pooja_bookings" ON public.pooja_bookings;

-- Drop any policies from earlier partial migrations that we replace below
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_service" ON public.users;
DROP POLICY IF EXISTS "users_select_admin" ON public.users;

-- ─── 2. Make sure RLS is enabled on every sensitive table ────────────────────

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temples            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pujas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pooja_bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sankalp_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revoked_tokens     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;

-- Tables that may exist depending on which migrations were applied
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webhook_events') THEN
    ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_leads') THEN
    ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ─── 3. Catalog tables: public read-only, writes via service role only ──────

CREATE POLICY "public_read_temples" ON public.temples
  FOR SELECT TO anon, authenticated USING (active = true);

CREATE POLICY "public_read_pujas" ON public.pujas
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "public_read_packages" ON public.packages
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "service_role_temples" ON public.temples
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_pujas" ON public.pujas
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_packages" ON public.packages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── 4. Sensitive tables: service role ONLY (no anon/authenticated access) ──
-- users, pooja_bookings, booking_payments, bookings, members tables, settings,
-- audit/security tables and contact submissions are read/written exclusively
-- by server functions using the service-role key.

CREATE POLICY "service_role_users" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_pooja_bookings" ON public.pooja_bookings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_booking_payments" ON public.booking_payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_bookings" ON public.bookings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_booking_members" ON public.booking_members
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_sankalp_members" ON public.sankalp_members
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_settings" ON public.settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_admin_audit_log" ON public.admin_audit_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_revoked_tokens" ON public.revoked_tokens
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_security_events" ON public.security_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_contact_submissions" ON public.contact_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- The admin leads page tracks follow-up state per submission
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';

CREATE POLICY "service_role_categories" ON public.categories
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── 5. Optional tables (present only if those migrations ran) ───────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    EXECUTE 'CREATE POLICY "service_role_orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
    EXECUTE 'CREATE POLICY "service_role_order_items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webhook_events') THEN
    EXECUTE 'CREATE POLICY "service_role_webhook_events" ON public.webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_leads') THEN
    EXECUTE 'CREATE POLICY "service_role_contact_leads" ON public.contact_leads FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- ─── 6. Verify (run manually): ───────────────────────────────────────────────
--   SELECT tablename, policyname, roles, cmd FROM pg_policies
--    WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- No policy should be missing a `roles` restriction on sensitive tables, and
-- the four "Service role access *" policies must be gone.
