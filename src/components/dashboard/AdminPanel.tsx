import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Activity, 
  UserPlus, 
  Search,
  Key,
  Mail,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  UserMinus,
  Crown
} from 'lucide-react';
import { supabase, UserProfile, ActivityLog } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function AdminPanel() {
  const { profile, inviteUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'activity'>('users');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [inviteResult, setInviteResult] = useState<{message: string, tempPassword?: string} | null>(null);

  useEffect(() => {
    loadUsers();
    loadActivities();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user_profiles!activity_logs_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;

    try {
      const result = await inviteUser(newUserEmail, newUserName, 'admin');
      
      if (result.error) {
        setInviteResult({ message: `Error: ${result.error}` });
      } else {
        setInviteResult({ 
          message: result.message || 'User invited successfully!',
          tempPassword: result.tempPassword 
        });
        setNewUserEmail('');
        setNewUserName('');
        loadUsers();
      }
    } catch (error: any) {
      setInviteResult({ message: `Error: ${error.message}` });
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Active Users', value: users.filter(u => u.is_active).length, icon: Eye, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Crown, color: 'text-warning-600', bg: 'bg-warning-50' },
    { label: 'Temp Passwords', value: users.filter(u => u.temp_password).length, icon: Key, color: 'text-error-600', bg: 'bg-error-50' },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-neutral-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-white to-neutral-50/50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Panel</h1>
          <p className="text-neutral-600">Manage users and monitor system activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center" padding="lg">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
              <p className="text-sm text-neutral-600 font-medium">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-neutral-100 rounded-2xl p-1 w-fit">
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              selectedTab === 'users'
                ? 'bg-white text-primary-700 shadow-soft'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setSelectedTab('activity')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              selectedTab === 'activity'
                ? 'bg-white text-primary-700 shadow-soft'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Activity Logs
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'users' && (
          <div className="space-y-8">
            {/* Invite User */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-1">Invite New Admin</h3>
                  <p className="text-neutral-600">Add authorized administrators to the system</p>
                </div>
                <Button 
                  icon={UserPlus} 
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className={showInviteForm ? 'bg-success-600 hover:bg-success-700' : ''}
                >
                  {showInviteForm ? 'Cancel' : 'Invite Admin'}
                </Button>
              </div>

              {showInviteForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-neutral-200 pt-6"
                >
                  <form onSubmit={handleInviteUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Enter full name"
                      value={newUserName}
                      onChange={setNewUserName}
                      icon={Users}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter email address"
                      value={newUserEmail}
                      onChange={setNewUserEmail}
                      icon={Mail}
                    />
                    <div className="md:col-span-2">
                      <Button 
                        type="submit" 
                        icon={UserPlus}
                        disabled={!newUserEmail || !newUserName}
                      >
                        Send Invitation
                      </Button>
                    </div>
                  </form>

                  {inviteResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-4 rounded-2xl ${
                        inviteResult.message.includes('Error') 
                          ? 'bg-error-50 border border-error-200' 
                          : 'bg-success-50 border border-success-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {inviteResult.message.includes('Error') ? (
                          <AlertTriangle className="w-5 h-5 text-error-600 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            inviteResult.message.includes('Error') ? 'text-error-800' : 'text-success-800'
                          }`}>
                            {inviteResult.message}
                          </p>
                          {inviteResult.tempPassword && (
                            <div className="mt-4 p-4 bg-white rounded-xl border">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-neutral-700 mb-1">Temporary Password:</p>
                                  <code className="text-sm font-mono text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                                    {inviteResult.tempPassword}
                                  </code>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  icon={Copy}
                                  onClick={() => copyToClipboard(inviteResult.tempPassword!)}
                                >
                                  Copy
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </Card>

            {/* Users List */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Authorized Admins</h2>
                <div className="w-80">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    icon={Search}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 rounded-xl">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900 rounded-l-xl">Admin</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Password</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Last Login</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900 rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900">{user.full_name}</p>
                              <p className="text-sm text-neutral-600">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-success-100 text-success-800' 
                              : 'bg-error-100 text-error-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.temp_password 
                              ? 'bg-warning-100 text-warning-800' 
                              : 'bg-success-100 text-success-800'
                          }`}>
                            {user.temp_password ? (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Temporary
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Permanent
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={user.is_active ? UserMinus : Eye}
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {selectedTab === 'activity' && (
          <Card padding="lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Activity Logs</h2>
              <p className="text-neutral-600 mt-1">Monitor system access and admin actions</p>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-4 bg-neutral-50 rounded-2xl">
                  <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 text-sm">
                      {(activity as any).user_profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-neutral-600">{activity.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.activity_type === 'login' ? 'bg-success-100 text-success-800' :
                    activity.activity_type === 'logout' ? 'bg-neutral-100 text-neutral-800' :
                    activity.activity_type === 'admin_action' ? 'bg-warning-100 text-warning-800' :
                    'bg-primary-100 text-primary-800'
                  }`}>
                    {activity.activity_type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}