import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppProvider, useApp } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';
import { AuthScreen } from './components/auth/AuthScreen';
import { AdminSetup } from './components/admin/AdminSetup';
import { Dashboard } from './components/dashboard/Dashboard';
import { User } from './types';
import { isSupabaseConfigured } from './lib/supabase';

function AppContent() {
  const { state, dispatch } = useApp();
  const { user, profile, loading } = useAuth();
  const [needsSetup, setNeedsSetup] = useState(false);

  const handleAuthenticate = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  // Check if we need initial admin setup
  useEffect(() => {
    if (isSupabaseConfigured() && !loading && !user) {
      // In a real app, you'd check if any admin users exist
      // For now, we'll assume setup is needed if no user is logged in
      setNeedsSetup(false); // Set to true if you want to test admin setup
    }
  }, [loading, user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Loading AI Email Assistant</h2>
          <p className="text-neutral-600">Connecting to your workspace...</p>
        </motion.div>
      </div>
    );
  }

  // Show admin setup if needed
  if (needsSetup) {
    return <AdminSetup onSetupComplete={() => setNeedsSetup(false)} />;
  }

  // Show auth screen if not authenticated
  if (!user || !state.user?.isAuthenticated) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />;
  }

  // Main dashboard
  return <Dashboard />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;