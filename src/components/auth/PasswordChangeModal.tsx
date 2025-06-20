import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userEmail: string;
}

export function PasswordChangeModal({ isOpen, onClose, onComplete, userEmail }: PasswordChangeModalProps) {
  const { changePassword, loading } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    console.log('🔑 Password change form submitted');

    // Validate passwords
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      console.log('🔑 Calling changePassword...');
      const result = await changePassword(newPassword);
      
      if (result.error) {
        console.error('❌ Password change error:', result.error);
        setError(result.error);
      } else {
        console.log('✅ Password changed successfully');
        setSuccess(result.message || 'Password updated successfully!');
        
        // Wait a moment to show success message, then complete
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (err: any) {
      console.error('💥 Password change exception:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleClose = () => {
    if (!isChangingPassword) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white shadow-large relative" padding="lg">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isChangingPassword}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-large">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Create Permanent Password</h2>
            <p className="text-neutral-600">
              Welcome! Please create a secure password to complete your account setup.
            </p>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-primary-600" />
              <p className="text-sm font-semibold text-primary-800">Account Verified</p>
            </div>
            <p className="text-xs text-primary-700">
              Signed in as: <strong>{userEmail}</strong>
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a secure password"
                value={newPassword}
                onChange={setNewPassword}
                icon={Lock}
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isChangingPassword}
                className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                icon={Lock}
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isChangingPassword}
                className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-neutral-600 bg-neutral-50 p-4 rounded-xl">
              <p className="font-medium mb-2">Password Requirements:</p>
              <ul className="space-y-1">
                <li className={`flex items-center space-x-2 ${newPassword.length >= 8 ? 'text-success-600' : ''}`}>
                  <span>{newPassword.length >= 8 ? '✓' : '•'}</span>
                  <span>At least 8 characters long</span>
                </li>
                <li className={`flex items-center space-x-2 ${/(?=.*[a-z])/.test(newPassword) ? 'text-success-600' : ''}`}>
                  <span>{/(?=.*[a-z])/.test(newPassword) ? '✓' : '•'}</span>
                  <span>One lowercase letter</span>
                </li>
                <li className={`flex items-center space-x-2 ${/(?=.*[A-Z])/.test(newPassword) ? 'text-success-600' : ''}`}>
                  <span>{/(?=.*[A-Z])/.test(newPassword) ? '✓' : '•'}</span>
                  <span>One uppercase letter</span>
                </li>
                <li className={`flex items-center space-x-2 ${/(?=.*\d)/.test(newPassword) ? 'text-success-600' : ''}`}>
                  <span>{/(?=.*\d)/.test(newPassword) ? '✓' : '•'}</span>
                  <span>One number</span>
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={isChangingPassword}
              disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || isChangingPassword}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              {isChangingPassword ? 'Updating Password...' : 'Update Password & Continue'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500">
              Your temporary password will be automatically removed once you create a permanent password.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}