import { supabase } from './supabase';
import { gmailIntegration } from './gmail';
import { Email } from '../types';

export class EmailSyncEngine {
  private userId: string;
  private onProgress?: (msg: string) => void;

  constructor(userId: string, onProgress?: (msg: string) => void) {
    this.userId = userId;
    this.onProgress = onProgress;
  }

  private log(message: string) {
    if (this.onProgress) this.onProgress(message);
  }

  async performInitialSync(): Promise<boolean> {
    this.log('🔐 Authenticating Gmail...');
    const auth = await gmailIntegration.initiateAuth();
    if (!auth.success) return false;

    this.log('📨 Fetching last 30 days of emails...');
    const syncResult = await gmailIntegration.syncRecentEmails(30);
    if (!syncResult.success) return false;

    const emails = syncResult.emails || [];
    this.log(`💾 Saving ${emails.length} emails to Supabase...`);
    await this.storeEmails(emails);

    if (syncResult.historyId) {
      await this.saveHistoryId(syncResult.historyId);
    }

    this.log('✅ Initial sync complete.');
    return true;
  }

  async performIncrementalSync(): Promise<boolean> {
    this.log('⏱ Checking for new Gmail history...');

    const { data, error } = await supabase
      .from('email_sync_status')
      .select('last_history_id')
      .eq('user_id', this.userId)
      .single();

    if (error || !data?.last_history_id) {
      this.log('⚠️ No previous sync found, skipping incremental.');
      return false;
    }

    const historyId = data.last_history_id;
    const result = await gmailIntegration.fetchHistorySince(historyId);
    if (!result.success || !result.emails?.length) {
      this.log('📭 No new emails found.');
      return true;
    }

    this.log(`📥 Found ${result.emails.length} new emails. Saving...`);
    await this.storeEmails(result.emails);
    await this.saveHistoryId(result.historyId);

    this.log('✅ Incremental sync complete.');
    return true;
  }

  private async storeEmails(emails: Email[]) {
    if (emails.length === 0) return;
    await supabase.from('emails').upsert(emails, { onConflict: 'id' });
  }

  private async saveHistoryId(historyId: string) {
    await supabase.from('email_sync_status')
      .upsert({ user_id: this.userId, last_history_id: historyId });
  }
}
