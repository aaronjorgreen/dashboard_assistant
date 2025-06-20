import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Plus, 
  Check, 
  AlertCircle, 
  Settings, 
  Zap,
  Shield,
  Globe,
  Key,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { emailIntegration, EmailAccount } from '../../lib/emailProviders';

export function EmailIntegration() {
  const [connectedAccounts, setConnectedAccounts] = useState<EmailAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleConnectProvider = async (provider: 'gmail' | 'outlook') => {
    setIsConnecting(provider);
    setConnectionStatus({ type: null, message: '' });

    try {
      let result;
      if (provider === 'gmail') {
        result = await emailIntegration.connectGmail();
      } else {
        result = await emailIntegration.connectOutlook();
      }

      if (result.success) {
        setConnectionStatus({
          type: 'success',
          message: `Successfully connected to ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`
        });
        // Refresh connected accounts
        // loadConnectedAccounts();
      } else {
        setConnectionStatus({
          type: 'error',
          message: result.error || 'Failed to connect to email provider'
        });
      }
    } catch (error: any) {
      setConnectionStatus({
        type: 'error',
        message: error.message || 'An unexpected error occurred'
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const providers = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect your Google Workspace or personal Gmail account',
      icon: '📧',
      color: 'from-red-500 to-red-600',
      features: ['Full email access', 'Send & receive', 'Labels & filters', 'Search & organize']
    },
    {
      id: 'outlook',
      name: 'Outlook',
      description: 'Connect your Microsoft 365 or Outlook.com account',
      icon: '📮',
      color: 'from-blue-500 to-blue-600',
      features: ['Full email access', 'Send & receive', 'Folders & rules', 'Calendar integration']
    },
    {
      id: 'imap',
      name: 'IMAP/SMTP',
      description: 'Connect any email provider using IMAP/SMTP',
      icon: '⚙️',
      color: 'from-gray-500 to-gray-600',
      features: ['Universal support', 'Custom configuration', 'Advanced settings', 'Enterprise ready'],
      comingSoon: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center space-x-3 mb-6"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-success-600 rounded-3xl flex items-center justify-center shadow-large">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Email Integration</h1>
            <p className="text-neutral-600">Connect your email accounts to get started</p>
          </div>
        </motion.div>

        {/* Security Notice */}
        <Card className="bg-gradient-to-r from-primary-50 to-success-50 border-primary-200/50 max-w-2xl mx-auto" padding="lg">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-bold text-primary-900">Enterprise-Grade Security</h3>
          </div>
          <p className="text-sm text-primary-700 mb-4">
            Your email data is encrypted and processed securely. We use OAuth2 authentication 
            and never store your email passwords. All AI processing happens in secure, 
            compliant environments.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/60 rounded-xl p-3">
              <Key className="w-5 h-5 text-primary-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-primary-800">OAuth2 Secure</p>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <Shield className="w-5 h-5 text-success-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-success-800">End-to-End Encrypted</p>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <Globe className="w-5 h-5 text-warning-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-warning-800">GDPR Compliant</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Connection Status */}
      {connectionStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-4 rounded-2xl border ${
            connectionStatus.type === 'success'
              ? 'bg-success-50 border-success-200 text-success-800'
              : 'bg-error-50 border-error-200 text-error-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            {connectionStatus.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-medium">{connectionStatus.message}</p>
          </div>
        </motion.div>
      )}

      {/* Email Providers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="h-full relative overflow-hidden" padding="lg" hover>
              {provider.comingSoon && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800 text-xs font-bold rounded-full">
                  Coming Soon
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${provider.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-large text-2xl`}>
                  {provider.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{provider.name}</h3>
                <p className="text-sm text-neutral-600">{provider.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {provider.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-success-600" />
                    <span className="text-sm text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => !provider.comingSoon && handleConnectProvider(provider.id as 'gmail' | 'outlook')}
                disabled={provider.comingSoon || isConnecting === provider.id}
                loading={isConnecting === provider.id}
                className={`w-full ${provider.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                icon={provider.comingSoon ? Settings : Plus}
              >
                {provider.comingSoon ? 'Coming Soon' : `Connect ${provider.name}`}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">Connected Accounts</h3>
            <Button variant="outline" size="sm" icon={RefreshCw}>
              Sync All
            </Button>
          </div>
          
          <div className="space-y-4">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{account.displayName}</p>
                    <p className="text-sm text-neutral-600">{account.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-sm font-medium text-success-700">Connected</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Features Preview */}
      <Card className="bg-gradient-to-br from-primary-50 to-success-50 border-primary-200/50" padding="lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-success-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-large">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-3">AI-Powered Email Intelligence</h3>
          <p className="text-neutral-700 mb-6 max-w-2xl mx-auto">
            Once connected, your AI assistant will automatically analyze emails, provide intelligent summaries, 
            suggest responses, and help you manage your inbox more efficiently than ever before.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/60 rounded-2xl p-4">
              <h4 className="font-semibold text-neutral-900 mb-2">Smart Analysis</h4>
              <p className="text-sm text-neutral-600">Automatic sentiment analysis, priority detection, and key topic extraction</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4">
              <h4 className="font-semibold text-neutral-900 mb-2">Response Generation</h4>
              <p className="text-sm text-neutral-600">AI-generated responses that match your tone and communication style</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4">
              <h4 className="font-semibold text-neutral-900 mb-2">Business Intelligence</h4>
              <p className="text-sm text-neutral-600">Extract insights, track trends, and identify opportunities from your emails</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}