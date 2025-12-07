
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, Title, Text, Metric, Grid } from '@tremor/react';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const HostAnalytics = () => {
  const { profile } = useAuth();
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
      const totalVisitors = visitors.length;
      const pendingApprovals = visitors.filter(v => v.status === 'pending').length;
      const checkedIn = visitors.filter(v => v.status === 'checked_in').length;
      const checkedOut = visitors.filter(v => v.status === 'checked_out').length;
      const upcomingVisits = visitors.filter(v => v.status === 'pre_registered').length;
      // Fetch badges assigned to this host's visitors
      const badgesAssigned = visitors.filter(v => v.badge_number).length;
      setStats({ totalVisitors, pendingApprovals, checkedIn, checkedOut, badgesAssigned, upcomingVisits });
    } catch (error) {
      console.error('Failed to fetch host analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Visitors', value: stats.totalVisitors },
    { label: 'Pending Approvals', value: stats.pendingApprovals },
    { label: 'Checked In', value: stats.checkedIn },
    { label: 'Checked Out', value: stats.checkedOut },
    { label: 'Badges Assigned', value: stats.badgesAssigned },
    { label: 'Upcoming Visits', value: stats.upcomingVisits },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Title>Host Analytics</Title>
        <Text className="mb-4">Overview of your visitor and badge activity</Text>
        <Grid numItems={3} className="gap-6">
          {statCards.map((stat) => (
            <Card key={stat.label} className="p-6 flex flex-col items-center justify-center">
              <Metric className="text-3xl font-bold mb-2">{loading ? '...' : stat.value}</Metric>
              <Text className="text-lg text-gray-700">{stat.label}</Text>
            </Card>
          ))}
        </Grid>
      </div>
    </DashboardLayout>
  );
};

export default HostAnalytics;
