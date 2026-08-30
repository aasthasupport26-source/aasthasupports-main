-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- This migration enables Row Level Security on all sensitive tables
-- and creates policies to ensure users can only access their own data
--
-- CRITICAL: This must be applied before production deployment
-- ============================================================================

-- ─── Enable RLS on all sensitive tables ────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pooja_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE revoked_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- ─── Users Table Policies ───────────────────────────────────────────────────

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (
    id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR id = auth.uid()::text
  );

-- Users can update their own profile (not admin status)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (
    id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR id = auth.uid()::text
  )
  WITH CHECK (
    id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR id = auth.uid()::text
  );

-- Service role (server) can insert new users
CREATE POLICY "users_insert_service" ON users
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Admins can view all users
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin_check
      WHERE admin_check.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND admin_check.is_admin = true
    )
  );

-- ─── Pooja Bookings Table Policies ──────────────────────────────────────────

-- Users can view their own bookings
CREATE POLICY "bookings_select_own" ON pooja_bookings
  FOR SELECT
  USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_id = auth.uid()::text
  );

-- Service role can insert bookings (server-side only for payment verification)
CREATE POLICY "bookings_insert_service" ON pooja_bookings
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Admins can view all bookings
CREATE POLICY "bookings_select_admin" ON pooja_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.is_admin = true
    )
  );

-- Admins can update bookings (for status changes)
CREATE POLICY "bookings_update_admin" ON pooja_bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.is_admin = true
    )
  );

-- ─── Booking Payments Table Policies ────────────────────────────────────────

-- Users can view their own payments (via booking relationship)
CREATE POLICY "payments_select_own" ON booking_payments
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM pooja_bookings
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      OR user_id = auth.uid()::text
    )
  );

-- Service role can insert payments (server-side only)
CREATE POLICY "payments_insert_service" ON booking_payments
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Admins can view all payments
CREATE POLICY "payments_select_admin" ON booking_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.is_admin = true
    )
  );

-- ─── Admin Audit Log Policies ───────────────────────────────────────────────

-- Only admins can view audit logs
CREATE POLICY "audit_select_admin" ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.is_admin = true
    )
  );

-- Service role can insert audit logs
CREATE POLICY "audit_insert_service" ON admin_audit_log
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ─── Revoked Tokens Table Policies ──────────────────────────────────────────

-- Service role can read revoked tokens (for token verification)
CREATE POLICY "revoked_tokens_select_service" ON revoked_tokens
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Service role can insert revoked tokens
CREATE POLICY "revoked_tokens_insert_service" ON revoked_tokens
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ─── Contact Submissions Policies ───────────────────────────────────────────

-- Anyone can insert contact submissions
CREATE POLICY "contact_insert_public" ON contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view contact submissions
CREATE POLICY "contact_select_admin" ON contact_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.is_admin = true
    )
  );

-- ─── Public Read Tables (No RLS restrictions) ───────────────────────────────

-- These tables are public read (catalogs)
-- RLS is not enabled on these as they are public information:
-- - temples
-- - pujas
-- - packages

COMMENT ON TABLE temples IS 'Public catalog - no RLS required';
COMMENT ON TABLE pujas IS 'Public catalog - no RLS required';
COMMENT ON TABLE packages IS 'Public catalog - no RLS required';

-- ─── Verification Queries ───────────────────────────────────────────────────

-- Run these to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- View all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE schemaname = 'public';
