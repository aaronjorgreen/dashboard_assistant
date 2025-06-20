import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Archive, 
  Trash2, 
  Star, 
  MoreHorizontal,
  User,
  Clock,
  Mic,
  Volume2,
  Bot,
  Sparkles,
  Zap,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react';
import { Email } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface EmailViewProps {
  email: Email | null;
}

export function EmailView({ email }: EmailViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!email) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50/20">
        <motion.div 
          className="text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
            <User className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-3">Select an Email</h3>
          <p className="text-neutral-600 text-lg max-w-md">Choose a conversation from your inbox to view its contents and get AI-powered insights</p>
        </motion.div>
      </div>
    );
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-full flex flex-col bg-gradient-to-br from-white to-primary-50/10"
    >
      {/* Header */}
      <div className="p-8 border-b border-neutral-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-large">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{email.sender}</h2>
              <p className="text-neutral-600 font-medium">{email.senderEmail}</p>
              <div className="flex items-center space-x-2 mt-1">
                {email.labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-200"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              icon={Star} 
              className={`p-3 rounded-xl ${email.isImportant ? 'text-warning-500 bg-warning-50' : 'hover:bg-neutral-100'}`}
            />
            <Button variant="ghost" size="sm" icon={Archive} className="p-3 rounded-xl hover:bg-neutral-100" />
            <Button variant="ghost" size="sm" icon={Trash2} className="p-3 rounded-xl hover:bg-neutral-100 hover:text-error-600" />
            <Button variant="ghost" size="sm" icon={MoreHorizontal} className="p-3 rounded-xl hover:bg-neutral-100" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">{email.subject}</h1>
            <div className="flex items-center space-x-6 text-sm text-neutral-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatDateTime(email.timestamp)}</span>
              </div>
              <span className="font-medium">to {email.recipient}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              icon={isPlaying ? Volume2 : Mic}
              onClick={handlePlayAudio}
              className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
                isPlaying 
                  ? 'text-primary-600 border-primary-300 bg-primary-50 shadow-glow' 
                  : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              {isPlaying ? 'Playing...' : 'Listen'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Email Body */}
        <Card className="shadow-medium border-neutral-200/50" padding="lg">
          <div className="prose max-w-none">
            <p className="text-neutral-800 leading-relaxed text-lg whitespace-pre-wrap">
              {email.body}
            </p>
          </div>
        </Card>

        {/* AI Insights Panel */}
        <Card className="bg-gradient-to-br from-primary-50 to-success-50 border-primary-200/50 shadow-large" padding="lg">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-success-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-medium">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-xl font-bold text-neutral-900">AI Assistant Analysis</h3>
                <Sparkles className="w-5 h-5 text-primary-600" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-success-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-success-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 mb-1">Key Insights Detected</p>
                      <p className="text-sm text-neutral-700">This email contains important financial data showing 23% revenue growth. Priority: High</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-warning-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-warning-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 mb-1">Action Required</p>
                      <p className="text-sm text-neutral-700">Schedule follow-up meeting to discuss Q4 performance metrics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 mb-1">Document Analysis</p>
                      <p className="text-sm text-neutral-700">Sales report attachment contains 15 key performance indicators</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-neutral-900 mb-3">Suggested Actions</h4>
                  <Button size="sm" className="w-full justify-start bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800">
                    <Zap className="w-4 h-4 mr-2" />
                    Extract Key Metrics
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start border-success-300 text-success-700 hover:bg-success-50">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Follow-up
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start border-warning-300 text-warning-700 hover:bg-warning-50">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Summary
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions Footer */}
      <div className="p-8 border-t border-neutral-200/50 bg-gradient-to-r from-white to-primary-50/30">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Button 
              icon={Reply} 
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-medium hover:shadow-large transition-all duration-300"
            >
              Reply
            </Button>
            <Button 
              icon={ReplyAll} 
              variant="outline" 
              className="border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
            >
              Reply All
            </Button>
            <Button 
              icon={Forward} 
              variant="outline"
              className="border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
            >
              Forward
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary-600 hover:bg-primary-50 font-semibold"
          >
            <Bot className="w-4 h-4 mr-2" />
            Ask AI Assistant
          </Button>
        </div>
      </div>
    </motion.div>
  );
}