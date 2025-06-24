// AIAssistant.tsx – Production-Ready AI Assistant UI
// ✅ Clean layout, clear actions, voice-ready, and ready to connect to OpenAI
// 🔗 Link each quick action to OpenAI function calls next

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, User, Mic, MicOff, Volume2, VolumeX, Send,
  TrendingUp, Star, MessageSquare, Calendar, BarChart3,
  Target, RotateCcw, Lightbulb, Brain, Layers, Settings, PieChart
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'summarize-unread',
      title: 'Summarize Unread',
      description: 'AI summary of unread emails',
      icon: TrendingUp,
      category: 'analysis',
      action: 'Summarize unread emails and highlight the most important ones',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      id: 'priority-emails',
      title: 'Priority Analysis',
      description: 'Show high-priority emails',
      icon: Star,
      category: 'analysis',
      action: 'What are my priority emails today?',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'draft-responses',
      title: 'Draft Replies',
      description: 'AI replies to key emails',
      icon: MessageSquare,
      category: 'compose',
      action: 'Draft responses to important unread emails',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'analytics',
      title: 'Email Analytics',
      description: 'Inbox behavior insights',
      icon: BarChart3,
      category: 'insights',
      action: 'Show me email behavior and productivity stats',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'followups',
      title: 'Follow-ups',
      description: 'Track emails needing replies',
      icon: RotateCcw,
      category: 'manage',
      action: 'Show follow-ups I owe responses to',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-ai',
          content: `🔍 Analyzing request: "${inputValue}"...\n\n(This is where OpenAI output will go.)`,
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }, 1200);
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.action);
    handleSendMessage();
  };

  const toggleVoiceInput = () => {
    setIsListening((prev) => !prev);
  };

  const toggleVoiceOutput = () => {
    setIsSpeaking((prev) => !prev);
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-96 border-r border-neutral-200 p-6 bg-white flex flex-col">
        <h2 className="text-lg font-bold mb-4">AI Actions</h2>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <Card key={action.id} className="cursor-pointer hover:shadow-md" onClick={() => handleQuickAction(action)}>
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.bgColor}`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{action.title}</h3>
                  <p className="text-xs text-neutral-500">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t">
          <div className="flex gap-3">
            <Button icon={isListening ? Mic : MicOff} onClick={toggleVoiceInput} />
            <Button icon={isSpeaking ? Volume2 : VolumeX} onClick={toggleVoiceOutput} />
          </div>
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white flex gap-3">
          <Input
            placeholder="Ask the assistant..."
            value={inputValue}
            onChange={setInputValue}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button icon={Send} onClick={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
