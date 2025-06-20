import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile, isSupabaseConfigured } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';

export function useAuth() {
  const { dispatch } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - no database required
      console.log('Running in demo mode - no database connection');
      setLoading(false);
      return;
    }

    // Real database mode
    initializeAuth();
  }, [dispatch]);

  const initializeAuth = async () => {
    if (!supabase) return;

    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setProfile(null);
            dispatch({ type: 'SET_USER', payload: null });
          }
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (!data) {
        console.log('No user profile found for user:', userId);
        setProfile(null);
        dispatch({ type: 'SET_USER', payload: null });
        return;
      }

      setProfile(data);
      
      // Update app context
      dispatch({
        type: 'SET_USER',
        payload: {
          id: data.id,
          email: data.email,
          name: data.full_name,
          avatar: data.avatar_url,
          role: data.role,
          isAuthenticated: true,
        }
      });

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      // Log login activity
      await supabase.rpc('log_user_activity', {
        activity_type_param: 'login',
        description_param: 'User signed in',
        metadata_param: { login_method: 'email' }
      });

    } catch (error: any) {
      console.error('Error loading user profile:', error);
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    
    try {
      if (!isSupabaseConfigured() || !supabase) {
        // Demo mode - create mock user
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
          id: 'demo-admin-' + Date.now(),
          email: email,
          name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          avatar: null,
          role: 'admin' as const,
          isAuthenticated: true,
        };

        const mockProfile: UserProfile = {
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.name,
          avatar_url: null,
          role: 'admin',
          is_active: true,
          temp_password: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setProfile(mockProfile);
        setUser(mockUser as any);
        dispatch({ type: 'SET_USER', payload: mockUser });

        return { data: { user: mockUser }, error: null };
      }

      // Real authentication
      console.log('🔐 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('❌ Auth error:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          return { data: null, error: 'Invalid email or password. Please check your credentials.' };
        }
        return { data: null, error: 'Unable to sign in. Please try again.' };
      }

      console.log('✅ Auth successful, checking for temporary password...');

      // CRITICAL: Check if user has temporary password IMMEDIATELY after successful auth
      if (data.user) {
        console.log('🔍 Checking for temporary password for user:', data.user.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('temp_password, temp_password_expires, full_name, email')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('❌ Error checking user profile:', profileError);
          return { data: null, error: 'Error loading user profile' };
        }

        console.log('📋 Profile data:', {
          hasProfile: !!profileData,
          hasTempPassword: !!profileData?.temp_password,
          tempPasswordExpires: profileData?.temp_password_expires
        });

        if (profileData?.temp_password) {
          console.log('🔑 User has temporary password, checking expiration...');
          
          // Check if temp password is expired
          if (profileData.temp_password_expires && new Date(profileData.temp_password_expires) < new Date()) {
            console.log('⏰ Temporary password has expired');
            await supabase.auth.signOut();
            return { 
              data: null, 
              error: 'Your temporary password has expired. Please contact an administrator for a new invitation.' 
            };
          }
          
          console.log('✅ Temporary password is valid, requiring password change');
          
          // DO NOT sign out - keep the user authenticated but require password change
          return { 
            data, 
            error: null, 
            requiresPasswordChange: true,
            message: 'Please create a permanent password to complete your account setup.',
            userProfile: profileData
          };
        }

        console.log('✅ No temporary password found, normal sign in complete');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Sign in exception:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!supabase || !user) {
      return { error: 'Not authenticated' };
    }

    try {
      console.log('🔑 Changing password for user:', user.id);

      // Update password in auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) {
        console.error('❌ Auth password update error:', authError);
        throw authError;
      }

      console.log('✅ Auth password updated successfully');

      // Clear temporary password from profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          temp_password: null,
          temp_password_expires: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        throw profileError;
      }

      console.log('✅ Profile updated successfully');

      // Log password change
      await supabase.rpc('log_user_activity', {
        activity_type_param: 'profile_update',
        description_param: 'Password changed from temporary to permanent',
        metadata_param: { action: 'password_change' }
      });

      // Reload profile to reflect changes
      await loadUserProfile(user.id);

      return { error: null, message: 'Password updated successfully!' };
    } catch (error: any) {
      console.error('💥 Password change error:', error);
      return { error: error.message };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - just clear state
      setProfile(null);
      setUser(null);
      setSession(null);
      dispatch({ type: 'SET_USER', payload: null });
      return;
    }
    
    setLoading(true);
    try {
      // Log logout activity
      if (user) {
        await supabase.rpc('log_user_activity', {
          activity_type_param: 'logout',
          description_param: 'User signed out',
          metadata_param: { logout_method: 'manual' }
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAdminAccount = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: 'Database not connected' };
    }

    try {
      const { data, error } = await supabase.rpc('create_admin_account', {
        admin_email: email,
        admin_password: password,
        admin_name: fullName
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to create admin account');
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const inviteUser = async (email: string, fullName: string, role: 'admin' = 'admin') => {
    if (!supabase || !isAdmin()) {
      return { error: 'Not authorized to invite users' };
    }

    try {
      const { data, error } = await supabase.rpc('invite_admin_user', {
        invite_email: email,
        invite_name: fullName,
        invite_role: role
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to invite user');
      }

      return { 
        error: null, 
        message: data.message,
        tempPassword: data.temp_password 
      };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const resetUserPassword = async (userEmail: string) => {
    if (!supabase || !isAdmin()) {
      return { error: 'Not authorized to reset passwords' };
    }

    try {
      const { data, error } = await supabase.rpc('reset_admin_password', {
        admin_email: userEmail
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      return { 
        error: null, 
        message: data.message,
        tempPassword: data.temp_password,
        expiresAt: data.expires_at
      };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  const hasTemporaryPassword = () => {
    return !!profile?.temp_password;
  };

  return {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    changePassword,
    createAdminAccount,
    inviteUser,
    resetUserPassword,
    isAdmin,
    hasTemporaryPassword,
  };
}