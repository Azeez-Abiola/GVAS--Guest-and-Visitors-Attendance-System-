import { useState, useEffect } from 'react'
import { Card, Title, Text, Badge as TremorBadge, Metric, Flex, Grid, BarList } from '@tremor/react'
import { 
  Shield, 
  Users, 
  AlertTriangle,
  Eye,
  Clock,
  TrendingUp,
  Building,
  FileText
} from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import ApiService from '../services/api'

const SecurityDashboard = () => {
  const [stats, setStats] = useState({
    activeVisitors: 0,
    totalToday: 0,
    blacklisted: 0,
    alerts: 0
  })
  const [visitors, setVisitors] = useState([])
  const [visitorsByFloor, setVisitorsByFloor] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    // Refresh every 10 seconds for real-time monitoring
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [visitorsData, tenantsData] = await Promise.all([
        ApiService.getVisitors({ status: 'all' }),
        ApiService.getTenants()
      ])
      
      setVisitors(visitorsData || [])
      
      // Calculate stats
      const active = visitorsData.filter(v => v.status === 'checked_in')
      const today = new Date().toISOString().split('T')[0]
      const todayVisitors = visitorsData.filter(v => v.check_in_time?.startsWith(today))
      
      setStats({
        activeVisitors: active.length,
        totalToday: todayVisitors.length,
        blacklisted: 0, // Implement blacklist check
        alerts: 0
      })

      // Group by floor for evacuation view
      const floorGroups = tenantsData.map(tenant => ({
        name: `Floor ${tenant.floor_number} - ${tenant.name}`,
        value: active.filter(v => v.tenant_id === tenant.id).length
      }))
      setVisitorsByFloor(floorGroups)

    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeVisitors = visitors.filter(v => v.status === 'checked_in')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Monitoring</h1>
            <p className="text-gray-500">Real-time visitor tracking and building security</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg shadow-sm border border-blue-200">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">Live Monitoring Active</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 font-medium">Active Visitors</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.activeVisitors}</Metric>
                <Text className="mt-1 text-xs text-blue-600 font-medium">Currently in building</Text>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Users className="text-blue-600" size={24} />
              </div>
            </Flex>
          </Card>

          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 font-medium">Today's Total</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.totalToday}</Metric>
                <Text className="mt-1 text-xs text-blue-600 font-medium">All check-ins</Text>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </Flex>
          </Card>

          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 font-medium">Blacklisted</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.blacklisted}</Metric>
                <Text className="mt-1 text-xs text-red-600 font-medium">Restricted visitors</Text>
              </div>
              <div className="bg-red-50 p-3 rounded-xl">
                <Shield className="text-red-600" size={24} />
              </div>
            </Flex>
          </Card>

          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 font-medium">Active Alerts</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900">{stats.alerts}</Metric>
                <Text className="mt-1 text-xs text-amber-600 font-medium">Requires attention</Text>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
            </Flex>
          </Card>
        </div>

        {/* Visitors by Floor */}
        <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
          <Title className="text-gray-900 font-bold">Visitors by Floor</Title>
          <Text className="text-gray-500">Current visitor distribution across building</Text>
          <div className="mt-6">
            {visitorsByFloor.length > 0 ? (
              <BarList
                data={visitorsByFloor}
                className="mt-2"
                color="blue"
                valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
              />
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-4">
                <Building size={32} className="mx-auto mb-2 opacity-20" />
                <p>No active visitors</p>
              </div>
            )}
          </div>
        </Card>

        {/* Active Visitors List */}
        <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <Title className="text-gray-900 font-bold">Active Visitors ({activeVisitors.length})</Title>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2">
              <FileText size={18} />
              Generate Evacuation List
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading visitors...</p>
            </div>
          ) : activeVisitors.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Users size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No active visitors in building</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pl-2">Visitor</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Floor/Host</th>
                    <th className="pb-3">Badge</th>
                    <th className="pb-3">Check-in Time</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeVisitors.map((visitor, index) => {
                    const checkInTime = new Date(visitor.check_in_time)
                    const duration = Math.floor((Date.now() - checkInTime.getTime()) / (1000 * 60))
                    
                    return (
                      <motion.tr
                        key={visitor.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                              {visitor.name?.charAt(0) || 'V'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{visitor.name}</p>
                              <p className="text-xs text-gray-500">{visitor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-600">{visitor.company || '-'}</td>
                        <td className="py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{visitor.host}</p>
                            <p className="text-xs text-gray-500">Floor {visitor.floor_number || '-'}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {visitor.badge_number || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700 font-medium">{duration} min</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-blue-700 font-medium">In Building</span>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Eye className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">View Evacuation</h3>
                <p className="text-sm text-gray-500 mt-1">Full evacuation list</p>
              </div>
            </div>
          </button>

          <button className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-red-200 hover:shadow-md transition-all text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <Shield className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">Blacklist</h3>
                <p className="text-sm text-gray-500 mt-1">Manage restricted visitors</p>
              </div>
            </div>
          </button>

          <button className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Alerts</h3>
                <p className="text-sm text-gray-500 mt-1">View all alerts</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SecurityDashboard
