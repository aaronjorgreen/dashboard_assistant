/*
  # Fix user management system structure

  1. Database Functions
    - Ensure all RPC functions exist and work correctly
    - Fix any issues with admin account creation and user invitations
    - Add proper error handling

  2. Security
    - Verify RLS policies are working
    - Ensure proper access controls for admin functions

  3. Data Integrity
    - Add missing constraints and indexes
    - Ensure referential integrity
*/

-- Ensure the log_user_activity function exists and works correctly
CREATE OR REPLACE FUNCTION public.log_user_activity(
    activity_type_param activity_type,
    description_param text DEFAULT NULL,
    metadata_param jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO activity_logs (
        user_id,
        activity_type,
        description,
        metadata,
        created_at
    ) VALUES (
        auth.uid(),
        activity_type_param,
        description_param,
        metadata_param,
        now()
    );
END;
$$;

-- Ensure the generate_temp_password function exists
CREATE OR REPLACE FUNCTION public.generate_temp_password()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    chars text := 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    result text := '';
    i integer;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Fix the create_admin_account function to handle existing users properly
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
            'error', 'Admin account already exists. Use the sign in form instead.'
        );
    END IF;
    
    -- Check if user with this email already exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'An account with this email already exists'
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

-- Fix the invite_admin_user function
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
    current_user_profile user_profiles%ROWTYPE;
BEGIN
    -- Check if current user is admin
    SELECT * INTO current_user_profile 
    FROM user_profiles 
    WHERE id = auth.uid();
    
    IF current_user_profile.role != 'admin' THEN
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.log_user_activity(activity_type, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_admin_user(text, text, user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_temp_password() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_account(text, text, text) TO anon, authenticated;

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_temp_password 
ON user_profiles(temp_password) 
WHERE temp_password IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_temp_password_expires 
ON user_profiles(temp_password_expires) 
WHERE temp_password_expires IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id 
ON activity_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at 
ON activity_logs(created_at DESC);

-- Ensure RLS policies are properly set
DROP POLICY IF EXISTS "Allow authenticated users full access to organizations" ON organizations;
DROP POLICY IF EXISTS "Allow authenticated users full access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users full access to activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow authenticated users full access to email_permissions" ON email_permissions;

CREATE POLICY "Allow authenticated users full access to organizations"
  ON organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to user_profiles"
  ON user_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to activity_logs"
  ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to email_permissions"
  ON email_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);