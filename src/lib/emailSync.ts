import { supabase } from './supabase';
import { gmailIntegration } from './gmail';
import { Email } from '../types';

export interface SyncProgress {
  phase: 'authenticating' | 'fetching' | 'processing' | 'storing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  emailsProcessed: number;
  totalEmails: number;
  errors: string[];
}

export interface SyncResult {
  success: boolean;
  emailsSynced: number;
  errors: string[];
  nextSyncToken?: string;
}

export class EmailSyncEngine {
  private userId: string;
  private onProgress?: (progress: SyncProgress) => void;

  constructor(userId: string, onProgress?: (progress: SyncProgress) => void) {
    this.userId = userId;
    this.onProgress = onProgress;
  }

  // Phase 1: Initial 30-Day Sync
  async performInitialSync(): Promise<SyncResult> {
    const progress: SyncProgress = {
      phase: 'authenticating',
      progress: 0,
      message: 'Connecting to Gmail...',
      emailsProcessed: 0,
      totalEmails: 0,
      errors: []
    };

    try {
      this.updateProgress(progress);

      // Step 1: Authenticate with Gmail
      if (!gmailIntegration.isAuthenticated()) {
        progress.message = 'Authenticating with Gmail...';
        this.updateProgress(progress);
        
        const authResult = await gmailIntegration.initiateAuth();
        if (!authResult.success) {
          throw new Error(authResult.error || 'Authentication failed');
        }
      }

      progress.phase = 'fetching';
      progress.progress = 20;
      progress.message = 'Getting Gmail profile...';
      this.updateProgress(progress);

      // Step 2: Get Gmail profile
      const profileResult = await gmailIntegration.getProfile();
      if (!profileResult.success) {
        throw new Error(profileResult.error || 'Failed to get Gmail profile');
      }

      progress.progress = 30;
      progress.message = 'Fetching recent emails (last 30 days)...';
      this.updateProgress(progress);

      // Step 3: Sync recent emails (30 days)
      const syncResult = await gmailIntegration.syncRecentEmails(30);
      if (!syncResult.success) {
        throw new Error(syncResult.error || 'Failed to sync emails');
      }

      const emails = syncResult.emails || [];
      progress.totalEmails = emails.length;
      progress.phase = 'processing';
      progress.progress = 50;
      progress.message = `Processing ${emails.length} emails...`;
      this.updateProgress(progress);

      // Step 4: Store emails in database
      const storedEmails = await this.storeEmails(emails, progress);

      // Step 5: Store sync metadata
      await this.storeSyncMetadata(profileResult.profile!, syncResult.nextPageToken);

      // Step 6: Create user workspace if it doesn't exist
      await this.ensureUserWorkspace();

      progress.phase = 'complete';
      progress.progress = 100;
      progress.message = `Successfully synced ${storedEmails} emails`;
      progress.emailsProcessed = storedEmails;
      this.updateProgress(progress);

      return {
        success: true,
        emailsSynced: storedEmails,
        errors: progress.errors,
        nextSyncToken: syncResult.nextPageToken
      };

    } catch (error: any) {
      console.error('Sync error:', error);
      progress.phase = 'error';
      progress.message = error.message;
      progress.errors.push(error.message);
      this.updateProgress(progress);

      return {
        success: false,
        emailsSynced: 0,
        errors: [error.message]
      };
    }
  }

  // Phase 1: Store Emails in Database
  private async storeEmails(emails: any[], progress: SyncProgress): Promise<number> {
    if (!supabase) {
      // Demo mode - just return count
      console.log('Demo mode: would store', emails.length, 'emails');
      return emails.length;
    }

    let storedCount = 0;
    const batchSize = 5; // Smaller batches for better error handling

    console.log(`Storing ${emails.length} emails in batches of ${batchSize}...`);

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        // Prepare email data for database
        const emailData = batch.map(email => {
          // Ensure all required fields have valid values
          const emailId = `gmail_${email.id}`;
          const subject = email.subject || '(No Subject)';
          const senderName = email.sender || 'Unknown Sender';
          const senderEmail = email.senderEmail || 'unknown@example.com';
          const recipientEmail = email.recipient || 'unknown@example.com';
          const body = email.body || email.gmailData?.snippet || '';
          const timestamp = email.timestamp ? new Date(email.timestamp).toISOString() : new Date().toISOString();

          return {
            id: emailId,
            user_id: this.userId,
            provider: 'gmail',
            provider_message_id: email.id,
            thread_id: email.threadId || null,
            subject,
            sender_name: senderName,
            sender_email: senderEmail,
            recipient_email: recipientEmail,
            body,
            timestamp,
            is_read: email.isRead || false,
            is_important: email.isImportant || false,
            labels: email.labels || [],
            metadata: {
              gmailData: email.gmailData || {},
              snippet: body.substring(0, 200)
            }
          };
        });

        console.log(`Storing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(emails.length/batchSize)}...`);

        // Insert batch with conflict resolution
        const { data, error } = await supabase
          .from('emails')
          .upsert(emailData, { 
            onConflict: 'provider_message_id,user_id',
            ignoreDuplicates: false 
          })
          .select('id');

        if (error) {
          console.error('Error storing email batch:', error);
          progress.errors.push(`Failed to store batch ${i}-${i + batch.length}: ${error.message}`);
          
          // Try to store emails individually to identify problematic ones
          for (const emailItem of emailData) {
            try {
              const { error: individualError } = await supabase
                .from('emails')
                .upsert([emailItem], { 
                  onConflict: 'provider_message_id,user_id',
                  ignoreDuplicates: true 
                });
              
              if (!individualError) {
                storedCount++;
              } else {
                console.error('Individual email error:', individualError, emailItem.subject);
              }
            } catch (individualErr) {
              console.error('Individual email exception:', individualErr);
            }
          }
        } else {
          storedCount += batch.length;
          console.log(`Batch stored successfully: ${batch.length} emails`);
        }

        // Update progress
        progress.emailsProcessed = storedCount;
        progress.progress = 50 + (storedCount / emails.length) * 40; // 50-90% range
        progress.message = `Stored ${storedCount}/${emails.length} emails...`;
        this.updateProgress(progress);

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error('Error in batch processing:', error);
        progress.errors.push(`Batch processing error: ${error.message}`);
      }
    }

    console.log(`Email storage complete: ${storedCount}/${emails.length} emails stored`);
    return storedCount;
  }

  // Phase 1: Store Sync Metadata
  private async storeSyncMetadata(profile: any, nextPageToken?: string): Promise<void> {
    if (!supabase) {
      console.log('Demo mode: would store sync metadata');
      return;
    }

    try {
      const syncData = {
        user_id: this.userId,
        provider: 'gmail',
        last_sync: new Date().toISOString(),
        sync_status: 'completed',
        emails_total: profile.messagesTotal || 0,
        emails_synced: 0, // Will be updated by the calling function
        last_history_id: profile.historyId,
        next_page_token: nextPageToken,
        sync_metadata: {
          profile,
          syncType: 'initial',
          syncDays: 30,
          timestamp: new Date().toISOString()
        }
      };

      console.log('Storing sync metadata:', syncData);

      const { error } = await supabase
        .from('email_sync_status')
        .upsert(syncData, { 
          onConflict: 'user_id,provider',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error storing sync metadata:', error);
      } else {
        console.log('Sync metadata stored successfully');
      }
    } catch (error) {
      console.error('Error in storeSyncMetadata:', error);
    }
  }

  // Phase 1: Ensure User Workspace Exists
  private async ensureUserWorkspace(): Promise<void> {
    if (!supabase) {
      console.log('Demo mode: would ensure user workspace');
      return;
    }

    try {
      // Check if workspace exists
      const { data: existingWorkspace, error: checkError } = await supabase
        .from('user_workspaces')
        .select('id')
        .eq('user_id', this.userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error checking workspace:', checkError);
        return;
      }

      if (!existingWorkspace) {
        // Create workspace
        const workspaceData = {
          user_id: this.userId,
          workspace_name: 'My Email Workspace',
          email_providers: ['gmail'],
          settings: {
            syncEnabled: true,
            syncDays: 30,
            autoSync: true
          },
          storage_used: 0,
          storage_limit: 10737418240, // 10GB
          is_active: true
        };

        const { error: createError } = await supabase
          .from('user_workspaces')
          .insert([workspaceData]);

        if (createError) {
          console.error('Error creating workspace:', createError);
        } else {
          console.log('User workspace created successfully');
        }
      } else {
        // Update existing workspace to include Gmail
        const { error: updateError } = await supabase
          .from('user_workspaces')
          .update({ 
            email_providers: ['gmail'],
            updated_at: new Date().toISOString()
          })
          .eq('user_id', this.userId);

        if (updateError) {
          console.error('Error updating workspace:', updateError);
        } else {
          console.log('User workspace updated successfully');
        }
      }
    } catch (error) {
      console.error('Error in ensureUserWorkspace:', error);
    }
  }

  // Phase 1: Update Progress Callback
  private updateProgress(progress: SyncProgress): void {
    if (this.onProgress) {
      this.onProgress({ ...progress });
    }
  }

  // Phase 1: Get Sync Status
  async getSyncStatus(): Promise<any> {
    if (!supabase) {
      return {
        provider: 'gmail',
        sync_status: 'demo',
        last_sync: new Date().toISOString(),
        emails_total: 0,
        emails_synced: 0
      };
    }

    try {
      const { data, error } = await supabase
        .from('email_sync_status')
        .select('*')
        .eq('user_id', this.userId)
        .eq('provider', 'gmail')
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        console.error('Error getting sync status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSyncStatus:', error);
      return null;
    }
  }

  // Phase 1: Incremental Sync (for future use)
  async performIncrementalSync(): Promise<SyncResult> {
    // This will be implemented in Phase 2 for real-time updates
    console.log('Incremental sync not yet implemented');
    return {
      success: false,
      emailsSynced: 0,
      errors: ['Incremental sync not yet implemented']
    };
  }
}

// Helper function to create sync engine
export const createEmailSync = (userId: string, onProgress?: (progress: SyncProgress) => void) => {
  return new EmailSyncEngine(userId, onProgress);
};