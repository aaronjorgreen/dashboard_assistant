import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white border-b border-neutral-200 flex items-center justify-center px-6 z-30"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-medium">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-neutral-900">ISDC Assistant</h1>
          <p className="text-xs text-neutral-600">AI-Powered Email Intelligence</p>
        </div>
        <Sparkles className="w-5 h-5 text-primary-600" />
      </div>
    </motion.header>
  );
}