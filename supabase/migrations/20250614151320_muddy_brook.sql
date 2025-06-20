-- Clean migration that handles existing objects properly

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist and recreate them
DO $$ BEGIN
    DROP TYPE IF EXISTS user_role CASCADE;
    CREATE TYPE user_role AS ENUM ('admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS activity_type CASCADE;
    CREATE TYPE activity_type AS ENUM ('login', 'logout', 'profile_update', 'admin_action');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS email_permissions CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  role user_role DEFAULT 'admin',
  organization_id uuid REFERENCES organizations(id),
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT true,
  last_login timestamptz,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity logs
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Email permissions
CREATE TABLE email_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  can_read_all boolean DEFAULT true,
  can_send boolean DEFAULT true,
  can_delete boolean DEFAULT true,
  can_manage_users boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_permissions ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (allow all for authenticated users)
CREATE POLICY "Allow authenticated users full access to organizations"
  ON organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to user_profiles"
  ON user_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to activity_logs"
  ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to email_permissions"
  ON email_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Function to create admin account
CREATE OR REPLACE FUNCTION public.create_admin_account(
    admin_email text,
    admin_password text,
    admin_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
    default_org_id uuid;
    existing_count integer;
BEGIN
    -- Validate inputs
    IF admin_email IS NULL OR admin_email = '' THEN
        RETURN json_build_object('success', false, 'error', 'Email is required');
    END IF;
    
    IF admin_password IS NULL OR admin_password = '' THEN
        RETURN json_build_object('success', false, 'error', 'Password is required');
    END IF;
    
    IF admin_name IS NULL OR admin_name = '' THEN
        RETURN json_build_object('success', false, 'error', 'Name is required');
    END IF;
    
    -- Check if any users already exist
    SELECT COUNT(*) INTO existing_count FROM user_profiles;
    
    IF existing_count > 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Admin account already exists'
        );
    END IF;
    
    -- Get or create default organization
    SELECT id INTO default_org_id FROM organizations LIMIT 1;
    
    IF default_org_id IS NULL THEN
        INSERT INTO organizations (name, domain, settings) 
        VALUES ('ISDC Foods', 'isdc-foods.com.au', '{}')
        RETURNING id INTO default_org_id;
    END IF;
    
    -- Generate unique user ID
    new_user_id := gen_random_uuid();
    
    -- Create user in auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        json_build_object('full_name', admin_name, 'role', 'admin'),
        now(),
        now(),
        '',
        '',
        '',
        ''
    );
    
    -- Create user profile
    INSERT INTO user_profiles (
        id, 
        email, 
        full_name, 
        email_verified,
        organization_id,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        admin_email,
        admin_name,
        true,
        default_org_id,
        'admin',
        true,
        now(),
        now()
    );
    
    -- Create email permissions
    INSERT INTO email_permissions (
        user_id, 
        can_read_all, 
        can_send, 
        can_delete, 
        can_manage_users,
        created_at,
        updated_at
    ) VALUES (
        new_user_id, 
        true, 
        true, 
        true, 
        true,
        now(),
        now()
    );
    
    -- Log the creation
    INSERT INTO activity_logs (
        user_id, 
        activity_type, 
        description, 
        metadata,
        created_at
    ) VALUES (
        new_user_id, 
        'admin_action', 
        'Admin account created',
        json_build_object('admin_email', admin_email),
        now()
    );
    
    RETURN json_build_object(
        'success', true,
        'user_id', new_user_id,
        'message', 'Admin account created successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_admin_account(text, text, text) TO anon, authenticated;

-- Create default organization
INSERT INTO organizations (name, domain, settings) 
VALUES ('ISDC Foods', 'isdc-foods.com.au', '{"email_domain": "isdc-foods.com.au"}')
ON CONFLICT (domain) DO NOTHING;