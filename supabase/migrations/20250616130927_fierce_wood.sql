/*
  # Phase 1: Email Integration Database Schema

  1. New Tables
    - `user_workspaces` - Personal workspaces for each user
    - `emails` - Email storage with full metadata
    - `email_sync_status` - Track sync progress and status

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Automatic workspace creation on user signup

  3. Performance
    - Indexes for email search and filtering
    - Full-text search capability
    - Optimized for Phase 1 Gmail integration
*/

-- User workspaces table
CREATE TABLE IF NOT EXISTS user_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_name text NOT NULL,
  email_providers text[] DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  storage_used bigint DEFAULT 0,
  storage_limit bigint DEFAULT 10737418240, -- 10GB default
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id) -- One workspace per user for Phase 1
);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id text PRIMARY KEY, -- Format: provider_messageId
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  provider_message_id text NOT NULL,
  thread_id text,
  subject text NOT NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  recipient_email text NOT NULL,
  body text NOT NULL,
  timestamp timestamptz NOT NULL,
  is_read boolean DEFAULT false,
  is_important boolean DEFAULT false,
  labels text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider_message_id, user_id) -- Prevent duplicates per user
);

-- Email sync status table
CREATE TABLE IF NOT EXISTS email_sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  last_sync timestamptz DEFAULT now(),
  sync_status text NOT NULL CHECK (sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
  emails_total integer DEFAULT 0,
  emails_synced integer DEFAULT 0,
  last_history_id text,
  next_page_token text,
  sync_metadata jsonb DEFAULT '{}',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider) -- One sync status per provider per user
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_timestamp ON emails(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emails_provider ON emails(provider);
CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails(is_read);
CREATE INDEX IF NOT EXISTS idx_emails_is_important ON emails(is_important);
CREATE INDEX IF NOT EXISTS idx_emails_labels ON emails USING GIN(labels);
CREATE INDEX IF NOT EXISTS idx_emails_search ON emails USING GIN(to_tsvector('english', subject || ' ' || body));

-- RLS Policies
ALTER TABLE user_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sync_status ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage their own workspace"
  ON user_workspaces FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own emails"
  ON emails FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sync status"
  ON email_sync_status FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_workspaces_updated_at BEFORE UPDATE ON user_workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_sync_status_updated_at BEFORE UPDATE ON email_sync_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user workspace on signup
CREATE OR REPLACE FUNCTION create_user_workspace()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_workspaces (user_id, workspace_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create workspace on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_workspace();