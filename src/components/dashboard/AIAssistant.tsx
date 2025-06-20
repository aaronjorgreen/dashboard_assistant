import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  User,
  Sparkles,
  Zap,
  Brain,
  TrendingUp,
  MessageSquare,
  Calendar,
  BarChart3,
  FileText,
  Mail,
  Clock,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  Search,
  Filter,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Target,
  Layers,
  PieChart,
  Activity
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'voice' | 'action' | 'summary';
  metadata?: {
    emailCount?: number;
    actionType?: string;
    confidence?: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'analysis' | 'compose' | 'manage' | 'insights';
  action: string;
  color: string;
  bgColor: string;
}

export function AIAssistant() {
  const { state } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Good ${getTimeOfDay()}, ${state.user?.name?.split(' ')[0] || 'there'}! I'm your AI assistant, ready to help you manage your emails intelligently. I've analyzed your current inbox and found ${state.emails.filter(e => !e.isRead).length} unread emails with ${state.emails.filter(e => e.isImportant).length} high-priority items that need your attention.`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  const quickActions: QuickAction[] = [
    {
      id: 'summarize-unread',
      title: 'Summarize Unread',
      description: 'Get AI summary of all unread emails',
      icon: TrendingUp,
      category: 'analysis',
      action: 'Summarize my unread emails and highlight the most important ones',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      id: 'priority-emails',
      title: 'Priority Analysis',
      description: 'Identify high-priority emails requiring immediate attention',
      icon: Star,
      category: 'analysis',
      action: 'What are my priority emails today and what actions do they require?',
      color: 'text-warning-600',
      bgColor: 'bg-warning-50'
    },
    {
      id: 'draft-responses',
      title: 'Draft Responses',
      description: 'Generate AI responses for important emails',
      icon: MessageSquare,
      category: 'compose',
      action: 'Help me draft responses to my most important unread emails',
      color: 'text-success-600',
      bgColor: 'bg-success-50'
    },
    {
      id: 'schedule-meetings',
      title: 'Schedule Meetings',
      description: 'Find emails requesting meetings and suggest times',
      icon: Calendar,
      category: 'manage',
      action: 'Find emails requesting meetings and help me schedule them',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'email-analytics',
      title: 'Email Analytics',
      description: 'Analyze email patterns and productivity metrics',
      icon: BarChart3,
      category: 'insights',
      action: 'Show me analytics on my email patterns and productivity insights',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'action-items',
      title: 'Extract Actions',
      description: 'Find all action items and deadlines from emails',
      icon: Target,
      category: 'analysis',
      action: 'Extract all action items and deadlines from my recent emails',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'follow-ups',
      title: 'Follow-up Tracker',
      description: 'Track emails that need follow-up responses',
      icon: RotateCcw,
      category: 'manage',
      action: 'Show me emails that need follow-up and suggest when to respond',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'business-insights',
      title: 'Business Insights',
      description: 'Extract business intelligence from email content',
      icon: Lightbulb,
      category: 'insights',
      action: 'Analyze my emails for business insights and opportunities',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Actions', icon: Layers },
    { id: 'analysis', label: 'Analysis', icon: Brain },
    { id: 'compose', label: 'Compose', icon: MessageSquare },
    { id: 'manage', label: 'Manage', icon: Settings },
    { id: 'insights', label: 'Insights', icon: PieChart }
  ];

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        `I've analyzed your request, ${state.user?.name?.split(' ')[0] || 'there'}. Based on your current email data, here are the key insights and recommendations I've generated for you.`,
        `Processing your email data now... I found several important patterns and actionable items that require your attention. Let me break this down for you.`,
        `Great question! I've examined your recent emails and identified the most critical items. Here's what I recommend focusing on first.`,
        `I've completed the analysis of your emails. Based on the content and patterns, I've prioritized the most important actions and insights for your review.`
      ];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          emailCount: state.emails.length,
          confidence: 0.95
        }
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setIsProcessing(false);
    }, 2000);
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.action);
    handleSendMessage();
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    
    if (!isListening && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognition.start();
    } else {
      setIsListening(false);
    }
  };

  const toggleVoiceOutput = () => {
    setIsSpeaking(!isSpeaking);
    
    if (!isSpeaking && 'speechSynthesis' in window) {
      const lastAiMessage = messages.filter(m => m.sender === 'ai').pop();
      if (lastAiMessage) {
        const utterance = new SpeechSynthesisUtterance(lastAiMessage.content);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-full bg-gradient-to-br from-white to-primary-50/10 flex">
      {/* Left Panel - AI Functions & Quick Actions */}
      <div className="w-96 border-r border-neutral-200/50 bg-white/80 backdrop-blur-sm flex flex-col">
        {/* Functions Header */}
        <div className="p-6 border-b border-neutral-200/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">AI Functions</h2>
              <p className="text-sm text-neutral-600">Quick actions and capabilities</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-success-700">Ready</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-transparent'
                }`}
              >
                <category.icon className="w-3 h-3" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-medium transition-all duration-300 border border-neutral-200/50 hover:border-primary-200"
                  padding="md"
                  hover
                  onClick={() => handleQuickAction(action)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${action.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 text-sm mb-1">{action.title}</h3>
                      <p className="text-xs text-neutral-600 leading-relaxed">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Voice Controls */}
        <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-white to-primary-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Voice Controls</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={isListening ? Mic : MicOff}
                onClick={toggleVoiceInput}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isListening 
                    ? 'text-success-600 bg-success-50 shadow-glow border-2 border-success-200' 
                    : 'text-neutral-500 hover:text-success-600 hover:bg-success-50'
                }`}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={isSpeaking ? Volume2 : VolumeX}
                onClick={toggleVoiceOutput}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isSpeaking 
                    ? 'text-primary-600 bg-primary-50 shadow-glow border-2 border-primary-200' 
                    : 'text-neutral-500 hover:text-primary-600 hover:bg-primary-50'
                }`}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center space-x-2 text-xs bg-neutral-50 hover:bg-success-50 px-3 py-2 rounded-xl text-neutral-700 hover:text-success-700 transition-all duration-200 border border-neutral-200 hover:border-success-200">
              <Mic className="w-3 h-3" />
              <span>Voice Input</span>
            </button>
            <button className="flex items-center space-x-2 text-xs bg-neutral-50 hover:bg-primary-50 px-3 py-2 rounded-xl text-neutral-700 hover:text-primary-700 transition-all duration-200 border border-neutral-200 hover:border-primary-200">
              <Volume2 className="w-3 h-3" />
              <span>Read Aloud</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-neutral-200/50 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-success-600 rounded-2xl flex items-center justify-center shadow-medium">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">AI Assistant</h1>
                <p className="text-sm text-neutral-600">Powered by advanced language models</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-xl border border-primary-200">
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-primary-700">Processing...</span>
                </div>
              )}

              {/* Status Indicators */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-success-50 rounded-xl border border-success-200">
                  <Activity className="w-4 h-4 text-success-600" />
                  <span className="text-sm font-medium text-success-700">AI Online</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={isExpanded ? Minimize2 : Maximize2}
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-xl hover:bg-neutral-100"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-primary-50 rounded-2xl p-4 text-center">
              <Mail className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-neutral-900">{state.emails.filter(e => !e.isRead).length}</p>
              <p className="text-sm text-neutral-600">Unread</p>
            </div>
            <div className="bg-warning-50 rounded-2xl p-4 text-center">
              <Star className="w-6 h-6 text-warning-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-neutral-900">{state.emails.filter(e => e.isImportant).length}</p>
              <p className="text-sm text-neutral-600">Priority</p>
            </div>
            <div className="bg-success-50 rounded-2xl p-4 text-center">
              <CheckCircle className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-neutral-900">{state.emails.length}</p>
              <p className="text-sm text-neutral-600">Total</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <Brain className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-neutral-900">Ready</p>
              <p className="text-sm text-neutral-600">AI Status</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-4 max-w-2xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-medium ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700' 
                      : 'bg-gradient-to-br from-success-500 to-success-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-6 h-6 text-white" />
                    ) : (
                      <Bot className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <Card className={`shadow-medium ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white border-primary-500'
                      : 'bg-white text-neutral-900 border-neutral-200/50'
                  }`} padding="lg">
                    <p className="text-sm leading-relaxed mb-3">{message.content}</p>
                    
                    {message.metadata && (
                      <div className="flex items-center justify-between pt-3 border-t border-white/20">
                        <div className="flex items-center space-x-4 text-xs">
                          {message.metadata.emailCount && (
                            <span className="opacity-75">
                              {message.metadata.emailCount} emails analyzed
                            </span>
                          )}
                          {message.metadata.confidence && (
                            <span className="opacity-75">
                              {Math.round(message.metadata.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <span className={`text-xs opacity-75 ${
                          message.sender === 'user' ? 'text-primary-100' : 'text-neutral-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-medium">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <Card className="bg-white border-neutral-200/50 shadow-medium" padding="lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-white to-primary-50/30">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Ask me anything about your emails or business..."
                value={inputValue}
                onChange={setInputValue}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-white/80 border-neutral-200/50 focus:bg-white focus:border-primary-300 rounded-2xl text-base py-4 pr-16"
              />
            </div>
            
            <Button
              size="lg"
              icon={Send}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-medium hover:shadow-large transition-all duration-300"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}