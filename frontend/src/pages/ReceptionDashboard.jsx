import { useState, useEffect } from 'react'
import { Card, Title, Text, Badge as TremorBadge, BarList, Metric, Flex, Grid } from '@tremor/react'
import {
  UserPlus,
  UserMinus,
  Users,
  Clock,
  Search,
  QrCode,
  Printer,
  Bell,
  CheckCircle,
  XCircle,
  LogOut,
  LogIn,
  X,
  Mail
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import ApiService from '../services/api'
import showToast from '../utils/toast'
import HostSelector from '../components/HostSelector'
import FloorSelector from '../components/FloorSelector'
import VisitorDetailModal from '../components/VisitorDetailModal'
import NotificationListener from '../components/NotificationListener'
import { useAuth } from '../contexts/AuthContext'
import GuestInviteModal from '../components/GuestInviteModal'

const ReceptionDashboard = () => {
  const { profile, user } = useAuth()
  const [stats, setStats] = useState({
    todayCheckIns: 0,
    activeVisitors: 0,
    pendingCheckOuts: 0,
    avgCheckInTime: '2.5 min',
    availableBadges: 0
  })
  const [visitors, setVisitors] = useState([])
  const [hosts, setHosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showVisitorDetail, setShowVisitorDetail] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [visitorToCheckOut, setVisitorToCheckOut] = useState(null)
  const [visitorToCheckIn, setVisitorToCheckIn] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrInput, setQrInput] = useState('')
  const [printSearch, setPrintSearch] = useState('')
  const [printVisitor, setPrintVisitor] = useState(null)
  const [badgeStats, setBadgeStats] = useState(null)
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



  const loadHosts = async () => {
    try {
      console.log('📋 Loading hosts...')
      const hostsData = await ApiService.getHosts()
      console.log('📋 Hosts loaded:', hostsData?.length || 0, 'hosts')
      setHosts(hostsData || [])
    } catch (error) {
      console.error('❌ Failed to load hosts:', error)
    }
  }

  const loadBadgeStats = async () => {
    try {
      const stats = await ApiService.getBadgeStats()
      setBadgeStats(stats)
      setStats(prev => ({
        ...prev,
        availableBadges: stats.byType.visitor?.available || 0
      }))
    } catch (error) {
      console.error('Failed to load badge stats:', error)
    }
  }

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      let visitorsData = await ApiService.getVisitors({ status: 'all' })

      console.log('🏢 ALL VISITORS (before filtering):', visitorsData.map(v => ({
        name: v.name,
        floor_number: v.floor_number,
        floor: v.floor,
        status: v.status
      })))

      console.log('👤 RECEPTIONIST PROFILE:', {
        role: profile?.role,
        assigned_floors: profile?.assigned_floors,
        assigned_floors_type: typeof profile?.assigned_floors,
        assigned_floors_length: profile?.assigned_floors?.length,
        assigned_floors_array: JSON.stringify(profile?.assigned_floors),
        is_array: Array.isArray(profile?.assigned_floors)
      })

      console.log('🔍 Filter condition check:', {
        has_profile: !!profile,
        is_reception: profile?.role === 'reception',
        has_assigned_floors: !!profile?.assigned_floors,
        has_length: profile?.assigned_floors?.length > 0,
        will_filter: profile && profile.role === 'reception' && profile.assigned_floors && profile.assigned_floors.length > 0
      })

      // Filter visitors by receptionist's assigned floors
      if (profile && profile.role === 'reception' && profile.assigned_floors && profile.assigned_floors.length > 0) {
        console.log('🔍 Filtering visitors by receptionist floors:', profile.assigned_floors)
        console.log('📊 Total visitors before filter:', visitorsData.length)

        // Convert floor names to numbers for comparison
        const floorMap = {
          'Ground Floor': 0,
          '1st Floor': 1,
          '2nd Floor': 2,
          '3rd Floor': 3,
          '4th Floor': 4,
          '5th Floor': 5,
          '6th Floor': 6,
          '7th Floor': 7,
          '8th Floor': 8,
          '9th Floor': 9,
        }

        visitorsData = visitorsData.filter(visitor => {
          // Get visitor's floor number
          let visitorFloorNum = visitor.floor_number !== undefined && visitor.floor_number !== null
            ? visitor.floor_number
            : floorMap[visitor.floor]

          // If visitor has no floor assigned, show them to all receptionists (fallback)
          // This ensures pre-registered guests with missing data aren't invisible
          if (visitorFloorNum === undefined || visitorFloorNum === null) {
            console.log('⚠️ Visitor has no floor assigned, showing as fallback:', visitor.name)
            return true
          }

          console.log(`👤 Visitor ${visitor.name} is on floor:`, visitorFloorNum)

          // Check if visitor's floor matches any of receptionist's assigned floors
          const matches = profile.assigned_floors.some(assignedFloor => {
            // Convert assigned floor to number
            let assignedFloorNum
            if (typeof assignedFloor === 'number') {
              assignedFloorNum = assignedFloor
            } else if (typeof assignedFloor === 'string') {
              // Try to parse as number first (e.g., "9" -> 9)
              const parsed = parseInt(assignedFloor)
              if (!isNaN(parsed)) {
                assignedFloorNum = parsed
              } else {
                // Use floor map for named floors (e.g., "9th Floor" -> 9)
                assignedFloorNum = floorMap[assignedFloor]
              }
            }

            // Loose comparison to handle potential string/number mismatches
            // e.g. "9" vs 9, or "09" vs 9
            const match = String(visitorFloorNum) === String(assignedFloorNum);

            console.log(`  🔍 Checking if floor ${visitorFloorNum} matches assigned floor ${assignedFloorNum}:`, match)
            return match
          })

          return matches
        })

        console.log(`✅ Filtered to ${visitorsData.length} visitors for receptionist's floors`)
      }

      setVisitors(visitorsData || [])

      console.log('✅ FINAL VISITORS SET TO STATE:', visitorsData.length, 'visitors')
      console.log('✅ FINAL VISITORS:', visitorsData.map(v => ({
        name: v.name,
        status: v.status,
        floor: v.floor_number,
        check_in_time: v.check_in_time
      })))

      // Calculate stats from filtered visitors
      // Get today's date in UTC to match database timestamps
      const now = new Date()
      const todayISO = now.toISOString().split('T')[0]

      console.log('📅 Today\'s date (ISO):', todayISO)
      console.log('📅 Current time:', now.toISOString())

      // Count today's check-ins (visitors who checked in today, regardless of current status)
      const todayCheckIns = visitorsData.filter(v => {
        if (!v.check_in_time) return false
        const checkInDate = new Date(v.check_in_time).toISOString().split('T')[0]
        console.log(`  🔍 Checking ${v.name}: check_in_time=${v.check_in_time}, date=${checkInDate}, matches today=${checkInDate === todayISO}`)
        return checkInDate === todayISO
      })

      console.log('📊 Today\'s check-ins breakdown:', todayCheckIns.map(v => ({
        name: v.name,
        check_in_time: v.check_in_time,
        status: v.status
      })))

      // Count active visitors (currently checked in, not checked out)
      const activeVisitors = visitorsData.filter(v =>
        v.status === 'checked_in'
      )

      // Count pending checkouts (same as active visitors)
      const pendingCheckOuts = activeVisitors.length

      console.log('📊 Stats calculated:', {
        todayCheckIns: todayCheckIns.length,
        activeVisitors: activeVisitors.length,
        pendingCheckOuts: pendingCheckOuts,
        calculatedFrom: visitorsData.length + ' visitors'
      })

      console.log('📊 SETTING STATS TO STATE:', {
        todayCheckIns: todayCheckIns.length,
        activeVisitors: activeVisitors.length,
        pendingCheckOuts: pendingCheckOuts
      })

      setStats(prev => ({
        ...prev,
        todayCheckIns: todayCheckIns.length,
        activeVisitors: activeVisitors.length,
        pendingCheckOuts: pendingCheckOuts,
        avgCheckInTime: '2.5 min'
      }))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Move useEffects here to avoid "ReferenceError: Cannot access 'loadData' before initialization"

  useEffect(() => {
    if (profile && user) {
      console.log('🔄 useEffect triggered - Loading data for user:', user.email)
      // Reset state when profile changes (e.g., after logout/login)
      setVisitors([])
      setLoading(true)
      loadData()
      loadHosts()
      loadBadgeStats()
    } else if (!profile && !user) {
      // Clear data when logged out
      console.log('🔄 User logged out - Clearing data')
      setVisitors([])
      setHosts([])
      setStats({
        todayCheckIns: 0,
        activeVisitors: 0,
        pendingCheckOuts: 0,
        avgCheckInTime: '2.5 min',
        availableBadges: 0
      })
    }
  }, [profile, user?.id])

  // Real-time updates subscription
  useEffect(() => {
    if (!profile) return

    console.log('🔌 ReceptionDashboard subscribing to updates...')
    const subscription = ApiService.subscribeToVisitors((payload) => {
      console.log('🔔 ReceptionDashboard received update:', payload)
      // Refresh data on any visitor change
      loadData(true)
      loadBadgeStats()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [profile])

  const handleCheckIn = async (visitor) => {
    // Open verification modal instead of direct check-in
    setVisitorToCheckIn(visitor)
    setShowQRModal(true)
  }

  const handleVerifyAndCheckIn = async () => {
    if (!qrInput.trim()) {
      showToast('Please enter guest code or scan QR code', 'error')
      return
    }

    try {
      setLoading(true)

      // Verify the code matches the visitor
      if (visitorToCheckIn && (
        qrInput.toLowerCase() === visitorToCheckIn.guest_code?.toLowerCase() ||
        qrInput === visitorToCheckIn.visitor_id ||
        qrInput === visitorToCheckIn.id
      )) {

        // --- Time Restriction Logic ---
        if (visitorToCheckIn.visit_date) {
          const now = new Date()
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const visitDate = new Date(visitorToCheckIn.visit_date)
          visitDate.setHours(0, 0, 0, 0)

          // 1. Check if visit date is in the future
          if (visitDate > today) {
            showToast(`Cannot check in yet. Visit is scheduled for ${new Date(visitorToCheckIn.visit_date).toLocaleDateString()}.`, 'error')
            setLoading(false)
            return
          }

          // 2. Check if visit date is today but time is too early (allow 60 mins buffer)
          if (visitDate.getTime() === today.getTime() && visitorToCheckIn.visit_time) {
            try {
              const [hours, mins] = visitorToCheckIn.visit_time.split(':')
              const scheduledTime = new Date()
              scheduledTime.setHours(parseInt(hours), parseInt(mins), 0, 0)

              const allowedTime = new Date(scheduledTime.getTime() - 60 * 60 * 1000) // 60 mins before

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
        // -----------------------------

        const updatedVisitor = await ApiService.checkIn(visitorToCheckIn.id)

        // Show success toast with badge info
        const badgeInfo = updatedVisitor.badge_number
          ? ` Badge ${updatedVisitor.badge_number} assigned.`
          : '';

        showToast(`${visitorToCheckIn.name} checked in successfully!${badgeInfo}`, 'success')

        setShowQRModal(false)
        setQrInput('')
        setVisitorToCheckIn(null)
        await loadData()
        await loadBadgeStats()
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

  const handleCheckOut = async (visitor) => {
    // Open confirmation modal
    setVisitorToCheckOut(visitor)
    setShowCheckOutModal(true)
  }

  const confirmCheckOut = async () => {
    if (!visitorToCheckOut) return

    try {
      const badgeNumber = visitorToCheckOut.badge_number
      await ApiService.checkOut(visitorToCheckOut.id)

      // Show success toast with badge release info
      const badgeInfo = badgeNumber
        ? ` Badge ${badgeNumber} returned to inventory.`
        : ''

      showToast(`${visitorToCheckOut.name} checked out successfully!${badgeInfo}`, 'success')

      setShowCheckOutModal(false)
      setVisitorToCheckOut(null)
      await loadData()
      await loadBadgeStats()
    } catch (error) {
      console.error('Check-out failed:', error)
      showToast('Failed to check out visitor. Please try again.', 'error')
    }
  }

  const handleOldCheckOut = async (visitor) => {
    try {
      const badgeNumber = visitor.badge_number;
      await ApiService.checkOut(visitor.id)

      // Show success message with badge release info
      const badgeInfo = badgeNumber
        ? ` Badge ${badgeNumber} returned to inventory.`
        : '';

      alert(`✅ ${visitor.full_name || visitor.name} checked out successfully!${badgeInfo}`)
      await loadData()
      await loadBadgeStats()
    } catch (error) {
      console.error('Check-out failed:', error)
      alert('Failed to check out visitor. Please try again.')
    }
  }

  const handleWalkInCheckIn = async () => {
    try {
      console.log('🚀 Creating visitor with data:', newVisitor)
      const createdVisitor = await ApiService.createVisitor(newVisitor)
      console.log('✅ Visitor created:', createdVisitor)

      // Auto check-in the newly created visitor (badge will be assigned automatically)
      const checkedInVisitor = await ApiService.checkIn(createdVisitor.id)
      console.log('✅ Visitor checked in')

      // Show success toast
      showToast(`${newVisitor.name} checked in successfully!`, 'success');

      setShowCheckInModal(false)
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

      // Show success message with badge info
      const badgeInfo = checkedInVisitor.badge_number
        ? ` Badge ${checkedInVisitor.badge_number} assigned.`
        : ' ⚠️ No badge assigned (inventory empty).';

      alert(`✅ Visitor checked in successfully!${badgeInfo}`)
      await loadData()
      await loadBadgeStats()
    } catch (error) {
      console.error('❌ Walk-in check-in failed:', error)
      console.error('Error details:', error.message)
      alert(`Failed to check in visitor: ${error.message || 'Please try again.'}`)
    }
  }

  const handleQRCheckIn = async () => {
    if (!qrInput.trim()) {
      alert('Please enter a guest code or QR code')
      return
    }

    try {
      setLoading(true)
      // Find visitor by guest_code or visitor_id
      const visitor = await ApiService.getVisitor(qrInput)

      if (!visitor) {
        alert('No visitor found with this code. Please check and try again.')
        return
      }

      if (visitor.status === 'checked_in') {
        alert(`${visitor.name} is already checked in!`)
        return
      }

      // Check in the visitor
      await ApiService.checkIn(visitor.id)
      setShowQRModal(false)
      setQrInput('')
      alert(`${visitor.name} checked in successfully via QR code!`)
      await loadData()
    } catch (error) {
      console.error('QR check-in failed:', error)
      alert('Invalid QR code or visitor not found.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintBadgeSearch = async () => {
    if (!printSearch.trim()) {
      return
    }

    try {
      // Search only visitors on receptionist's assigned floors
      const allVisitors = await ApiService.getVisitors({ status: 'all' })

      // Filter by receptionist's floors first
      let searchableVisitors = allVisitors
      if (profile && profile.role === 'reception' && profile.assigned_floors && profile.assigned_floors.length > 0) {
        const floorMap = {
          'Ground Floor': 0, '1st Floor': 1, '2nd Floor': 2, '3rd Floor': 3,
          '4th Floor': 4, '5th Floor': 5, '6th Floor': 6, '7th Floor': 7,
          '8th Floor': 8, '9th Floor': 9
        }

        searchableVisitors = allVisitors.filter(visitor => {
          if (!visitor.floor_number && visitor.floor_number !== 0 && !visitor.floor) return false

          const visitorFloorNum = visitor.floor_number !== undefined && visitor.floor_number !== null
            ? visitor.floor_number
            : floorMap[visitor.floor]

          return profile.assigned_floors.some(assignedFloor => {
            let assignedFloorNum = typeof assignedFloor === 'number'
              ? assignedFloor
              : (typeof assignedFloor === 'string' ? (parseInt(assignedFloor) || floorMap[assignedFloor]) : null)
            return visitorFloorNum === assignedFloorNum
          })
        })
      }

      const found = searchableVisitors.find(v =>
        v.name?.toLowerCase().includes(printSearch.toLowerCase()) ||
        v.visitor_id?.toLowerCase() === printSearch.toLowerCase() ||
        v.badge_number?.toLowerCase() === printSearch.toLowerCase()
      )

      if (found) {
        setPrintVisitor(found)
      } else {
        showToast('No visitor found on your assigned floors with that name, visitor ID, or badge number', 'error')
        setPrintVisitor(null)
      }
    } catch (error) {
      console.error('Search failed:', error)
      showToast('Failed to search for visitor', 'error')
    }
  }

  const handlePrintBadge = () => {
    if (!printVisitor) return

    // Generate QR code for the visitor if they have a guest code
    const qrCodeData = printVisitor.guest_code || printVisitor.visitor_id

    // Create a professional badge print layout
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html>
        <head>
          <title>Visitor Badge - ${printVisitor.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              background: #f5f5f5;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .badge-container {
              background: white;
              width: 400px;
              border: 3px solid #0f172a;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            
            .badge-header {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            
            .logo {
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            
            .subtitle {
              font-size: 14px;
              opacity: 0.9;
              letter-spacing: 0.5px;
            }
            
            .badge-body {
              padding: 30px;
            }
            
            .visitor-photo {
              width: 120px;
              height: 120px;
              margin: 0 auto 20px;
              background: linear-gradient(135deg, #0f172a 0%, #475569 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 48px;
              font-weight: 700;
              color: white;
              border: 4px solid #e2e8f0;
            }
            
            .visitor-name {
              font-size: 24px;
              font-weight: 700;
              text-align: center;
              color: #0f172a;
              margin-bottom: 10px;
            }
            
            .visitor-company {
              font-size: 16px;
              text-align: center;
              color: #64748b;
              margin-bottom: 20px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .info-label {
              font-size: 14px;
              color: #64748b;
              font-weight: 600;
            }
            
            .info-value {
              font-size: 14px;
              color: #0f172a;
              font-weight: 600;
            }
            
            .badge-number {
              background: #0f172a;
              color: white;
              padding: 15px;
              text-align: center;
              margin: 20px 0;
              border-radius: 10px;
              font-size: 20px;
              font-weight: 700;
              letter-spacing: 2px;
            }
            
            .qr-section {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px dashed #e2e8f0;
            }
            
            .qr-code {
              width: 150px;
              height: 150px;
              margin: 15px auto;
              background: white;
              padding: 10px;
              border: 2px solid #e2e8f0;
              border-radius: 10px;
            }
            
            .guest-code {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 3px;
              margin-top: 10px;
            }
            
            .validity {
              font-size: 12px;
              color: #64748b;
              text-align: center;
              margin-top: 15px;
            }
            
            .print-button {
              display: block;
              margin: 30px auto;
              padding: 15px 40px;
              font-size: 16px;
              font-weight: 600;
              background: #0f172a;
              color: white;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            
            .print-button:hover {
              background: #1e293b;
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(15, 23, 42, 0.3);
            }
            
            @media print {
              body { 
                background: white; 
                padding: 0;
              }
              .badge-container {
                box-shadow: none;
                border: 2px solid #0f172a;
              }
              .print-button { 
                display: none; 
              }
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        </head>
        <body>
          <div>
            <div class="badge-container">
              <div class="badge-header">
                <div class="logo">GVAS</div>
                <div class="subtitle">Guest & Visitor Attendance System</div>
              </div>
              
              <div class="badge-body">
                <div class="visitor-photo">
                  ${printVisitor.name?.charAt(0).toUpperCase() || 'V'}
                </div>
                
                <div class="visitor-name">${printVisitor.name || 'Unknown Visitor'}</div>
                <div class="visitor-company">${printVisitor.company || 'Guest'}</div>
                
                <div class="info-row">
                  <span class="info-label">Badge Number</span>
                  <span class="info-value">#${printVisitor.badge_number || 'Not Assigned'}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Check-In</span>
                  <span class="info-value">${printVisitor.check_in_time ? new Date(printVisitor.check_in_time).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A'}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Host</span>
                  <span class="info-value">${printVisitor.host_name || 'N/A'}</span>
                </div>
                
                <div class="info-row" style="border-bottom: none;">
                  <span class="info-label">Floor</span>
                  <span class="info-value">${printVisitor.floor || 'N/A'}</span>
                </div>
                
                ${printVisitor.guest_code || printVisitor.visitor_id ? `
                <div class="qr-section">
                  <div id="qrcode" class="qr-code"></div>
                  <div class="guest-code">${printVisitor.guest_code || printVisitor.visitor_id}</div>
                  <div class="validity">Scan to verify visitor identity</div>
                </div>
                ` : ''}
                
                <div class="validity" style="margin-top: 20px;">
                  Valid for: ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })}
                </div>
              </div>
            </div>
            
            <button onclick="window.print()" class="print-button">
              🖨️ Print Badge
            </button>
          </div>
          
          <script>
            // Generate QR code if data is available
            if ('${qrCodeData}') {
              new QRCode(document.getElementById("qrcode"), {
                text: '${qrCodeData}',
                width: 130,
                height: 130,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
              });
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  console.log('🔍 Search term:', searchTerm)
  console.log('📊 Visitors state:', visitors.length, 'visitors')

  const filteredVisitors = visitors.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  console.log('📊 Filtered visitors (after search):', filteredVisitors.length, 'visitors')

  const recentVisitors = filteredVisitors.slice(0, 10)

  console.log('📊 Recent visitors (top 10):', recentVisitors.length, 'visitors')

  return (
    <DashboardLayout>
      {/* Real-time Notification Listener */}
      <NotificationListener
        userRole={profile?.role}
        floorNumber={profile?.floor_number || 1}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reception Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage visitor check-ins and check-outs
              {profile?.assigned_floors && profile.assigned_floors.length > 0 && (
                <span className="ml-2">
                  • <span className="font-semibold text-slate-900 dark:text-white">Your Floors:</span>{' '}
                  {profile.assigned_floors.map((floor, idx) => {
                    const floorName = typeof floor === 'number'
                      ? (floor === 0 ? 'Ground Floor' : `${floor === 1 ? '1st' : floor === 2 ? '2nd' : floor === 3 ? '3rd' : `${floor}th`} Floor`)
                      : floor
                    return (
                      <span key={idx}>
                        {idx > 0 && ', '}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900">
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
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Mail size={18} />
              Invite Guest
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 dark:text-gray-400 font-medium">Today's Check-ins</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.todayCheckIns}</Metric>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                <UserPlus className="text-blue-600 dark:text-blue-400" size={24} />
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

          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 dark:text-gray-400 font-medium">Pending Check-outs</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingCheckOuts}</Metric>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl">
                <LogOut className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
            </Flex>
          </Card>

          <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-gray-500 dark:text-gray-400 font-medium">Available Badges</Text>
                <Metric className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.availableBadges}</Metric>
                {badgeStats && (
                  <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {badgeStats.byType.visitor?.issued || 0} issued / {badgeStats.byType.visitor?.total || 0} total
                  </Text>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stats.availableBadges > 2 ? 'bg-green-50 dark:bg-green-900/30' : stats.availableBadges > 0 ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                <Printer className={`${stats.availableBadges > 2 ? 'text-green-600 dark:text-green-400' : stats.availableBadges > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`} size={24} />
              </div>
            </Flex>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
          <Title className="text-gray-900 dark:text-white font-bold mb-4">Quick Actions</Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                console.log('🚪 Opening check-in modal, hosts available:', hosts.length)
                setShowCheckInModal(true)
              }}
              className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <UserPlus className="text-blue-700 dark:text-blue-400" size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-300">Walk-in Check-in</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-700/70 dark:group-hover:text-blue-400/70">Register new visitor</p>
              </div>
            </button>

            <button
              onClick={() => setShowQRModal(true)}
              className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <QrCode className="text-blue-700 dark:text-blue-400" size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-300">Verify Guest</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-700/70 dark:group-hover:text-blue-400/70">Pre-registered visitor</p>
              </div>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                <Printer className="text-violet-700 dark:text-violet-400" size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-violet-900 dark:group-hover:text-violet-300">Print Badge</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-violet-700/70 dark:group-hover:text-violet-400/70">Reprint visitor badge</p>
              </div>
            </button>
          </div>
        </Card>

        {/* Visitor List */}
        <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <Title className="text-gray-900 dark:text-white font-bold">Recent Visitors</Title>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#052e16] dark:focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#052e16] dark:border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading visitors...</p>
            </div>
          ) : recentVisitors.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
              <Users size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No visitors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                    <th className="pb-3 pl-2">Visitor</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Host</th>
                    <th className="pb-3">Floor</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Time</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {recentVisitors.map((visitor, index) => (
                    <motion.tr
                      key={visitor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedVisitor(visitor)
                        setShowVisitorDetail(true)
                      }}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {visitor.name?.charAt(0) || 'V'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{visitor.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{visitor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{visitor.company || '-'}</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{visitor.host?.name || visitor.host_name || '-'}</td>
                      <td className="py-3">
                        {visitor.floor_number !== undefined && visitor.floor_number !== null ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {visitor.floor_number === 0 ? 'Ground Floor' : `${visitor.floor_number}${visitor.floor_number === 1 ? 'st' : visitor.floor_number === 2 ? 'nd' : visitor.floor_number === 3 ? 'rd' : 'th'} Floor`}
                          </span>
                        ) : visitor.floor ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {visitor.floor}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3">
                        {visitor.status === 'checked_in' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                            Checked In
                          </span>
                        ) : visitor.status === 'checked_out' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                            Checked Out
                          </span>
                        ) : visitor.status === 'pre_registered' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            Pre-registered
                          </span>
                        ) : visitor.status === 'pending_approval' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                            Awaiting Approval
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                        {visitor.check_in_time ? new Date(visitor.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="py-3 text-right pr-2">
                        {visitor.status === 'checked_in' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCheckOut(visitor)
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <LogOut size={14} /> Check Out
                          </button>
                        ) : visitor.status === 'checked_out' ? (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">Completed</span>
                        ) : (() => {
                          // Check if visitor is "too early" for pre-registered guests
                          let isTooEarly = false
                          let scheduledInfo = ''

                          if (visitor.visit_date && (visitor.status === 'pre_registered' || visitor.status === 'pending')) {
                            const now = new Date()
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                            const visitDate = new Date(visitor.visit_date)
                            const visitDateOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate())

                            // If visit is in the future (not today)
                            if (visitDateOnly > today) {
                              isTooEarly = true
                              scheduledInfo = `Scheduled for ${visitDate.toLocaleDateString()}`
                            } else if (visitDateOnly.getTime() === today.getTime() && visitor.visit_time) {
                              // Same day - check time
                              const [hours, minutes] = visitor.visit_time.split(':').map(Number)
                              const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
                              const bufferMs = 60 * 60 * 1000 // 60 minutes early buffer

                              if (now.getTime() < scheduledTime.getTime() - bufferMs) {
                                isTooEarly = true
                                scheduledInfo = `Scheduled for ${visitor.visit_time} (${Math.round((scheduledTime - now) / 60000)} min early)`
                              }
                            }
                          }

                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCheckIn(visitor)
                              }}
                              title={isTooEarly ? scheduledInfo : 'Check in this visitor'}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isTooEarly
                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800'
                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                                }`}
                            >
                              <LogIn size={14} />
                              {isTooEarly ? 'Early Check In' : 'Check In'}
                            </button>
                          )
                        })()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Walk-in Check-in Modal */}
      <AnimatePresence>
        {showCheckInModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckInModal(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-left"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Walk-in Check-in</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Register and check-in a new visitor</p>
                    </div>
                    <button
                      onClick={() => setShowCheckInModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={newVisitor.name}
                          onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Visitor's full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          value={newVisitor.email}
                          onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="visitor@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone *</label>
                        <input
                          type="tel"
                          value={newVisitor.phone}
                          onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="+234-XXX-XXX-XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                        <input
                          type="text"
                          value={newVisitor.company}
                          onChange={(e) => setNewVisitor({ ...newVisitor, company: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Company name"
                        />
                      </div>
                    </div>

                    {/* NEW ENHANCED HOST SELECTOR - v2.0 */}
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purpose of Visit *</label>
                      <textarea
                        value={newVisitor.purpose}
                        onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Brief description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected Duration (hours)</label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={newVisitor.expected_duration || 4}
                        onChange={(e) => setNewVisitor({ ...newVisitor, expected_duration: parseInt(e.target.value) || 4 })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Hours"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => setShowCheckInModal(false)}
                      className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleWalkInCheckIn}
                      disabled={!newVisitor.name || !newVisitor.email || !newVisitor.phone || !newVisitor.host_id || !newVisitor.purpose || !newVisitor.floor}
                      className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <UserPlus size={18} />
                      Check In Visitor
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Verify Guest Modal (QR/Guest Code Scanner) */}
      <AnimatePresence>
        {showQRModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowQRModal(false)
                setQrInput('')
                setVisitorToCheckIn(null)
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
                        {visitorToCheckIn ? `Verifying: ${visitorToCheckIn.name}` : 'Enter guest code to verify'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowQRModal(false)
                        setQrInput('')
                        setVisitorToCheckIn(null)
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
                        {visitorToCheckIn
                          ? `Enter the guest code to verify ${visitorToCheckIn.name}`
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
                        setVisitorToCheckIn(null)
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
          </>
        )}
      </AnimatePresence>

      {/* Check-Out Confirmation Modal */}
      <AnimatePresence>
        {showCheckOutModal && visitorToCheckOut && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCheckOutModal(false)
                setVisitorToCheckOut(null)
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
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                      <LogOut size={32} className="text-red-600" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                    Check Out Visitor?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    Are you sure you want to check out <strong>{visitorToCheckOut.name}</strong>?
                    {visitorToCheckOut.badge_number && (
                      <span className="block mt-2 text-sm">
                        Badge {visitorToCheckOut.badge_number} will be returned to inventory.
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowCheckOutModal(false)
                        setVisitorToCheckOut(null)
                      }}
                      className="flex-1 px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmCheckOut}
                      className="flex-1 px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Check Out
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Print Badge Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrintModal(false)}
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
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Print Badge</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reprint visitor badge</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowPrintModal(false)
                        setPrintSearch('')
                        setPrintVisitor(null)
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Visitor</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Search within your assigned floors only</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={printSearch}
                          onChange={(e) => setPrintSearch(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handlePrintBadgeSearch()}
                          placeholder="Enter visitor name or badge number"
                          className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={handlePrintBadgeSearch}
                          className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors text-gray-900 dark:text-white"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    {printVisitor ? (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700">
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-slate-900 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                            {printVisitor.name?.charAt(0) || 'V'}
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">{printVisitor.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{printVisitor.company || 'Guest'}</p>
                          <div className="mt-3 inline-block bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold">
                            Badge: {printVisitor.badge_number || 'Not Assigned'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Visitor ID</p>
                            <p className="font-medium text-gray-900 dark:text-white">{printVisitor.visitor_id}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Floor</p>
                            <p className="font-medium text-gray-900 dark:text-white">{printVisitor.floor || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Host</p>
                            <p className="font-medium text-gray-900 dark:text-white">{printVisitor.host || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Check-in Time</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {printVisitor.check_in_time ? new Date(printVisitor.check_in_time).toLocaleTimeString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-slate-800 rounded-xl">
                        <Printer size={48} className="mx-auto mb-3 text-gray-400 dark:text-slate-500" />
                        <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">No visitor selected</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Search for a visitor to print their badge</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setShowPrintModal(false)
                        setPrintSearch('')
                        setPrintVisitor(null)
                      }}
                      className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePrintBadge}
                      disabled={!printVisitor}
                      className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Printer size={18} />
                      Print Badge
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )
        }
      </AnimatePresence >

      {/* Visitor Detail Modal */}
      < VisitorDetailModal
        visitor={selectedVisitor}
        isOpen={showVisitorDetail}
        onClose={() => {
          setShowVisitorDetail(false)
        }}
        onRefresh={async () => {
          // Refresh the selected visitor data
          if (selectedVisitor?.id) {
            const updated = await ApiService.getVisitorById(selectedVisitor.id)
            if (updated) setSelectedVisitor(updated)
          }
          await loadData()
        }}
      />
      <GuestInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        hostName={profile?.full_name}
        hostId={profile?.id}
      />
    </DashboardLayout >
  )
}

export default ReceptionDashboard
