import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  ReplyAll, 
  Forward,
  User,
  Clock,
  Bot,
  Sparkles,
  TrendingUp,
  Calendar,
  FileText,
  Zap,
  Volume2,
  Mic,
  Plus,
  Filter
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function EmailView() {
  const { state } = useApp();
  const [selectedEmail, setSelectedEmail] = useState(state.emails[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredEmails = state.emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="w-96 border-r border-neutral-200/50 flex flex-col">
        {/* List Header */}
        <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-white to-primary-50/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Inbox</h2>
              <p className="text-sm text-neutral-600">{filteredEmails.length} conversations</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" icon={Filter} className="h-9 w-9 p-0" />
              <Button size="sm" icon={Plus} onClick={() => setIsComposing(true)} className="h-9">
                Compose
              </Button>
            </div>
          </div>
          
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={setSearchQuery}
            icon={Search}
            className="bg-white border-neutral-200"
          />
        </div>
        
        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map((email, index) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedEmail(email)}
              className={`p-4 cursor-pointer border-b border-neutral-100/50 hover:bg-neutral-50 transition-all duration-200 ${
                selectedEmail?.id === email.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'
              } ${!email.isRead ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-medium">
                  <User className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-semibold truncate ${!email.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}>
                      {email.sender}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-neutral-500">{formatTime(email.timestamp)}</span>
                      {!email.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full"></div>}
                      {email.isImportant && <Star className="w-3 h-3 text-warning-500 fill-current" />}
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-2 truncate ${!email.isRead ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}>
                    {email.subject}
                  </p>
                  
                  <p className="text-xs text-neutral-600 line-clamp-2 mb-2">
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-6 border-b border-neutral-200/50 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-medium">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">{selectedEmail.sender}</h3>
                    <p className="text-sm text-neutral-600">{selectedEmail.senderEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={isPlaying ? Volume2 : Mic}
                    onClick={handleListen}
                    className={`${isPlaying ? 'text-primary-600 border-primary-300 bg-primary-50' : ''}`}
                  >
                    {isPlaying ? 'Stop' : 'Listen'}
                  </Button>
                  <Button variant="ghost" size="sm" icon={Star} className={selectedEmail.isImportant ? 'text-warning-500' : ''} />
                  <Button variant="ghost" size="sm" icon={Archive} />
                  <Button variant="ghost" size="sm" icon={Trash2} className="hover:text-error-600" />
                </div>
              </div>

              <div>
                <h1 className="text-xl font-bold text-neutral-900 mb-2">{selectedEmail.subject}</h1>
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedEmail.timestamp.toLocaleString()}</span>
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
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <Card className="shadow-medium" padding="lg">
                <div className="prose max-w-none">
                  <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.body}
                  </p>
                </div>
              </Card>

              {/* AI Insights */}
              <Card className="bg-gradient-to-br from-primary-50 to-success-50 border-primary-200/50" padding="lg">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-success-600 rounded-2xl flex items-center justify-center shadow-medium">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-4">
                      <h4 className="text-lg font-bold text-neutral-900">AI Analysis</h4>
                      <Sparkles className="w-4 h-4 text-primary-600" />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/60 rounded-xl p-3 text-center">
                        <TrendingUp className="w-5 h-5 text-success-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-neutral-700">High Priority</p>
                        <p className="text-xs text-neutral-600">Revenue impact</p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-3 text-center">
                        <Calendar className="w-5 h-5 text-warning-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-neutral-700">Action Required</p>
                        <p className="text-xs text-neutral-600">Follow-up needed</p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-3 text-center">
                        <FileText className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-neutral-700">Positive</p>
                        <p className="text-xs text-neutral-600">Sentiment</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <Zap className="w-3 h-3 mr-1" />
                        Extract Metrics
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-white to-primary-50/30">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <Button icon={Reply}>Reply</Button>
                  <Button icon={ReplyAll} variant="outline">Reply All</Button>
                  <Button icon={Forward} variant="outline">Forward</Button>
                </div>
                
                <Button variant="ghost" size="sm" icon={Bot} className="text-primary-600 hover:bg-primary-50">
                  Ask AI
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Select an Email</h3>
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900">Compose Email</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsComposing(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <Input placeholder="To" />
                <Input placeholder="Subject" />
                <textarea
                  placeholder="Write your message..."
                  className="w-full h-40 p-4 border border-neutral-200 rounded-2xl resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" icon={Mic}>Voice Input</Button>
                    <Button variant="ghost" size="sm" icon={Bot}>AI Assist</Button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setIsComposing(false)}>Cancel</Button>
                    <Button>Send</Button>
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