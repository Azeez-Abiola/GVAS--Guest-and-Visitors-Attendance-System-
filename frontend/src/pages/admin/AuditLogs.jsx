import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import ApiService from '../../services/api';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Select,
  SelectItem,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Metric,
  TabGroup,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Dialog,
  DialogPanel,
  Flex,
  Grid,
  DatePicker
} from '@tremor/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Load audit logs from database
  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const logsData = await ApiService.getAuditLogs();
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on selected filters
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.user === userFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
          break;
      }
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, userFilter, dateFilter]);

  const getSeverityBadge = (severity) => {
    const colors = {
      info: 'blue',
      warning: 'yellow',
      error: 'red',
      critical: 'red'
    };
    return <Badge color={colors[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
        return <UserIcon className="h-4 w-4" />;
      case 'security_alert_triggered':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'system_settings_changed':
        return <ShieldCheckIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,User,Action,Resource,Details,Severity,IP Address\n" +
      filteredLogs.map(log => 
        `${log.timestamp},${log.user},${log.action},${log.resource},"${log.details}",${log.severity},${log.ipAddress}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "audit_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUniqueUsers = () => {
    return [...new Set(logs.map(log => log.user))];
  };

  const getUniqueActions = () => {
    return [...new Set(logs.map(log => log.action))];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Monitor system activities and security events</p>
        </div>
        <button 
          onClick={exportLogs}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          Export Logs
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <TabGroup index={selectedTab} onIndexChange={setSelectedTab}>
          <TabList className="border-b border-gray-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-t-xl p-1">
            <Tab className="px-6 py-3 text-sm font-semibold text-slate-300 data-[selected]:text-white data-[selected]:bg-slate-700 rounded-lg first:rounded-tl-xl hover:text-white hover:bg-slate-700/50 transition-all duration-200 flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              Activity Logs
            </Tab>
            <Tab className="px-6 py-3 text-sm font-semibold text-slate-300 data-[selected]:text-white data-[selected]:bg-slate-700 rounded-lg hover:text-white hover:bg-slate-700/50 transition-all duration-200 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4" />
              Security Events
            </Tab>
            <Tab className="px-6 py-3 text-sm font-semibold text-slate-300 data-[selected]:text-white data-[selected]:bg-slate-700 rounded-lg hover:text-white hover:bg-slate-700/50 transition-all duration-200 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              User Activities
            </Tab>
            <Tab className="px-6 py-3 text-sm font-semibold text-slate-300 data-[selected]:text-white data-[selected]:bg-slate-700 rounded-lg last:rounded-tr-xl hover:text-white hover:bg-slate-700/50 transition-all duration-200 flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4" />
              System Changes
            </Tab>
          </TabList>

        <TabPanels>
          {/* Activity Logs Tab */}
          <TabPanel>
            {/* Statistics Cards */}
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Flex alignItems="start">
                  <div className="flex-1">
                    <Text className="text-blue-100 font-medium">Total Events</Text>
                    <Metric className="text-white text-4xl font-bold mt-2">{filteredLogs.length}</Metric>
                    <Text className="text-sm text-blue-100 mt-1">All activities</Text>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                </Flex>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
              <Card className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Flex alignItems="start">
                  <div className="flex-1">
                    <Text className="text-yellow-100 font-medium">Security Events</Text>
                    <Metric className="text-white text-4xl font-bold mt-2">{filteredLogs.filter(log => log.severity === 'warning' || log.severity === 'error').length}</Metric>
                    <Text className="text-sm text-yellow-100 mt-1">Warnings & errors</Text>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                </Flex>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
              <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Flex alignItems="start">
                  <div className="flex-1">
                    <Text className="text-green-100 font-medium">Active Users</Text>
                    <Metric className="text-white text-4xl font-bold mt-2">{getUniqueUsers().length}</Metric>
                    <Text className="text-sm text-green-100 mt-1">Unique users</Text>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                </Flex>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Flex alignItems="start">
                  <div className="flex-1">
                    <Text className="text-purple-100 font-medium">System Changes</Text>
                    <Metric className="text-white text-4xl font-bold mt-2">{filteredLogs.filter(log => log.action.includes('settings') || log.action.includes('config')).length}</Metric>
                    <Text className="text-sm text-purple-100 mt-1">Config updates</Text>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                </Flex>
              </Card>
              </motion.div>
            </Grid>

            {/* Filters */}
            <Card className="p-6 mb-6 bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-600" />
                    <Text className="font-semibold text-slate-900">Search</Text>
                  </div>
                  <TextInput
                    icon={MagnifyingGlassIcon}
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FunnelIcon className="h-4 w-4 text-slate-600" />
                    <Text className="font-semibold text-slate-900">Action Type</Text>
                  </div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectItem value="all">All Actions</SelectItem>
                    {getUniqueActions().map(action => (
                      <SelectItem key={action} value={action}>
                        {action.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="h-4 w-4 text-slate-600" />
                    <Text className="font-semibold text-slate-900">User</Text>
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectItem value="all">All Users</SelectItem>
                    {getUniqueUsers().map(user => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="h-4 w-4 text-slate-600" />
                    <Text className="font-semibold text-slate-900">Time Range</Text>
                  </div>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Logs Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
            <Card className="p-6 shadow-lg border-slate-200">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <motion.div 
                      className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <Text className="text-slate-600 font-medium">Loading audit logs...</Text>
                  </div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <Title className="mb-2 text-gray-900">No Audit Logs Found</Title>
                  <Text className="text-gray-500 mb-6">
                    {logs.length === 0 
                      ? "No audit logs have been recorded yet. System activities will appear here once logged."
                      : "No logs match your current filters. Try adjusting your search criteria."
                    }
                  </Text>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHead className="bg-gradient-to-r from-slate-100 to-slate-50">
                      <TableRow>
                        <TableHeaderCell className="font-semibold text-slate-800">Timestamp</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-slate-800">User</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-slate-800">Action</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-slate-800">Resource</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-slate-800">Severity</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-slate-800">Actions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLogs.map(log => (
                        <TableRow key={log.id} className="hover:bg-blue-50 transition-colors">
                          <TableCell>
                            <Text className="text-sm font-medium text-gray-900">
                              {new Date(log.timestamp).toLocaleString()}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              <Text className="text-sm text-gray-900 font-medium">{log.user}</Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getActionIcon(log.action)}
                              <Text className="text-sm text-gray-700 capitalize">{log.action.replace(/_/g, ' ')}</Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Text className="text-sm text-gray-700">{log.resource}</Text>
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(log.severity)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="xs"
                              variant="secondary"
                              icon={EyeIcon}
                              onClick={() => handleViewDetails(log)}
                              className="hover:bg-slate-900 hover:text-white transition-colors"
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
            </motion.div>
          </TabPanel>

          {/* Security Events Tab */}
          <TabPanel>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
            <Card className="p-6 bg-gradient-to-br from-white to-red-50/30 border-red-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                </div>
                <Title className="text-red-900">Security Events</Title>
              </div>
              <div className="space-y-4">
                {filteredLogs
                  .filter(log => log.severity === 'warning' || log.severity === 'error')
                  .map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                    <Card className="p-4 border-l-4 border-l-red-500 hover:shadow-md transition-shadow bg-white">
                      <Flex justifyContent="between" alignItems="start">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                            <Text className="font-semibold text-gray-900">{log.action.replace('_', ' ').toUpperCase()}</Text>
                            {getSeverityBadge(log.severity)}
                          </div>
                          <Text className="text-sm text-gray-600 mb-1">{log.details}</Text>
                          <Text className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()} • {log.user} • {log.ipAddress}
                          </Text>
                        </div>
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => handleViewDetails(log)}
                          className="hover:bg-red-500 hover:text-white transition-colors"
                        >
                          View
                        </Button>
                      </Flex>
                    </Card>
                    </motion.div>
                  ))}
              </div>
            </Card>
            </motion.div>
          </TabPanel>

          {/* User Activities Tab */}
          <TabPanel>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
            <Card className="p-6 bg-gradient-to-br from-white to-green-50/30 border-green-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <Title className="text-green-900">User Activity Summary</Title>
              </div>
              <div className="space-y-4">
                {getUniqueUsers().map((user, index) => {
                  const userLogs = filteredLogs.filter(log => log.user === user);
                  return (
                    <motion.div
                      key={user}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                    <Card className="p-4 hover:shadow-md transition-shadow bg-white border-green-100">
                      <Flex justifyContent="between" alignItems="center">
                        <div>
                          <Text className="font-semibold text-gray-900">{user}</Text>
                          <Text className="text-sm text-gray-500">
                            {userLogs.length} activities
                          </Text>
                        </div>
                        <div className="text-right">
                          <Text className="text-sm text-gray-600">
                            Last activity: {userLogs[0] ? new Date(userLogs[0].timestamp).toLocaleString() : 'N/A'}
                          </Text>
                        </div>
                      </Flex>
                      
                      <div className="mt-3 space-y-2">
                        {userLogs.slice(0, 3).map(log => (
                          <div key={log.id} className="flex items-center space-x-2 text-sm bg-green-50 p-2 rounded-lg">
                            {getActionIcon(log.action)}
                            <Text className="text-gray-900 font-medium">{log.action.replace('_', ' ')}</Text>
                            <span className="text-gray-400">•</span>
                            <Text className="text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </Card>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
            </motion.div>
          </TabPanel>

          {/* System Changes Tab */}
          <TabPanel>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
            <Card className="p-6 bg-gradient-to-br from-white to-purple-50/30 border-purple-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>
                <Title className="text-purple-900">System Configuration Changes</Title>
              </div>
              <div className="space-y-4">
                {filteredLogs
                  .filter(log => log.action.includes('settings') || log.action.includes('config'))
                  .map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                    <Card className="p-4 hover:shadow-md transition-shadow bg-white border-purple-100">
                      <div className="mb-3">
                        <Flex justifyContent="between" alignItems="start">
                          <div>
                            <Text className="font-semibold text-gray-900">{log.action.replace('_', ' ').toUpperCase()}</Text>
                            <Text className="text-sm text-gray-600">{log.details}</Text>
                          </div>
                          <Text className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </Text>
                        </Flex>
                      </div>
                      
                      {log.changes && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <Text className="font-semibold text-red-700 mb-2">Before:</Text>
                            <pre className="text-xs text-red-900 overflow-auto max-h-32">
                              {JSON.stringify(log.changes.before, null, 2)}
                            </pre>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <Text className="font-semibold text-green-700 mb-2">After:</Text>
                            <pre className="text-xs text-green-900 overflow-auto max-h-32">
                              {JSON.stringify(log.changes.after, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </Card>
                    </motion.div>
                  ))}
              </div>
            </Card>
            </motion.div>
          </TabPanel>
        </TabPanels>
        </TabGroup>
      </div>

      {/* Log Details Dialog */}
      <Dialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
        <DialogPanel className="sm:max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {selectedLog && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        {getActionIcon(selectedLog.action)}
                      </div>
                      <div>
                        <Title className="text-2xl font-bold text-slate-900">
                          {selectedLog.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Title>
                        <Text className="text-sm text-gray-500">
                          {new Date(selectedLog.timestamp).toLocaleString('en-US', {
                            dateStyle: 'full',
                            timeStyle: 'medium'
                          })}
                        </Text>
                      </div>
                    </div>
                  </div>
                  {getSeverityBadge(selectedLog.severity)}
                </div>
              </div>
              
              <div className="space-y-5">
                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <Text className="text-xs font-semibold text-blue-900 uppercase">User</Text>
                    </div>
                    <Text className="text-sm font-bold text-slate-900">{selectedLog.user}</Text>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <Text className="text-xs font-semibold text-purple-900 uppercase">IP Address</Text>
                    </div>
                    <Text className="text-sm font-mono font-bold text-slate-900">{selectedLog.ipAddress}</Text>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <Text className="text-xs font-semibold text-green-900 uppercase">Action</Text>
                    </div>
                    <Text className="text-sm font-bold text-slate-900">{selectedLog.action.replace(/_/g, ' ')}</Text>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <Text className="text-xs font-semibold text-amber-900 uppercase">Resource</Text>
                    </div>
                    <Text className="text-sm font-bold text-slate-900">{selectedLog.resource}</Text>
                  </div>
                </div>

                {/* Details Section */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg p-5 border border-gray-200">
                  <Text className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Event Details
                  </Text>
                  <Text className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                    {selectedLog.details}
                  </Text>
                </div>

                {/* User Agent Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-5 border border-indigo-200">
                  <Text className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    User Agent
                  </Text>
                  <Text className="text-xs font-mono text-gray-600 bg-white p-4 rounded-lg border border-indigo-200 break-all">
                    {selectedLog.userAgent}
                  </Text>
                </div>

                {/* Changes Section */}
                {selectedLog.changes && (
                  <div className="bg-white rounded-lg p-5 border-2 border-dashed border-gray-300">
                    <Text className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Data Changes
                    </Text>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border-2 border-red-200">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <Text className="text-sm font-bold text-red-700">Previous Value</Text>
                        </div>
                        <pre className="text-xs bg-white p-4 rounded-lg border border-red-300 overflow-x-auto font-mono text-gray-800">
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <Text className="text-sm font-bold text-green-700">New Value</Text>
                        </div>
                        <pre className="text-xs bg-white p-4 rounded-lg border border-green-300 overflow-x-auto font-mono text-gray-800">
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <Button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </DialogPanel>
      </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;