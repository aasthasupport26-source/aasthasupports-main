CREATE TABLE IF NOT EXISTS revoked_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revoked_tokens_hash ON revoked_tokens(token_hash);
CREATE INDEX idx_revoked_tokens_expires ON revoked_tokens(expires_at);
