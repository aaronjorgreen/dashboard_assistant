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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-soft">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 via-primary-700 to-success-600 rounded-2xl flex items-center justify-center shadow-large">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white">
                  <Sparkles className="w-2 h-2 text-white ml-0.5 mt-0.5" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <p className="text-sm text-neutral-500 font-medium">Intelligent Email Management</p>
              </div>
            </div>

            {/* Center Search */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search emails, ask AI, or run commands..."
                  className="w-full pl-12 pr-6 py-3 bg-white/60 border border-neutral-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all duration-300 text-neutral-900 placeholder-neutral-500"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-neutral-100">
                <Mic className="w-5 h-5 text-neutral-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-neutral-100">
                <Volume2 className="w-5 h-5 text-neutral-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-neutral-100 relative">
                <Bell className="w-5 h-5 text-neutral-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></div>
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 pl-3 border-l border-neutral-200">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-medium">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-neutral-900">{state.user?.name || 'User'}</p>
                  <p className="text-xs text-neutral-500">{isAdmin() ? 'Administrator' : 'User'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-neutral-200/30">
        <div className="px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-neutral-100/80 rounded-2xl p-1.5 shadow-soft">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    currentView === item.id
                      ? 'bg-white text-primary-700 shadow-medium border border-primary-200/50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-140px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {currentView === 'emails' && <EmailWorkspace />}
            {currentView === 'admin' && isAdmin() && <AdminPanel />}
            {currentView === 'ai' && <AIAssistant />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
