import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, User, Email } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_EMAILS'; payload: Email[] }
  | { type: 'SELECT_EMAIL'; payload: Email | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_EMAIL'; payload: Email }
  | { type: 'UPDATE_EMAIL'; payload: { id: string; updates: Partial<Email> } }
  | { type: 'LOGOUT' };

// Load user from localStorage if available
const loadUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem('isdc_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const initialState: AppState = {
  user: loadUserFromStorage(),
  emails: [],
  selectedEmail: null,
  isLoading: false,
  error: null,
  sidebarOpen: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      // Persist user to localStorage
      if (action.payload) {
        localStorage.setItem('isdc_user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('isdc_user');
      }
      return { ...state, user: action.payload };
    case 'SET_EMAILS':
      return { ...state, emails: action.payload };
    case 'SELECT_EMAIL':
      return { ...state, selectedEmail: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'ADD_EMAIL':
      return { ...state, emails: [action.payload, ...state.emails] };
    case 'UPDATE_EMAIL':
      return {
        ...state,
        emails: state.emails.map(email =>
          email.id === action.payload.id
            ? { ...email, ...action.payload.updates }
            : email
        ),
      };
    case 'LOGOUT':
      localStorage.removeItem('isdc_user');
      return { ...initialState, user: null, sidebarOpen: true };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load emails when user is authenticated
  useEffect(() => {
    if (state.user?.isAuthenticated) {
      loadUserEmails();
    }
  }, [state.user]);

  const loadUserEmails = async () => {
    if (!state.user?.isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (isSupabaseConfigured() && supabase) {
        // Load real emails from database
        const { data: emails, error } = await supabase
          .from('emails')
          .select('*')
          .eq('user_id', state.user.id)
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error loading emails:', error);
          // Fall back to mock data if database query fails
          loadMockEmails();
          return;
        }

        if (emails && emails.length > 0) {
          // Convert database emails to our Email type
          const convertedEmails: Email[] = emails.map(email => ({
            id: email.id,
            subject: email.subject,
            sender: email.sender_name,
            senderEmail: email.sender_email,
            recipient: email.recipient_email,
            body: email.body,
            timestamp: new Date(email.timestamp),
            isRead: email.is_read,
            isImportant: email.is_important,
            labels: email.labels || [],
            threadId: email.thread_id
          }));

          dispatch({ type: 'SET_EMAILS', payload: convertedEmails });
        } else {
          // No emails in database, load mock data for demo
          loadMockEmails();
        }
      } else {
        // Demo mode - load mock emails
        loadMockEmails();
      }
    } catch (error) {
      console.error('Error loading emails:', error);
      loadMockEmails(); // Fallback to mock data
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadMockEmails = () => {
    const mockEmails: Email[] = [
      {
        id: '1',
        subject: 'Q4 Sales Report - Performance Analysis',
        sender: 'Sarah Johnson',
        senderEmail: 'sarah.johnson@analytics.com',
        recipient: state.user?.email || 'user@example.com',
        body: `Hi ${state.user?.name?.split(' ')[0] || 'there'}, I've completed the comprehensive Q4 sales analysis. The results show a remarkable 23% increase in revenue compared to Q3, with particularly strong performance in our premium product lines. The data indicates significant growth opportunities in the organic segment, and I've identified three key areas where we can optimize our supply chain for even better margins. I've attached the detailed report with actionable recommendations for the upcoming board meeting.`,
        timestamp: new Date('2024-01-15T09:30:00'),
        isRead: false,
        isImportant: true,
        labels: ['Business', 'Reports', 'High Priority'],
      },
      {
        id: '2',
        subject: 'Strategic Partnership Opportunity - Supply Chain Optimization',
        sender: 'Michael Chen',
        senderEmail: 'michael.chen@suppliers.com',
        recipient: state.user?.email || 'user@example.com',
        body: `Dear ${state.user?.name?.split(' ')[0] || 'there'}, We have an exciting strategic opportunity to discuss a new partnership that could significantly reduce your supply chain costs by up to 15% while improving delivery times. Our innovative logistics platform has helped similar companies streamline their operations and increase profitability. I'd love to schedule a call this week to discuss how we can support your growth objectives.`,
        timestamp: new Date('2024-01-15T08:45:00'),
        isRead: false,
        isImportant: false,
        labels: ['Business', 'Partnerships', 'Cost Savings'],
      },
      {
        id: '3',
        subject: 'Executive Team Meeting Agenda - January 16th Strategic Planning',
        sender: 'Lisa Rodriguez',
        senderEmail: 'lisa@company.com',
        recipient: state.user?.email || 'user@example.com',
        body: `Hi ${state.user?.name?.split(' ')[0] || 'there'}, Here's the comprehensive agenda for tomorrow's executive team meeting. Please review the quarterly objectives section and the new market expansion proposals. We'll be discussing the budget allocation for Q2 and the timeline for the new product launches. I've also included the competitive analysis report that came in this morning.`,
        timestamp: new Date('2024-01-14T16:20:00'),
        isRead: true,
        isImportant: false,
        labels: ['Internal', 'Meetings', 'Strategic'],
      },
      {
        id: '4',
        subject: 'Urgent: Contract Renewal - Action Required',
        sender: 'David Kim',
        senderEmail: 'david.kim@procurement.com',
        recipient: state.user?.email || 'user@example.com',
        body: `${state.user?.name?.split(' ')[0] || 'there'}, The contract with our primary supplier expires at the end of this month. We need your approval on the renewed terms, which include a 5% price increase but guarantee supply stability for the next 18 months. Given the current market volatility, I recommend we proceed with the renewal to secure our supply chain.`,
        timestamp: new Date('2024-01-14T14:15:00'),
        isRead: false,
        isImportant: true,
        labels: ['Urgent', 'Contracts', 'Suppliers'],
      },
      {
        id: '5',
        subject: 'Weekly Performance Dashboard - Key Metrics Update',
        sender: 'Analytics Team',
        senderEmail: 'analytics@company.com',
        recipient: state.user?.email || 'user@example.com',
        body: `Hello ${state.user?.name?.split(' ')[0] || 'there'}, Your weekly performance dashboard is ready. This week shows strong performance across all key metrics: Customer satisfaction is up 12%, operational efficiency improved by 8%, and revenue growth continues at 15% month-over-month. The AI insights suggest focusing on the emerging market segments for maximum impact next quarter.`,
        timestamp: new Date('2024-01-13T10:00:00'),
        isRead: true,
        isImportant: false,
        labels: ['Analytics', 'Performance', 'Weekly Report'],
      },
    ];
    
    dispatch({ type: 'SET_EMAILS', payload: mockEmails });
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}