import { useState, useEffect } from 'react'
import { Card, Title, Text, Metric, Flex, Grid, ProgressBar, AreaChart, DonutChart, Badge as TremorBadge, Button, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react'
import { Users, UserCheck, Clock, TrendingUp, Calendar, Eye, UserPlus, Shield, Building2, X, MonitorPlay, Mail, QrCode, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import ApiService from '../services/api'
import showToast from '../utils/toast'
import { useAuth } from '../contexts/AuthContext'
import { generateAccessCode } from '../utils/auth'
import HostSelector from '../components/HostSelector'
import FloorSelector from '../components/FloorSelector'
import VisitorDetailModal from '../components/VisitorDetailModal'
import GuestInviteModal from '../components/GuestInviteModal'

const AdminDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [showInviteModal, setShowInviteModal] = useState(false)
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
  const [checkingIn, setCheckingIn] = useState(null)
  const [showCheckOutConfirm, setShowCheckOutConfirm] = useState(false)
  const [pendingVisitorAction, setPendingVisitorAction] = useState(null)
  const [hosts, setHosts] = useState([])
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrInput, setQrInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
    host_id: '',
    floor: '',
    expected_duration: 4,
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  })

  const loadHosts = async () => {
    try {
      const hostsData = await ApiService.getHosts()
      if (typeof setHosts === 'function') {
        setHosts(hostsData || [])
      } else {
        console.error('setHosts is not a function in loadHosts');
      }
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

  useEffect(() => {
    loadData()
    loadHosts()
  }, [])

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
        expected_duration: 4,
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
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
        expected_duration: 4,
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
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

  const handleCheckIn = async (visitor, e) => {
    if (e) e.stopPropagation();
    setPendingVisitorAction(visitor);
    setShowQRModal(true);
  };

  const handleVerifyAndCheckIn = async () => {
    if (!qrInput.trim()) {
      showToast('Please enter guest code or scan QR code', 'error')
      return
    }

    try {
      setLoading(true)

      // Verify the code matches the visitor
      if (pendingVisitorAction && (
        qrInput.toLowerCase() === pendingVisitorAction.guest_code?.toLowerCase() ||
        qrInput === pendingVisitorAction.visitor_id ||
        qrInput === pendingVisitorAction.id
      )) {

        // --- Time Restriction Logic (Optional but good for consistency) ---
        if (pendingVisitorAction.visit_date) {
          const now = new Date()
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const visitDate = new Date(pendingVisitorAction.visit_date)
          visitDate.setHours(0, 0, 0, 0)

          if (visitDate > today) {
            showToast(`Cannot check in yet. Visit is scheduled for ${new Date(pendingVisitorAction.visit_date).toLocaleDateString()}.`, 'error')
            setLoading(false)
            return
          }

          if (visitDate.getTime() === today.getTime() && pendingVisitorAction.visit_time) {
            try {
              const [hours, mins] = pendingVisitorAction.visit_time.split(':')
              const scheduledTime = new Date()
              scheduledTime.setHours(parseInt(hours), parseInt(mins), 0, 0)

              const allowedTime = new Date(scheduledTime.getTime() - 60 * 60 * 1000) // 60 mins buffer

              if (now < allowedTime) {
                showToast(`Too early! Check-in allowed from ${allowedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'error')
                setLoading(false)
                return
              }
            } catch (e) {
              console.warn('Error parsing visit time:', e)
            }
          }
        }

        const updatedVisitor = await ApiService.checkIn(pendingVisitorAction.id)

        // Show success toast with badge info
        const badgeInfo = updatedVisitor.badge_number
          ? ` Badge ${updatedVisitor.badge_number} assigned.`
          : '';

        showToast(`${pendingVisitorAction.name} checked in successfully!${badgeInfo}`, 'success')

        setShowQRModal(false)
        setQrInput('')
        setPendingVisitorAction(null)
        await loadData()
      } else {
        showToast('Invalid code! Code does not match this visitor.', 'error')
      }
    } catch (error) {
      console.error('Check-in failed:', error)
      showToast('Failed to check in visitor. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }



  const handleCheckOut = async (visitor, e) => {
    if (e) e.stopPropagation();
    setPendingVisitorAction(visitor);
    setShowCheckOutConfirm(true);
  };

  const confirmCheckOut = async () => {
    if (!pendingVisitorAction) return;
    const visitor = pendingVisitorAction;
    try {
      const visitorId = visitor.id || visitor;
      setCheckingIn(visitorId);

      await ApiService.updateVisitor(visitorId, {
        status: 'checked_out',
        check_out_time: new Date().toISOString()
      });

      await loadData();
      setShowCheckOutConfirm(false);
      setPendingVisitorAction(null);
    } catch (error) {
      console.error('Failed to check out visitor:', error);
      alert('Failed to check out visitor. Please try again.');
    } finally {
      setCheckingIn(null);
    }
  };


  const floorDistribution = [
    { name: 'Floor 1-3', value: 45 },
    { name: 'Floor 4-6', value: 32 },
    { name: 'Floor 7-9', value: 18 },
    { name: 'Floor 10-12', value: 15 }
  ]

  const recentActivity = visitors.slice(0, 5).map(v => ({
    ...v,
    // Map check_in_time and check_out_time directly from the visitor object
    check_in_time: v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
    check_out_time: v.check_out_time ? new Date(v.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
    name: v.name,
    time: v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    status: v.status,
    badge: v.badge_number,
    id: v.id,
    full_name: v.full_name,
    floor: v.floor_number || v.floor
  }))


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Overview of visitor activity and system status</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/reception/visitor-kiosk')}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-lg transition-colors shadow-sm"
            >
              Visitor Kiosk
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Mail size={18} />
              Invite Guest
            </button>
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
            <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
              <Flex alignItems="start" justifyContent="between">
                <div>
                  <Text className="text-gray-500 dark:text-gray-400 font-medium">Total Visitors</Text>
                  <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalVisitors}</Metric>
                  <Flex className="mt-2" alignItems="center" justifyContent="start">
                    <TrendingUp className="text-blue-500 dark:text-blue-400" size={16} />
                    <Text className="text-blue-600 dark:text-blue-400 ml-1 font-medium">+{stats.weeklyGrowth}%</Text>
                  </Flex>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                  <Users className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </Flex>
            </Card>

            <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
              <Flex alignItems="start" justifyContent="between">
                <div>
                  <Text className="text-gray-500 dark:text-gray-400 font-medium">Active Now</Text>
                  <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.activeVisitors}</Metric>
                  <Text className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium">Currently on site</Text>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                  <UserCheck className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </Flex>
            </Card>

            <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
              <Flex alignItems="start" justifyContent="between">
                <div>
                  <Text className="text-gray-500 dark:text-gray-400 font-medium">Today's Check-ins</Text>
                  <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.todayCheckIns}</Metric>
                  <Text className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Since midnight</Text>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/30 p-3 rounded-xl">
                  <Calendar className="text-violet-600 dark:text-violet-400" size={24} />
                </div>
              </Flex>
            </Card>

            <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
              <Flex alignItems="start" justifyContent="between">
                <div>
                  <Text className="text-gray-500 dark:text-gray-400 font-medium">Pending Approvals</Text>
                  <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals}</Metric>
                  <Text className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">Action required</Text>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl">
                  <Clock className="text-amber-600 dark:text-amber-400" size={24} />
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
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg text-base font-medium hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Mid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">High</span>
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
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
            >
              View All
            </button>
          </div>
          <Table className="mt-4">
            <TableHead>
              <TableRow className="border-b border-gray-100 dark:border-slate-800">
                <TableHeaderCell>Visitor</TableHeaderCell>
                <TableHeaderCell>Floor</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Check In</TableHeaderCell>
                <TableHeaderCell>Check Out</TableHeaderCell>
                <TableHeaderCell>Badge</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                <TableRow
                  key={i}
                  onClick={() => handleViewVisitor(activity)}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {activity.name?.charAt(0) || 'V'}
                      </div>
                      <Text className="font-medium text-gray-900 dark:text-white">{activity.name || 'Unknown'}</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    {activity.floor ? (
                      <TremorBadge color="blue" size="xs">
                        {activity.floor}
                      </TremorBadge>
                    ) : (
                      <Text className="text-gray-400 dark:text-gray-500">-</Text>
                    )}
                  </TableCell>
                  <TableCell>
                    <TremorBadge
                      color={activity.status === 'checked_in' ? 'green' : activity.status === 'pre_registered' ? 'blue' : (activity.status === 'pending' || activity.status === 'pending_approval') ? 'amber' : 'gray'}
                      size="xs"
                    >
                      {activity.status === 'checked_in' ? 'Checked In'
                        : activity.status === 'pre_registered' ? 'Pre-registered'
                          : activity.status === 'pending' ? 'Pending'
                            : activity.status === 'pending_approval' ? 'Awaiting Approval'
                              : 'Checked Out'}
                    </TremorBadge>
                  </TableCell>
                  <TableCell>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">{activity.check_in_time}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">{activity.check_out_time}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">#{activity.badge || 'N/A'}</Text>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {activity.status !== 'checked_in' && activity.status !== 'checked_out' && (
                        <Button
                          size="xs"
                          color="green"
                          loading={checkingIn === activity.id}
                          disabled={checkingIn === activity.id}
                          onClick={(e) => handleCheckIn(activity, e)}
                        >
                          Check In
                        </Button>
                      )}
                      {activity.status === 'checked_in' && (
                        <Button
                          size="xs"
                          variant="secondary"
                          loading={checkingIn === activity.id}
                          disabled={checkingIn === activity.id}
                          onClick={(e) => handleCheckOut(activity, e)}
                        >
                          Check Out
                        </Button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewVisitor(activity);
                        }}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                    No recent activity found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Visitor Modal */}
      < AnimatePresence >
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
                  className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Visitor</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pre-register a visitor for check-in</p>
                      </div>
                      <button
                        onClick={() => setIsAddVisitorOpen(false)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newVisitor.name}
                          onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent"
                          placeholder="Enter visitor's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={newVisitor.email}
                          onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent"
                          placeholder="visitor@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={newVisitor.phone}
                          onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent"
                          placeholder="+234-XXX-XXX-XXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Company/Organization
                        </label>
                        <input
                          type="text"
                          value={newVisitor.company}
                          onChange={(e) => setNewVisitor({ ...newVisitor, company: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent"
                          placeholder="Company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Visit Date *
                        </label>
                        <DatePicker
                          selected={newVisitor.visit_date ? new Date(newVisitor.visit_date) : null}
                          onChange={(date) => setNewVisitor({ ...newVisitor, visit_date: date.toISOString().split('T')[0] })}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent"
                          dateFormat="MMMM d, yyyy"
                          minDate={new Date()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Visit Time
                        </label>
                        <DatePicker
                          selected={newVisitor.visit_time ? new Date(`2000-01-01T${newVisitor.visit_time}`) : null}
                          onChange={(date) => setNewVisitor({ ...newVisitor, visit_time: date.toTimeString().split(' ')[0].substring(0, 5) })}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent"
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
                      required={false}
                    />

                    <FloorSelector
                      value={newVisitor.floor}
                      onChange={(floor) => setNewVisitor({ ...newVisitor, floor })}
                      label="Floor Assignment"
                      required={false}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Purpose of Visit *
                      </label>
                      <textarea
                        value={newVisitor.purpose}
                        onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent resize-none"
                        placeholder="Brief description of visit purpose"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expected Duration (hours)
                      </label>
                      <input
                        type="number"
                        value={newVisitor.expected_duration}
                        onChange={(e) => setNewVisitor({ ...newVisitor, expected_duration: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent"
                        min="1"
                        max="24"
                      />
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-white dark:bg-slate-900 px-6 py-4 border-t border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setIsAddVisitorOpen(false)}
                        className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddVisitor}
                        disabled={!newVisitor.name || !newVisitor.purpose}
                        className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center gap-2"
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
      </AnimatePresence >

      {/* Edit Visitor Modal */}
      < AnimatePresence >
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
                        disabled={!newVisitor.name || !newVisitor.purpose}
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
      </AnimatePresence >

      {/* View Visitor Details Modal */}
      < AnimatePresence >
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
      </AnimatePresence >

      {/* Visitor Detail Modal */}
      < VisitorDetailModal
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
      < GuestInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        hostName={profile?.full_name}
        hostId={profile?.id}
      />

      {/* Confirmation Modals */}
      < AnimatePresence >
        {showQRModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowQRModal(false)
                setQrInput('')
                setPendingVisitorAction(null)
              }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verify Guest</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {pendingVisitorAction ? `Verifying: ${pendingVisitorAction.name || pendingVisitorAction.full_name}` : 'Enter guest code to verify'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowQRModal(false)
                        setQrInput('')
                        setPendingVisitorAction(null)
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Guest Code or QR Code
                      </label>
                      <input
                        type="text"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerifyAndCheckIn()}
                        placeholder="Enter guest code (e.g., GC-XXXXX)"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {pendingVisitorAction
                          ? `Enter the guest code to verify ${pendingVisitorAction.name || pendingVisitorAction.full_name}`
                          : 'Enter the visitor\'s guest code or scan their QR code'}
                      </p>
                    </div>

                    <div className="text-center py-8 bg-gray-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600">
                      <QrCode size={64} className="mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                      <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">QR Scanner Ready</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enter code above or use QR scanner device</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setShowQRModal(false)
                        setQrInput('')
                        setPendingVisitorAction(null)
                      }}
                      className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyAndCheckIn}
                      disabled={!qrInput.trim() || loading}
                      className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      {loading ? 'Verifying...' : 'Verify & Check In'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {
          showCheckOutConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100 dark:border-slate-800"
              >
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Check Out</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to check out <strong>{pendingVisitorAction?.full_name}</strong>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowCheckOutConfirm(false); setPendingVisitorAction(null); }}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCheckOut}
                    disabled={checkingIn}
                    className="flex-1 px-4 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
      </AnimatePresence>
    </DashboardLayout >
  )
}

export default AdminDashboard