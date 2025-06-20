import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function Sidebar() {
  return (
    <motion.div
      initial={{ x: -256, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white border-r border-neutral-200 flex flex-col"
    >
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-medium">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">ISDC Assistant</h1>
            <p className="text-xs text-neutral-600">AI-Powered</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}