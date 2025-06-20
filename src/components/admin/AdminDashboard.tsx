import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  UserPlus, 
  UserMinus,
  Crown,
  Eye,
  Search,
  Key,
  Mail,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Lock
} from 'lucide-react';
import { supabase, UserProfile, ActivityLog } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function AdminDashboard() {
  const { profile, isAdmin, inviteUser, resetUserPassword } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'activity' | 'settings'>('users');
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin'>('admin');
  const [inviteResult, setInviteResult] = useState<{message: string, tempPassword?: string} | null>(null);
  const [resetResult, setResetResult] = useState<{message: string, tempPassword?: string, userEmail?: string} | null>(null);

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
      loadActivities();
    }
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
        .limit(50);

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
      const result = await inviteUser(newUserEmail, newUserName, newUserRole);
      
      if (result.error) {
        setInviteResult({ message: `Error: ${result.error}` });
      } else {
        setInviteResult({ 
          message: result.message || 'User invited successfully!',
          tempPassword: result.tempPassword 
        });
        setNewUserEmail('');
        setNewUserName('');
        setNewUserRole('admin');
        loadUsers();
      }
    } catch (error: any) {
      setInviteResult({ message: `Error: ${error.message}` });
    }
  };

  const handleResetPassword = async (userEmail: string) => {
    try {
      const result = await resetUserPassword(userEmail);
      
      if (result.error) {
        setResetResult({ message: `Error: ${result.error}`, userEmail });
      } else {
        setResetResult({ 
          message: result.message || 'Password reset successfully!',
          tempPassword: result.tempPassword,
          userEmail
        });
        loadUsers(); // Refresh to show updated temp password status
      }
    } catch (error: any) {
      setResetResult({ message: `Error: ${error.message}`, userEmail });
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;

      await supabase.rpc('log_user_activity', {
        activity_type_param: 'admin_action',
        description_param: `User ${!isActive ? 'activated' : 'deactivated'}`,
        metadata_param: { target_user_id: userId, new_status: !isActive }
      });

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

  if (!isAdmin()) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-white border border-neutral-200 rounded-xl p-8">
          <Shield className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Access Denied</h2>
          <p className="text-neutral-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary-600' },
    { label: 'Active Users', value: users.filter(u => u.is_active).length, icon: Eye, color: 'text-success-600' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Crown, color: 'text-warning-600' },
    { label: 'Temp Passwords', value: users.filter(u => u.temp_password).length, icon: Key, color: 'text-error-600' },
  ];

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
            <p className="text-neutral-600">Manage invite-only access, monitor activity, and configure system settings</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                <p className="text-sm text-neutral-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-neutral-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          {selectedTab === 'users' && (
            <div className="space-y-6">
              {/* Global Reset Result */}
              {resetResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    resetResult.message.includes('Error') 
                      ? 'bg-error-50 border-error-200' 
                      : 'bg-success-50 border-success-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {resetResult.message.includes('Error') ? (
                      <AlertTriangle className="w-5 h-5 text-error-600 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        resetResult.message.includes('Error') ? 'text-error-800' : 'text-success-800'
                      }`}>
                        Password Reset for {resetResult.userEmail}: {resetResult.message}
                      </p>
                      {resetResult.tempPassword && (
                        <div className="mt-3 p-3 bg-white rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-neutral-700 mb-1">New Temporary Password:</p>
                              <code className="text-sm font-mono text-neutral-900 bg-neutral-100 px-2 py-1 rounded">
                                {resetResult.tempPassword}
                              </code>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Copy}
                              onClick={() => copyToClipboard(resetResult.tempPassword!)}
                              className="ml-2"
                            >
                              Copy
                            </Button>
                          </div>
                          <div className="mt-2 p-2 bg-warning-50 border border-warning-200 rounded">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-warning-600" />
                              <p className="text-xs text-warning-700 font-medium">Security Notice</p>
                            </div>
                            <p className="text-xs text-warning-600 mt-1">
                              Share this temporary password securely. It expires in 24 hours and the user must create a permanent password on next login.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResetResult(null)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      ×
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Invite User Section */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">Invite New Admin</h3>
                    <p className="text-sm text-neutral-600">Add authorized admins to the system with temporary passwords</p>
                  </div>
                  <Button 
                    icon={UserPlus} 
                    onClick={() => setShowInviteUser(!showInviteUser)}
                    className={showInviteUser ? 'bg-success-600 hover:bg-success-700' : ''}
                  >
                    {showInviteUser ? 'Cancel' : 'Invite Admin'}
                  </Button>
                </div>

                {showInviteUser && (
                  <div className="border-t border-neutral-200 pt-4">
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
                          className="w-full md:w-auto"
                        >
                          Send Invitation
                        </Button>
                      </div>
                    </form>

                    {inviteResult && (
                      <div className={`mt-4 p-4 rounded-xl ${
                        inviteResult.message.includes('Error') 
                          ? 'bg-error-50 border border-error-200' 
                          : 'bg-success-50 border border-success-200'
                      }`}>
                        <div className="flex items-start space-x-3">
                          {inviteResult.message.includes('Error') ? (
                            <div className="w-5 h-5 text-error-600 mt-0.5">⚠️</div>
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
                              <div className="mt-3 p-3 bg-white rounded-lg border">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-medium text-neutral-700 mb-1">Temporary Password:</p>
                                    <code className="text-sm font-mono text-neutral-900 bg-neutral-100 px-2 py-1 rounded">
                                      {inviteResult.tempPassword}
                                    </code>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    icon={Copy}
                                    onClick={() => copyToClipboard(inviteResult.tempPassword!)}
                                    className="ml-2"
                                  >
                                    Copy
                                  </Button>
                                </div>
                                <div className="mt-2 p-2 bg-warning-50 border border-warning-200 rounded">
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-4 h-4 text-warning-600" />
                                    <p className="text-xs text-warning-700 font-medium">Important Security Notice</p>
                                  </div>
                                  <p className="text-xs text-warning-600 mt-1">
                                    Share this temporary password securely with the new admin. They will be required to create a permanent password on first login. The temporary password expires in 7 days.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Users List */}
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900">Authorized Admins</h2>
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={setSearchQuery}
                      icon={Search}
                      className="w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-900">Admin</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-900">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-900">Password</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-900">Last Login</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
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
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_active 
                                ? 'bg-success-100 text-success-800' 
                                : 'bg-error-100 text-error-800'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                          <td className="px-4 py-3 text-sm text-neutral-600">
                            {user.last_login 
                              ? new Date(user.last_login).toLocaleDateString()
                              : 'Never'
                            }
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={RotateCcw}
                                onClick={() => handleResetPassword(user.email)}
                                className="text-xs text-warning-600 hover:bg-warning-50"
                                title="Reset Password"
                              >
                                Reset
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={user.is_active ? UserMinus : Eye}
                                onClick={() => toggleUserStatus(user.id, user.is_active)}
                                className="text-xs"
                              >
                                {user.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'activity' && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-neutral-900">Security & Activity Logs</h2>
                <p className="text-sm text-neutral-600 mt-1">Monitor admin access and system activities</p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-3 h-3 text-primary-600" />
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
            </div>
          )}

          {selectedTab === 'settings' && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">System Settings</h2>
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-primary-900">Invite-Only Security</h3>
                  </div>
                  <p className="text-sm text-primary-700 mb-4">
                    This application is configured for invite-only admin access with secure password management. Only existing admins can create new admin accounts.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-neutral-700 mb-1">Public Registration</p>
                      <p className="text-sm font-bold text-error-600">Disabled</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-neutral-700 mb-1">Temporary Passwords</p>
                      <p className="text-sm font-bold text-success-600">7 Days</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-neutral-700 mb-1">Admin Workspaces</p>
                      <p className="text-sm font-bold text-success-600">Isolated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;