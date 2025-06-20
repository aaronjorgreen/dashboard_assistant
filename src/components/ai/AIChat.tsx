import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Bot,
  User,
  Sparkles,
  Zap,
  Brain,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'voice';
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello Danny! I'm your AI assistant, powered by advanced language models and trained specifically for ISDC Foods operations. I can help you manage emails, draft responses, extract insights, schedule meetings, and much more. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand you'd like help with that. I'm analyzing your request using advanced AI capabilities. In the full version, I'll be powered by OpenAI's latest models to provide intelligent, contextual responses tailored specifically to your business needs and ISDC Foods operations.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const quickActions = [
    { text: "Summarize my unread emails", icon: TrendingUp },
    { text: "Draft a response to the latest email", icon: MessageSquare },
    { text: "What are my priority emails today?", icon: Sparkles },
    { text: "Schedule a follow-up meeting", icon: Brain },
  ];

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-white to-primary-50/20 border-neutral-200/50 shadow-large" padding="none">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-primary-50 to-success-50">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-success-600 rounded-2xl flex items-center justify-center shadow-medium">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-neutral-900">AI Assistant</h3>
            <p className="text-sm text-neutral-600 font-medium">Powered by advanced language models</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-success-700">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
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
              <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-medium ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700' 
                    : 'bg-gradient-to-br from-success-500 to-success-600'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div className={`rounded-2xl px-5 py-3 shadow-soft ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white'
                    : 'bg-white text-neutral-900 border border-neutral-200/50'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-medium">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-5 py-3 border border-neutral-200/50 shadow-soft">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-neutral-200/50 bg-gradient-to-r from-white to-primary-50/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Ask me anything about your emails or business..."
              value={inputValue}
              onChange={setInputValue}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-white/80 border-neutral-200/50 focus:bg-white focus:border-primary-300 rounded-2xl"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            icon={isListening ? Mic : MicOff}
            onClick={toggleVoiceInput}
            className={`p-3 rounded-2xl transition-all duration-300 ${
              isListening 
                ? 'text-success-600 bg-success-50 shadow-glow border-2 border-success-200' 
                : 'text-neutral-500 hover:text-success-600 hover:bg-success-50 border-2 border-transparent'
            }`}
          />
          
          <Button
            size="sm"
            icon={Send}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-medium hover:shadow-large transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.text}
              onClick={() => setInputValue(action.text)}
              className="flex items-center space-x-2 text-xs bg-gradient-to-r from-neutral-50 to-primary-50 hover:from-primary-50 hover:to-primary-100 px-3 py-2 rounded-xl text-neutral-700 hover:text-primary-700 transition-all duration-300 border border-neutral-200/50 hover:border-primary-200 group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <action.icon className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium truncate">{action.text}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </Card>
  );
}