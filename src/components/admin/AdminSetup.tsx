import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

interface AdminSetupProps {
  onSetupComplete: () => void;
}

export function AdminSetup({ onSetupComplete }: AdminSetupProps) {
  const { createAdminAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.fullName) {
      setResult({
        success: false,
        message: 'Please fill in all fields'
      });
      return;
    }

    if (formData.password.length < 8) {
      setResult({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await createAdminAccount(
        formData.email,
        formData.password,
        formData.fullName
      );

      if (response.error) {
        if (response.error.includes('already exists')) {
          setResult({
            success: false,
            message: 'An admin account already exists. You can sign in instead.'
          });
          setShowLogin(true);
        } else {
          setResult({
            success: false,
            message: response.error
          });
        }
      } else {
        setResult({
          success: true,
          message: 'Admin account created successfully! You can now sign in with your credentials.'
        });
        setShowLogin(true);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: 'Failed to create admin account: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToLogin = () => {
    onSetupComplete();
  };

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
            {showLogin ? 'Ready to Sign In' : 'Create Your Admin Account'}
          </h1>
          <p className="text-neutral-600">
            {showLogin ? 'Your admin account is ready' : 'Set up your personal admin workspace'}
          </p>
        </motion.div>

        {/* Setup Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="lg">
            {showLogin ? (
              // Login Ready State
              <div className="text-center">
                <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <p className="text-sm font-semibold text-success-800">Setup Complete!</p>
                  </div>
                  <p className="text-xs text-success-700">
                    Your admin account has been created successfully. You can now sign in with your credentials.
                  </p>
                </div>

                <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
                  <h3 className="font-semibold text-neutral-900 mb-2">Your Login Credentials</h3>
                  <div className="text-left space-y-2">
                    <div>
                      <p className="text-xs font-medium text-neutral-600">Email:</p>
                      <p className="text-sm font-mono bg-white px-2 py-1 rounded border">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-600">Password:</p>
                      <p className="text-sm text-neutral-500">The password you just created</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToLogin}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Go to Sign In
                </Button>
              </div>
            ) : (
              // Setup Form
              <>
                {/* Info Notice */}
                <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-primary-600" />
                    <p className="text-sm font-semibold text-primary-800">Your Personal Workspace</p>
                  </div>
                  <p className="text-xs text-primary-700">
                    This creates your personal admin account with full access to all AI assistant features.
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

                {/* Form */}
                <form onSubmit={handleCreateAdmin} className="space-y-5">
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(value) => setFormData(prev => ({ ...prev, fullName: value }))}
                    icon={User}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    icon={Mail}
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
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

                  <div className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Password Requirements:</p>
                    <ul className="space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Mix of letters, numbers, and symbols recommended</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    loading={loading}
                    disabled={!formData.email || !formData.password || !formData.fullName}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                  >
                    Create Admin Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                {/* Alternative Action */}
                {result?.message.includes('already exists') && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <Button
                      onClick={handleProceedToLogin}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Go to Sign In Instead
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}