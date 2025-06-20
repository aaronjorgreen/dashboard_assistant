/*
  # Fix RLS Policies for Data Isolation

  1. Security Updates
    - Fix user_profiles RLS policy to ensure users can only access their own data
    - Maintain proper data isolation between admin workspaces
    - Ensure activity logs are properly scoped

  2. Data Integrity
    - Verify all policies enforce proper user isolation
    - Maintain admin functionality while securing data
*/

-- Fix the user_profiles RLS policy for proper data isolation
DROP POLICY IF EXISTS "Allow authenticated users full access to user_profiles" ON user_profiles;

CREATE POLICY "Users can manage their own profile"
  ON user_profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Update activity_logs policy to allow users to see their own logs
-- and admins to see all logs for admin functions
DROP POLICY IF EXISTS "Allow authenticated users full access to activity_logs" ON activity_logs;

CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs"
  ON activity_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all activity logs for admin panel functionality
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update email_permissions policy for better isolation
DROP POLICY IF EXISTS "Allow authenticated users full access to email_permissions" ON email_permissions;

CREATE POLICY "Users can manage their own email permissions"
  ON email_permissions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Organizations can be viewed by all authenticated users (for admin functions)
-- but only admins can modify them
DROP POLICY IF EXISTS "Allow authenticated users full access to organizations" ON organizations;

CREATE POLICY "All users can view organizations"
  ON organizations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify organizations"
  ON organizations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update organizations"
  ON organizations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete organizations"
  ON organizations FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add function to check if current user is admin (helper for policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Update the invite_admin_user function to use the helper
CREATE OR REPLACE FUNCTION public.invite_admin_user(
    invite_email text,
    invite_name text,
    invite_role user_role DEFAULT 'admin'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
    temp_password text;
    default_org_id uuid;
BEGIN
    -- Check if current user is admin using helper function
    IF NOT is_admin() THEN
        RETURN json_build_object('success', false, 'error', 'Only admins can invite users');
    END IF;
    
    -- Validate inputs
    IF invite_email IS NULL OR invite_email = '' THEN
        RETURN json_build_object('success', false, 'error', 'Email is required');
    END IF;
    
    IF invite_name IS NULL OR invite_name = '' THEN
        RETURN json_build_object('success', false, 'error', 'Name is required');
    END IF;
    
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM user_profiles WHERE email = invite_email) THEN
        RETURN json_build_object('success', false, 'error', 'User with this email already exists');
    END IF;
    
    -- Check if user already exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = invite_email) THEN
        RETURN json_build_object('success', false, 'error', 'An account with this email already exists');
    END IF;
    
    -- Get default organization
    SELECT id INTO default_org_id FROM organizations LIMIT 1;
    
    -- Generate temporary password
    temp_password := generate_temp_password();
    
    -- Generate unique user ID
    new_user_id := gen_random_uuid();
    
    -- Create user in auth.users with temporary password
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
        invite_email,
        crypt(temp_password, gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        json_build_object('full_name', invite_name, 'role', invite_role),
        now(),
        now(),
        '',
        '',
        '',
        ''
    );
    
    -- Create user profile with temporary password
    INSERT INTO user_profiles (
        id, 
        email, 
        full_name, 
        email_verified,
        organization_id,
        role,
        is_active,
        temp_password,
        temp_password_expires,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        invite_email,
        invite_name,
        true,
        default_org_id,
        invite_role,
        true,
        temp_password,
        now() + interval '7 days',
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
    
    -- Log the invitation
    INSERT INTO activity_logs (
        user_id, 
        activity_type, 
        description, 
        metadata,
        created_at
    ) VALUES (
        auth.uid(), 
        'admin_action', 
        'Admin user invited',
        json_build_object(
            'invited_email', invite_email,
            'invited_name', invite_name,
            'invited_role', invite_role,
            'temp_password_expires', now() + interval '7 days'
        ),
        now()
    );
    
    RETURN json_build_object(
        'success', true,
        'user_id', new_user_id,
        'temp_password', temp_password,
        'message', 'Admin user invited successfully. Temporary password expires in 7 days.'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- Update the reset_admin_password function to use the helper
CREATE OR REPLACE FUNCTION public.reset_admin_password(
    admin_email text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    profile_record user_profiles%ROWTYPE;
    new_temp_password text;
BEGIN
    -- Check if current user is admin (only admins can reset passwords)
    IF NOT is_admin() THEN
        RETURN json_build_object('success', false, 'error', 'Only admins can reset passwords');
    END IF;
    
    -- Validate input
    IF admin_email IS NULL OR admin_email = '' THEN
        RETURN json_build_object('success', false, 'error', 'Email is required');
    END IF;
    
    -- Find the user in auth.users
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF user_record.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'No account found with this email address');
    END IF;
    
    -- Check if user profile exists and is admin
    SELECT * INTO profile_record 
    FROM user_profiles 
    WHERE id = user_record.id;
    
    IF profile_record.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    IF profile_record.role != 'admin' THEN
        RETURN json_build_object('success', false, 'error', 'Only admin accounts can be reset');
    END IF;
    
    -- Generate temporary password
    new_temp_password := generate_temp_password();
    
    -- Update auth.users with new temporary password
    UPDATE auth.users 
    SET 
        encrypted_password = crypt(new_temp_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = user_record.id;
    
    -- Update user profile with temporary password info
    UPDATE user_profiles 
    SET 
        temp_password = new_temp_password,
        temp_password_expires = now() + interval '24 hours',
        updated_at = now()
    WHERE id = user_record.id;
    
    -- Log the password reset
    INSERT INTO activity_logs (
        user_id, 
        activity_type, 
        description, 
        metadata,
        created_at
    ) VALUES (
        auth.uid(), 
        'admin_action', 
        'Admin password reset',
        json_build_object(
            'target_admin_email', admin_email,
            'reset_method', 'temporary_password',
            'temp_password_expires', now() + interval '24 hours'
        ),
        now()
    );
    
    RETURN json_build_object(
        'success', true,
        'temp_password', new_temp_password,
        'expires_at', now() + interval '24 hours',
        'message', 'Temporary password generated successfully. It expires in 24 hours.'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.invite_admin_user(text, text, user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_admin_password(text) TO authenticated;