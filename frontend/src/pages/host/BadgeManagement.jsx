import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { BadgeCheck, Clock, User, Hash } from 'lucide-react';
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Badge Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor badge assignments for your visitors</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Hash size={14} />
                      Badge Number
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      Visitor
                    </div>
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      Assigned At
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">Loading assignments...</td>
                  </tr>
                ) : badgeAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center">
                      <BadgeCheck size={32} className="mb-2 text-gray-300 dark:text-gray-600" />
                      No badge assignments found.
                    </td>
                  </tr>
                ) : (
                  badgeAssignments.map((badge, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{badge.badgeNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{badge.visitor}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.status === 'Assigned'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                          }`}>
                          {badge.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{badge.assignedAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BadgeManagement;
