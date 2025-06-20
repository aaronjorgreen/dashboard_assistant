/*
  # Reset Admin Password Function

  1. New Function
    - `reset_admin_password` - Allows resetting admin password with temporary password
    - Generates secure temporary password
    - Sets expiration date
    - Logs the password reset activity

  2. Security
    - Only works for existing admin accounts
    - Temporary password expires in 24 hours
    - Activity logging for security audit
*/

-- Function to reset admin password with temporary password
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
    temp_password text;
BEGIN
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
    temp_password := generate_temp_password();
    
    -- Update auth.users with new temporary password
    UPDATE auth.users 
    SET 
        encrypted_password = crypt(temp_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = user_record.id;
    
    -- Update user profile with temporary password info
    UPDATE user_profiles 
    SET 
        temp_password = temp_password,
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
        user_record.id, 
        'admin_action', 
        'Admin password reset',
        json_build_object(
            'admin_email', admin_email,
            'reset_method', 'temporary_password',
            'temp_password_expires', now() + interval '24 hours'
        ),
        now()
    );
    
    RETURN json_build_object(
        'success', true,
        'temp_password', temp_password,
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

-- Grant permission to execute the function
GRANT EXECUTE ON FUNCTION public.reset_admin_password(text) TO anon, authenticated;

-- Execute the password reset for aaron@vertexvista.com.au
SELECT public.reset_admin_password('aaron@vertexvista.com.au');