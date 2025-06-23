import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Bot, Sparkles, ArrowRight, Shield, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { isSupabaseConfigured } from '../../lib/supabase';
import { PasswordChangeModal } from './PasswordChangeModal';

interface AuthScreenProps {
  onAuthenticate?: (user: any) => void;
}

export function AuthScreen({ onAuthenticate }: AuthScreenProps) {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [tempUserData, setTempUserData] = useState<any>(null);

  const supabaseConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError(null);
    setSuccess(null);

    try {
      console.log('🔐 Starting sign in process...');
      const result = await signIn(email, password, rememberMe);

      console.log('🔐 Sign in result:', {
        hasError: !!result.error,
        requiresPasswordChange: result.requiresPasswordChange,
        hasData: !!result.data,
        hasUserProfile: !!result.userProfile
      });

      if (result.error) {
        console.log('❌ Sign in error:', result.error);
        setError(result.error);
      } else if (result.requiresPasswordChange) {
        console.log('🔑 Password change required - showing modal');
        console.log('User profile data:', result.userProfile);
        
        setTempUserData({
          user: result.data?.user,
          profile: result.userProfile
        });
        setShowPasswordChange(true);
        setSuccess(result.message || 'Please create a permanent password.');
        
        // Force a re-render to ensure modal shows
        setTimeout(() => {
          console.log('🔑 Modal should be visible now. showPasswordChange:', true);
        }, 100);
      } else {
        console.log('✅ Sign in successful without password change required');
      }
      // Success without password change is handled by the useAuth hook
    } catch (err: any) {
      console.error('💥 Sign in error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const handlePasswordChangeComplete = () => {
    console.log('✅ Password change completed');
    setShowPasswordChange(false);
    setTempUserData(null);
    setSuccess('Password updated successfully! You are now signed in.');
    // The useAuth hook will handle the authentication state update
  };

  const handlePasswordChangeCancel = () => {
    console.log('❌ Password change cancelled');
    setShowPasswordChange(false);
    setTempUserData(null);
    setError('Password change is required to continue. Please try signing in again.');
  };

  // Debug logging for modal state
  React.useEffect(() => {
    console.log('🔍 Modal state changed:', {
      showPasswordChange,
      hasTempUserData: !!tempUserData,
      userEmail: tempUserData?.profile?.email || tempUserData?.user?.email
    });
  }, [showPasswordChange, tempUserData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-accent-50/10 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-large">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">AI-Powered Email Intelligence</h1>
              </div>
            </div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-large" padding="none">
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Shield className="w-6 h-6 text-primary-600" />
                    <h2 className="text-2xl font-bold text-neutral-900">
                      {supabaseConfigured ? 'Admin Sign In' : 'Demo Access'}
                    </h2>
                  </div>
                  <p className="text-neutral-600">
                    {supabaseConfigured 
                      ? 'Sign in with your admin credentials to access your workspace.'
                      : 'Enter any email and password to explore the demo.'
                    }
                  </p>
                </div>

                {/* Mode Notice */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl border ${
                    supabaseConfigured 
                      ? 'bg-primary-50 border-primary-200' 
                      : 'bg-success-50 border-success-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Key className={`w-4 h-4 ${supabaseConfigured ? 'text-primary-600' : 'text-success-600'}`} />
                    <p className={`text-sm font-semibold ${supabaseConfigured ? 'text-primary-800' : 'text-success-800'}`}>
                      {supabaseConfigured ? 'Invite-Only Access' : 'Demo Mode Active'}
                    </p>
                  </div>
                  <p className={`text-xs ${supabaseConfigured ? 'text-primary-700' : 'text-success-700'}`}>
                    {supabaseConfigured 
                      ? 'This application is invite-only. Only authorized admins can access the system.'
                      : 'No database connection. Use any email and password to explore the features.'
                    }
                  </p>
                </motion.div>

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <p className="text-sm text-success-700 font-medium">{success}</p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-error-600" />
                      <p className="text-sm text-error-700 font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder={supabaseConfigured ? "Enter your admin email" : "Enter any email address"}
                    value={email}
                    onChange={setEmail}
                    icon={Mail}
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={supabaseConfigured ? "Enter your password" : "Enter any password"}
                      value={password}
                      onChange={setPassword}
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {supabaseConfigured && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <label htmlFor="rememberMe" className="text-sm text-neutral-700 font-medium">
                        Remember me for 30 days
                      </label>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    loading={loading}
                    disabled={!email || !password}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-medium hover:shadow-large transition-all duration-300 group"
                  >
                    {supabaseConfigured ? 'Sign In' : 'Access Demo'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </form>

                {/* Help Section */}
                <div className="mt-8 text-center">
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-600 mb-2">
                      <strong>{supabaseConfigured ? 'Need Access?' : 'Demo Features'}</strong>
                    </p>
                    <p className="text-xs text-neutral-500">
                      {supabaseConfigured 
                        ? 'Contact your system administrator if you need an invitation or are experiencing login issues.'
                        : 'Explore AI-powered email management, intelligent responses, and business insights in this demonstration.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <Key className="w-4 h-4" />
                <span>Invite-Only</span>
              </div>
              <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <Bot className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Password Change Modal - CRITICAL: This should always render when conditions are met */}
      {showPasswordChange && tempUserData && (
        <>
          {console.log('🔑 Rendering PasswordChangeModal with:', {
            isOpen: showPasswordChange,
            userEmail: tempUserData.profile?.email || tempUserData.user?.email
          })}
          <PasswordChangeModal
            isOpen={showPasswordChange}
            onClose={handlePasswordChangeCancel}
            onComplete={handlePasswordChangeComplete}
            userEmail={tempUserData.profile?.email || tempUserData.user?.email}
          />
        </>
      )}
    </div>
  );
}

export default AuthScreen;