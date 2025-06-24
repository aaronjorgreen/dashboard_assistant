import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 w-full bg-white border-b border-neutral-200 px-6 flex items-center justify-between shadow-sm z-30"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-xs text-neutral-500">AI-Powered Email Intelligence</p>
        </div>
      </div>

      <Sparkles className="w-5 h-5 text-primary-600 opacity-80" />
    </motion.header>
  );
}
