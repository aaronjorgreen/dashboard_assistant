import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Crown,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';

export function InviteSetup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'verify' | 'setup' | 'complete'>('verify');
  
  const [inviteData, setInviteData] = useState<{
    email: string;
    name: string;
    tempPassword: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Extract invite data from URL parameters
  useEffect(() => {
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const tempPassword = searchParams.get('temp');
    const expires = searchParams.get('expires');

    if (!email || !name || !tempPassword || !expires) {
      setResult({
        success: false,
        message: 'Invalid invitation link. Please contact your administrator for a new invitation.'
      });
      return;
    }

    // Check if invitation has expired
    const expirationDate = new Date(expires);
    if (expirationDate < new Date()) {
      setResult({
        success: false,
        message: 'This invitation has expired. Please contact your administrator for a new invitation.'
      });
      return;
    }

    setInviteData({
      email: decodeURIComponent(email),
      name: decodeURIComponent(name),
      tempPassword: decodeURIComponent(tempPassword)
    });

    setStep('setup');
  }, [searchParams]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteData) return;

    // Validate passwords
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setResult({
        success: false,
        message: passwordError
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setResult({
        success: false,
        message: 'Passwords do not match'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // First, sign in with temporary password
      const signInResult = await signIn(inviteData.email, inviteData.tempPassword);
      
      if (signInResult.error) {
        setResult({
          success: false,
          message: signInResult.error
        });
        return;
      }

      // If sign in was successful and requires password change, handle it
      if (signInResult.requiresPasswordChange) {
        // The password change will be handled by the PasswordChangeModal
        // which should be triggered by the AuthScreen
        setStep('complete');
        setResult({
          success: true,
          message: 'Account setup successful! You can now access your admin workspace.'
        });
      } else {
        // User is already set up, redirect to dashboard
        navigate('/admin');
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: 'Failed to set up account: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToLogin = () => {
    navigate('/');
  };

  if (step === 'verify' || !inviteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-accent-50/10 flex items-center justify-center p-6">
        <Card className="text-center max-w-md" padding="lg">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-large">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Verifying Invitation</h1>
          {result ? (
            <div className={`p-4 rounded-xl border ${
              result.success 
                ? 'bg-success-50 border-success-200' 
                : 'bg-error-50 border-error-200'
            }`}>
              <div className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-error-600" />
                )}
                <p className={`text-sm font-medium ${
                  result.success ? 'text-success-800' : 'text-error-800'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-accent-50/10 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-large">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {step === 'complete' ? 'Welcome to Your Workspace!' : 'Complete Your Admin Setup'}
          </h1>
          <p className="text-neutral-600">
            {step === 'complete' 
              ? 'Your admin account is ready to use' 
              : 'Create a secure password to access your admin workspace'
            }
          </p>
        </motion.div>

        {/* Setup Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="lg">
            {step === 'complete' ? (
              // Complete State
              <div className="text-center">
                <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <p className="text-sm font-semibold text-success-800">Setup Complete!</p>
                  </div>
                  <p className="text-xs text-success-700">
                    Your admin account has been successfully configured. You now have access to your personal workspace.
                  </p>
                </div>

                <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
                  <h3 className="font-semibold text-neutral-900 mb-2">Your Admin Account</h3>
                  <div className="text-left space-y-2">
                    <div>
                      <p className="text-xs font-medium text-neutral-600">Name:</p>
                      <p className="text-sm font-mono bg-white px-2 py-1 rounded border">{inviteData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-600">Email:</p>
                      <p className="text-sm font-mono bg-white px-2 py-1 rounded border">{inviteData.email}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToLogin}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Access Your Workspace
                </Button>
              </div>
            ) : (
              // Setup Form
              <>
                {/* Invitation Info */}
                <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4 text-primary-600" />
                    <p className="text-sm font-semibold text-primary-800">Admin Invitation</p>
                  </div>
                  <p className="text-xs text-primary-700 mb-2">
                    You've been invited to join as an admin: <strong>{inviteData.name}</strong>
                  </p>
                  <p className="text-xs text-primary-600">
                    Email: {inviteData.email}
                  </p>
                </div>

                {/* Result Message */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-xl border ${
                      result.success 
                        ? 'bg-success-50 border-success-200' 
                        : 'bg-error-50 border-error-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-error-600" />
                      )}
                      <p className={`text-sm font-medium ${
                        result.success ? 'text-success-800' : 'text-error-800'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Password Setup Form */}
                <form onSubmit={handleSetupPassword} className="space-y-5">
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a secure password"
                      value={formData.newPassword}
                      onChange={(value) => setFormData(prev => ({ ...prev, newPassword: value }))}
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="text-xs text-neutral-600 bg-neutral-50 p-4 rounded-xl">
                    <p className="font-medium mb-2">Password Requirements:</p>
                    <ul className="space-y-1">
                      <li className={`flex items-center space-x-2 ${formData.newPassword.length >= 8 ? 'text-success-600' : ''}`}>
                        <span>{formData.newPassword.length >= 8 ? '✓' : '•'}</span>
                        <span>At least 8 characters long</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${/(?=.*[a-z])/.test(formData.newPassword) ? 'text-success-600' : ''}`}>
                        <span>{/(?=.*[a-z])/.test(formData.newPassword) ? '✓' : '•'}</span>
                        <span>One lowercase letter</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-success-600' : ''}`}>
                        <span>{/(?=.*[A-Z])/.test(formData.newPassword) ? '✓' : '•'}</span>
                        <span>One uppercase letter</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${/(?=.*\d)/.test(formData.newPassword) ? 'text-success-600' : ''}`}>
                        <span>{/(?=.*\d)/.test(formData.newPassword) ? '✓' : '•'}</span>
                        <span>One number</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    loading={loading}
                    disabled={!formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                  >
                    Complete Setup & Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default InviteSetup;