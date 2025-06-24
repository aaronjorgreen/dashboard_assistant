import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
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
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    checkGmailConnection();
  }, [user]);

  const checkGmailConnection = () => {
    setIsCheckingConnection(true);
    const isConnected = gmailIntegration.isAuthenticated();
    setHasGmailConnection(isConnected);
    setIsCheckingConnection(false);
  };

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setStatusMessage("Syncing emails...");
    const sync = createEmailSync(user.id, msg => setStatusMessage(msg));
    await sync.performIncrementalSync();
    setSyncing(false);
    setStatusMessage("✅ Sync complete.");
  };

  if (!user) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Loading user...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">📥 Email Workspace</h2>

      <Card className="p-4 space-y-4">
        {isCheckingConnection ? (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="animate-spin" size={18} />
            <span>Checking Gmail connection...</span>
          </div>
        ) : hasGmailConnection ? (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle size={18} />
            <span>Gmail Connected</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle size={18} />
            <span>No Gmail account connected</span>
          </div>
        )}

        {!hasGmailConnection && <GmailSetup />}

        {hasGmailConnection && (
          <div className="flex items-center gap-3">
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? <Loader2 className="animate-spin mr-2" size={16} /> : <RefreshCcw className="mr-2" size={16} />}
              Sync Emails Now
            </Button>
            <Button variant="outline">AI Summarize Inbox</Button>
            <Button variant="ghost" onClick={checkGmailConnection}>Reconnect Gmail</Button>
          </div>
        )}

        {statusMessage && <p className="text-sm text-muted-foreground pt-2">{statusMessage}</p>}
      </Card>

      {hasGmailConnection ? <EmailView /> : <p className="text-center text-muted-foreground">Connect Gmail to view emails.</p>}
    </div>
  );
}
