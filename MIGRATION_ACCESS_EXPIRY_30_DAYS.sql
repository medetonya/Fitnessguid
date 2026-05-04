-- Optional migration: 30-day access window for approved users
-- Safe to run multiple times (idempotent)

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_access_expires_at ON users(access_expires_at);

-- Backfill existing approved users who do not yet have a deadline.
UPDATE users
SET access_expires_at = NOW() + INTERVAL '30 days'
WHERE status = 'approved' AND access_expires_at IS NULL;

COMMIT;

-- Verification
-- SELECT email, status, access_expires_at FROM users ORDER BY created_at DESC;
