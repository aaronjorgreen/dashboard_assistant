
-- Add `is_temporary_password` flag to user_profiles if not exists
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_temporary_password BOOLEAN DEFAULT FALSE;

-- Update policy to allow users to update their own temporary password flag
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;

CREATE POLICY "Users can manage their own profile"
  ON user_profiles FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow INSERT for invited users
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
