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
  Filter,
  MoreHorizontal,
  CheckCircle
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
    <div className="h-full flex bg-gradient-to-br from-white to-neutral-50/30">
      {/* Email List Panel */}
      <div className="w-96 border-r border-neutral-200/50 flex flex-col bg-white/60 backdrop-blur-sm">
        {/* List Header */}
        <div className="p-6 border-b border-neutral-200/30 bg-gradient-to-r from-white/80 to-primary-50/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Inbox</h2>
              <p className="text-sm text-neutral-600 font-medium">{filteredEmails.length} conversations</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-neutral-100">
                <Filter className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={() => setIsComposing(true)} className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-medium">
                <Plus className="w-4 h-4 mr-2" />
                Compose
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/80 border border-neutral-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all duration-300"
            />
          </div>
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
              className={`p-6 cursor-pointer border-b border-neutral-100/50 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-primary-50/30 transition-all duration-300 ${
                selectedEmail?.id === email.id ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'
              } ${!email.isRead ? 'bg-gradient-to-r from-blue-50/30 to-primary-50/20' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-medium">
                  <User className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-semibold truncate ${!email.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}>
                      {email.sender}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-neutral-500 font-medium">{formatTime(email.timestamp)}</span>
                      {!email.isRead && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>}
                      {email.isImportant && <Star className="w-3.5 h-3.5 text-warning-500 fill-current" />}
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-3 truncate ${!email.isRead ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>
                    {email.subject}
                  </p>
                  
                  <p className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
                    {email.body}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {email.labels.slice(0, 2).map((label) => (
                      <span
                        key={label}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 border border-neutral-200/50"
                      >
                        {label}
                      </span>
                    ))}
                    {email.labels.length > 2 && (
                      <span className="text-xs text-neutral-500 font-medium">
                        +{email.labels.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Email Content Panel */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-8 border-b border-neutral-200/30 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-large">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{selectedEmail.sender}</h3>
                    <p className="text-neutral-600 font-medium">{selectedEmail.senderEmail}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {selectedEmail.labels.map((label) => (
                        <span
                          key={label}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-200/50"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleListen}
                    className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
                      isPlaying 
                        ? 'text-primary-600 border-primary-300 bg-primary-50 shadow-glow' 
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    {isPlaying ? <Volume2 className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Playing...' : 'Listen'}
                  </Button>
                  <Button variant="ghost" size="sm" className={`p-3 rounded-xl ${selectedEmail.isImportant ? 'text-warning-500 bg-warning-50' : 'hover:bg-neutral-100'}`}>
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-neutral-100">
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-neutral-100 hover:text-error-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-neutral-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-3">{selectedEmail.subject}</h1>
                <div className="flex items-center space-x-6 text-sm text-neutral-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{selectedEmail.timestamp.toLocaleString()}</span>
                  </div>
                  <span className="font-medium">to {selectedEmail.recipient}</span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-br from-white to-neutral-50/30">
              <Card className="shadow-medium border-neutral-200/50" padding="lg">
                <div className="prose max-w-none">
                  <p className="text-neutral-800 leading-relaxed text-lg whitespace-pre-wrap">
                    {selectedEmail.body}
                  </p>
                </div>
              </Card>

              {/* AI Insights */}
              <Card className="bg-gradient-to-br from-primary-50 via-primary-50/80 to-success-50/60 border-primary-200/50 shadow-large" padding="lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-success-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-medium">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-4">
                      <h4 className="text-xl font-bold text-neutral-900">AI Analysis</h4>
                      <Sparkles className="w-5 h-5 text-primary-600" />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50">
                        <TrendingUp className="w-6 h-6 text-success-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-neutral-700">High Priority</p>
                        <p className="text-xs text-neutral-600">Revenue impact</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50">
                        <Calendar className="w-6 h-6 text-warning-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-neutral-700">Action Required</p>
                        <p className="text-xs text-neutral-600">Follow-up needed</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50">
                        <CheckCircle className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-neutral-700">Positive</p>
                        <p className="text-xs text-neutral-600">Sentiment</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button size="sm" className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-medium">
                        <Zap className="w-3 h-3 mr-2" />
                        Extract Metrics
                      </Button>
                      <Button size="sm" variant="outline" className="border-2 border-success-300 text-success-700 hover:bg-success-50">
                        <Calendar className="w-3 h-3 mr-2" />
                        Schedule Meeting
                      </Button>
                      <Button size="sm" variant="outline" className="border-2 border-warning-300 text-warning-700 hover:bg-warning-50">
                        <FileText className="w-3 h-3 mr-2" />
                        Generate Summary
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Bar */}
            <div className="p-8 border-t border-neutral-200/30 bg-gradient-to-r from-white/90 to-primary-50/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-medium hover:shadow-large transition-all duration-300">
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" className="border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50">
                    <ReplyAll className="w-4 h-4 mr-2" />
                    Reply All
                  </Button>
                  <Button variant="outline" className="border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50">
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50 font-semibold">
                  <Bot className="w-4 h-4 mr-2" />
                  Ask AI Assistant
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50/20">
            <motion.div 
              className="text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
                <Mail className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">Select an Email</h3>
              <p className="text-neutral-600 text-lg max-w-md">Choose a conversation from your inbox to view its contents and get AI-powered insights</p>
            </motion.div>
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
                  className="h-8 w-8 p-0 rounded-xl hover:bg-neutral-100"
                >
                  ×
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <Input placeholder="To" className="rounded-2xl" />
                <Input placeholder="Subject" className="rounded-2xl" />
                <textarea
                  placeholder="Write your message..."
                  className="w-full h-40 p-4 border border-neutral-200 rounded-2xl resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <Mic className="w-4 h-4 mr-2" />
                      Voice Input
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <Bot className="w-4 h-4 mr-2" />
                      AI Assist
                    </Button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setIsComposing(false)} className="rounded-xl">
                      Cancel
                    </Button>
                    <Button className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800">
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