import { useState, useEffect } from 'react'
import { Card, Title, Text, Metric, Flex, Grid, ProgressBar, AreaChart, DonutChart, Badge as TremorBadge } from '@tremor/react'
import { Users, UserCheck, Clock, TrendingUp, Calendar, Eye, UserPlus, Shield, Building2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import ApiService from '../services/api'
import showToast from '../utils/toast'
import { useAuth } from '../contexts/AuthContext'
import HostSelector from '../components/HostSelector'
import FloorSelector from '../components/FloorSelector'
import VisitorDetailModal from '../components/VisitorDetailModal'

const AdminDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeVisitors: 0,
    todayCheckIns: 0,
    pendingApprovals: 0,
    weeklyGrowth: 12.5
  })
  const [visitors, setVisitors] = useState([])
  const [chartData, setChartData] = useState([])
  const [isAddVisitorOpen, setIsAddVisitorOpen] = useState(false)
  const [isEditVisitorOpen, setIsEditVisitorOpen] = useState(false)
  const [isViewVisitorOpen, setIsViewVisitorOpen] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [hosts, setHosts] = useState([])
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
    host_id: '',
    floor: '',
    expected_duration: 4
  })

  useEffect(() => {
    loadData()
    loadHosts()
  }, [])

  const loadHosts = async () => {
    try {
      const hostsData = await ApiService.getHosts()
      setHosts(hostsData || [])
    } catch (error) {
      console.error('Failed to load hosts:', error)
    }
  }

  const loadData = async () => {
    try {
      const visitorsData = await ApiService.getVisitors({ status: 'all' })
      setVisitors(visitorsData || [])

      const today = new Date().toISOString().split('T')[0]
      const todayVisitors = visitorsData.filter(v => v.check_in_time?.startsWith(today))
      const active = visitorsData.filter(v => v.status === 'checked_in')
      const pending = visitorsData.filter(v => v.status === 'pre_registered' || v.status === 'pending_approval')

      setStats({
        totalVisitors: visitorsData.length,
        activeVisitors: active.length,
        todayCheckIns: todayVisitors.length,
        pendingApprovals: pending.length,
        weeklyGrowth: 12.5
      })

      // Generate chart data for last 7 days
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const count = visitorsData.filter(v => v.check_in_time?.startsWith(dateStr)).length
        last7Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Check-ins': count,
          'Check-outs': Math.max(0, count - Math.floor(Math.random() * 3))
        })
      }
      setChartData(last7Days)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleAddVisitor = async () => {
    try {
      await ApiService.createVisitor(newVisitor)

      // Show success toast
      showToast(`Visitor ${newVisitor.name} added successfully!`, 'success');

      setIsAddVisitorOpen(false)
      setNewVisitor({
        name: '',
        email: '',
        phone: '',
        company: '',
        purpose: '',
        host_id: '',
        floor: '',
        expected_duration: 4
      })
      loadData() // Reload data to show new visitor
    } catch (error) {
      console.error('Failed to add visitor:', error)
      showToast('Failed to add visitor. Please try again.', 'error');
    }
  }

  const handleEditVisitor = async () => {
    try {
      // Convert floor to number if it's a string
      let floorNumber = newVisitor.floor
      if (typeof floorNumber === 'string') {
        // Extract number from strings like "9th Floor" or "Ground Floor"
        if (floorNumber.toLowerCase().includes('ground')) {
          floorNumber = 0
        } else {
          const match = floorNumber.match(/\d+/)
          floorNumber = match ? parseInt(match[0]) : null
        }
      }

      console.log('🔄 Updating visitor with data:', {
        name: newVisitor.name,
        email: newVisitor.email,
        phone: newVisitor.phone,
        company: newVisitor.company,
        purpose: newVisitor.purpose,
        host_id: newVisitor.host_id,
        floor_number: floorNumber
      })

      await ApiService.updateVisitor(selectedVisitor.id, {
        name: newVisitor.name,
        email: newVisitor.email,
        phone: newVisitor.phone,
        company: newVisitor.company,
        purpose: newVisitor.purpose,
        host_id: newVisitor.host_id,
        floor_number: floorNumber
      })

      showToast(`Visitor ${newVisitor.name} updated successfully!`, 'success');

      setIsEditVisitorOpen(false)
      setSelectedVisitor(null)
      setNewVisitor({
        name: '',
        email: '',
        phone: '',
        company: '',
        purpose: '',
        host_id: '',
        floor: '',
        expected_duration: 4
      })
      loadData()
    } catch (err) {
      console.error('Failed to update visitor:', err)
      showToast(`Failed to update visitor: ${err.message || 'Please try again.'}`, 'error');
    }
  }

  const handleViewVisitor = (activity) => {
    // Find the full visitor object
    const visitor = visitors.find(v =>
      v.full_name === activity.name ||
      v.name === activity.name ||
      v.id === activity.id
    )
    setSelectedVisitor(visitor || activity)
    setIsViewVisitorOpen(true)
  }

  const floorDistribution = [
    { name: 'Floor 1-3', value: 45 },
    { name: 'Floor 4-6', value: 32 },
    { name: 'Floor 7-9', value: 18 },
    { name: 'Floor 10-12', value: 15 }
  ]

  const recentActivity = visitors.slice(0, 5).map(v => ({
    name: v.name,
    time: v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    status: v.status,
    badge: v.badge_number
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Overview of visitor activity and system status</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm transition-colors">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Top Row: Welcome Card & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome/Update Card - Dark Blue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-300">Live Update</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {profile?.full_name?.split(' ')[0]}!</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Visitor traffic has increased by <span className="text-blue-400 font-bold">+{stats.weeklyGrowth}%</span> this week.
                Keep up the great work managing the flow!
              </p>
              <button
                onClick={() => navigate('/reports-analytics')}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View Report <TrendingUp size={16} />
              </button>
            </div>
            {/* Decorative Circles */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />
            <div className="absolute top-10 right-10 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl" />
          </motion.div>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
              <Flex alignItems="start" justifyContent="between">
                <div>
                  <Text className="text-gray-500 font-medium">Total Visitors</Text>
                  <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.totalVisitors}</Metric>
                  <Flex className="mt-2" alignItems="center" justifyContent="start">
                    <TrendingUp className="text-blue-500" size={16} />
                    <Text className="text-blue-600 ml-1 font-medium">+{stats.weeklyGrowth}%</Text>
                  </Flex>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Users className="text-blue-600" size={24} />
                </div>
              </Flex>
            </Card>

            <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
              <Flex alignItems="start" justifyContent="between">
                <div>
                  <Text className="text-gray-500 dark:text-gray-400 font-medium">Active Now</Text>
                  <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.activeVisitors}</Metric>
                  <Text className="mt-2 text-blue-600 text-sm font-medium">Currently on site</Text>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <UserCheck className="text-blue-600" size={24} />
                </div>
              </Flex>
            </Card>

            <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
              <Flex alignItems="start" justifyContent="between">
                <div>
                  <Text className="text-gray-500 font-medium">Today's Check-ins</Text>
                  <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.todayCheckIns}</Metric>
                  <Text className="mt-2 text-gray-500 text-sm">Since midnight</Text>
                </div>
                <div className="bg-violet-50 p-3 rounded-xl">
                  <Calendar className="text-violet-600" size={24} />
                </div>
              </Flex>
            </Card>

            <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
              <Flex alignItems="start" justifyContent="between">
                <div>
                  <Text className="text-gray-500 font-medium">Pending Approvals</Text>
                  <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingApprovals}</Metric>
                  <Text className="mt-2 text-amber-600 text-sm font-medium">Action required</Text>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl">
                  <Clock className="text-amber-600" size={24} />
                </div>
              </Flex>
            </Card>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
            <Title className="text-gray-900 dark:text-white font-bold">Visitor Traffic</Title>
            <AreaChart
              className="mt-4 h-72"
              data={chartData}
              index="date"
              categories={['Check-ins', 'Check-outs']}
              colors={['blue', 'slate']}
              valueFormatter={(value) => value.toString()}
              showLegend={true}
              showGridLines={false}
              curveType="monotone"
            />
          </Card>

          <div className="space-y-6">
            {/* Add Visitor Button */}
            <button
              onClick={() => setIsAddVisitorOpen(true)}
              className="w-full bg-slate-900 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Add New Visitor
            </button>

            {/* Floor Distribution Card */}
            <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
              <Title className="text-gray-900 dark:text-white font-bold">Floor Distribution</Title>
              <DonutChart
                className="mt-8 h-60"
                data={floorDistribution}
                category="value"
                index="name"
                colors={['blue', 'indigo', 'cyan', 'slate']}
                valueFormatter={(value) => `${value}`}
                showLabel={true}
                variant="pie"
              />
              <div className="mt-6 flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-500">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-sm text-gray-500">Mid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-sm text-gray-500">High</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <Title className="text-gray-900 dark:text-white font-bold">Recent Activity</Title>
            <button
              onClick={() => navigate('/reception')}
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 pl-2">Visitor</th>
                  <th className="pb-3">Floor</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Badge</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                  <tr
                    key={i}
                    onClick={() => handleViewVisitor(activity)}
                    className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {activity.name?.charAt(0) || 'V'}
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-slate-900">{activity.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      {activity.floor ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activity.floor}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.status === 'checked_in'
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {activity.status === 'checked_in' ? 'Checked In' : activity.status === 'pending' ? 'Pending' : 'Checked Out'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">{activity.time}</td>
                    <td className="py-3 text-sm text-gray-500">#{activity.badge || 'N/A'}</td>
                    <td className="py-3 text-right pr-2">
                      <Eye size={16} className="text-gray-400 group-hover:text-slate-900 transition-colors inline-block" />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No recent activity</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Visitor Modal */}
      <AnimatePresence>
        {isAddVisitorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddVisitorOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Add New Visitor</h3>
                        <p className="text-sm text-gray-500 mt-1">Pre-register a visitor for check-in</p>
                      </div>
                      <button
                        onClick={() => setIsAddVisitorOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newVisitor.name}
                          onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="Enter visitor's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={newVisitor.email}
                          onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="visitor@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={newVisitor.phone}
                          onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="+234-XXX-XXX-XXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company/Organization
                        </label>
                        <input
                          type="text"
                          value={newVisitor.company}
                          onChange={(e) => setNewVisitor({ ...newVisitor, company: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="Company name"
                        />
                      </div>
                    </div>

                    <HostSelector
                      hosts={hosts}
                      value={newVisitor.host_id}
                      onChange={(hostId) => {
                        // Auto-fill floor based on selected host
                        const selectedHost = hosts.find(h => h.id === hostId);
                        const hostFloor = selectedHost?.floor_number
                          ? `${selectedHost.floor_number === 1 ? 'Ground Floor' : selectedHost.floor_number === 2 ? '1st Floor' : selectedHost.floor_number === 3 ? '2nd Floor' : selectedHost.floor_number === 4 ? '3rd Floor' : selectedHost.floor_number === 5 ? '4th Floor' : selectedHost.floor_number === 6 ? '5th Floor' : selectedHost.floor_number === 7 ? '6th Floor' : selectedHost.floor_number === 8 ? '7th Floor' : selectedHost.floor_number === 9 ? '8th Floor' : selectedHost.floor_number === 10 ? '9th Floor' : `${selectedHost.floor_number}th Floor`}`
                          : '';
                        setNewVisitor({ ...newVisitor, host_id: hostId, floor: hostFloor });
                      }}
                      label="Host"
                    />

                    <FloorSelector
                      value={newVisitor.floor}
                      onChange={(floor) => setNewVisitor({ ...newVisitor, floor })}
                      label="Floor Assignment"
                      required={true}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose of Visit *
                      </label>
                      <textarea
                        value={newVisitor.purpose}
                        onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                        placeholder="Brief description of visit purpose"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Duration (hours)
                      </label>
                      <input
                        type="number"
                        value={newVisitor.expected_duration}
                        onChange={(e) => setNewVisitor({ ...newVisitor, expected_duration: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        min="1"
                        max="24"
                      />
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setIsAddVisitorOpen(false)}
                        className="px-5 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddVisitor}
                        disabled={!newVisitor.name || !newVisitor.email || !newVisitor.phone || !newVisitor.host_id || !newVisitor.purpose}
                        className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <UserPlus size={18} />
                        Add Visitor
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Visitor Modal */}
      <AnimatePresence>
        {isEditVisitorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditVisitorOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Edit Visitor</h3>
                        <p className="text-sm text-gray-500 mt-1">Update visitor information</p>
                      </div>
                      <button
                        onClick={() => setIsEditVisitorOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newVisitor.name}
                          onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="Enter visitor's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={newVisitor.email}
                          onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="visitor@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={newVisitor.phone}
                          onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="+234-XXX-XXX-XXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company/Organization
                        </label>
                        <input
                          type="text"
                          value={newVisitor.company}
                          onChange={(e) => setNewVisitor({ ...newVisitor, company: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="Company name"
                        />
                      </div>
                    </div>

                    <HostSelector
                      hosts={hosts}
                      value={newVisitor.host_id}
                      onChange={(hostId) => {
                        const selectedHost = hosts.find(h => h.id === hostId);
                        const hostFloor = selectedHost?.floor_number
                          ? `${selectedHost.floor_number === 1 ? 'Ground Floor' : selectedHost.floor_number === 2 ? '1st Floor' : selectedHost.floor_number === 3 ? '2nd Floor' : selectedHost.floor_number === 4 ? '3rd Floor' : selectedHost.floor_number === 5 ? '4th Floor' : selectedHost.floor_number === 6 ? '5th Floor' : selectedHost.floor_number === 7 ? '6th Floor' : selectedHost.floor_number === 8 ? '7th Floor' : selectedHost.floor_number === 9 ? '8th Floor' : selectedHost.floor_number === 10 ? '9th Floor' : `${selectedHost.floor_number}th Floor`}`
                          : '';
                        setNewVisitor({ ...newVisitor, host_id: hostId, floor: hostFloor });
                      }}
                      label="Host"
                    />

                    <FloorSelector
                      value={newVisitor.floor}
                      onChange={(floor) => setNewVisitor({ ...newVisitor, floor })}
                      label="Floor Assignment"
                      required={true}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose of Visit *
                      </label>
                      <textarea
                        value={newVisitor.purpose}
                        onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                        placeholder="Brief description of visit purpose"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setIsEditVisitorOpen(false)}
                        className="px-5 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEditVisitor}
                        disabled={!newVisitor.name || !newVisitor.email || !newVisitor.phone || !newVisitor.purpose}
                        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* View Visitor Details Modal */}
      <AnimatePresence>
        {isViewVisitorOpen && selectedVisitor && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewVisitorOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Visitor Details</h3>
                      <p className="text-sm text-gray-500 mt-1">Complete visitor information</p>
                    </div>
                    <button
                      onClick={() => setIsViewVisitorOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <p className="text-base font-semibold text-gray-900">{selectedVisitor.full_name || selectedVisitor.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-base text-gray-900">{selectedVisitor.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <p className="text-base text-gray-900">{selectedVisitor.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Company</label>
                        <p className="text-base text-gray-900">{selectedVisitor.company || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Badge Number</label>
                        <p className="text-base font-mono text-gray-900">#{selectedVisitor.badge_number || selectedVisitor.badge || 'Not Assigned'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Floor Number</label>
                        <p className="text-base text-gray-900">{selectedVisitor.floor_number || selectedVisitor.floor || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedVisitor.status === 'checked_in'
                          ? 'bg-green-100 text-green-800'
                          : selectedVisitor.status === 'checked_out'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {selectedVisitor.status === 'checked_in' ? 'Checked In' :
                            selectedVisitor.status === 'checked_out' ? 'Checked Out' :
                              'Pending'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Purpose of Visit</label>
                      <p className="text-base text-gray-900">{selectedVisitor.purpose || 'N/A'}</p>
                    </div>

                    {selectedVisitor.check_in_time && (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Check-in Time</label>
                          <p className="text-base text-gray-900">
                            {new Date(selectedVisitor.check_in_time).toLocaleString()}
                          </p>
                        </div>
                        {selectedVisitor.check_out_time && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Check-out Time</label>
                            <p className="text-base text-gray-900">
                              {new Date(selectedVisitor.check_out_time).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setIsViewVisitorOpen(false)}
                        className="px-5 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setNewVisitor({
                            name: selectedVisitor.full_name || selectedVisitor.name,
                            email: selectedVisitor.email || '',
                            phone: selectedVisitor.phone || '',
                            company: selectedVisitor.company || '',
                            purpose: selectedVisitor.purpose || '',
                            host_id: selectedVisitor.host_id || '',
                            floor: selectedVisitor.floor_number || selectedVisitor.floor || ''
                          })
                          setIsViewVisitorOpen(false)
                          setIsEditVisitorOpen(true)
                        }}
                        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Visitor
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Visitor Detail Modal */}
      <VisitorDetailModal
        visitor={selectedVisitor}
        isOpen={isViewVisitorOpen}
        onClose={() => {
          setIsViewVisitorOpen(false)
          loadData()
        }}
        onRefresh={async () => {
          if (selectedVisitor?.id) {
            const updated = await ApiService.getVisitorById(selectedVisitor.id)
            if (updated) setSelectedVisitor(updated)
          }
          await loadData()
        }}
        onEdit={(visitor) => {
          setNewVisitor({
            name: visitor.full_name || visitor.name,
            email: visitor.email || '',
            phone: visitor.phone || '',
            company: visitor.company || '',
            purpose: visitor.purpose || '',
            host_id: visitor.host_id || '',
            floor: visitor.floor_number || visitor.floor || ''
          })
          setIsEditVisitorOpen(true)
        }}
      />
    </DashboardLayout>
  )
}

export default AdminDashboard