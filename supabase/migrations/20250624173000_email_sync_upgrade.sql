-- Migration: Email Sync Upgrade (Token Security + History Sync + AI Summaries)

-- 1. Encrypt refresh token
ALTER TABLE email_accounts
ADD COLUMN IF NOT EXISTS refresh_token_encrypted bytea;

-- Optional: You can NULL out or drop the old column later
-- ALTER TABLE email_accounts DROP COLUMN refresh_token;

-- 2. Track Gmail sync progress (last Gmail historyId)
ALTER TABLE email_sync_status
ADD COLUMN IF NOT EXISTS last_history_id text;

-- 3. Optional: Cache AI summaries of email threads
CREATE TABLE IF NOT EXISTS email_summaries (
  thread_id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  summary text,
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_summaries_user ON email_summaries(user_id);

-- RLS for safety
ALTER TABLE email_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can access their own summaries"
  ON email_summaries FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Create encryption RPC using pgp_sym_encrypt (requires pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.encrypt_refresh_token(token text)
RETURNS bytea
LANGUAGE sql
AS $$
  SELECT pgp_sym_encrypt(token, 'super-secret-key');
$$;

-- ⚠ Replace 'super-secret-key' with your real encryption key and manage securely
