
-- Email Accounts table for OAuth sync
create table if not exists email_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  workspace_id uuid references workspaces not null,
  email_address text,
  refresh_token text,
  access_token text,
  token_expiry timestamp,
  created_at timestamp default now()
);

-- RLS policies for email_accounts
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own email accounts"
  ON email_accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own email accounts"
  ON email_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
