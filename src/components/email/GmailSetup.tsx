import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Clock,
  Database,
  Sparkles,
  RefreshCw,
  Settings,
  Globe,
  Key,
  Activity,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { gmailIntegration } from '../../lib/gmail';
import { createEmailSync, SyncProgress } from '../../lib/emailSync';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';

export function GmailSetup() {
  const { user } = useAuth();
  const { dispatch } = useApp();
  const [step, setStep] = useState<'intro' | 'auth' | 'syncing' | 'complete' | 'error'>('intro');
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    if (gmailIntegration.isAuthenticated()) {
      console.log('Gmail already authenticated, checking sync status...');
      checkExistingSync();
    }
  }, []);

  const checkExistingSync = async () => {
    if (!user) return;

    try {
      const emailSync = createEmailSync(user.id);
      const status = await emailSync.getSyncStatus();
      
      if (status && status.sync_status === 'completed') {
        console.log('Previous sync found:', status);
        setSyncResult({
          emailsSynced: status.emails_synced || 0,
          lastSync: status.last_sync
        });
        setStep('complete');
      }
    } catch (error) {
      console.error('Error checking existing sync:', error);
    }
  };

  const handleStartSetup = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setStep('auth');
    setError(null);

    try {
      // Step 1: Authenticate with Gmail
      console.log('Starting Gmail authentication...');
      const authResult = await gmailIntegration.initiateAuth();
      
      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed');
      }

      console.log('Gmail authentication successful, starting sync...');
      
      // Step 2: Start email sync
      setStep('syncing');
      
      const emailSync = createEmailSync(user.id, (progress) => {
        console.log('Sync progress:', progress);
        setSyncProgress(progress);
      });

      const result = await emailSync.performInitialSync();
      
      if (result.success) {
        console.log('Sync completed successfully:', result);
        setSyncResult(result);
        setStep('complete');
        
        // Trigger email reload in app context
        dispatch({ type: 'SET_LOADING', payload: true });
        setTimeout(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
        }, 1000);
      } else {
        throw new Error(result.errors.join(', ') || 'Sync failed');
      }

    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message);
      setStep('error');
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    setSyncProgress(null);
    setSyncResult(null);
    
    // Clear any existing authentication
    gmailIntegration.clearAuth();
    
    // Wait a moment then restart
    setTimeout(() => {
      setStep('intro');
      setIsRetrying(false);
    }, 1000);
  };

  const handleComplete = () => {
    // Navigate to main email view
    window.location.reload(); // Simple reload for now
  };

  const handleManualRefresh = async () => {
    if (!user) return;
    
    setIsRetrying(true);
    try {
      const emailSync = createEmailSync(user.id, (progress) => {
        setSyncProgress(progress);
      });
      
      const result = await emailSync.performInitialSync();
      if (result.success) {
        setSyncResult(result);
      }
    } catch (error) {
      console.error('Manual refresh error:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-success-50/10 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-success-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-large">
                <Mail className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">Connect Your Gmail</h1>
              <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">
                Set up your personal email workspace with AI-powered intelligence and full Gmail integration.
              </p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Card className="text-left" padding="lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">Secure Authentication</h3>
                      <p className="text-neutral-600 text-sm leading-relaxed">
                        OAuth2 secure connection to your Gmail account with read/write permissions. 
                        Your credentials are never stored on our servers.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="text-left" padding="lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-success-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-success-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">30-Day Email Sync</h3>
                      <p className="text-neutral-600 text-sm leading-relaxed">
                        Download and analyze your last 30 days of emails for immediate productivity insights 
                        and AI-powered management.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="text-left" padding="lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-warning-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Database className="w-6 h-6 text-warning-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">Personal Workspace</h3>
                      <p className="text-neutral-600 text-sm leading-relaxed">
                        Create your secure personal workspace with isolated data storage 
                        and customizable organization settings.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="text-left" padding="lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">AI Intelligence</h3>
                      <p className="text-neutral-600 text-sm leading-relaxed">
                        Advanced email analysis, priority detection, intelligent responses, 
                        and business insight generation.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Security Notice */}
              <Card className="bg-gradient-to-r from-primary-50 to-success-50 border-primary-200/50 mb-8" padding="lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-8 h-8 text-primary-600" />
                  <h3 className="text-xl font-bold text-primary-900">Enterprise-Grade Security</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6 text-sm text-primary-700">
                  <div className="text-center">
                    <Key className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <p className="font-semibold mb-1">OAuth2 Secure</p>
                    <p>Industry-standard authentication without password storage</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-success-600 mx-auto mb-2" />
                    <p className="font-semibold mb-1">End-to-End Encrypted</p>
                    <p>Your email data is encrypted and processed securely</p>
                  </div>
                  <div className="text-center">
                    <Globe className="w-8 h-8 text-warning-600 mx-auto mb-2" />
                    <p className="font-semibold mb-1">GDPR Compliant</p>
                    <p>Full compliance with international privacy regulations</p>
                  </div>
                </div>
              </Card>

              <Button
                size="lg"
                onClick={handleStartSetup}
                disabled={isRetrying}
                className="bg-gradient-to-r from-primary-600 to-success-600 hover:from-primary-700 hover:to-success-700 shadow-large hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 mr-3" />
                    Connect Gmail & Start Setup
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {step === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card padding="lg">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
                
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Connecting to Gmail</h2>
                <p className="text-neutral-600 mb-8 text-lg">
                  Please complete the authentication in the popup window. If you don't see a popup, 
                  check if it was blocked by your browser.
                </p>
                
                <div className="bg-warning-50 border border-warning-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <AlertCircle className="w-6 h-6 text-warning-600" />
                    <p className="text-lg font-semibold text-warning-800">Popup Blocked?</p>
                  </div>
                  <p className="text-warning-700">
                    If the authentication popup was blocked, please allow popups for this site and try again.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'syncing' && syncProgress && (
            <motion.div
              key="syncing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card padding="lg">
                <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
                  <Database className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Setting Up Your Workspace</h2>
                <p className="text-neutral-600 mb-8 text-lg">{syncProgress.message}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-neutral-200 rounded-full h-4 mb-8">
                  <motion.div
                    className="bg-gradient-to-r from-success-500 to-success-600 h-4 rounded-full flex items-center justify-end pr-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${syncProgress.progress}%` }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-white text-xs font-bold">
                      {Math.round(syncProgress.progress)}%
                    </span>
                  </motion.div>
                </div>
                
                {/* Progress Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <Activity className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Phase</p>
                    <p className="text-lg font-bold text-neutral-900 capitalize">{syncProgress.phase}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <TrendingUp className="w-6 h-6 text-success-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Progress</p>
                    <p className="text-lg font-bold text-neutral-900">{Math.round(syncProgress.progress)}%</p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <Mail className="w-6 h-6 text-warning-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Total Emails</p>
                    <p className="text-lg font-bold text-neutral-900">{syncProgress.totalEmails}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Processed</p>
                    <p className="text-lg font-bold text-neutral-900">{syncProgress.emailsProcessed}</p>
                  </div>
                </div>

                {syncProgress.errors.length > 0 && (
                  <div className="bg-warning-50 border border-warning-200 rounded-2xl p-6 mt-6">
                    <p className="text-lg font-semibold text-warning-800 mb-3">Warnings:</p>
                    <ul className="text-sm text-warning-700 space-y-1 text-left">
                      {syncProgress.errors.slice(0, 3).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {syncProgress.errors.length > 3 && (
                        <li>• ... and {syncProgress.errors.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card padding="lg">
                <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Workspace Ready!</h2>
                <p className="text-neutral-600 mb-8 text-lg">
                  Your Gmail integration is complete and your AI-powered email workspace is ready to use.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-success-50 rounded-2xl p-6">
                    <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-success-800">Emails Synced</p>
                    <p className="text-2xl font-bold text-success-900">{syncResult?.emailsSynced || 0}</p>
                  </div>
                  
                  <div className="bg-primary-50 rounded-2xl p-6">
                    <Sparkles className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-primary-800">AI Analysis</p>
                    <p className="text-2xl font-bold text-primary-900">Complete</p>
                  </div>
                  
                  <div className="bg-warning-50 rounded-2xl p-6">
                    <Zap className="w-8 h-8 text-warning-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-warning-800">Workspace</p>
                    <p className="text-2xl font-bold text-warning-900">Active</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-success-50 border border-primary-200 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">What's Next?</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-700">
                    <div className="text-left">
                      <p>• Your emails are now being analyzed by AI for insights and priorities</p>
                      <p>• Real-time sync will keep your workspace updated automatically</p>
                    </div>
                    <div className="text-left">
                      <p>• Use voice commands to interact with your emails hands-free</p>
                      <p>• Get intelligent response suggestions and business insights</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-primary-600 to-success-600 hover:from-primary-700 hover:to-success-700 shadow-large hover:shadow-xl transition-all duration-300"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Open My Email Workspace
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleManualRefresh}
                    disabled={isRetrying}
                    className="border-2"
                  >
                    {isRetrying ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-5 h-5 mr-2" />
                    )}
                    Refresh Sync
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card padding="lg">
                <div className="w-20 h-20 bg-gradient-to-br from-error-500 to-error-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Setup Failed</h2>
                <p className="text-neutral-600 mb-8 text-lg">
                  We encountered an issue while setting up your Gmail integration.
                </p>
                
                {error && (
                  <div className="bg-error-50 border border-error-200 rounded-2xl p-6 mb-8">
                    <p className="text-lg font-semibold text-error-800 mb-3">Error Details:</p>
                    <p className="text-sm text-error-700 text-left bg-white p-4 rounded-xl font-mono">
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                  >
                    {isRetrying ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-5 h-5 mr-2" />
                    )}
                    Try Again
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-2"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Start Over
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}