
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BadgeManagement = () => {
  const { profile } = useAuth();
  const [badgeAssignments, setBadgeAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchBadgeAssignments();
    }
  }, [profile?.id]);

  const fetchBadgeAssignments = async () => {
    setLoading(true);
    try {
      // Fetch all visitors for this host
      const visitors = await ApiService.getVisitors({ host_id: profile.id });
      // Only show visitors with badges assigned
      const assignments = visitors
        .filter(v => v.badge_number)
        .map(v => ({
          badgeNumber: v.badge_number,
          visitor: v.name,
          status: v.status === 'checked_in' ? 'Assigned' : 'Returned',
          assignedAt: v.check_in_time ? new Date(v.check_in_time).toLocaleString() : 'N/A'
        }));
      setBadgeAssignments(assignments);
    } catch (error) {
      console.error('Failed to fetch badge assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Title>Badge Management</Title>
        <Text className="mb-4">Monitor badge assignments for your visitors</Text>
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Badge Number</TableHeaderCell>
                <TableHeaderCell>Visitor</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Assigned At</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : badgeAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400">No badge assignments yet.</TableCell>
                </TableRow>
              ) : (
                badgeAssignments.map((badge) => (
                  <TableRow key={badge.badgeNumber + badge.visitor}>
                    <TableCell>{badge.badgeNumber}</TableCell>
                    <TableCell>{badge.visitor}</TableCell>
                    <TableCell>
                      <Badge color={badge.status === 'Assigned' ? 'blue' : 'gray'}>{badge.status}</Badge>
                    </TableCell>
                    <TableCell>{badge.assignedAt}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BadgeManagement;
