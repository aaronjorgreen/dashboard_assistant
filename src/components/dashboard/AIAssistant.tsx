import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Volume2, Activity } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { aiAssistant } from '../../lib/openai';

export function AIAssistant() {
  const { state } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setInputValue('');

    const aiReply = await aiAssistant.chatWithAI(userMessage.content);

    const aiMessage = {
      id: Date.now().toString() + '-ai',
      content: aiReply,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsProcessing(false);
  };

  const handleSummarizeUnread = async () => {
    setIsProcessing(true);
    const unreadEmails = state.emails.filter((e) => !e.isRead);
    const summary = await aiAssistant.summarizeEmails(unreadEmails);

    const aiMessage = {
      id: Date.now().toString() + '-summary',
      content: summary,
      sender: 'ai',
      timestamp: new Date(),
      type: 'summary',
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsProcessing(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-neutral-200 p-4 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5" /> AI Functions
        </h2>
        <p className="text-sm text-neutral-500">Ask anything or run a quick action</p>
        <Button onClick={handleSummarizeUnread} className="w-full">
          Summarize Unread
        </Button>
      </div>

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-success-600" />
            <h1 className="text-xl font-bold">AI Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="text-success-600 w-4 h-4" />
            <span className="text-sm text-success-700">Online</span>
          </div>
        </div>

        {/* Messages (scrollable only here) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-md p-4 shadow-md whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-primary-100 text-black'
                      : 'bg-white text-neutral-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Sticky input at bottom */}
        <div className="p-4 border-t border-neutral-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask your AI assistant..."
              value={inputValue}
              onChange={(val) => setInputValue(val)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button icon={Send} onClick={handleSendMessage} disabled={!inputValue || isProcessing} />
            <Button icon={Volume2} onClick={() => setIsSpeaking(!isSpeaking)} variant="ghost" />
          </div>
        </div>
      </div>
    </div>
  );
}
