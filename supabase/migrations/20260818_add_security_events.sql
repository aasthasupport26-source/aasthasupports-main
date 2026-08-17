-- Security events table for persistent tracking
-- Stores security-related events like brute force attempts, suspicious activity

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  identifier TEXT,
  attempts INTEGER,
  locked_until TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_identifier ON security_events(identifier);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- Add comment
COMMENT ON TABLE security_events IS 'Security events log for monitoring and alerting';
