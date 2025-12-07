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
  Flex,
  Grid,
  AreaChart,
  BarChart,
  DonutChart,
  LineChart
} from '@tremor/react';
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  CalendarIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  ClockIcon,
  ChartPieIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

const ReportsAnalytics = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRange, setDateRange] = useState('7days');
  const [reportType, setReportType] = useState('visitors');
  const [loading, setLoading] = useState(true);
  const [visitorData, setVisitorData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch real visitor data from database
      const visitorsData = await ApiService.getVisitors();
      setVisitors(visitorsData);
      
      // Process data for charts
      processVisitorData(visitorsData);
      processDepartmentData(visitorsData);
      processTimeSeriesData(visitorsData);
      
    } catch (error) {
      console.error('Failed to load report data:', error);
      // Set empty arrays on error
      setVisitorData([]);
      setDepartmentData([]);
      setTimeSeriesData([]);
    } finally {
      setLoading(false);
    }
  };

  const processVisitorData = (visitorsData) => {
    // Group visitors by date for the chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayVisitors = visitorsData.filter(v => 
        v.created_at?.startsWith(dateStr) || v.check_in_time?.startsWith(dateStr)
      );
      
      last7Days.push({
        date: dateStr,
        visitors: dayVisitors.length,
        checkins: dayVisitors.filter(v => v.check_in_time).length,
        checkouts: dayVisitors.filter(v => v.check_out_time).length
      });
    }
    setVisitorData(last7Days);
  };

  const processDepartmentData = (visitorsData) => {
    // Group by host/department (you may need to adjust based on your data structure)
    const deptCount = {};
    visitorsData.forEach(v => {
      const dept = v.host?.department || v.department || 'Other';
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });
    
    const total = visitorsData.length || 1;
    const deptData = Object.entries(deptCount).map(([department, count]) => ({
      department,
      visitors: count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.visitors - a.visitors).slice(0, 5);
    
    setDepartmentData(deptData);
  };

  const processTimeSeriesData = (visitorsData) => {
    // Group by hour
    const hourlyCount = {};
    for (let i = 8; i <= 18; i++) {
      hourlyCount[`${i.toString().padStart(2, '0')}:00`] = 0;
    }
    
    visitorsData.forEach(v => {
      const checkInTime = v.check_in_time || v.created_at;
      if (checkInTime) {
        const hour = new Date(checkInTime).getHours();
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
        if (hourlyCount[hourStr] !== undefined) {
          hourlyCount[hourStr]++;
        }
      }
    });
    
    const timeData = Object.entries(hourlyCount).map(([time, visitors]) => ({
      time,
      visitors
    }));
    
    setTimeSeriesData(timeData);
  };

  const exportReport = (format) => {
    if (format === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Date,Visitors,Check-ins,Check-outs\n" +
        visitorData.map(row => 
          `${row.date},${row.visitors},${row.checkins},${row.checkouts}`
        ).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `visitor_report_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generatePDFReport = () => {
    // PDF generation would be implemented here
    alert('PDF report generation would be implemented with a library like jsPDF');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">Comprehensive reporting and data analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm flex items-center gap-2"
          >
            <ShareIcon className="h-4 w-4" />
            Share
          </button>
          <button 
            onClick={generatePDFReport}
            className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm flex items-center gap-2"
          >
            <PrinterIcon className="h-4 w-4" />
            Print
          </button>
          <button 
            onClick={() => exportReport('csv')}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <TabGroup index={selectedTab} onIndexChange={setSelectedTab}>
          <TabList className="border-b border-gray-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6">
            <Tab className="px-8 py-5 text-sm font-semibold text-gray-300 data-[selected]:text-white data-[selected]:bg-slate-800/50 data-[selected]:border-b-4 data-[selected]:border-blue-400 first:rounded-tl-2xl hover:text-white hover:bg-slate-800/30 transition-all duration-300 flex items-center gap-3">
              <ChartBarIcon className="h-5 w-5" />
              Dashboard
            </Tab>
            <Tab className="px-8 py-5 text-sm font-semibold text-gray-300 data-[selected]:text-white data-[selected]:bg-slate-800/50 data-[selected]:border-b-4 data-[selected]:border-blue-400 last:rounded-tr-2xl hover:text-white hover:bg-slate-800/30 transition-all duration-300 flex items-center gap-3">
              <PresentationChartLineIcon className="h-5 w-5" />
              Visitor Analytics
            </Tab>
          </TabList>

        <TabPanels>
          {/* Dashboard Tab */}
          <TabPanel>
            {/* Control Panel */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Text className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Date Range
                  </Text>
                  <Select 
                    value={dateRange} 
                    onValueChange={setDateRange}
                    className="bg-white border-gray-200 shadow-sm hover:border-slate-400 transition-colors"
                  >
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Text className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
                    <DocumentChartBarIcon className="h-4 w-4" />
                    Report Type
                  </Text>
                  <Select 
                    value={reportType} 
                    onValueChange={setReportType}
                    className="bg-white border-gray-200 shadow-sm hover:border-slate-400 transition-colors"
                  >
                    <SelectItem value="visitors">Visitors</SelectItem>
                    <SelectItem value="security">Security Events</SelectItem>
                    <SelectItem value="badges">Badge Usage</SelectItem>
                    <SelectItem value="departments">Department Analytics</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="p-6">
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Flex alignItems="start">
                  <div className="flex-1">
                    <Text className="text-blue-100 font-medium">Total Visitors</Text>
                    <Metric className="text-white text-4xl font-bold mt-2">{loading ? '...' : visitors.length}</Metric>
                    <Text className="text-sm text-blue-100 mt-1">Last {dateRange === '7days' ? '7 days' : dateRange}</Text>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                </Flex>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
              <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Flex alignItems="start">
                  <div className="flex-1">
                    <Text className="text-green-100 font-medium">Average Daily</Text>
                    <Metric className="text-white text-4xl font-bold mt-2">{loading ? '...' : Math.round(visitors.length / 7)}</Metric>
                    <Text className="text-sm text-green-100 mt-1">Per day average</Text>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PresentationChartLineIcon className="h-6 w-6 text-white" />
                  </div>
                </Flex>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Flex alignItems="start">
                  <div className="flex-1">
                    <Text className="text-purple-100 font-medium">Checked In</Text>
                    <Metric className="text-white text-4xl font-bold mt-2">{loading ? '...' : visitors.filter(v => v.check_in_time && !v.check_out_time).length}</Metric>
                    <Text className="text-sm text-purple-100 mt-1">Currently on premises</Text>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <EyeIcon className="h-6 w-6 text-white" />
                  </div>
                </Flex>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
              <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Flex alignItems="start">
                  <div className="flex-1">
                    <Text className="text-orange-100 font-medium">Check-in Rate</Text>
                    <Metric className="text-white text-4xl font-bold mt-2">
                      {loading ? '...' : visitors.length > 0 
                        ? `${Math.round((visitors.filter(v => v.check_in_time).length / visitors.length) * 100)}%` 
                        : '0%'}
                    </Metric>
                    <Text className="text-sm text-orange-100 mt-1">Completion rate</Text>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DocumentChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                </Flex>
              </Card>
              </motion.div>
            </Grid>
            </div>

            {/* Charts Row 1 */}
            <div className="p-6 pt-0">
            <Grid numItems={1} numItemsLg={2} className="gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
              <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-white to-blue-50/30 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Title className="text-gray-900 font-bold flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                    Visitor Trends
                  </Title>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Live</div>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <Text className="text-gray-500">Loading data...</Text>
                    </div>
                  </div>
                ) : visitorData.length === 0 ? (
                  <div className="flex items-center justify-center h-80">
                    <Text className="text-gray-500">No visitor data available for this period</Text>
                  </div>
                ) : (
                  <AreaChart
                    data={visitorData}
                    index="date"
                    categories={["visitors", "checkins", "checkouts"]}
                    colors={["blue", "green", "red"]}
                    height="h-80"
                    showAnimation={true}
                    curveType="natural"
                  />
                )}
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
              <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Title className="text-gray-900 font-bold flex items-center gap-2">
                    <PresentationChartLineIcon className="h-5 w-5 text-purple-600" />
                    Hourly Distribution
                  </Title>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Today</div>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <Text className="text-gray-500">Loading data...</Text>
                    </div>
                  </div>
                ) : timeSeriesData.length === 0 ? (
                  <div className="flex items-center justify-center h-80">
                    <Text className="text-gray-500">No hourly data available</Text>
                  </div>
                ) : (
                  <BarChart
                    data={timeSeriesData}
                    index="time"
                    categories={["visitors"]}
                    colors={["purple"]}
                    height="h-80"
                    showAnimation={true}
                  />
                )}
              </Card>
              </motion.div>
            </Grid>

            {/* Charts Row 2 */}
            <Grid numItems={1} numItemsLg={2} className="gap-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
              <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-white to-green-50/30 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Title className="text-gray-900 font-bold flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-green-600" />
                    Department Distribution
                  </Title>
                </div>
                <DonutChart
                  data={departmentData}
                  category="visitors"
                  index="department"
                  colors={["blue", "green", "yellow", "red", "purple"]}
                  height="h-80"
                  showAnimation={true}
                  variant="donut"
                />
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
              <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-white to-orange-50/30 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Title className="text-gray-900 font-bold flex items-center gap-2">
                    <PresentationChartLineIcon className="h-5 w-5 text-orange-600" />
                    Weekly Comparison
                  </Title>
                </div>
                <LineChart
                  data={visitorData}
                  index="date"
                  categories={["visitors"]}
                  colors={["orange"]}
                  height="h-80"
                  showAnimation={true}
                  curveType="natural"
                />
              </Card>
              </motion.div>
            </Grid>
            </div>
          </TabPanel>

          {/* Visitor Analytics Tab */}
          <TabPanel>
            <Grid numItems={1} numItemsLg={3} className="gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
              <Card className="p-6 bg-gradient-to-br from-white to-green-50/30 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <UserGroupIcon className="h-5 w-5 text-white" />
                  </div>
                  <Title className="text-green-900">Visitor Status</Title>
                </div>
                <div className="space-y-3">
                  <motion.div 
                    className="flex justify-between items-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Text className="font-medium text-green-900">Checked In</Text>
                    <Badge color="green" className="text-sm font-semibold">23</Badge>
                  </motion.div>
                  <motion.div 
                    className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Text className="font-medium text-yellow-900">Expected</Text>
                    <Badge color="yellow" className="text-sm font-semibold">8</Badge>
                  </motion.div>
                  <motion.div 
                    className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Text className="font-medium text-gray-900">Checked Out</Text>
                    <Badge color="gray" className="text-sm font-semibold">156</Badge>
                  </motion.div>
                  <motion.div 
                    className="flex justify-between items-center p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Text className="font-medium text-red-900">Overdue</Text>
                    <Badge color="red" className="text-sm font-semibold">2</Badge>
                  </motion.div>
                </div>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
              <Card className="p-6 bg-gradient-to-br from-white to-blue-50/30 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-white" />
                  </div>
                  <Title className="text-blue-900">Visit Duration</Title>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text className="font-medium text-gray-700">{'< 1 hour'}</Text>
                      <Text className="font-semibold text-slate-900">45%</Text>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-slate-600 to-slate-900 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text className="font-medium text-gray-700">1-4 hours</Text>
                      <Text className="font-semibold text-green-600">35%</Text>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '35%' }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text className="font-medium text-gray-700">{'> 4 hours'}</Text>
                      <Text className="font-semibold text-yellow-600">20%</Text>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '20%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
              <Card className="p-6 bg-gradient-to-br from-white to-purple-50/30 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <ChartPieIcon className="h-5 w-5 text-white" />
                  </div>
                  <Title className="text-purple-900">Visitor Types</Title>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-60">
                    <div className="text-center">
                      <motion.div 
                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <Text className="text-purple-600 font-medium">Loading...</Text>
                    </div>
                  </div>
                ) : (
                  <DonutChart
                    data={(() => {
                      const types = {};
                      visitors.forEach(v => {
                        const type = v.purpose || v.visit_type || 'Other';
                        types[type] = (types[type] || 0) + 1;
                      });
                      return Object.entries(types).map(([type, count]) => ({
                        type: type,
                        visitors: count
                      }));
                    })()}
                    category="visitors"
                    index="type"
                    colors={["blue", "green", "yellow", "red", "purple"]}
                    height="h-60"
                    showAnimation={true}
                  />
                )}
              </Card>
              </motion.div>
            </Grid>

            {/* Detailed Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
            <Card className="p-6 bg-gradient-to-br from-white to-slate-50/50 shadow-lg border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <TableCellsIcon className="h-5 w-5 text-white" />
                </div>
                <Title className="text-slate-900">Detailed Visitor Analytics</Title>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <motion.div 
                      className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <Text className="text-slate-600 font-medium">Loading analytics...</Text>
                  </div>
                </div>
              ) : visitorData.length === 0 ? (
                <div className="text-center py-12">
                  <Text className="text-gray-500">No visitor data available for this period</Text>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHead className="bg-gradient-to-r from-slate-100 to-slate-50">
                      <TableRow>
                        <TableHeaderCell className="font-semibold text-slate-800">Date</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-slate-800">Total Visitors</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-slate-800">Check-ins</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-slate-800">Check-outs</TableHeaderCell>
                        <TableHeaderCell className="font-semibold text-slate-800">Still On-Site</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visitorData.map((row, index) => (
                        <TableRow key={index} className="hover:bg-blue-50 transition-colors">
                          <TableCell className="text-gray-900 font-medium">{new Date(row.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-gray-900 font-semibold">{row.visitors}</TableCell>
                          <TableCell>
                            <Badge color="green" className="font-semibold">{row.checkins}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge color="gray" className="font-semibold">{row.checkouts}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge color="blue" className="font-semibold">{row.checkins - row.checkouts}</Badge>
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
        </TabPanels>
        </TabGroup>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsAnalytics;