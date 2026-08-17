-- Admin audit logging table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_email ON admin_audit_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON admin_audit_log(resource_type, resource_id);

-- Add comment
COMMENT ON TABLE admin_audit_log IS 'Audit trail for all admin actions';

-- Auto-cleanup old audit logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_audit_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
