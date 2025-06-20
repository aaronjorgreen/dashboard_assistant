export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'member';
  isAuthenticated: boolean;
}

export interface Email {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  labels: string[];
  threadId?: string;
}

export interface AIResponse {
  id: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'voice';
  confidence?: number;
}

export interface AppState {
  user: User | null;
  emails: Email[];
  selectedEmail: Email | null;
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
}