import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, 
  Plus, 
  Search, 
  Filter,
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Package,
  Users,
  Activity,
  TrendingUp,
  RefreshCw,
  Tag,
  User,
  MapPin
} from 'lucide-react'
import ApiService from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'

const BadgeManagement = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [badges, setBadges] = useState([])
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [showMarkAvailableModal, setShowMarkAvailableModal] = useState(false)
  const [showMarkLostModal, setShowMarkLostModal] = useState(false)
  const [showMarkDamagedModal, setShowMarkDamagedModal] = useState(false)
  const [showMarkMaintenanceModal, setShowMarkMaintenanceModal] = useState(false)

  useEffect(() => {
    loadData()
    // Real-time subscription to badge changes
    const subscription = ApiService.subscribeToBadges((payload) => {
      console.log('Badge updated:', payload)
      loadData()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [filter])

  const loadData = async () => {
    try {
      setLoading(true)
      const statusFilter = filter === 'all' ? null : filter
      const [badgesData, visitorsData] = await Promise.all([
        ApiService.getBadges(statusFilter),
        ApiService.getVisitors({ status: 'checked-in' })
      ])
      setBadges(badgesData)
      setVisitors(visitorsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReleaseBadge = async () => {
    if (!selectedBadge) return

    try {
      // Release badge by setting status to available and clearing visitor info
      const { error } = await ApiService.supabase
        .from('badges')
        .update({
          status: 'available',
          current_visitor_id: null
        })
        .eq('id', selectedBadge.id)

      if (error) throw error

      // Also clear badge from visitor record if exists
      if (selectedBadge.current_visitor_id) {
        await ApiService.supabase
          .from('visitors')
          .update({
            badge_id: null,
            badge_number: null
          })
          .eq('id', selectedBadge.current_visitor_id)
      }

      setShowReleaseModal(false)
      setSelectedBadge(null)
      loadData()
    } catch (error) {
      console.error('Failed to release badge:', error)
      alert('Failed to release badge. Please try again.')
    }
  }

  const handleMarkLost = async (badgeId) => {
    const badge = badges.find(b => b.id === badgeId)
    setSelectedBadge(badge)
    setShowMarkLostModal(true)
  }

  const confirmMarkLost = async () => {
    if (!selectedBadge) return

    try {
      const { error } = await ApiService.supabase
        .from('badges')
        .update({ status: 'lost' })
        .eq('id', selectedBadge.id)

      if (error) throw error
      setShowMarkLostModal(false)
      setSelectedBadge(null)
      loadData()
    } catch (error) {
      console.error('Failed to mark badge as lost:', error)
      alert('Failed to update badge status.')
    }
  }

  const handleMarkDamaged = async (badgeId) => {
    const badge = badges.find(b => b.id === badgeId)
    setSelectedBadge(badge)
    setShowMarkDamagedModal(true)
  }

  const confirmMarkDamaged = async () => {
    if (!selectedBadge) return

    try {
      const { error } = await ApiService.supabase
        .from('badges')
        .update({ status: 'damaged' })
        .eq('id', selectedBadge.id)

      if (error) throw error
      setShowMarkDamagedModal(false)
      setSelectedBadge(null)
      loadData()
    } catch (error) {
      console.error('Failed to mark badge as damaged:', error)
      alert('Failed to update badge status.')
    }
  }

  const handleMarkAvailable = async (badgeId) => {
    const badge = badges.find(b => b.id === badgeId)
    setSelectedBadge(badge)
    setShowMarkAvailableModal(true)
  }

  const confirmMarkAvailable = async () => {
    if (!selectedBadge) return

    try {
      const { error } = await ApiService.supabase
        .from('badges')
        .update({ status: 'available', current_visitor_id: null })
        .eq('id', selectedBadge.id)

      if (error) throw error
      setShowMarkAvailableModal(false)
      setSelectedBadge(null)
      loadData()
    } catch (error) {
      console.error('Failed to update badge:', error)
      alert('Failed to update badge status.')
    }
  }

  const handleMarkMaintenance = async (badgeId) => {
    const badge = badges.find(b => b.id === badgeId)
    setSelectedBadge(badge)
    setShowMarkMaintenanceModal(true)
  }

  const confirmMarkMaintenance = async () => {
    if (!selectedBadge) return

    try {
      const { error } = await ApiService.supabase
        .from('badges')
        .update({ status: 'maintenance', current_visitor_id: null })
        .eq('id', selectedBadge.id)

      if (error) throw error
      setShowMarkMaintenanceModal(false)
      setSelectedBadge(null)
      loadData()
    } catch (error) {
      console.error('Failed to update badge:', error)
      alert('Failed to update badge status.')
    }
  }

  const getBadgeTypeColor = (type) => {
    switch (type) {
      case 'visitor':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contractor':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivery':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getBadgeStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'in-use':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'lost':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getBadgeStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />
      case 'in-use':
        return <User className="w-4 h-4" />
      case 'maintenance':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredBadges = badges.filter(badge =>
    badge.badge_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: badges.length,
    available: badges.filter(b => b.status === 'available').length,
    inUse: badges.filter(b => b.status === 'in-use').length,
    maintenance: badges.filter(b => b.status === 'maintenance').length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Badge Management</h1>
            <p className="text-gray-500">
              Track and manage physical badge inventory
              {profile?.assigned_floors && profile.assigned_floors.length > 0 && (
                <span className="ml-2">
                  • <span className="font-semibold text-slate-900">Your Floors:</span>{' '}
                  {profile.assigned_floors.map((floor, idx) => {
                    const floorName = typeof floor === 'number' 
                      ? (floor === 0 ? 'Ground Floor' : `${floor === 1 ? '1st' : floor === 2 ? '2nd' : floor === 3 ? '3rd' : `${floor}th`} Floor`)
                      : floor
                    return (
                      <span key={idx}>
                        {idx > 0 && ', '}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-white">
                          {floorName}
                        </span>
                      </span>
                    )
                  })}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadData}
              className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-gray-200 shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </motion.button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-none ring-1 ring-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Badges</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-none ring-1 ring-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Available</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.available}</p>
                <p className="text-blue-600 text-xs mt-1 font-medium">Ready to assign</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-none ring-1 ring-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">In Use</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inUse}</p>
                <p className="text-indigo-600 text-xs mt-1 font-medium">Currently assigned</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-none ring-1 ring-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Maintenance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.maintenance}</p>
                <p className="text-amber-600 text-xs mt-1 font-medium">Under repair</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border-none ring-1 ring-gray-100 p-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by badge number or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === 'available'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setFilter('in-use')}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === 'in-use'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                In Use
              </button>
              <button
                onClick={() => setFilter('maintenance')}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === 'maintenance'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Maintenance
              </button>
            </div>
          </div>
        </motion.div>

        {/* Badge Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border-none ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className={`p-6 ${getBadgeStatusColor(badge.status)} bg-opacity-10`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm">
                        <Shield className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{badge.badge_number}</h3>
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${getBadgeTypeColor(badge.type)} mt-1`}>
                          {badge.type ? badge.type.toUpperCase() : 'STANDARD'}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getBadgeStatusColor(badge.status)} bg-white`}>
                      {getBadgeStatusIcon(badge.status)}
                      <span className="capitalize">{badge.status.replace('-', ' ')}</span>
                    </span>
                  </div>

                  {badge.status === 'in-use' && badge.current_visitor && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                      <p className="text-xs text-gray-500 mb-1">Assigned to:</p>
                      <p className="font-semibold text-gray-900 text-sm">{badge.current_visitor.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Since: {new Date(badge.assigned_at).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {badge.notes && (
                    <div className="mt-3 text-sm text-gray-600 bg-white/50 p-2 rounded-lg">
                      <p className="font-medium text-xs text-gray-500">Notes:</p>
                      <p className="mt-1 text-xs">{badge.notes}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    {badge.status === 'issued' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedBadge(badge)
                          setShowReleaseModal(true)
                        }}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm shadow-sm"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Release Badge</span>
                      </motion.button>
                    )}

                    {badge.status === 'available' && (
                      <div className="flex-1 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-medium text-sm text-center">
                        ✓ Ready to Assign
                      </div>
                    )}

                    {(badge.status === 'lost' || badge.status === 'damaged') && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMarkAvailable(badge.id)}
                        className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200 text-sm shadow-sm"
                      >
                        Mark Available
                      </motion.button>
                    )}

                    {badge.status === 'available' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMarkLost(badge.id)}
                          className="px-3 py-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 text-gray-700 hover:text-red-700 rounded-lg transition-all duration-200 text-sm"
                          title="Mark as Lost"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMarkDamaged(badge.id)}
                          className="px-3 py-2 bg-white border border-gray-200 hover:bg-amber-50 hover:border-amber-300 text-gray-700 hover:text-amber-700 rounded-lg transition-all duration-200 text-sm"
                          title="Mark as Damaged"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </>
                    )}

                    {badge.status === 'available' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMarkMaintenance(badge.id)}
                        className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                      >
                        Maintenance
                      </motion.button>
                    )}

                    {badge.status === 'maintenance' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMarkAvailable(badge.id)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm"
                      >
                        Mark Available
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredBadges.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border-none ring-1 ring-gray-100 p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No badges found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      {/* Release Badge Modal */}
      {showReleaseModal && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-amber-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Release Badge {selectedBadge.badge_number}
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              This will release the badge back to available inventory. The visitor's badge assignment will be cleared.
            </p>

            {selectedBadge.current_visitor_id && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This badge is currently assigned to a visitor. Make sure they have returned the physical badge before releasing it in the system.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowReleaseModal(false)
                  setSelectedBadge(null)
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReleaseBadge}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-amber-600/20"
              >
                Release Badge
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mark Available Modal */}
      {showMarkAvailableModal && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Mark Badge Available
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to mark badge <strong>{selectedBadge.badge_number}</strong> as available? This will return it to the active inventory.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowMarkAvailableModal(false)
                  setSelectedBadge(null)
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmMarkAvailable}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-600/20"
              >
                Mark Available
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mark Lost Modal */}
      {showMarkLostModal && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Mark Badge as Lost
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to mark badge <strong>{selectedBadge.badge_number}</strong> as lost? This will remove it from available inventory.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Lost badges should be reported and may need replacement.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowMarkLostModal(false)
                  setSelectedBadge(null)
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmMarkLost}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-600/20"
              >
                Mark as Lost
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mark Damaged Modal */}
      {showMarkDamagedModal && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Mark Badge as Damaged
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to mark badge <strong>{selectedBadge.badge_number}</strong> as damaged? This will remove it from available inventory.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Damaged badges should be set aside for repair or replacement.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowMarkDamagedModal(false)
                  setSelectedBadge(null)
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmMarkDamaged}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-amber-600/20"
              >
                Mark as Damaged
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mark Maintenance Modal */}
      {showMarkMaintenanceModal && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Send Badge to Maintenance
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to send badge <strong>{selectedBadge.badge_number}</strong> to maintenance? This will temporarily remove it from circulation.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Badge will be unavailable until marked as available again.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowMarkMaintenanceModal(false)
                  setSelectedBadge(null)
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmMarkMaintenance}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-600/20"
              >
                Send to Maintenance
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default BadgeManagement
