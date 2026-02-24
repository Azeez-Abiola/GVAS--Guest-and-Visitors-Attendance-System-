import { useState, useEffect } from 'react'
import { Card, Title, Text, BarChart, DonutChart, LineChart } from '@tremor/react'
import { TrendingUp, Users, Clock, Award } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import ApiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const ReceptionAnalytics = () => {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    weeklyVisitors: [],
    floorDistribution: [],
    avgCheckInTime: '2.5 min',
    peakHours: []
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const visitors = await ApiService.getVisitors({ status: 'all' })

      // Handle statistics properly with the real total count
      const totalVisitorsCount = visitors.totalCount || visitors.length

      // Filter by assigned floors if receptionist
      let filteredVisitors = visitors
      if (profile?.role === 'reception' && profile?.assigned_floors?.length > 0) {
        const floorMap = {
          'Ground Floor': 0, '1st Floor': 1, '2nd Floor': 2, '3rd Floor': 3,
          '4th Floor': 4, '5th Floor': 5, '6th Floor': 6, '7th Floor': 7,
          '8th Floor': 8, '9th Floor': 9, '10th Floor': 10
        }

        filteredVisitors = visitors.filter(v => {
          let floorNum = v.floor_number
          if (floorNum === undefined || floorNum === null) {
            floorNum = floorMap[v.floor] ?? v.floor
          }

          return profile.assigned_floors.some(af => {
            const assignedFloorNum = typeof af === 'number' ? af : parseInt(af)
            return floorNum == assignedFloorNum // loose equality for string/number match safety
          })
        })
      }

      // Today's visitors (using local time)
      const todayLocal = new Date().toLocaleDateString('en-CA');
      const todayVisitors = filteredVisitors.filter(v => {
        if (!v.check_in_time) return false;
        return new Date(v.check_in_time).toLocaleDateString('en-CA') === todayLocal;
      })

      // Weekly visitors (last 7 days)
      const weeklyData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('en-CA') // Local YYYY-MM-DD

        const count = filteredVisitors.filter(v => {
          if (!v.check_in_time) return false;
          return new Date(v.check_in_time).toLocaleDateString('en-CA') === dateStr;
        }).length

        weeklyData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          Visitors: count
        })
      }

      // Floor distribution
      const floorCounts = {}
      filteredVisitors.forEach(v => {
        const floor = v.floor_number ?? v.floor ?? 'Unassigned'
        floorCounts[floor] = (floorCounts[floor] || 0) + 1
      })
      const floorDistribution = Object.entries(floorCounts).map(([floor, count]) => ({
        floor: floor === 0 ? 'Ground Floor' : `Floor ${floor}`,
        Visitors: count
      }))

      // Peak hours (group by hour)
      const hourCounts = {}
      filteredVisitors.forEach(v => {
        if (v.check_in_time) {
          const hour = new Date(v.check_in_time).getHours()
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        }
      })
      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({
          time: `${hour}:00`,
          Visitors: count
        }))
        .sort((a, b) => parseInt(a.time) - parseInt(b.time))

      setAnalytics({
        totalVisitors: totalVisitorsCount,
        todayVisitors: todayVisitors.length,
        weeklyVisitors: weeklyData,
        floorDistribution,
        avgCheckInTime: '2.5 min',
        peakHours
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-500">Visitor statistics and trends</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card decoration="top" decorationColor="blue">
            <div className="flex items-start justify-between">
              <div>
                <Text>Total Visitors</Text>
                <Title className="text-3xl font-bold mt-2">{analytics.totalVisitors}</Title>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card decoration="top" decorationColor="green">
            <div className="flex items-start justify-between">
              <div>
                <Text>Today's Visitors</Text>
                <Title className="text-3xl font-bold mt-2">{analytics.todayVisitors}</Title>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card decoration="top" decorationColor="purple">
            <div className="flex items-start justify-between">
              <div>
                <Text>Avg Check-in Time</Text>
                <Title className="text-3xl font-bold mt-2">{analytics.avgCheckInTime}</Title>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>

          <Card decoration="top" decorationColor="orange">
            <div className="flex items-start justify-between">
              <div>
                <Text>Active Floors</Text>
                <Title className="text-3xl font-bold mt-2">{analytics.floorDistribution.length}</Title>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Award className="text-orange-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <Card>
            <Title>Weekly Visitor Trend</Title>
            <Text>Last 7 days</Text>
            <LineChart
              className="mt-6"
              data={analytics.weeklyVisitors}
              index="date"
              categories={["Visitors"]}
              colors={["blue"]}
              yAxisWidth={40}
              showLegend={false}
            />
          </Card>

          {/* Floor Distribution */}
          <Card>
            <Title>Visitors by Floor</Title>
            <Text>Distribution across floors</Text>
            <DonutChart
              className="mt-6"
              data={analytics.floorDistribution}
              category="Visitors"
              index="floor"
              colors={["blue", "cyan", "indigo", "violet", "purple", "fuchsia"]}
            />
          </Card>
        </div>

        {/* Peak Hours */}
        <Card>
          <Title>Peak Hours</Title>
          <Text>Visitor check-ins by hour</Text>
          <BarChart
            className="mt-6"
            data={analytics.peakHours}
            index="time"
            categories={["Visitors"]}
            colors={["blue"]}
            yAxisWidth={40}
          />
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default ReceptionAnalytics
