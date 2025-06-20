import React from 'react';
import { motion } from 'framer-motion';
import { Star, Paperclip, Clock, User, Bot, Zap, AlertCircle } from 'lucide-react';
import { Email } from '../../types';
import { Card } from '../ui/Card';

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
}

const mockEmails: Email[] = [
  {
    id: '1',
    subject: 'Q4 Sales Report - ISDC Foods Performance Analysis',
    sender: 'Sarah Johnson',
    senderEmail: 'sarah.johnson@analytics.com',
    recipient: 'danny@isdc-foods.com.au',
    body: 'Hi Danny, I\'ve completed the comprehensive Q4 sales analysis for ISDC Foods. The results show a remarkable 23% increase in revenue compared to Q3, with particularly strong performance in our premium product lines...',
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
    recipient: 'danny@isdc-foods.com.au',
    body: 'Dear Danny, We have an exciting strategic opportunity to discuss a new partnership that could significantly reduce your supply chain costs by up to 15% while improving delivery times...',
    timestamp: new Date('2024-01-15T08:45:00'),
    isRead: false,
    isImportant: false,
    labels: ['Business', 'Partnerships', 'Cost Savings'],
  },
  {
    id: '3',
    subject: 'Executive Team Meeting Agenda - January 16th Strategic Planning',
    sender: 'Lisa Rodriguez',
    senderEmail: 'lisa@isdc-foods.com.au',
    recipient: 'danny@isdc-foods.com.au',
    body: 'Hi Danny, Here\'s the comprehensive agenda for tomorrow\'s executive team meeting. Please review the quarterly objectives section and the new market expansion proposals...',
    timestamp: new Date('2024-01-14T16:20:00'),
    isRead: true,
    isImportant: false,
    labels: ['Internal', 'Meetings', 'Strategic'],
  },
];

export function EmailList({ emails = mockEmails, selectedEmail, onSelectEmail }: EmailListProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getPriorityColor = (email: Email) => {
    if (email.isImportant) return 'from-error-500 to-warning-500';
    if (!email.isRead) return 'from-primary-500 to-primary-600';
    return 'from-neutral-400 to-neutral-500';
  };

  return (
    <div className="h-full bg-white/50 backdrop-blur-sm border-r border-neutral-200/50">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-white to-primary-50/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900">Inbox</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-success-700">AI Processing</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600 font-medium">{emails.length} conversations</p>
          <div className="flex items-center space-x-2 px-3 py-1 bg-primary-50 rounded-full border border-primary-200/50">
            <Bot className="w-3 h-3 text-primary-600" />
            <span className="text-xs font-bold text-primary-700">{emails.filter(e => !e.isRead).length} unread</span>
          </div>
        </div>
      </div>
      
      {/* Email List */}
      <div className="overflow-y-auto">
        {emails.map((email, index) => (
          <motion.div
            key={email.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onSelectEmail(email)}
            className={`
              relative p-6 cursor-pointer transition-all duration-300 border-b border-neutral-100/50 group
              ${selectedEmail?.id === email.id 
                ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 border-r-4 border-primary-500 shadow-soft' 
                : 'hover:bg-gradient-to-r hover:from-neutral-50 hover:to-primary-50/30 hover:shadow-soft'
              }
              ${!email.isRead ? 'bg-gradient-to-r from-blue-50/30 to-primary-50/20' : ''}
            `}
          >
            {/* Priority Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getPriorityColor(email)} opacity-60`}></div>

            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-large transition-all duration-300">
                  <User className="w-6 h-6 text-white" />
                </div>
                {email.isImportant && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-warning-500 to-error-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              {/* Email Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <p className={`text-sm font-semibold truncate ${
                      !email.isRead ? 'text-neutral-900' : 'text-neutral-700'
                    }`}>
                      {email.sender}
                    </p>
                    {email.isImportant && (
                      <Star className="w-4 h-4 text-warning-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-neutral-500 font-medium">
                      {formatTime(email.timestamp)}
                    </span>
                    {!email.isRead && (
                      <div className="w-3 h-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-soft"></div>
                    )}
                  </div>
                </div>
                
                <p className={`text-sm mb-3 truncate ${
                  !email.isRead ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'
                }`}>
                  {email.subject}
                </p>
                
                <p className="text-sm text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
                  {email.body}
                </p>
                
                {/* Labels and AI Insights */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {email.labels.slice(0, 2).map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 border border-neutral-200/50"
                      >
                        {label}
                      </span>
                    ))}
                    {email.labels.length > 2 && (
                      <span className="text-xs text-neutral-500 font-medium">
                        +{email.labels.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  {/* AI Processing Indicator */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-success-50 to-primary-50 rounded-full border border-success-200/50">
                      <Zap className="w-3 h-3 text-success-600" />
                      <span className="text-xs font-medium text-success-700">AI Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Summary Footer */}
      <motion.div 
        className="p-4 border-t border-neutral-200/50 bg-gradient-to-r from-primary-50/50 to-success-50/50"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">AI Insights Available</p>
            <p className="text-xs text-neutral-600">2 high-priority items need attention</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}