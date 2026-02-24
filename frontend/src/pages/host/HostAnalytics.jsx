import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Users, Clock, CheckCircle, LogOut, BadgeCheck, Calendar, TrendingUp } from 'lucide-react';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

import GuestInviteModal from '../../components/GuestInviteModal';

const HostAnalytics = () => {
  const { profile } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    pendingApprovals: 0,
    checkedIn: 0,
    checkedOut: 0,
    badgesAssigned: 0,
    upcomingVisits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile?.id]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all visitors for this host
      const visitors = await ApiService.getVisitors({ host_id: profile.id });
      const totalVisitors = visitors.totalCount || visitors.length;
      const pendingApprovals = visitors.filter(v => v.status === 'pending' || v.status === 'pending_approval').length;
      const checkedIn = visitors.filter(v => v.status === 'checked_in').length;
      const checkedOut = visitors.filter(v => v.status === 'checked_out').length;
      const upcomingVisits = visitors.filter(v => v.status === 'pre_registered').length;

      // Calculate today's visitors for this host (checked in today)
      const todayLocal = new Date().toLocaleDateString('en-CA');
      const todayVisitors = visitors.filter(v => {
        // Check if they checked in TODAY
        if (v.status === 'checked_in' || v.status === 'checked_out') {
          if (v.check_in_time) {
            return new Date(v.check_in_time).toLocaleDateString('en-CA') === todayLocal;
          }
        }
        return false;
      }).length;

      // Fetch badges assigned to this host's visitors
      const badgesAssigned = visitors.filter(v => v.badge_number).length;
      setStats({ totalVisitors, pendingApprovals, checkedIn, checkedOut, badgesAssigned, upcomingVisits, todayVisitors });
    } catch (error) {
      console.error('Failed to fetch host analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Today's Visitors", value: stats.todayVisitors || 0, icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Visitors', value: stats.totalVisitors, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Checked In', value: stats.checkedIn, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Checked Out', value: stats.checkedOut, icon: LogOut, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
    { label: 'Badges Assigned', value: stats.badgesAssigned, icon: BadgeCheck, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Upcoming Visits', value: stats.upcomingVisits, icon: Calendar, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Host Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your visitor and badge activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-start justify-between hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {loading ? (
                      <span className="w-8 h-8 rounded bg-gray-200 dark:bg-slate-700 animate-pulse inline-block" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <GuestInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        hostName={profile?.full_name}
        hostId={profile?.id}
      />
    </DashboardLayout>
  );
};

export default HostAnalytics;
