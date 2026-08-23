-- Add unique constraints to prevent duplicate payment records
-- This prevents double-spending attacks and payment replay

-- Add unique constraint on gateway_payment_id
ALTER TABLE booking_payments 
  ADD CONSTRAINT unique_gateway_payment_id UNIQUE (gateway_payment_id);

-- Add unique constraint on gateway_order_id
ALTER TABLE booking_payments 
  ADD CONSTRAINT unique_gateway_order_id UNIQUE (gateway_order_id);

-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);

-- Add comment
COMMENT ON TABLE webhook_events IS 'Stores processed webhook event IDs to prevent replay attacks';
