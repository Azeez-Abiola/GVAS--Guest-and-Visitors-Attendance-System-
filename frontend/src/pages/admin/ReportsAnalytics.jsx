import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import ApiService from '../../services/api';
import {
  Card,
  Title,
  Text,
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

  // Data States
  const [visitors, setVisitors] = useState([]); // Raw data
  const [visitorData, setVisitorData] = useState([]); // Chart data
  const [departmentData, setDepartmentData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  // Stats States
  const [visitorStats, setVisitorStats] = useState({
    checkedIn: 0,
    expected: 0,
    checkedOut: 0,
    overdue: 0
  });

  const [durationStats, setDurationStats] = useState({
    short: 0, // < 1 hour
    medium: 0, // 1-4 hours
    long: 0 // > 4 hours
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // Fetch fresh data
      const visitorsData = await ApiService.getVisitors();
      setVisitors(visitorsData);

      // Process all analytics
      processVisitorData(visitorsData);
      processDepartmentData(visitorsData);
      processTimeSeriesData(visitorsData);

    } catch (error) {
      console.error('Failed to load report data:', error);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const processVisitorData = (data) => {
    // 1. Determine Date Range
    let daysToLookBack = 7;
    if (dateRange === 'today') daysToLookBack = 1;
    else if (dateRange === '7days') daysToLookBack = 7;
    else if (dateRange === '30days') daysToLookBack = 30;
    else if (dateRange === '90days') daysToLookBack = 90;
    else if (dateRange === 'year') daysToLookBack = 365;

    const chartData = [];
    let filteredVisitors = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Build Chart Data (Historical Trend)
    // Loop backwards from today
    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD Local

      // Filter visitors for this specific day
      const dayVisitors = data.filter(v => {
        if (!v.check_in_time && !v.created_at) return false;
        // Use local date comparison
        const checkIn = v.check_in_time ? new Date(v.check_in_time).toLocaleDateString('en-CA') : null;
        const created = v.created_at ? new Date(v.created_at).toLocaleDateString('en-CA') : null;
        return checkIn === dateStr || created === dateStr;
      });

      // Add to total filtered list
      filteredVisitors = [...filteredVisitors, ...dayVisitors];

      chartData.push({
        date: dateStr,
        visitors: dayVisitors.length,
        checkins: dayVisitors.filter(v => v.check_in_time).length,
        checkouts: dayVisitors.filter(v => v.check_out_time).length
      });
    }
    setVisitorData(chartData);

    // 3. Calculate Visitor Status Stats
    // "Checked In": Typically refers to currently active visitors (Live Status)
    const liveCheckedIn = data.filter(v => v.status === 'checked_in').length;

    // "Expected": Pre-registered future/pending (Live Status)
    const liveExpected = data.filter(v => v.status === 'pre_registered' || v.status === 'pending').length;

    // "Checked Out": Refers to completed visits within the SELECTED DATE RANGE
    // because "Total Checked Out" forever isn't useful in a weekly report.
    const rangeCheckedOut = filteredVisitors.filter(v => v.status === 'checked_out').length;

    // "Overdue": Live status check
    const now = new Date();
    const liveOverdue = data.filter(v => {
      if (v.status !== 'checked_in' || !v.check_in_time) return false;
      const checkIn = new Date(v.check_in_time);
      const durationHours = v.expected_duration || 4;
      const expectedExit = new Date(checkIn.getTime() + durationHours * 60 * 60 * 1000);
      return now > expectedExit;
    }).length;

    setVisitorStats({
      checkedIn: liveCheckedIn,
      expected: liveExpected,
      checkedOut: rangeCheckedOut,
      overdue: liveOverdue
    });

    // 4. Calculate Duration Stats
    // Based on visitors who COMPLETED their visit within the filtered range
    const completedVisits = filteredVisitors.filter(v => v.check_in_time && v.check_out_time);
    let short = 0; // < 1h
    let medium = 0; // 1-4h
    let long = 0; // > 4h

    completedVisits.forEach(v => {
      const start = new Date(v.check_in_time);
      const end = new Date(v.check_out_time);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 1) short++;
      else if (diffHours <= 4) medium++;
      else long++;
    });

    const totalDurations = completedVisits.length || 1; // Prevent NaN
    setDurationStats({
      short: Math.round((short / totalDurations) * 100),
      medium: Math.round((medium / totalDurations) * 100),
      long: Math.round((long / totalDurations) * 100)
    });
  };

  const processDepartmentData = (data) => {
    const deptCount = {};
    data.forEach(v => {
      const dept = v.host?.department || v.department || 'General';
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });

    const total = data.length || 1;
    const deptData = Object.entries(deptCount).map(([department, count]) => ({
      department,
      visitors: count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.visitors - a.visitors).slice(0, 5);

    setDepartmentData(deptData);
  };

  const processTimeSeriesData = (data) => {
    // Determine the relevant subset of data based on view
    // For time series, usually "Today's" hourly breakdown is most useful,
    // or if viewing a range, maybe "Average by Hour".
    // Let's stick to "Today's Activity" if dateRange is 'today', otherwise 'Average Peak Hours'?
    // For simplicity, let's show breakdown of the filtered dataset by hour of day (Peak Hours Analysis)

    const hourlyCount = {};
    // Initialize 08:00 to 18:00
    for (let i = 8; i <= 18; i++) {
      hourlyCount[`${i.toString().padStart(2, '0')}:00`] = 0;
    }

    // Use visitors from the chart data's range logic would be best, but we don't have that list easily exposed.
    // Let's re-filter or just use 'visitors' (all) but strictly for the current day if dateRange is today.
    // Actually, "Hourly Distribution" chart implies "Peak Times", so aggregating over the selected range is good.
    // e.g. "Over the last 7 days, 10am is busiest".

    // Re-use logic to check if a visitor falls in date range?
    // Simplified: Just iterate all 'visitors' and check if they match the date filter logic.
    // To match `processVisitorData` exactly, we'd need the start date. 
    // Let's just use all data for generalized "Peak Hours" if range > 1 day, otherwise just today.

    let relevantVisitors = data;
    if (dateRange === 'today') {
      const todayStr = new Date().toLocaleDateString('en-CA');
      relevantVisitors = data.filter(v => {
        const d = v.check_in_time ? new Date(v.check_in_time) : (v.created_at ? new Date(v.created_at) : null);
        return d && d.toLocaleDateString('en-CA') === todayStr;
      });
    }

    relevantVisitors.forEach(v => {
      const t = v.check_in_time || v.created_at;
      if (t) {
        const d = new Date(t);
        const h = d.getHours();
        const hStr = `${h.toString().padStart(2, '0')}:00`;
        // Only count if within business hours bucket (or create new bucket)
        if (hourlyCount[hStr] !== undefined) {
          hourlyCount[hStr]++;
        } else {
          // optional: add off-hours
        }
      }
    });

    const timeData = Object.entries(hourlyCount).map(([time, count]) => ({
      time,
      visitors: count
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
    alert('PDF report generation would be implemented with a library like jsPDF');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400">Comprehensive reporting and data analytics</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Action Buttons */}
            <button className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
              <ShareIcon className="h-4 w-4" /> Share
            </button>
            <button onClick={generatePDFReport} className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
              <PrinterIcon className="h-4 w-4" /> Print
            </button>
            <button onClick={() => exportReport('csv')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2">
              <DocumentArrowDownIcon className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
          <TabGroup index={selectedTab} onIndexChange={setSelectedTab}>
            <TabList className="border-b border-gray-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6">
              <Tab className="px-8 py-5 text-sm font-semibold text-gray-300 data-[selected]:text-white data-[selected]:bg-slate-800/50 data-[selected]:border-b-4 data-[selected]:border-blue-400 first:rounded-tl-2xl hover:text-white hover:bg-slate-800/30 transition-all duration-300 flex items-center gap-3">
                <ChartBarIcon className="h-5 w-5" /> Dashboard
              </Tab>
              <Tab className="px-8 py-5 text-sm font-semibold text-gray-300 data-[selected]:text-white data-[selected]:bg-slate-800/50 data-[selected]:border-b-4 data-[selected]:border-blue-400 last:rounded-tr-2xl hover:text-white hover:bg-slate-800/30 transition-all duration-300 flex items-center gap-3">
                <PresentationChartLineIcon className="h-5 w-5" /> Visitor Analytics
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {/* Control Panel */}
                <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-slate-900 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" /> Date Range
                      </Text>
                      <div className="relative">
                        <select
                          value={dateRange}
                          onChange={(e) => setDateRange(e.target.value)}
                          className="w-full appearance-none bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg pl-4 pr-10 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border hover:border-blue-400 transition-colors cursor-pointer"
                        >
                          <option value="today">Today</option>
                          <option value="7days">Last 7 Days</option>
                          <option value="30days">Last 30 Days</option>
                          <option value="90days">Last 3 Months</option>
                          <option value="year">This Year</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <Text className="mb-2 font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <DocumentChartBarIcon className="h-4 w-4" /> Report Type
                      </Text>
                      <div className="relative">
                        <select
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                          className="w-full appearance-none bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg pl-4 pr-10 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border hover:border-blue-400 transition-colors cursor-pointer"
                        >
                          <option value="visitors">Visitors</option>
                          <option value="security">Security Events</option>
                          <option value="badges">Badge Usage</option>
                          <option value="departments">Department Analytics</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Key Metrics */}
                <div className="p-6">
                  <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
                    <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg">
                      <Flex alignItems="start">
                        <div className="flex-1">
                          <Text className="text-blue-100 font-medium">Total Visitors</Text>
                          <Metric className="text-white text-4xl font-bold mt-2">
                            {/* Use totalCount if available from API, otherwise sum from filtered data */}
                            {loading ? '...' : (visitors.totalCount || visitorData.reduce((acc, curr) => acc + curr.visitors, 0))}
                          </Metric>
                          <Text className="text-sm text-blue-100 mt-1">
                            {visitors.totalCount ? 'System Total' : 'In selected period'}
                          </Text>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <ChartBarIcon className="h-6 w-6 text-white" />
                        </div>
                      </Flex>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg">
                      <Flex alignItems="start">
                        <div className="flex-1">
                          <Text className="text-green-100 font-medium">Daily Average</Text>
                          <Metric className="text-white text-4xl font-bold mt-2">
                            {loading ? '...' : Math.round(visitorData.reduce((acc, curr) => acc + curr.visitors, 0) / (visitorData.length || 1))}
                          </Metric>
                          <Text className="text-sm text-green-100 mt-1">Visitors per day</Text>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <PresentationChartLineIcon className="h-6 w-6 text-white" />
                        </div>
                      </Flex>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 border-none shadow-lg">
                      <Flex alignItems="start">
                        <div className="flex-1">
                          <Text className="text-purple-100 font-medium">Checked In</Text>
                          <Metric className="text-white text-4xl font-bold mt-2">{loading ? '...' : visitorStats.checkedIn}</Metric>
                          <Text className="text-sm text-purple-100 mt-1">Currently on site</Text>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <EyeIcon className="h-6 w-6 text-white" />
                        </div>
                      </Flex>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-lg">
                      <Flex alignItems="start">
                        <div className="flex-1">
                          <Text className="text-orange-100 font-medium">Expected</Text>
                          <Metric className="text-white text-4xl font-bold mt-2">{loading ? '...' : visitorStats.expected}</Metric>
                          <Text className="text-sm text-orange-100 mt-1">Pending arrival</Text>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <DocumentChartBarIcon className="h-6 w-6 text-white" />
                        </div>
                      </Flex>
                    </Card>
                  </Grid>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-900">
                      <Title className="text-gray-900 dark:text-white font-bold mb-4">Visitor Trends</Title>
                      <AreaChart
                        data={visitorData}
                        index="date"
                        categories={["visitors", "checkins", "checkouts"]}
                        colors={["blue", "green", "red"]}
                        height="h-80"
                        showAnimation={true}
                      />
                    </Card>
                    <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-slate-900">
                      <Title className="text-gray-900 dark:text-white font-bold mb-4">Peak Hours</Title>
                      <BarChart
                        data={timeSeriesData}
                        index="time"
                        categories={["visitors"]}
                        colors={["purple"]}
                        height="h-80"
                        showAnimation={true}
                      />
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-slate-900">
                      <Title className="text-gray-900 dark:text-white font-bold mb-4">Department Distribution</Title>
                      <DonutChart
                        data={departmentData}
                        category="visitors"
                        index="department"
                        colors={["blue", "green", "yellow", "red", "purple"]}
                        height="h-80"
                        showAnimation={true}
                      />
                    </Card>
                    <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-slate-900">
                      <Title className="text-gray-900 dark:text-white font-bold mb-4">Weekly Comparison</Title>
                      <LineChart
                        data={visitorData}
                        index="date"
                        categories={["visitors"]}
                        colors={["orange"]}
                        height="h-80"
                        showAnimation={true}
                      />
                    </Card>
                  </div>
                </div>
              </TabPanel>

              {/* Visitor Analytics Detail Tab */}
              <TabPanel>
                <div className="p-6">
                  <Grid numItems={1} numItemsLg={3} className="gap-6 mb-6">
                    {/* Status Breakdown */}
                    <Card className="p-6 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-900/10 border-green-100 dark:border-green-900/30 shadow-lg">
                      <Title className="text-green-900 dark:text-green-400 mb-4 flex items-center gap-2">
                        <UserGroupIcon className="h-5 w-5" /> Visitor Status
                      </Title>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <Text className="font-medium text-green-900 dark:text-green-300">Checked In</Text>
                          <Badge color="green" className="font-semibold">{visitorStats.checkedIn}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                          <Text className="font-medium text-yellow-900 dark:text-yellow-300">Expected</Text>
                          <Badge color="yellow" className="font-semibold">{visitorStats.expected}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                          <Text className="font-medium text-gray-900 dark:text-gray-300">Checked Out</Text>
                          <Badge color="gray" className="font-semibold">{visitorStats.checkedOut}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <Text className="font-medium text-red-900 dark:text-red-300">Overdue</Text>
                          <Badge color="red" className="font-semibold">{visitorStats.overdue}</Badge>
                        </div>
                      </div>
                    </Card>

                    {/* Duration Breakdown */}
                    <Card className="p-6 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-lg">
                      <Title className="text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
                        <ClockIcon className="h-5 w-5" /> Visit Duration
                      </Title>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <Text className="font-medium text-gray-700 dark:text-gray-300">{'< 1 hour'}</Text>
                            <Text className="font-semibold text-slate-900 dark:text-white">{durationStats.short}%</Text>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-slate-600 dark:bg-slate-400 h-2.5 rounded-full" style={{ width: `${durationStats.short}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <Text className="font-medium text-gray-700 dark:text-gray-300">1-4 hours</Text>
                            <Text className="font-semibold text-green-600 dark:text-green-400">{durationStats.medium}%</Text>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${durationStats.medium}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <Text className="font-medium text-gray-700 dark:text-gray-300">{'> 4 hours'}</Text>
                            <Text className="font-semibold text-yellow-600 dark:text-yellow-400">{durationStats.long}%</Text>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${durationStats.long}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Type Breakdown */}
                    <Card className="p-6 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-900/10 border-purple-100 dark:border-purple-900/30 shadow-lg">
                      <Title className="text-purple-900 dark:text-purple-400 mb-4 flex items-center gap-2">
                        <ChartPieIcon className="h-5 w-5" /> Visitor Types
                      </Title>
                      <DonutChart
                        data={(() => {
                          const types = {};
                          visitors.forEach(v => {
                            const type = v.purpose || v.visit_type || 'General';
                            types[type] = (types[type] || 0) + 1;
                          });
                          return Object.entries(types).map(([type, count]) => ({
                            type,
                            visitors: count
                          }));
                        })()}
                        category="visitors"
                        index="type"
                        colors={["blue", "green", "yellow", "red", "purple"]}
                        height="h-60"
                        showAnimation={true}
                      />
                    </Card>
                  </Grid>

                  {/* Detailed Native Table */}
                  <Card className="p-6 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800 shadow-lg border-slate-200 dark:border-slate-700">
                    <Title className="text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <TableCellsIcon className="h-5 w-5" /> Detailed Analytics
                    </Title>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHead className="bg-slate-50 dark:bg-slate-800">
                          <TableRow>
                            <TableHeaderCell className="text-slate-900 dark:text-white">Date</TableHeaderCell>
                            <TableHeaderCell className="text-slate-900 dark:text-white">Total Visitors</TableHeaderCell>
                            <TableHeaderCell className="text-slate-900 dark:text-white">Check-ins</TableHeaderCell>
                            <TableHeaderCell className="text-slate-900 dark:text-white">Check-outs</TableHeaderCell>
                            <TableHeaderCell className="text-slate-900 dark:text-white">Peak Hour</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visitorData.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-gray-700 dark:text-gray-300">{row.date}</TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">{row.visitors}</TableCell>
                              <TableCell>
                                <Badge color="green">{row.checkins}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge color="gray">{row.checkouts}</Badge>
                              </TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {/* Placeholder for peak hour calc per day if needed */}
                                -
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsAnalytics;