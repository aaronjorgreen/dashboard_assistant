import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Search, 
  Filter, 
  Archive, 
  Star, 
  Trash2, 
  MoreHorizontal,
  User,
  Clock,
  Reply,
  ReplyAll,
  Forward,
  Bot,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  Send,
  Mic,
  Volume2,
  Eye,
  CheckCircle,
  Zap,
  Plus,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Email {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  labels: string[];
}

const mockEmails: Email[] = [
  {
    id: '1',
    subject: 'Q4 Sales Report - ISDC Foods Performance Analysis',
    sender: 'Sarah Johnson',
    senderEmail: 'sarah.johnson@analytics.com',
    body: 'Hi Danny, I\'ve completed the comprehensive Q4 sales analysis for ISDC Foods. The results show a remarkable 23% increase in revenue compared to Q3, with particularly strong performance in our premium product lines. The data indicates significant growth opportunities in the organic segment, and I\'ve identified three key areas where we can optimize our supply chain for even better margins. I\'ve attached the detailed report with actionable recommendations for the upcoming board meeting.',
    timestamp: new Date('2024-01-15T09:30:00'),
    isRead: false,
    isImportant: true,
    labels: ['Business', 'Reports'],
  },
  {
    id: '2',
    subject: 'Strategic Partnership Opportunity - Supply Chain Optimization',
    sender: 'Michael Chen',
    senderEmail: 'michael.chen@suppliers.com',
    body: 'Dear Danny, We have an exciting strategic opportunity to discuss a new partnership that could significantly reduce your supply chain costs by up to 15% while improving delivery times. Our innovative logistics platform has helped similar food companies streamline their operations and increase profitability. I\'d love to schedule a call this week to discuss how we can support ISDC Foods\' growth objectives.',
    timestamp: new Date('2024-01-15T08:45:00'),
    isRead: false,
    isImportant: false,
    labels: ['Business', 'Partnerships'],
  },
  {
    id: '3',
    subject: 'Executive Team Meeting Agenda - January 16th Strategic Planning',
    sender: 'Lisa Rodriguez',
    senderEmail: 'lisa@isdc-foods.com.au',
    body: 'Hi Danny, Here\'s the comprehensive agenda for tomorrow\'s executive team meeting. Please review the quarterly objectives section and the new market expansion proposals. We\'ll be discussing the budget allocation for Q2 and the timeline for the new product launches. I\'ve also included the competitive analysis report that came in this morning.',
    timestamp: new Date('2024-01-14T16:20:00'),
    isRead: true,
    isImportant: false,
    labels: ['Internal', 'Meetings'],
  },
  {
    id: '4',
    subject: 'Urgent: Supplier Contract Renewal - Action Required',
    sender: 'David Kim',
    senderEmail: 'david.kim@procurement.com',
    body: 'Danny, The contract with our primary organic supplier expires at the end of this month. We need your approval on the renewed terms, which include a 5% price increase but guarantee supply stability for the next 18 months. Given the current market volatility, I recommend we proceed with the renewal to secure our supply chain.',
    timestamp: new Date('2024-01-14T14:15:00'),
    isRead: false,
    isImportant: true,
    labels: ['Urgent', 'Contracts'],
  },
];

export function MainArea() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(mockEmails[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleListen = () => {
    if (!selectedEmail) return;
    
    setIsPlaying(!isPlaying);
    
    if (!isPlaying && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Email from ${selectedEmail.sender}. Subject: ${selectedEmail.subject}. ${selectedEmail.body}`
      );
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="h-full flex bg-white">
      {/* Email List */}
      <div className="w-80 border-r border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-neutral-900">Inbox</h2>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" icon={Filter} className="h-8 w-8 p-0" />
              <Button variant="ghost" size="sm" icon={Plus} className="h-8 w-8 p-0" onClick={() => setIsComposing(true)} />
            </div>
          </div>
          
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={setSearchQuery}
            icon={Search}
            className="h-9"
          />
          
          <div className="flex items-center justify-between mt-3 text-xs text-neutral-600">
            <span>{mockEmails.length} emails</span>
            <span>{mockEmails.filter(e => !e.isRead).length} unread</span>
          </div>
        </div>
        
        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {mockEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-3 cursor-pointer border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                selectedEmail?.id === email.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'
              } ${!email.isRead ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">
                    {email.sender.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-semibold truncate ${!email.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}>
                      {email.sender}
                    </p>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-neutral-500">{formatTime(email.timestamp)}</span>
                      {!email.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full"></div>}
                      {email.isImportant && <Star className="w-3 h-3 text-warning-500 fill-current" />}
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-1 truncate ${!email.isRead ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}>
                    {email.subject}
                  </p>
                  
                  <p className="text-xs text-neutral-600 line-clamp-1 mb-2">
                    {email.body}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {email.labels.slice(0, 2).map((label) => (
                      <span
                        key={label}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email View */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-4 border-b border-neutral-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedEmail.sender.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{selectedEmail.sender}</h3>
                    <p className="text-sm text-neutral-600">{selectedEmail.senderEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={isPlaying ? Volume2 : Mic}
                    onClick={handleListen}
                    className={`h-9 ${isPlaying ? 'text-primary-600 border-primary-300 bg-primary-50' : ''}`}
                  >
                    {isPlaying ? 'Stop' : 'Listen'}
                  </Button>
                  <Button variant="ghost" size="sm" icon={Star} className={`h-9 w-9 ${selectedEmail.isImportant ? 'text-warning-500' : ''}`} />
                  <Button variant="ghost" size="sm" icon={Archive} className="h-9 w-9" />
                  <Button variant="ghost" size="sm" icon={Trash2} className="h-9 w-9 hover:text-error-600" />
                  <Button variant="ghost" size="sm" icon={MoreHorizontal} className="h-9 w-9" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 mb-1">{selectedEmail.subject}</h1>
                  <div className="flex items-center space-x-4 text-sm text-neutral-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(selectedEmail.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  {selectedEmail.labels.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Email Body */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="prose max-w-none">
                  <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.body}
                  </p>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-gradient-to-r from-primary-50 to-success-50 border border-primary-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h4 className="font-bold text-neutral-900">AI Analysis</h4>
                      <Sparkles className="w-4 h-4 text-primary-600" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <TrendingUp className="w-4 h-4 text-success-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-neutral-700">High Priority</p>
                        <p className="text-xs text-neutral-600">Revenue growth</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <Calendar className="w-4 h-4 text-warning-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-neutral-700">Action Required</p>
                        <p className="text-xs text-neutral-600">Schedule follow-up</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <CheckCircle className="w-4 h-4 text-primary-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-neutral-700">Sentiment</p>
                        <p className="text-xs text-neutral-600">Positive</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" className="text-xs h-8">
                        <Zap className="w-3 h-3 mr-1" />
                        Extract Metrics
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button icon={Reply} className="h-9">Reply</Button>
                  <Button icon={ReplyAll} variant="outline" className="h-9">Reply All</Button>
                  <Button icon={Forward} variant="outline" className="h-9">Forward</Button>
                </div>
                
                <Button variant="ghost" size="sm" icon={Bot} className="text-primary-600 hover:bg-primary-50 h-9">
                  Ask AI
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Select an Email</h3>
              <p className="text-neutral-600">Choose a conversation to view its contents</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="font-bold text-neutral-900">Compose Email</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => setIsComposing(false)}
                  className="h-8 w-8 p-0"
                />
              </div>
              
              <div className="p-4 space-y-4">
                <Input placeholder="To" className="h-9" />
                <Input placeholder="Subject" className="h-9" />
                <textarea
                  placeholder="Write your message..."
                  className="w-full h-40 p-3 border border-neutral-200 rounded-xl resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" icon={Mic} className="h-9">
                      Voice Input
                    </Button>
                    <Button variant="ghost" size="sm" icon={Bot} className="h-9">
                      AI Assist
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setIsComposing(false)} className="h-9">
                      Cancel
                    </Button>
                    <Button icon={Send} className="h-9">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}