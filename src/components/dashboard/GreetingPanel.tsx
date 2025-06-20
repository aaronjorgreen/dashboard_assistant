import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff,
  Calendar,
  Mail,
  TrendingUp,
  Clock,
  User,
  Volume2,
  VolumeX,
  BarChart3,
  FileText,
  Star
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function GreetingPanel() {
  const { state } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Good evening${state.user?.name ? `, ${state.user.name.split(' ')[0]}` : ''}! I've analyzed your inbox and found ${state.emails.filter(e => !e.isRead).length} high-priority emails requiring your attention. Would you like me to summarize them?`,
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        `I'll help you with that right away, ${state.user?.name?.split(' ')[0] || 'there'}. Let me analyze the relevant data and provide you with actionable insights.`,
        `Based on your recent email patterns, I recommend prioritizing the supplier contracts first, then the quarterly reports.`,
        `I've processed your request. Here are the key points you should focus on for maximum impact on your business goals.`,
        `Great question! I'm analyzing your business data to provide the most relevant and timely response.`,
        `I can see you have ${state.emails.filter(e => e.isImportant).length} important emails that need immediate attention. Would you like me to prioritize them?`
      ];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    { text: "What's urgent today?", icon: Clock },
    { text: "Show email analytics", icon: BarChart3 },
    { text: "Draft a response", icon: MessageSquare },
    { text: "Schedule a meeting", icon: Calendar },
  ];

  const todayStats = [
    { 
      label: 'Unread', 
      value: state.emails.filter(e => !e.isRead).length, 
      icon: Mail, 
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    { 
      label: 'Important', 
      value: state.emails.filter(e => e.isImportant).length, 
      icon: Star, 
      color: 'text-warning-600',
      bgColor: 'bg-warning-50'
    },
    { 
      label: 'Total', 
      value: state.emails.length, 
      icon: FileText, 
      color: 'text-success-600',
      bgColor: 'bg-success-50'
    },
  ];

  const handleVoiceToggle = () => {
    setIsSpeaking(!isSpeaking);
    
    if (!isSpeaking && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Hello ${state.user?.name?.split(' ')[0] || 'there'}! I'm your AI assistant. How can I help you today?`
      );
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleVoiceInput = () => {
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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">
              {getGreeting()}{state.user?.name ? `, ${state.user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-sm text-neutral-600">{formatTime(currentTime)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {todayStats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-2 text-center`}
            >
              <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
              <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
              <p className="text-xs text-neutral-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* AI Status */}
        <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-neutral-900">AI Assistant</p>
              <p className="text-xs text-neutral-600">Ready to help</p>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-success-700">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-primary-600" />
            <h3 className="font-bold text-neutral-900">AI Assistant</h3>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-primary-600' 
                      : 'bg-success-500'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-white" />
                    )}
                  </div>
                  
                  <div className={`rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-900 border border-neutral-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-primary-100' : 'text-neutral-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-success-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white rounded-lg px-3 py-2 border border-neutral-200">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-neutral-200 bg-white">
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex-1">
              <Input
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={setInputValue}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="h-9"
              />
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                icon={isListening ? Mic : MicOff}
                onClick={handleVoiceInput}
                className={`h-8 w-8 p-0 ${isListening ? 'text-success-600 bg-success-50' : 'text-neutral-500'}`}
              />
              
              <Button
                variant="ghost"
                size="sm"
                icon={isSpeaking ? Volume2 : VolumeX}
                onClick={handleVoiceToggle}
                className={`h-8 w-8 p-0 ${isSpeaking ? 'text-primary-600 bg-primary-50' : 'text-neutral-500'}`}
              />
              
              <Button
                size="sm"
                icon={Send}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-8 w-8 p-0"
              />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-1">
            {quickActions.map((action) => (
              <button
                key={action.text}
                onClick={() => setInputValue(action.text)}
                className="flex items-center space-x-1 text-xs bg-neutral-50 hover:bg-primary-50 px-2 py-1.5 rounded-lg text-neutral-700 hover:text-primary-700 transition-all duration-200 border border-neutral-200 hover:border-primary-200"
              >
                <action.icon className="w-3 h-3" />
                <span className="truncate">{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}