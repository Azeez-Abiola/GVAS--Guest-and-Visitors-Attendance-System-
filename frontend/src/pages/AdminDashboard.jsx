import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Download, 
  Eye, 
  UserCheck, 
  UserX, 
  Clock,
  ArrowLeft,
  QrCode,
  Bell,
  Settings,
  Calendar,
  Activity,
  TrendingUp,
  Shield,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  ChevronDown,
  Hash
} from 'lucide-react'
import ApiService from '../services/api'
import GvasLogo from '../components/GvasLogo'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [visitors, setVisitors] = useState([])
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState(null)

  const [preRegisterData, setPreRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    host: '',
    purpose: ''
  })
  const [showGuestCode, setShowGuestCode] = useState(null)
  const [generatedVisitorId, setGeneratedVisitorId] = useState(null)

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [visitorsData, hostsData] = await Promise.all([
        ApiService.getVisitors({ status: filter }),
        ApiService.getHosts()
      ])
      setVisitors(visitorsData)
      setHosts(hostsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreRegister = async () => {
    try {
      // Generate visitor ID for pre-registered guest
      const visitorId = `V${String(Math.floor(Math.random() * 9000) + 1000)}`
      setGeneratedVisitorId(visitorId)
      
      const response = await ApiService.preRegisterVisitor({
        ...preRegisterData,
        visitor_id: visitorId
      })
      setShowGuestCode(response.guestCode)
      setPreRegisterData({
        name: '',
        email: '',
        phone: '',
        company: '',
        host: '',
        purpose: ''
      })
      loadData()
    } catch (error) {
      console.error('Pre-registration failed:', error)
      alert('Pre-registration failed. Please try again.')
    }
  }

  const handleCheckOut = async (visitorId) => {
    try {
      await ApiService.checkOutVisitor(visitorId)
      loadData()
    } catch (error) {
      console.error('Check-out failed:', error)
      alert('Check-out failed. Please try again.')
    }
  }

  // Helper function to calculate visit duration
  const getVisitDuration = (visitor) => {
    if (!visitor.check_in_time) return 'N/A'
    
    const checkinTime = new Date(visitor.check_in_time)
    const endTime = visitor.check_out_time ? new Date(visitor.check_out_time) : new Date()
    const duration = endTime - checkinTime
    
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  // Helper function to get or generate visitor ID
  const getVisitorId = (visitor) => {
    // If visitor already has an ID in the format V1234, return it
    if (visitor.visitor_id && visitor.visitor_id.match(/^V\d{4}$/)) {
      return visitor.visitor_id
    }
    
    // If pre-registered visitor has a guest code, format it as visitor ID
    if (visitor.id && visitor.status === 'pre-registered') {
      const codeId = visitor.id.substring(0, 8).toUpperCase()
      // Convert to V1234 format if possible, otherwise use the existing code
      if (codeId.match(/^\w{4,8}$/)) {
        const numericPart = codeId.replace(/\D/g, '').padStart(4, '0').substring(0, 4)
        return `V${numericPart}`
      }
    }
    
    // Generate a visitor ID based on visitor data (in real app, this would come from backend)
    const hash = visitor.name?.charCodeAt(0) || 1
    const randomNum = (hash * 37 + (visitor.email?.length || 5)) % 9000 + 1000
    return `V${randomNum}`
  }

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (visitor.company && visitor.company.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked-in': return 'text-emerald-700 bg-gradient-to-r from-emerald-100 to-emerald-200 border border-emerald-300'
      case 'checked-out': return 'text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300'
      case 'pre-registered': return 'text-purple-700 bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-300'
      default: return 'text-amber-700 bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checked-in': return <UserCheck className="h-4 w-4" />
      case 'checked-out': return <UserX className="h-4 w-4" />
      case 'pre-registered': return <Clock className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        {/* Navigation Bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/desk')}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Desk</span>
          </motion.button>
        </div>
        
        {/* Header Content */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <GvasLogo variant="white" className="scale-110" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Guest & Visitor Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreRegisterModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Pre-Register Guest</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
              >
                <Download className="h-5 w-5" />
                <span>Export</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -mr-10 -mt-10 opacity-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-medium">Today's Visitors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{visitors.length}</p>
              <p className="text-emerald-600 text-sm font-medium mt-1 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                +12% from yesterday
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-200">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full -mr-10 -mt-10 opacity-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-medium">Checked In</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {visitors.filter(v => v.status === 'checked-in').length}
              </p>
              <p className="text-emerald-600 text-sm font-medium mt-1 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Active visitors
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-200">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full -mr-10 -mt-10 opacity-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pre-Registered</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {visitors.filter(v => v.status === 'pre-registered').length}
              </p>
              <p className="text-purple-600 text-sm font-medium mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-2" />
                Awaiting arrival
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-200">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full -mr-10 -mt-10 opacity-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-medium">Checked Out</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {visitors.filter(v => v.status === 'checked-out').length}
              </p>
              <p className="text-red-600 text-sm font-medium mt-1 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Completed visits
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-200">
              <UserX className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full -mr-10 -mt-10 opacity-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Visit Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">2.5h</p>
              <p className="text-orange-600 text-sm font-medium mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-2" />
                Duration tracking
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-200">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            
            <div className="relative">
              <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-10 w-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
              >
                <option value="all">All Visitors</option>
                <option value="checked-in">Checked In</option>
                <option value="pre-registered">Pre-Registered</option>
                <option value="checked-out">Checked Out</option>
              </select>
              <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Visitors</h2>
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredVisitors.length} total
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Visitor</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Host</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Purpose</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Status</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Check-in/out Time</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Duration</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVisitors.map((visitor, index) => (
                  <motion.tr
                    key={visitor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedVisitor(visitor)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {visitor.photo ? (
                          <img
                            src={visitor.photo}
                            alt={visitor.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="text-gray-900 font-semibold">{visitor.name}</p>
                          <p className="text-gray-600 text-sm">{visitor.company || 'No company'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{visitor.host}</td>
                    <td className="py-4 px-6 text-gray-700">{visitor.purpose}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
                        {getStatusIcon(visitor.status)}
                        <span className="capitalize">{visitor.status.replace('-', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 text-xs">In:</span>
                          <span className="font-medium">
                            {visitor.check_in_time ? 
                              new Date(visitor.check_in_time).toLocaleTimeString() : 
                              new Date(visitor.created_at).toLocaleTimeString()
                            }
                          </span>
                        </div>
                        {visitor.check_out_time && (
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 text-xs">Out:</span>
                            <span className="font-medium">
                              {new Date(visitor.check_out_time).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{getVisitDuration(visitor)}</span>
                        {visitor.status === 'checked-in' && (
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        {visitor.status === 'checked-in' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/checkout?from=admin')}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Check Out"
                          >
                            <UserX className="h-4 w-4" />
                          </motion.button>
                        )}
                        
                        {visitor.status === 'pre-registered' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                            title="Notify Host"
                          >
                            <Bell className="h-4 w-4" />
                          </motion.button>
                        )}
                        
                        {!visitor.status || visitor.status === 'checked-out' ? (
                          <span className="text-gray-400 text-xs">No actions</span>
                        ) : null}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && filteredVisitors.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No visitors found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Pre-Register Modal */}
      {showPreRegisterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            {!showGuestCode ? (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Pre-Register Guest</h2>
                  <button
                    onClick={() => setShowPreRegisterModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={preRegisterData.name}
                    onChange={(e) => setPreRegisterData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                  
                  <input
                    type="email"
                    placeholder="Email"
                    value={preRegisterData.email}
                    onChange={(e) => setPreRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                  
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={preRegisterData.phone}
                    onChange={(e) => setPreRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                  
                  <input
                    type="text"
                    placeholder="Company"
                    value={preRegisterData.company}
                    onChange={(e) => setPreRegisterData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                  
                  <select
                    value={preRegisterData.host}
                    onChange={(e) => setPreRegisterData(prev => ({ ...prev, host: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                  >
                    <option value="">Select Host *</option>
                    {hosts.map(host => (
                      <option key={host.id} value={host.name}>
                        {host.name} - {host.company}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={preRegisterData.purpose}
                    onChange={(e) => setPreRegisterData(prev => ({ ...prev, purpose: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                  >
                    <option value="">Purpose *</option>
                    <option value="Business Meeting">Business Meeting</option>
                    <option value="Interview">Interview</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Other">Other</option>
                  </select>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowPreRegisterModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePreRegister}
                      className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors ${!preRegisterData.name || !preRegisterData.host || !preRegisterData.purpose ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!preRegisterData.name || !preRegisterData.host || !preRegisterData.purpose}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Guest Registered Successfully!</h2>
                  <button
                    onClick={() => {
                      setShowGuestCode(null)
                      setShowPreRegisterModal(false)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="p-6 text-center">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200 rounded-2xl p-8 mb-6">
                    <div className="text-emerald-600 mb-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-800 mb-2">Guest Successfully Registered!</h3>
                    <p className="text-emerald-700 text-sm">Share this code with your guest for express check-in</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Guest Entry Code */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-blue-200 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                      <div className="relative z-10">
                        <p className="text-sm text-blue-600 font-medium mb-2">GUEST ENTRY CODE</p>
                        <div className="text-3xl font-bold text-blue-700 mb-2 tracking-wider font-mono bg-white px-4 py-2 rounded-lg shadow-sm border">
                          {showGuestCode}
                        </div>
                        <p className="text-xs text-blue-600">Guest should enter this code at the desk</p>
                      </div>
                    </div>

                    {/* Visitor ID */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-3 border-green-200 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                      <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-2">
                          <Hash className="h-4 w-4 text-green-600" />
                          <p className="text-sm text-green-600 font-medium">VISITOR ID</p>
                        </div>
                        <div className="text-2xl font-bold text-green-700 mb-2 tracking-wider font-mono bg-white px-4 py-2 rounded-lg shadow-sm border">
                          {generatedVisitorId || 'V0000'}
                        </div>
                        <p className="text-xs text-green-600">Needed for checkout when leaving</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const fullInfo = `Guest Entry Code: ${showGuestCode}\nVisitor ID: ${generatedVisitorId}\n\nUse the Entry Code to check in at the desk.\nUse the Visitor ID to check out when leaving.`
                        navigator.clipboard.writeText(fullInfo)
                        alert('Guest information copied to clipboard!')
                      }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Copy className="w-5 h-5" />
                      <span>Copy All Information</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowGuestCode(null)
                        setGeneratedVisitorId(null)
                        setShowPreRegisterModal(false)
                      }}
                      className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-medium transition-all duration-200"
                    >
                      Done
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Visitor Details</h2>
                  <p className="text-gray-600">Complete visitor information and activity</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Photo and Basic Info */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  {selectedVisitor.photo ? (
                    <img
                      src={selectedVisitor.photo}
                      alt={selectedVisitor.name}
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
                      <Users className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedVisitor.name}</h3>
                    <p className="text-gray-600">{selectedVisitor.company || 'No company specified'}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedVisitor.status)}`}>
                      {getStatusIcon(selectedVisitor.status)}
                      <span className="capitalize">{selectedVisitor.status.replace('-', ' ')}</span>
                    </span>
                    
                    {/* Visitor ID Display - For All Visitors */}
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-300 px-4 py-2 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700 font-medium">Visitor ID:</span>
                        <span className="text-lg font-bold text-blue-800 font-mono tracking-wider">
                          {getVisitorId(selectedVisitor)}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getVisitorId(selectedVisitor))
                            alert('Visitor ID copied to clipboard!')
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded"
                          title="Copy visitor ID"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Legacy Guest Code for Pre-registered (if different from visitor ID) */}
                    {selectedVisitor.status === 'pre-registered' && selectedVisitor.id && 
                     selectedVisitor.id.substring(0, 8).toUpperCase() !== getVisitorId(selectedVisitor) && (
                      <div className="bg-gradient-to-r from-purple-100 to-purple-200 border-2 border-purple-300 px-4 py-2 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <QrCode className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-purple-700 font-medium">Guest Code:</span>
                          <span className="text-lg font-bold text-purple-800 font-mono tracking-wider">
                            {selectedVisitor.id.substring(0, 8).toUpperCase()}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedVisitor.id.substring(0, 8).toUpperCase())
                              alert('Guest code copied to clipboard!')
                            }}
                            className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded"
                            title="Copy guest code"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="block text-gray-600 text-sm font-medium mb-1">Email Address</label>
                    <p className="text-gray-900 font-semibold">{selectedVisitor.email || 'Not provided'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="block text-gray-600 text-sm font-medium mb-1">Phone Number</label>
                    <p className="text-gray-900 font-semibold">{selectedVisitor.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              {/* Visit Information */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="bg-green-500 p-2 rounded-lg mr-3">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Visit Information
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="block text-gray-600 text-sm font-medium mb-1">Host</label>
                    <p className="text-gray-900 font-semibold">{selectedVisitor.host}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="block text-gray-600 text-sm font-medium mb-1">Purpose of Visit</label>
                    <p className="text-gray-900 font-semibold">{selectedVisitor.purpose}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="block text-gray-600 text-sm font-medium mb-1">Check-in Time</label>
                    <p className="text-gray-900 font-semibold">
                      {selectedVisitor.check_in_time ? 
                        new Date(selectedVisitor.check_in_time).toLocaleString() : 
                        'Not checked in yet'
                      }
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="block text-gray-600 text-sm font-medium mb-1">Registration Time</label>
                    <p className="text-gray-900 font-semibold">
                      {new Date(selectedVisitor.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Digital Signature */}
              {selectedVisitor.signature && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="bg-amber-500 p-2 rounded-lg mr-3">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    Digital Signature
                  </h4>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <img
                      src={selectedVisitor.signature}
                      alt="Digital Signature"
                      className="border-2 border-gray-300 rounded-lg bg-white p-2 w-full max-w-md mx-auto"
                    />
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {/* Debug: Show current status */}
                <div className="text-sm text-gray-500 self-center mr-4">
                  Status: {selectedVisitor.status || 'undefined'}
                </div>
                
                {selectedVisitor.status === 'checked-in' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedVisitor(null)
                      navigate('/checkout?from=admin')
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <UserX className="h-5 w-5" />
                    <span>Check Out Visitor</span>
                  </motion.button>
                )}

                {/* Temporary: Show checkout button for all statuses for testing */}
                {selectedVisitor.status !== 'checked-in' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      console.log('Test checkout button clicked for status:', selectedVisitor.status)
                      setSelectedVisitor(null)
                      navigate('/checkout?from=admin')
                    }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <UserX className="h-5 w-5" />
                    <span>Test Checkout ({selectedVisitor.status})</span>
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedVisitor(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </div>
  )
}

export default AdminDashboard