import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  AlertTriangle, 
  Users, 
  Download, 
  Printer,
  ArrowLeft,
  MapPin,
  Clock,
  RefreshCw,
  Building,
  User,
  Phone,
  Mail,
  CheckCircle,
  Search,
  CheckCheck,
  XCircle
} from 'lucide-react'
import ApiService from '../services/api'
import DashboardLayout from '../components/DashboardLayout'

const EvacuationDashboard = () => {
  const navigate = useNavigate()
  const [checkedInVisitors, setCheckedInVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupByFloor, setGroupByFloor] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [evacuatedVisitors, setEvacuatedVisitors] = useState(new Set())
  const [drillMode, setDrillMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
    
    // Auto-refresh disabled per user request
    // const interval = setInterval(() => {
    //   loadData()
    // }, 10000)

    // Real-time subscription disabled
    // const subscription = ApiService.subscribeToVisitors((payload) => {
    //   console.log('Visitor updated:', payload)
    //   loadData()
    // })

    // return () => {
    //   clearInterval(interval)
    //   subscription?.unsubscribe()
    // }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getCheckedInVisitors()
      setCheckedInVisitors(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load evacuation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const csv = [
      ['Name', 'Visitor ID', 'Company', 'Floor', 'Host', 'Badge Number', 'Check-in Time', 'Phone', 'Email', 'Evacuated'],
      ...checkedInVisitors.map(v => [
        v.name,
        v.visitor_id,
        v.company || 'N/A',
        v.floor_number || 'N/A',
        v.host_name || 'N/A',
        v.badge_number || 'Not assigned',
        new Date(v.check_in_time).toLocaleString(),
        v.phone || 'N/A',
        v.email || 'N/A',
        evacuatedVisitors.has(v.id) ? 'YES' : 'NO'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evacuation-list-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const toggleEvacuated = (visitorId) => {
    setEvacuatedVisitors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(visitorId)) {
        newSet.delete(visitorId)
      } else {
        newSet.add(visitorId)
      }
      return newSet
    })
  }

  const markAllEvacuated = () => {
    const allIds = new Set(checkedInVisitors.map(v => v.id))
    setEvacuatedVisitors(allIds)
  }

  const clearEvacuated = () => {
    setEvacuatedVisitors(new Set())
  }

  // Group visitors by floor
  const visitorsByFloor = checkedInVisitors
    .filter(visitor =>
      visitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.visitor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .reduce((acc, visitor) => {
      const floor = visitor.floor_number || 'Unknown'
      if (!acc[floor]) {
        acc[floor] = []
      }
      acc[floor].push(visitor)
      return acc
    }, {})

  const floors = Object.keys(visitorsByFloor).sort((a, b) => {
    if (a === 'Unknown') return 1
    if (b === 'Unknown') return -1
    return parseInt(a) - parseInt(b)
  })

  const filteredVisitors = checkedInVisitors.filter(visitor =>
    visitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.visitor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const evacuatedCount = evacuatedVisitors.size
  const notEvacuatedCount = checkedInVisitors.length - evacuatedCount

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 print:p-4">
        {/* Emergency Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900 rounded-2xl shadow-lg p-6 mb-6 border border-slate-800 print:border-2 print:bg-white print:text-black"
        >
          <div className="flex items-center justify-between mb-6 print:mb-2">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-xl shadow-sm print:border print:border-red-600 backdrop-blur-sm">
                <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white print:text-red-600">
                  EMERGENCY EVACUATION LIST
                </h1>
                <p className="text-slate-400 mt-1 print:text-gray-600">Real-time building occupancy - UAC House</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 print:hidden">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadData}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm border border-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrint}
                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:bg-gray-50"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm border border-slate-800"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </motion.button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 print:gap-2">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 print:border print:border-gray-200 print:bg-white">
              <p className="text-slate-400 text-sm font-medium print:text-gray-500">Total Checked-In</p>
              <p className="text-3xl font-bold text-white mt-1 print:text-black">{checkedInVisitors.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 print:border print:border-gray-200 print:bg-white">
              <p className="text-slate-400 text-sm font-medium print:text-gray-500">Evacuated</p>
              <p className="text-3xl font-bold text-green-400 mt-1 print:text-green-600">{evacuatedCount}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 print:border print:border-gray-200 print:bg-white">
              <p className="text-slate-400 text-sm font-medium print:text-gray-500">Not Evacuated</p>
              <p className="text-3xl font-bold text-red-400 mt-1 print:text-red-600">{notEvacuatedCount}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 print:border print:border-gray-200 print:bg-white">
              <p className="text-slate-400 text-sm font-medium print:text-gray-500">Last Updated</p>
              <p className="text-xl font-bold text-white mt-2 print:text-black">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 print:hidden">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search visitors by name, ID, or company..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={markAllEvacuated}
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <CheckCheck size={18} />
              Mark All Evacuated
            </button>
            <button
              onClick={clearEvacuated}
              className="px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <XCircle size={18} />
              Clear All
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex items-center space-x-2 print:hidden bg-white p-1 rounded-xl border border-gray-200 w-fit shadow-sm">
          <button
            onClick={() => setGroupByFloor(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
              groupByFloor
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Group by Floor
          </button>
          <button
            onClick={() => setGroupByFloor(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
              !groupByFloor
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Visitors
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
          </div>
        )}

        {!loading && checkedInVisitors.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border-none ring-1 ring-gray-100 p-12 text-center">
            <CheckCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Building is Clear</h3>
            <p className="text-gray-500">No visitors currently checked in</p>
          </div>
        )}

        {/* Grouped by Floor View */}
        {!loading && groupByFloor && checkedInVisitors.length > 0 && (
          <div className="space-y-6">
            {floors.map(floor => (
              <motion.div
                key={floor}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border-none ring-1 ring-gray-100 overflow-hidden"
              >
                <div className="bg-gray-50 p-4 flex items-center justify-between border-b border-gray-100 print:bg-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Building className="h-5 w-5 text-gray-700" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Floor {floor} - {visitorsByFloor[floor][0]?.tenant_name || 'Unknown Tenant'}
                    </h2>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-200">
                    {visitorsByFloor[floor].length} {visitorsByFloor[floor].length === 1 ? 'Person' : 'People'}
                  </span>
                </div>

                <div className="p-6 print:p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visitorsByFloor[floor].map((visitor, index) => {
                      const isEvacuated = evacuatedVisitors.has(visitor.id)
                      return (
                        <div
                          key={visitor.id}
                          className={`rounded-xl p-4 border-2 transition-all print:break-inside-avoid ${
                            isEvacuated 
                              ? 'bg-green-50 border-green-300' 
                              : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <button
                                onClick={() => toggleEvacuated(visitor.id)}
                                className={`p-2 rounded-lg transition-colors print:hidden ${
                                  isEvacuated ? 'bg-green-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                              >
                                {isEvacuated ? <CheckCircle className="h-5 w-5" /> : <User className="h-5 w-5" />}
                              </button>
                              <div className="print:ml-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-gray-900 text-lg">{visitor.name}</h3>
                                  {isEvacuated && (
                                    <span className="bg-green-600 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                                      ✓ SAFE
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{visitor.company || 'No company'}</p>
                              </div>
                            </div>
                            {visitor.badge_number && (
                              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md text-xs font-bold border border-indigo-100">
                                Badge: {visitor.badge_number}
                              </span>
                            )}
                          </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 flex items-center text-xs mb-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              Visitor ID
                            </p>
                            <p className="font-medium text-gray-900">{visitor.visitor_id}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center text-xs mb-1">
                              <Clock className="h-3 w-3 mr-1" />
                              Check-in
                            </p>
                            <p className="font-medium text-gray-900">
                              {new Date(visitor.check_in_time).toLocaleTimeString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center text-xs mb-1">
                              <User className="h-3 w-3 mr-1" />
                              Host
                            </p>
                            <p className="font-medium text-gray-900">{visitor.host_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center text-xs mb-1">
                              <Phone className="h-3 w-3 mr-1" />
                              Contact
                            </p>
                            <p className="font-medium text-gray-900">{visitor.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* All Visitors View */}
        {!loading && !groupByFloor && checkedInVisitors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border-none ring-1 ring-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredVisitors.map((visitor, index) => {
                    const isEvacuated = evacuatedVisitors.has(visitor.id)
                    return (
                      <tr
                        key={visitor.id}
                        className={`transition-colors print:break-inside-avoid ${
                          isEvacuated ? 'bg-green-50' : 'hover:bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4 print:hidden">
                          <button
                            onClick={() => toggleEvacuated(visitor.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isEvacuated ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {isEvacuated ? <CheckCircle className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{visitor.name}</p>
                            {isEvacuated && (
                              <span className="bg-green-600 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                                ✓ SAFE
                              </span>
                            )}
                          </div>
                        </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{visitor.visitor_id}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{visitor.company || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md text-xs font-medium border border-blue-100">
                          Floor {visitor.floor_number || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{visitor.host_name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {visitor.badge_number ? (
                          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md text-xs font-medium border border-indigo-100">
                            {visitor.badge_number}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(visitor.check_in_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        <div>
                          <p>{visitor.phone || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{visitor.email || 'N/A'}</p>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Print Footer */}
        <div className="hidden print:block mt-8 text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
          <p>Generated: {new Date().toLocaleString()}</p>
          <p>UAC House Emergency Evacuation List - GVAS</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EvacuationDashboard
