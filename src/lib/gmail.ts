import { EmailAccount, EmailProvider } from './emailProviders';

// Gmail API Configuration
export interface GmailConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      headers?: Array<{ name: string; value: string }>;
    }>;
  };
  internalDate: string;
  historyId: string;
}

export interface GmailThread {
  id: string;
  historyId: string;
  messages: GmailMessage[];
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export class GmailIntegration {
  private config: GmailConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GMAIL_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/gmail/callback.html`,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    };

    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  // Phase 1: OAuth2 Authentication
  async initiateAuth(): Promise<{ success: boolean; authUrl?: string; error?: string }> {
    try {
      if (!this.config.clientId) {
        return { 
          success: false, 
          error: 'Gmail Client ID not configured. Please add VITE_GMAIL_CLIENT_ID to your environment variables.' 
        };
      }

      const authUrl = this.buildAuthUrl();
      console.log('Opening Gmail OAuth popup:', authUrl);
      
      // Open popup for OAuth
      const popup = window.open(
        authUrl,
        'gmail-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes,left=' + 
        (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 300)
      );

      if (!popup) {
        return { 
          success: false, 
          error: 'Popup blocked. Please allow popups for this site and try again.' 
        };
      }

      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            resolve({ success: false, error: 'Authentication cancelled by user' });
          }
        }, 1000);

        // Listen for auth completion
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          console.log('Received auth message:', event.data);
          
          if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', messageHandler);
            
            this.accessToken = event.data.accessToken;
            this.refreshToken = event.data.refreshToken;
            this.tokenExpiry = new Date(Date.now() + (event.data.expiresIn * 1000));
            
            // Save tokens to localStorage
            this.saveTokensToStorage();
            
            resolve({ success: true });
          } else if (event.data.type === 'GMAIL_AUTH_ERROR') {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', messageHandler);
            resolve({ success: false, error: event.data.error });
          }
        };

        window.addEventListener('message', messageHandler);
      });
    } catch (error: any) {
      console.error('Auth initiation error:', error);
      return { success: false, error: error.message };
    }
  }

  private buildAuthUrl(): string {
    const state = this.generateRandomString(32);
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state: state
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Phase 1: Get User Profile
  async getProfile(): Promise<{ success: boolean; profile?: GmailProfile; error?: string }> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await this.makeApiCall('/gmail/v1/users/me/profile');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gmail profile API error:', response.status, errorText);
        throw new Error(`Gmail API error: ${response.status} - ${errorText}`);
      }

      const profile = await response.json();
      console.log('Gmail profile loaded:', profile);
      
      return {
        success: true,
        profile: {
          emailAddress: profile.emailAddress,
          messagesTotal: profile.messagesTotal || 0,
          threadsTotal: profile.threadsTotal || 0,
          historyId: profile.historyId
        }
      };
    } catch (error: any) {
      console.error('Error getting Gmail profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Phase 1: Sync Last 30 Days of Emails
  async syncRecentEmails(days: number = 30): Promise<{ 
    success: boolean; 
    emails?: any[]; 
    nextPageToken?: string;
    error?: string 
  }> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: 'Not authenticated' };
      }

      console.log(`Starting sync of last ${days} days of emails...`);

      // Calculate date X days ago
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      const query = `after:${Math.floor(daysAgo.getTime() / 1000)}`;

      console.log('Gmail query:', query);

      // Get message list
      const listResponse = await this.makeApiCall(
        `/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=100`
      );

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error('Gmail messages list API error:', listResponse.status, errorText);
        throw new Error(`Gmail API error: ${listResponse.status} - ${errorText}`);
      }

      const listData = await listResponse.json();
      console.log('Gmail messages list response:', listData);
      
      if (!listData.messages || listData.messages.length === 0) {
        console.log('No messages found in the specified time range');
        return { success: true, emails: [] };
      }

      console.log(`Found ${listData.messages.length} messages, fetching details...`);

      // Get detailed message data in batches
      const emails = await this.batchGetMessages(listData.messages.slice(0, 50)); // Limit to 50 for Phase 1

      console.log(`Successfully processed ${emails.length} emails`);

      return {
        success: true,
        emails,
        nextPageToken: listData.nextPageToken
      };
    } catch (error: any) {
      console.error('Error syncing emails:', error);
      return { success: false, error: error.message };
    }
  }

  // Phase 1: Batch Get Messages for Efficiency
  private async batchGetMessages(messageRefs: Array<{ id: string }>): Promise<any[]> {
    const emails = [];
    const batchSize = 5; // Smaller batches to avoid rate limits
    
    console.log(`Processing ${messageRefs.length} messages in batches of ${batchSize}...`);
    
    // Process in batches to avoid rate limits
    for (let i = 0; i < messageRefs.length; i += batchSize) {
      const batch = messageRefs.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(messageRefs.length/batchSize)}...`);
      
      const batchPromises = batch.map(ref => this.getMessage(ref.id));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        const validEmails = batchResults.filter(email => email !== null);
        emails.push(...validEmails);
        
        console.log(`Batch completed: ${validEmails.length}/${batch.length} emails processed successfully`);
        
        // Delay between batches to respect rate limits
        if (i + batchSize < messageRefs.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error('Batch processing error:', error);
        // Continue with next batch
      }
    }
    
    console.log(`Total emails processed: ${emails.length}`);
    return emails;
  }

  // Phase 1: Get Individual Message
  private async getMessage(messageId: string): Promise<any | null> {
    try {
      const response = await this.makeApiCall(`/gmail/v1/users/me/messages/${messageId}`);
      
      if (!response.ok) {
        console.error(`Failed to get message ${messageId}: ${response.status}`);
        return null;
      }

      const message: GmailMessage = await response.json();
      return this.parseGmailMessage(message);
    } catch (error) {
      console.error(`Error getting message ${messageId}:`, error);
      return null;
    }
  }

  // Phase 1: Parse Gmail Message to Our Format
  private parseGmailMessage(gmailMessage: GmailMessage): any {
    const headers = gmailMessage.payload.headers || [];
    
    const getHeader = (name: string) => 
      headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const subject = getHeader('Subject');
    const from = getHeader('From');
    const to = getHeader('To');
    const date = getHeader('Date');
    
    // Extract email address from "Name <email>" format
    const extractEmail = (str: string) => {
      const match = str.match(/<([^>]+)>/);
      return match ? match[1] : str.split(' ').pop() || str;
    };

    const extractName = (str: string) => {
      const match = str.match(/^([^<]+)</);
      if (match) {
        return match[1].trim().replace(/"/g, '');
      }
      // If no angle brackets, try to extract name before email
      const parts = str.split(' ');
      if (parts.length > 1 && parts[parts.length - 1].includes('@')) {
        return parts.slice(0, -1).join(' ').replace(/"/g, '');
      }
      return str.split('@')[0];
    };

    // Get email body
    const body = this.extractEmailBody(gmailMessage.payload);

    // Determine if email is important based on labels and content
    const isImportant = gmailMessage.labelIds?.includes('IMPORTANT') || 
                       subject.toLowerCase().includes('urgent') ||
                       subject.toLowerCase().includes('important') ||
                       subject.toLowerCase().includes('asap') ||
                       subject.toLowerCase().includes('priority');

    // Determine if read
    const isRead = !gmailMessage.labelIds?.includes('UNREAD');

    // Generate labels from Gmail labels
    const labels = this.generateLabels(gmailMessage.labelIds || []);

    // Parse timestamp
    let timestamp = new Date();
    if (date) {
      timestamp = new Date(date);
    } else if (gmailMessage.internalDate) {
      timestamp = new Date(parseInt(gmailMessage.internalDate));
    }

    return {
      id: gmailMessage.id,
      subject: subject || '(No Subject)',
      sender: extractName(from) || 'Unknown Sender',
      senderEmail: extractEmail(from) || 'unknown@example.com',
      recipient: extractEmail(to) || 'unknown@example.com',
      body: body || gmailMessage.snippet || '',
      timestamp,
      isRead,
      isImportant,
      labels,
      threadId: gmailMessage.threadId,
      gmailData: {
        historyId: gmailMessage.historyId,
        labelIds: gmailMessage.labelIds,
        snippet: gmailMessage.snippet
      }
    };
  }

  // Phase 1: Extract Email Body from Gmail Payload
  private extractEmailBody(payload: any): string {
    if (payload.body?.data) {
      return this.decodeBase64Url(payload.body.data);
    }

    if (payload.parts) {
      // First try to find plain text
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return this.decodeBase64Url(part.body.data);
        }
      }
      
      // Fallback to HTML if no plain text
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          const html = this.decodeBase64Url(part.body.data);
          return this.stripHtml(html);
        }
      }

      // Check nested parts
      for (const part of payload.parts) {
        if (part.parts) {
          const nestedBody = this.extractEmailBody(part);
          if (nestedBody) return nestedBody;
        }
      }
    }

    return '';
  }

  // Phase 1: Decode Base64URL
  private decodeBase64Url(data: string): string {
    try {
      // Convert base64url to base64
      let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      // Pad if necessary
      while (base64.length % 4) {
        base64 += '=';
      }
      return atob(base64);
    } catch (error) {
      console.error('Error decoding base64url:', error);
      return '';
    }
  }

  // Phase 1: Strip HTML Tags
  private stripHtml(html: string): string {
    try {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    } catch (error) {
      console.error('Error stripping HTML:', error);
      return html;
    }
  }

  // Phase 1: Generate User-Friendly Labels
  private generateLabels(gmailLabels: string[]): string[] {
    const labelMap: { [key: string]: string } = {
      'INBOX': 'Inbox',
      'SENT': 'Sent',
      'DRAFT': 'Draft',
      'SPAM': 'Spam',
      'TRASH': 'Trash',
      'IMPORTANT': 'Important',
      'STARRED': 'Starred',
      'UNREAD': 'Unread',
      'CATEGORY_PERSONAL': 'Personal',
      'CATEGORY_SOCIAL': 'Social',
      'CATEGORY_PROMOTIONS': 'Promotions',
      'CATEGORY_UPDATES': 'Updates',
      'CATEGORY_FORUMS': 'Forums'
    };

    return gmailLabels
      .map(label => labelMap[label] || label.replace('Label_', ''))
      .filter(label => !['Unread', 'Inbox'].includes(label)); // Filter out common labels
  }

  // Token Management
  private async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken) {
      console.log('No access token available');
      return false;
    }

    // Check if token is expired
    if (this.tokenExpiry && this.tokenExpiry <= new Date()) {
      console.log('Access token expired, attempting refresh...');
      if (this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) {
          console.log('Token refresh failed');
          return false;
        }
      } else {
        console.log('No refresh token available');
        return false;
      }
    }

    return true;
  }

  // Phase 1: Make API Call with Auth
  private async makeApiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const url = `https://www.googleapis.com${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Handle token refresh if needed
    if (response.status === 401 && this.refreshToken) {
      console.log('Received 401, attempting token refresh...');
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        return fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
      }
    }

    return response;
  }

  // Phase 1: Refresh Access Token
  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        console.log('No refresh token available');
        return false;
      }

      console.log('Refreshing access token...');

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', response.status, errorText);
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
      
      // Save updated tokens
      this.saveTokensToStorage();
      
      console.log('Access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Token Storage
  private saveTokensToStorage(): void {
    try {
      const tokenData = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry?.toISOString()
      };
      localStorage.setItem('gmail_tokens', JSON.stringify(tokenData));
      console.log('Tokens saved to localStorage');
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  private loadTokensFromStorage(): void {
    try {
      const tokenData = localStorage.getItem('gmail_tokens');
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
        this.tokenExpiry = parsed.tokenExpiry ? new Date(parsed.tokenExpiry) : null;
        console.log('Tokens loaded from localStorage');
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  }

  // Phase 1: Check if Authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Phase 1: Get Access Token for Storage
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Phase 1: Set Tokens (for restoration from storage)
  setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    if (expiresIn) {
      this.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
    }
    this.saveTokensToStorage();
  }

  // Clear authentication
  clearAuth(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('gmail_tokens');
    console.log('Gmail authentication cleared');
  }
}

// Export singleton instance
export const gmailIntegration = new GmailIntegration();