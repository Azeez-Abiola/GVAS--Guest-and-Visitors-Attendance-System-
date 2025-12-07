import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Metric,
  Grid
} from '@tremor/react';
import ApiService from '../../services/api';
import { generateAccessCode } from '../../utils/auth';
import { supabase } from '../../lib/supabase';

const ReceptionistDashboard = () => {
  const [visitors, setVisitors] = useState([]);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
    setupRealtimeNotifications();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile with assigned floors
      const userData = await ApiService.getUserById(user.id);
      setCurrentUser(userData);

      // Load today's visitors
      await loadTodayVisitors();

      // Load notifications
      await loadNotifications(user.id);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayVisitors = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const visitorsData = await ApiService.getVisitors({
        date: today,
        status: 'all'
      });
      setTodayVisitors(visitorsData || []);
    } catch (error) {
      console.error('Failed to load visitors:', error);
    }
  };

  const loadNotifications = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const setupRealtimeNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Subscribe to notifications for this user
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification:', payload);
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/logo.png'
            });
          }
        }
      )
      .subscribe();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCheckIn = async (visitor) => {
    try {
      setCheckingIn(visitor.id);

      // Generate access code
      const accessCode = generateAccessCode(6);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Update visitor
      const updatedVisitor = await ApiService.updateVisitor(visitor.id, {
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.id,
        access_code: accessCode
      });

      // Create notification for receptionists on the same floor
      if (visitor.floor && currentUser?.assigned_floors?.includes(visitor.floor)) {
        await createCheckInNotification(visitor, accessCode);
      }

      // Reload visitors
      await loadTodayVisitors();

      // Show success message
      alert(`✅ Checked in successfully!\n\nAccess Code: ${accessCode}\n\nPlease provide this code to the visitor.`);
    } catch (error) {
      console.error('Failed to check in visitor:', error);
      alert('Failed to check in visitor. Please try again.');
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCheckOut = async (visitor) => {
    try {
      setCheckingIn(visitor.id);

      // Update visitor
      await ApiService.updateVisitor(visitor.id, {
        status: 'checked_out',
        checked_out_at: new Date().toISOString()
      });

      // Reload visitors
      await loadTodayVisitors();
    } catch (error) {
      console.error('Failed to check out visitor:', error);
      alert('Failed to check out visitor. Please try again.');
    } finally {
      setCheckingIn(null);
    }
  };

  const createCheckInNotification = async (visitor, accessCode) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Get all receptionists assigned to this floor
      const { data: receptionists } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'reception')
        .contains('assigned_floors', [visitor.floor]);

      if (!receptionists || receptionists.length === 0) return;

      // Create notifications for each receptionist
      const notifications = receptionists.map(receptionist => ({
        user_id: receptionist.id,
        type: 'visitor_checkin',
        title: `Visitor Checked In - Floor ${visitor.floor}`,
        message: `${visitor.full_name} has checked in`,
        data: {
          visitor_id: visitor.id,
          visitor_name: visitor.full_name,
          access_code: accessCode,
          floor: visitor.floor,
          host_name: visitor.host_name,
          photo_url: visitor.photo_url,
          purpose: visitor.purpose,
          checked_in_at: new Date().toISOString()
        }
      }));

      // Insert notifications
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      checked_in: { color: 'green', label: 'Checked In' },
      checked_out: { color: 'gray', label: 'Checked Out' },
      pending: { color: 'yellow', label: 'Pending' },
      cancelled: { color: 'red', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const filteredVisitors = todayVisitors.filter(visitor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      visitor.full_name?.toLowerCase().includes(searchLower) ||
      visitor.email?.toLowerCase().includes(searchLower) ||
      visitor.phone?.includes(searchTerm) ||
      visitor.access_code?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: todayVisitors.length,
    checkedIn: todayVisitors.filter(v => v.status === 'checked_in').length,
    checkedOut: todayVisitors.filter(v => v.status === 'checked_out').length,
    pending: todayVisitors.filter(v => v.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Receptionist Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage visitor check-ins for Floor {currentUser?.assigned_floors?.join(', ') || 'N/A'}
              </p>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col"
                    >
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <Title className="text-lg">Notifications</Title>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <Text className="text-gray-500">No notifications yet</Text>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.is_read ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${
                                    !notification.is_read ? 'bg-blue-600' : 'bg-gray-300'
                                  }`} />
                                  <div className="flex-1">
                                    <Text className="font-semibold text-slate-900 mb-1">
                                      {notification.title}
                                    </Text>
                                    <Text className="text-sm text-gray-600 mb-2">
                                      {notification.message}
                                    </Text>
                                    {notification.data?.access_code && (
                                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-2 mb-2">
                                        <Text className="text-xs font-medium text-green-900 mb-1">Access Code:</Text>
                                        <code className="text-lg font-bold text-green-700">
                                          {notification.data.access_code}
                                        </code>
                                      </div>
                                    )}
                                    <Text className="text-xs text-gray-400">
                                      {new Date(notification.created_at).toLocaleString()}
                                    </Text>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
          <Card decoration="top" decorationColor="blue">
            <Text>Total Today</Text>
            <Metric>{stats.total}</Metric>
          </Card>
          <Card decoration="top" decorationColor="green">
            <Text>Checked In</Text>
            <Metric>{stats.checkedIn}</Metric>
          </Card>
          <Card decoration="top" decorationColor="gray">
            <Text>Checked Out</Text>
            <Metric>{stats.checkedOut}</Metric>
          </Card>
          <Card decoration="top" decorationColor="yellow">
            <Text>Pending</Text>
            <Metric>{stats.pending}</Metric>
          </Card>
        </Grid>

        {/* Search */}
        <Card>
          <TextInput
            icon={() => (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            placeholder="Search by name, email, phone, or access code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        {/* Visitors Table */}
        <Card>
          <Title>Today's Visitors</Title>
          <Table className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Visitor</TableHeaderCell>
                <TableHeaderCell>Contact</TableHeaderCell>
                <TableHeaderCell>Host</TableHeaderCell>
                <TableHeaderCell>Access Code</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
                  </TableCell>
                </TableRow>
              ) : filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No visitors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {visitor.photo_url ? (
                          <img
                            src={visitor.photo_url}
                            alt={visitor.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {visitor.full_name?.charAt(0) || 'V'}
                          </div>
                        )}
                        <div>
                          <Text className="font-semibold">{visitor.full_name}</Text>
                          <Text className="text-xs text-gray-500">{visitor.purpose}</Text>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Text className="text-sm">{visitor.email}</Text>
                      <Text className="text-xs text-gray-500">{visitor.phone}</Text>
                    </TableCell>
                    <TableCell>{visitor.host_name}</TableCell>
                    <TableCell>
                      {visitor.access_code ? (
                        <code className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono text-sm font-bold">
                          {visitor.access_code}
                        </code>
                      ) : (
                        <Text className="text-gray-400">Not generated</Text>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(visitor.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {visitor.status !== 'checked_in' ? (
                          <Button
                            size="xs"
                            color="green"
                            onClick={() => handleCheckIn(visitor)}
                            loading={checkingIn === visitor.id}
                            disabled={checkingIn === visitor.id}
                          >
                            Check In
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleCheckOut(visitor)}
                            loading={checkingIn === visitor.id}
                            disabled={checkingIn === visitor.id}
                          >
                            Check Out
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
