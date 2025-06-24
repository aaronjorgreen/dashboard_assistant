import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Users, Search, Bell, User, Bot, Sparkles, Menu, X, Shield, LogOut, Mic, Volume2, Settings, ChevronDown
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { EmailWorkspace } from './EmailWorkspace';
import { AdminPanel } from './AdminPanel';
import { AIAssistant } from './AIAssistant';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function Dashboard() {
  const { state, dispatch } = useApp();
  const { signOut, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<'emails' | 'admin' | 'ai'>('emails');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'emails', label: 'Email Workspace', icon: Mail },
    ...(isAdmin() ? [{ id: 'admin', label: 'Admin Panel', icon: Users }] : []),
    { id: 'ai', label: 'AI Assistant', icon: Bot },
  ];

  const handleLogout = async () => {
    await signOut();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-semibold">AI Assistant</h1>
            <p className="text-xs text-neutral-500">Intelligent Email Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search emails or ask AI..."
            icon={Search}
            className="w-64 rounded-xl"
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" icon={Mic} />
            <Button variant="ghost" size="icon" icon={Volume2} />
            <Button variant="ghost" size="icon" icon={Bell} />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-medium">{state.user?.name || 'User'}</div>
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex justify-center bg-neutral-50 border-b border-neutral-200 px-6 py-3">
        <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentView === item.id ? 'bg-primary-100 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'emails' && <EmailWorkspace />}
          {currentView === 'admin' && isAdmin() && <AdminPanel />}
          {currentView === 'ai' && <AIAssistant />}
        </motion.div>
      </main>
    </div>
  );
}
