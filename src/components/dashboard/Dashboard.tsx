import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Users, 
  Search, 
  Bell, 
  User,
  Bot,
  Sparkles,
  Menu,
  X,
  Shield,
  LogOut,
  Mic,
  Volume2,
  Settings,
  ChevronDown
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const navigationItems = [
    { id: 'emails', label: 'Email Workspace', icon: Mail, count: state.emails.filter(e => !e.isRead).length },
    ...(isAdmin() ? [{ id: 'admin', label: 'Admin Panel', icon: Users, count: 0 }] : []),
    { id: 'ai', label: 'AI Assistant', icon: Bot, count: 0 },
  ];

  const notifications = [
    { id: 1, message: 'New high-priority email from Sarah Johnson', time: '2 min ago', type: 'email', unread: true },
    { id: 2, message: 'AI analysis completed for 5 emails', time: '5 min ago', type: 'ai', unread: true },
    { id: 3, message: 'Weekly email summary ready', time: '1 hour ago', type: 'report', unread: false },
    { id: 4, message: 'Contract renewal email requires attention', time: '2 hours ago', type: 'email', unread: true },
  ];

  const unreadEmailCount = state.emails.filter(e => !e.isRead).length;
  const unreadNotificationCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/10">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-neutral-200/50 sticky top-0 z-50 shadow-soft">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  <Menu className="w-5 h-5 text-neutral-600" />
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-medium">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-success-500 to-success-600 rounded-full border-2 border-white flex items-center justify-center">
                      <Sparkles className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-neutral-900">AI Assistant</h1>
                    <p className="text-xs text-neutral-600 font-medium">Intelligent Email Management</p>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1 bg-neutral-100/80 rounded-2xl p-1 backdrop-blur-sm">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                      currentView === item.id
                        ? 'bg-white text-primary-700 shadow-soft border border-primary-100'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.count > 0 && (
                      <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-soft">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right: Search & Controls */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block w-80">
                <Input
                  placeholder="Search emails or ask AI..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  icon={Search}
                  className="bg-neutral-50/80 border-neutral-200/50 focus:bg-white focus:border-primary-300 rounded-2xl backdrop-blur-sm"
                />
              </div>

              {/* Voice Controls */}
              <div className="hidden sm:flex items-center space-x-1 bg-neutral-100/80 rounded-xl p-1 backdrop-blur-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={Mic} 
                  className="h-8 w-8 p-0 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200" 
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={Volume2} 
                  className="h-8 w-8 p-0 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200" 
                />
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl hover:bg-neutral-100/80 transition-all duration-200 backdrop-blur-sm"
                >
                  <Bell className="w-5 h-5 text-neutral-600" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-error-500 to-error-600 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-medium border-2 border-white">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-large border border-neutral-200/50 overflow-hidden z-50 backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-primary-50/30">
                        <h3 className="font-bold text-neutral-900">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-neutral-500 font-medium">
                            {unreadNotificationCount} unread
                          </span>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                          >
                            <X className="w-4 h-4 text-neutral-500" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`flex items-start space-x-3 p-4 hover:bg-neutral-50 transition-colors border-l-4 ${
                              notification.unread 
                                ? 'border-l-primary-500 bg-primary-50/30' 
                                : 'border-l-transparent'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'email' ? 'bg-primary-100' :
                              notification.type === 'ai' ? 'bg-success-100' :
                              'bg-warning-100'
                            }`}>
                              {notification.type === 'email' && <Mail className="w-4 h-4 text-primary-600" />}
                              {notification.type === 'ai' && <Bot className="w-4 h-4 text-success-600" />}
                              {notification.type === 'report' && <Settings className="w-4 h-4 text-warning-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-relaxed ${
                                notification.unread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-neutral-500 mt-1 font-medium">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-4 border-t border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-primary-50/30">
                        <button className="w-full text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors py-2 px-4 rounded-xl hover:bg-primary-50">
                          Mark all as read
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-neutral-100/80 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-medium">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-neutral-900">{state.user?.name}</p>
                    <p className="text-xs text-neutral-600 font-medium">{isAdmin() ? 'Administrator' : 'User'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-500 hidden md:block" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-large border border-neutral-200/50 overflow-hidden z-50 backdrop-blur-md"
                    >
                      <div className="p-4 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-primary-50/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-medium">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">{state.user?.name}</p>
                            <p className="text-sm text-neutral-600">{state.user?.email}</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 mt-1 border border-primary-200">
                              <Shield className="w-3 h-3 mr-1" />
                              {isAdmin() ? 'Administrator' : 'User'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                          <Settings className="w-4 h-4" />
                          <span>Account Settings</span>
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 h-full bg-white/95 backdrop-blur-md shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-medium">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">AI Assistant</h2>
                    <p className="text-xs text-neutral-600">Navigation</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as any);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 shadow-soft'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count > 0 && (
                      <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-[calc(100vh-5rem)]"
        >
          {currentView === 'emails' && <EmailWorkspace />}
          {currentView === 'admin' && isAdmin() && <AdminPanel />}
          {currentView === 'ai' && <AIAssistant />}
        </motion.div>
      </main>
    </div>
  );
}