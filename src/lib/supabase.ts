import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client or demo mode
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Simple types for our application
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin';
  is_active: boolean;
  temp_password?: string | null;
  temp_password_expires?: string | null;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'profile_update' | 'admin_action';
  description?: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Helper functions
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
           supabaseUrl !== 'https://placeholder.supabase.co' &&
           supabaseUrl.includes('supabase.co'));
};

export const getSupabaseStatus = () => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Running in demo mode - no database connection required'
    };
  }
  
  return {
    connected: true,
    message: 'Connected to Supabase database'
  };
};

// Test database connection
export const testDatabaseConnection = async () => {
  if (!supabase) {
    return {
      success: false,
      message: 'No database connection - running in demo mode',
      demoMode: true
    };
  }

  try {
    const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    return {
      success: true,
      message: 'Database connection verified',
      demoMode: false
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      demoMode: false
    };
  }
};