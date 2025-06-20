import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Plus, 
  Settings, 
  Zap, 
  Database,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { GmailSetup } from '../email/GmailSetup';
import { EmailView } from './EmailView';
import { gmailIntegration } from '../../lib/gmail';
import { createEmailSync } from '../../lib/emailSync';

export function EmailWorkspace() {
  const { user } = useAuth();
  const { state } = useApp();
  const [hasGmailConnection, setHasGmailConnection] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [syncStatus, setSyncStatus] = useState<any>(null);

  useEffect(() => {
    checkGmailConnection();
  }, [user]);

  const checkGmailConnection = async () => {
    if (!user) return;

    setIsCheckingConnection(true);
    
    try {
      // Check if Gmail is authenticated
      const isAuthenticated = gmailIntegration.isAuthenticated();
      
      if (isAuthenticated) {
        setHasGmailConnection(true);
        
        // Get sync status
        const emailSync = createEmailSync(user.id);
        const status = await emailSync.getSyncStatus();
        setSyncStatus(status);
      } else {
        setHasGmailConnection(false);
      }
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setHasGmailConnection(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  if (isCheckingConnection) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Loading Workspace</h2>
          <p className="text-neutral-600">Checking your email connections...</p>
        </motion.div>
      </div>
    );
  }

  if (!hasGmailConnection) {
    return <GmailSetup />;
  }

  return (
    <div className="h-full bg-gradient-to-br from-white to-primary-50/10">
      <div className="h-full flex flex-col">
        {/* Workspace Header */}
        <div className="p-6 border-b border-neutral-200/50 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-success-600 rounded-2xl flex items-center justify-center shadow-medium">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {user?.name?.split(' ')[0]}'s Email Workspace
                </h1>
                <p className="text-neutral-600">AI-powered email intelligence and management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-success-50 rounded-xl border border-success-200">
                <CheckCircle className="w-4 h-4 text-success-600" />
                <span className="text-sm font-medium text-success-700">Gmail Connected</span>
              </div>

              {/* Sync Status */}
              {syncStatus && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-xl border border-primary-200">
                  <Database className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">
                    {syncStatus.emails_synced || 0} emails synced
                  </span>
                </div>
              )}

              {/* Settings */}
              <Button variant="ghost" size="sm" icon={Settings} className="h-10 w-10 p-0" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="text-center" padding="md">
              <Mail className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-neutral-900">{state.emails.filter(e => !e.isRead).length}</p>
              <p className="text-sm text-neutral-600">Unread</p>
            </Card>
            
            <Card className="text-center" padding="md">
              <Zap className="w-6 h-6 text-warning-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-neutral-900">{state.emails.filter(e => e.isImportant).length}</p>
              <p className="text-sm text-neutral-600">Important</p>
            </Card>
            
            <Card className="text-center" padding="md">
              <CheckCircle className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-neutral-900">{state.emails.length}</p>
              <p className="text-sm text-neutral-600">Total</p>
            </Card>
            
            <Card className="text-center" padding="md">
              <Database className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-neutral-900">
                {syncStatus?.last_sync ? 'Synced' : 'Ready'}
              </p>
              <p className="text-sm text-neutral-600">Status</p>
            </Card>
          </div>
        </div>

        {/* Email Interface */}
        <div className="flex-1 overflow-hidden">
          <EmailView />
        </div>
      </div>
    </div>
  );
}