import { useState, useEffect } from 'react'
import { Card, Title, Text, Badge as TremorBadge, Metric, Flex, Grid } from '@tremor/react'
import {
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building,
  Calendar,
  Filter
} from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import ApiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import GuestInviteModal from '../components/GuestInviteModal'

const ApprovalsDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    todayVisits: 0,
    activeVisitors: 0
  })
  const [visitors, setVisitors] = useState([])
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // pending, approved, all

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '',
    expected_duration: '60'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // For hosts, only show their own visitors - admins see all visitors
      let visitorsData
      if (profile?.role === 'host') {
        console.log('🔍 Loading approvals for host:', profile?.id)
        visitorsData = await ApiService.getVisitors({ host_id: profile?.id })
      } else {
        console.log('🔍 Loading approvals for all visitors (admin)')
        visitorsData = await ApiService.getVisitors()
      }

      setVisitors(visitorsData || [])

      // Calculate stats from all data
      const pending = visitorsData.filter(v => v.status === 'pre_registered' || v.status === 'pending_approval' || v.status === 'pending').length
      const approved = visitorsData.filter(v => v.status === 'approved' || v.status === 'checked_in').length
      const today = new Date().toISOString().split('T')[0]
      const todayVisits = visitorsData.filter(v => v.visit_date?.startsWith(today)).length
      const active = visitorsData.filter(v => v.status === 'checked_in').length

      setStats({ pending, approved, todayVisits, activeVisitors: active })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (visitorId) => {
    try {
      await ApiService.updateVisitor(visitorId, { status: 'approved' })
      await loadData()
    } catch (error) {
      console.error('Failed to approve:', error)
    }
  }

  const handleReject = async (visitorId) => {
    try {
      await ApiService.updateVisitor(visitorId, { status: 'rejected' })
      await loadData()
    } catch (error) {
      console.error('Failed to reject:', error)
    }
  }

  const handlePreRegister = async (e) => {
    e.preventDefault()
    try {
      await ApiService.preRegisterVisitor({
        ...formData,
        host_id: profile?.id,
        tenant_id: profile?.tenant_id,
        status: 'pre_registered'
      })
      setShowPreRegisterModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        purpose: '',
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: '',
        expected_duration: '60'
      })
      await loadData()
    } catch (error) {
      console.error('Failed to pre-register:', error)
    }
  }

  // Filter visitors based on selected tab
  const filteredVisitors = visitors.filter(visitor => {
    if (filter === 'all') return true
    if (filter === 'pending') {
      return visitor.status === 'pre_registered' || visitor.status === 'pending_approval' || visitor.status === 'pending'
    }
    if (filter === 'approved') {
      return visitor.status === 'approved' || visitor.status === 'checked_in'
    }
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visitor Approvals</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your visitor pre-registrations and approvals</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Mail size={18} />
              Invite Guest
            </button>
            <button
              onClick={() => setShowPreRegisterModal(true)}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2"
            >
              <UserPlus size={18} />
              Pre-register Visitor
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 dark:text-gray-400 font-medium">Pending</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</Metric>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl">
                <Clock className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
            </Flex>
          </Card>

          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 dark:text-gray-400 font-medium">Approved</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.approved}</Metric>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                <CheckCircle className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </Flex>
          </Card>

          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 dark:text-gray-400 font-medium">Today's Visits</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.todayVisits}</Metric>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl">
                <Calendar className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
            </Flex>
          </Card>

          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 dark:text-gray-400 font-medium">Active Visitors</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.activeVisitors}</Metric>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </Flex>
          </Card>
        </div>

        {/* Filter Tabs & Content */}
        <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'pending'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'approved'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
              >
                All Visitors
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2 text-gray-400 dark:text-gray-500">
              <Filter size={16} />
              <span className="text-sm">Filter list</span>
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading visitors...</p>
              </div>
            ) : filteredVisitors.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                <Users size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium">No visitors found</p>
                <p className="text-sm mt-1">Try adjusting your filters or add a new visitor</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVisitors.map((visitor, index) => (
                  <motion.div
                    key={visitor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white dark:bg-slate-800 p-5 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                          {visitor.name?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{visitor.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{visitor.company || 'No Company'}</p>
                        </div>
                      </div>
                      {visitor.status === 'pending_approval' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                          Pending
                        </span>
                      )}
                      {visitor.status === 'approved' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          Approved
                        </span>
                      )}
                      {visitor.status === 'checked_in' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/10 dark:bg-blue-400/20 text-blue-900 dark:text-blue-300">
                          Checked In
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400 mb-5">
                      <div className="flex items-center gap-2.5">
                        <Mail size={14} className="text-gray-400 dark:text-gray-500" />
                        <span className="truncate">{visitor.email}</span>
                      </div>
                      {visitor.phone && (
                        <div className="flex items-center gap-2.5">
                          <Phone size={14} className="text-gray-400 dark:text-gray-500" />
                          <span>{visitor.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5">
                        <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                        <span>{new Date(visitor.visit_date || visitor.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Building size={14} className="text-gray-400 dark:text-gray-500" />
                        <span className="truncate">{visitor.purpose || 'General visit'}</span>
                      </div>
                    </div>

                    {visitor.status === 'pending_approval' && (
                      <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-slate-700">
                        <button
                          onClick={() => handleApprove(visitor.id)}
                          className="flex-1 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-gray-100 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(visitor.id)}
                          className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Pre-register Modal */}
      {showPreRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pre-register Visitor</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Fill in the details to schedule a visit</p>
                </div>
                <button
                  onClick={() => setShowPreRegisterModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handlePreRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Visitor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent transition-all outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent transition-all outline-none"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent transition-all outline-none"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent transition-all outline-none"
                      placeholder="Company Name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Visit Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.visit_date}
                      onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Expected Time
                    </label>
                    <input
                      type="time"
                      value={formData.visit_time}
                      onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Purpose of Visit <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="e.g., Business meeting, Job interview, etc."
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPreRegisterModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-gray-100 font-medium shadow-lg shadow-slate-900/20 dark:shadow-none transition-all transform active:scale-[0.98]"
                  >
                    Pre-register Visitor
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Guest Invite Modal */}
      <GuestInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        hostName={profile?.full_name}
        hostId={profile?.id}
      />
    </DashboardLayout>
  )
}

export default ApprovalsDashboard
