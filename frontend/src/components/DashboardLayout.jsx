import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import ApiService from '../services/api'
import {
  LayoutDashboard,
  UserCheck,
  Badge,
  Users,
  Shield,
  AlertTriangle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileText,
  BarChart3,
  ShieldAlert,
  Bell,
  User,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import GvasLogo from './GvasLogo'

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { profile, signOut, canAccess } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  // State for notifications
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!profile) return

    console.log('🔌 Subscribing to real-time visitor updates for:', profile.email)

    // Subscribe to real-time visitor updates
    const subscription = ApiService.subscribeToVisitors((payload) => {
      console.log('🔔 Real-time event received:', payload)

      const newVisitor = payload.new
      if (!newVisitor) return

      let shouldNotify = false
      let message = ''
      let title = ''
      let type = 'visitor'

      // 1. Host Notification
      if (profile.role === 'host' && newVisitor.host_id === profile.id) {
        if (payload.eventType === 'INSERT') {
          // Distinguish walk-in vs pre-registration
          const isWalkIn = newVisitor.status === 'checked_in' && !newVisitor.guest_code
          shouldNotify = true

          if (isWalkIn) {
            type = 'walk_in'
            title = '🚶 Walk-in Visitor'
            message = `${newVisitor.name} has walked in and checked in to see you.`
          } else {
            type = 'pre_registered'
            title = '📅 New Appointment Booked'
            message = `A guest (${newVisitor.name}) has booked an appointment with you for ${newVisitor.visit_date || 'soon'}. Guest Code: ${newVisitor.guest_code || 'N/A'}`
          }
        } else if (payload.eventType === 'UPDATE' && newVisitor.status === 'checked_in') {
          // Pre-registered guest has now arrived
          shouldNotify = true
          type = 'arrival'
          title = '✅ Your Guest Has Arrived'
          message = `${newVisitor.name} has arrived and is waiting for you at reception.`
        }
      }

      // 2. Reception Notification (floor-specific)
      if (profile.role === 'reception') {
        // Check if this visitor is on receptionist's assigned floor
        const visitorFloor = newVisitor.floor_number
        const isMyFloor = !profile.assigned_floors || profile.assigned_floors.length === 0 ||
          profile.assigned_floors.some(f => {
            const floorNum = typeof f === 'number' ? f : parseInt(f)
            return floorNum === visitorFloor
          })

        if (isMyFloor && payload.eventType === 'INSERT') {
          const isWalkIn = newVisitor.status === 'checked_in' && !newVisitor.guest_code
          shouldNotify = true

          if (isWalkIn) {
            type = 'walk_in'
            title = '🚶 Walk-in Visitor'
            message = `${newVisitor.name} (${newVisitor.company || 'Guest'}) has walked in for ${newVisitor.host_name || 'a host'}.`
          } else {
            type = 'pre_registered'
            title = '📅 New Pre-registration'
            message = `A guest (${newVisitor.name}) has pre-registered for an appointment with ${newVisitor.host_name || 'a host'} on your floor.`
          }
        } else if (isMyFloor && payload.eventType === 'UPDATE' && newVisitor.status === 'checked_in' && newVisitor.guest_code) {
          shouldNotify = true
          type = 'arrival'
          title = '✅ Guest Checked In'
          message = `${newVisitor.name} (Code: ${newVisitor.guest_code}) has checked in.`
        }
      }

      // 3. Admin Notification (all visitors)
      if (profile.role === 'admin') {
        if (payload.eventType === 'INSERT') {
          const isWalkIn = newVisitor.status === 'checked_in' && !newVisitor.guest_code
          shouldNotify = true

          if (isWalkIn) {
            type = 'walk_in'
            title = '🚶 Walk-in Visitor'
            message = `${newVisitor.name} walked in on Floor ${newVisitor.floor_number || 'N/A'} for ${newVisitor.host_name || 'a host'}.`
          } else {
            type = 'pre_registered'
            title = '📅 New Pre-registration'
            message = `A guest (${newVisitor.name}) has pre-registered for Floor ${newVisitor.floor_number || 'N/A'} to visit ${newVisitor.host_name || 'a host'}.`
          }
        }
      }

      // 4. Security Alert (blacklisted)
      if ((profile.role === 'security' || profile.role === 'admin') && newVisitor.is_blacklisted) {
        shouldNotify = true
        type = 'security'
        title = '🚨 Security Alert'
        message = `Blacklisted individual attempting access: ${newVisitor.name}`
      }

      if (shouldNotify && title) {
        const newNotif = {
          id: Date.now(),
          type,
          title,
          message,
          time: 'Just now',
          read: false,
          guestCode: newVisitor.guest_code
        }

        setNotifications(prev => [newNotif, ...prev])

        // Play a subtle notification sound if possible
        try {
          const audio = new Audio('/notification.mp3') // Placeholder, won't play if missing but safe
          audio.play().catch(e => console.log('Audio play failed', e))
        } catch (e) { }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [profile])

  const unreadCount = notifications.filter(n => !n.read).length

  // Mark single notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleLogout = async () => {
    await signOut()
    setShowLogoutModal(false)
    navigate('/login')
  }

  const confirmLogout = () => {
    setShowLogoutModal(true)
  }

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const items = []

    // Dashboard - everyone gets a dashboard
    if (profile?.role === 'admin') {
      items.push({ name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard, feature: 'admin' })
      items.push({ name: 'User Management', path: '/user-management', icon: Users, feature: 'admin' })
    } else if (profile?.role === 'reception') {
      items.push({ name: 'Reception', path: '/reception', icon: UserCheck, feature: 'reception' })
    } else if (profile?.role === 'host') {
      items.push({ name: 'Approvals', path: '/approvals', icon: Users, feature: 'approvals' })
      items.push({ name: 'Host Analytics', path: '/host/host-analytics', icon: TrendingUp, feature: 'host-analytics' })
      items.push({ name: 'Badge Management', path: '/host/badge-management', icon: Badge, feature: 'host-badges' })
    } else if (profile?.role === 'security') {
      items.push({ name: 'Security', path: '/security', icon: Shield, feature: 'security' })
    }

    // Additional features based on permissions
    if (canAccess('reception')) {
      items.push({ name: 'Reception', path: '/reception', icon: UserCheck, feature: 'reception' })
      items.push({ name: 'Analytics', path: '/reception-analytics', icon: TrendingUp, feature: 'reception' })
    }

    if (canAccess('badges')) {
      items.push({ name: 'Badge Management', path: '/badges', icon: Badge, feature: 'badges' })
    }

    if (canAccess('approvals')) {
      items.push({ name: 'Visitor Approvals', path: '/approvals', icon: Users, feature: 'approvals' })
    }

    if (canAccess('evacuation')) {
      items.push({ name: 'Evacuation', path: '/evacuation', icon: AlertTriangle, feature: 'evacuation' })
    }

    if (canAccess('blacklist')) {
      items.push({ name: 'Blacklist', path: '/blacklist', icon: Shield, feature: 'blacklist' })
    }

    // Profile page - available to all users except admin
    if (profile?.role !== 'admin') {
      items.push({ name: 'Profile', path: '/profile', icon: User, feature: 'profile' })
    }

    // Admin-only features
    if (profile?.role === 'admin') {
      items.push({ name: 'System Settings', path: '/system-settings', icon: Settings, feature: 'admin' })
      items.push({ name: 'Audit Logs', path: '/audit-logs', icon: FileText, feature: 'admin' })
      items.push({ name: 'Reports & Analytics', path: '/reports-analytics', icon: BarChart3, feature: 'admin' })
      items.push({ name: 'Profile', path: '/profile', icon: User, feature: 'profile' })
    } else if (canAccess('settings')) {
      // Non-admin users get personal settings
      items.push({ name: 'Settings', path: '/settings', icon: Settings, feature: 'settings' })
    }

    // Remove duplicates based on path
    return items.filter((item, index, self) =>
      index === self.findIndex((t) => t.path === item.path)
    )
  }

  const navigationItems = getNavigationItems()

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <GvasLogo className="h-8 dark:text-white" />
        <div className="flex items-center gap-2">
          {/* Theme Toggle - Mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>

          {/* Notification Icon - Mobile */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 relative"
            >
              <Bell size={20} className="text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="hidden lg:block fixed left-0 top-0 h-screen bg-slate-900 border-r border-gray-800 z-40 text-white"
      >
        <div className="flex flex-col h-full">
          {/* Logo, Notification & Toggle */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 flex-1"
                >
                  <GvasLogo className="h-8 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300"
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-gray-900 font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-semibold text-white truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group
                    ${active
                      ? 'text-white font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  <Icon size={22} className={`flex-shrink-0 ${active ? 'text-blue-400' : ''}`} />
                  <AnimatePresence mode="wait">
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={confirmLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors w-full"
            >
              <LogOut size={20} className="flex-shrink-0" />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween' }}
              className="lg:hidden fixed left-0 top-0 h-screen w-[280px] bg-white z-50 shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-4 border-b border-gray-200">
                  <GvasLogo className="h-8" />
                </div>

                {/* User Profile */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.path)

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                          ${active
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Icon size={20} />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={confirmLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Notification Dropdown Modal */}
      <AnimatePresence>
        {notificationOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setNotificationOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-20 lg:top-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white rounded-t-xl">
                <div className="flex items-center gap-2">
                  <Bell size={20} />
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {notifications.map((notification) => {
                      // Determine dot color based on notification type
                      const getDotColor = () => {
                        switch (notification.type) {
                          case 'walk_in': return 'bg-orange-500'
                          case 'pre_registered': return 'bg-blue-500'
                          case 'arrival': return 'bg-green-500'
                          case 'security': return 'bg-red-500'
                          default: return !notification.read ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }
                      }

                      return (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                        >
                          <div className="flex gap-3">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getDotColor()}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={`font-medium text-sm mb-1 ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 ml-2 mt-1.5" />
                                )}
                              </div>
                              <p className={`text-sm mb-2 ${!notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                {notification.message}
                              </p>
                              {notification.guestCode && (
                                <p className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block mb-2">
                                  Code: {notification.guestCode}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 rounded-b-xl flex justify-between gap-2">
                  {unreadCount > 0 ? (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-slate-900 dark:text-white hover:underline font-medium flex-1 text-center"
                    >
                      Mark all as read
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 text-center">
                      All caught up!
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 pt-16 lg:pt-0
          ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'}
        `}
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {profile?.full_name || 'User'}</p>
          </div>
          <div className="flex items-center gap-4">

            {/* Theme Toggle - Desktop */}
            <button
              onClick={toggleTheme}
              className="w-12 h-12 rounded-full border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center transition-all group"
            >
              {theme === 'dark' ? (
                <Sun size={22} className="text-yellow-400" />
              ) : (
                <Moon size={22} className="text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white" />
              )}
            </button>

            {/* Styled Notification Icon */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="w-12 h-12 rounded-full border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center transition-all group"
              >
                <Bell size={22} className="text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-900 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
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
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <LogOut size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                    Confirm Logout
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                    Are you sure you want to log out? You will need to sign in again to access your dashboard.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DashboardLayout
