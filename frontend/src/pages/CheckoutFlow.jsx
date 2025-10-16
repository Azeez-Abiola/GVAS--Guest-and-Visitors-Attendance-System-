import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  Search, 
  QrCode, 
  UserCheck, 
  Clock, 
  Building2,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader,
  Users,
  Shield
} from 'lucide-react'
import GvasLogo from '../components/GvasLogo'
import apiService from '../services/api'

const CheckoutFlow = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAdminContext = searchParams.get('from') === 'admin'
  
  const [checkoutMethod, setCheckoutMethod] = useState('id') // 'id', 'qr', or 'recent'
  const [visitorId, setVisitorId] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Enhanced mock visitor database for better validation
  const mockVisitorDatabase = [
    {
      id: 'V1234',
      name: 'John Doe',
      company: 'TechCorp Inc.',
      host: 'Sarah Johnson',
      checkinTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      purpose: 'Business Meeting',
      status: 'checked-in',
      email: 'john.doe@techcorp.com',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 'V1235',
      name: 'Jane Smith',
      company: 'Design Studio',
      host: 'Mike Wilson',
      checkinTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      purpose: 'Client Consultation',
      status: 'checked-in',
      email: 'jane.smith@designstudio.com',
      phone: '+1 (555) 987-6543'
    },
    {
      id: 'V1236',
      name: 'Bob Johnson',
      company: 'ABC Corp',
      host: 'Lisa Brown',
      checkinTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      purpose: 'Project Review',
      status: 'checked-out', // Already checked out
      email: 'bob.johnson@abccorp.com',
      phone: '+1 (555) 456-7890'
    }
  ]

  // Mock recent visitors for quick checkout (only checked-in visitors)
  const recentVisitors = mockVisitorDatabase.filter(visitor => visitor.status === 'checked-in')

  // Mock data - replace with actual API calls
  const mockVisitorData = {
    id: 'V001',
    name: 'John Doe',
    company: 'TechCorp Inc.',
    host: 'Sarah Johnson',
    checkinTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    purpose: 'Business Meeting',
    status: 'checked-in'
  }

  const handleSearch = async () => {
    if (!visitorId.trim()) {
      setValidationError('Please enter a Visitor ID')
      return
    }
    
    setLoading(true)
    setValidationError('')
    setSearchResults(null)
    
    try {
      // Clean and validate the input
      const cleanId = visitorId.trim().toUpperCase()
      
      // Validate ID format (V1234 or 1234)
      if (!cleanId.match(/^V\d{4}$/) && !cleanId.match(/^\d{3,4}$/)) {
        setValidationError('Invalid ID format. Please enter format: V1234 or 1234')
        setLoading(false)
        return
      }
      
      // Normalize ID to V1234 format
      const normalizedId = cleanId.startsWith('V') ? cleanId : `V${cleanId.padStart(4, '0')}`
      
      // Try to fetch visitor from API
      const visitorData = await apiService.getVisitor(normalizedId)
      
      if (!visitorData) {
        setValidationError(`No visitor found with ID: ${normalizedId}`)
        setLoading(false)
        return
      }
      
      // Check if visitor is already checked out
      if (visitorData.status === 'checked-out') {
        setValidationError(`Visitor ${visitorData.name} (${normalizedId}) has already been checked out`)
        setLoading(false)
        return
      }
      
      // Check if visitor is actually checked in
      if (visitorData.status !== 'checked-in') {
        setValidationError(`Visitor ${visitorData.name} (${normalizedId}) is not currently checked in (Status: ${visitorData.status})`)
        setLoading(false)
        return
      }
      
      // Valid visitor found
      setSearchResults(visitorData)
      setLoading(false)
      
    } catch (error) {
      console.error('Error fetching visitor:', error)
      
      // Handle different error types
      if (error.message.includes('404')) {
        setValidationError(`No visitor found with ID: ${normalizedId}. Make sure the visitor has checked in first.`)
        setLoading(false)
        return
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setValidationError('Unable to connect to server. Please check your connection or try again later.')
        setLoading(false)
        return
      }
      
      // Fallback to mock data if API fails
      console.log('API failed, falling back to mock data')
      
      // Clean and validate the input
      const cleanId = visitorId.trim().toUpperCase()
      
      // Validate ID format (V1234 or 1234)
      if (!cleanId.match(/^V\d{4}$/) && !cleanId.match(/^\d{3,4}$/)) {
        setValidationError('Invalid ID format. Please enter format: V1234 or 1234')
        setLoading(false)
        return
      }
      
      // Normalize ID to V1234 format
      const normalizedId = cleanId.startsWith('V') ? cleanId : `V${cleanId.padStart(4, '0')}`
      
      // Search in mock database as fallback
      const foundVisitor = mockVisitorDatabase.find(visitor => visitor.id === normalizedId)
      
      if (!foundVisitor) {
        setValidationError(`No visitor found with ID: ${normalizedId}. Please check the ID and try again, or try the fallback test IDs below.`)
        setLoading(false)
        return
      }
      
      // Check if visitor is already checked out
      if (foundVisitor.status === 'checked-out') {
        setValidationError(`Visitor ${foundVisitor.name} (${normalizedId}) has already been checked out`)
        setLoading(false)
        return
      }
      
      // Check if visitor is actually checked in
      if (foundVisitor.status !== 'checked-in') {
        setValidationError(`Visitor ${foundVisitor.name} (${normalizedId}) is not currently checked in (Status: ${foundVisitor.status})`)
        setLoading(false)
        return
      }
      
      // Valid visitor found
      setSearchResults(foundVisitor)
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!searchResults) return
    
    setCheckingOut(true)
    
    try {
      // Try to checkout using the API
      await apiService.checkOutVisitor(searchResults.id)
      setCheckingOut(false)
      setCheckoutComplete(true)
    } catch (error) {
      console.error('Error checking out visitor:', error)
      // For now, still complete the checkout even if API fails
      // In a real app, you might want to show an error or retry
      setCheckingOut(false)
      setCheckoutComplete(true)
    }
  }

  const formatDuration = (checkinTime) => {
    const duration = new Date() - new Date(checkinTime)
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (checkoutComplete) {
    return (
      <div className="min-h-screen bg-gray-900 flex">
        {/* Left Side - GVAS Logo */}
        <div className="w-1/2 relative overflow-hidden">
          <img 
            src="/images/gvasblack.jpg" 
            alt="GVAS Logo" 
            className="w-full h-screen object-cover"
          />
          
          {/* Powered by Hovidastechnologies - Below Logo */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center z-20">
            <div className="text-white text-sm drop-shadow-lg">
              Powered by{' '}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('https://hovidastechnologies.com', '_blank')}
                className="text-blue-300 hover:text-blue-200 underline font-semibold transition-colors"
              >
                Hovidastechnologies
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Side - Checkout Success */}
        <div className="w-1/2 bg-gray-50 flex flex-col justify-center items-center min-h-screen py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="h-12 w-12 text-green-600" />
              </motion.div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Checkout Complete!
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Thank you for visiting. Your checkout has been recorded successfully.
              </p>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visitor:</span>
                    <span className="font-medium text-gray-900">{searchResults?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visit Duration:</span>
                    <span className="font-medium text-gray-900">{formatDuration(searchResults?.check_in_time || searchResults?.checkinTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Checkout Time:</span>
                    <span className="font-medium text-gray-900">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/desk')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <span>Return to Desk</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Side - GVAS Logo */}
      <div className="w-1/2 relative overflow-hidden">
        <img 
          src="/images/gvasblack.jpg" 
          alt="GVAS Logo" 
          className="w-full h-screen object-cover"
        />
        
        {/* Powered by Hovidastechnologies - Below Logo */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center z-20">
          <div className="text-white text-sm drop-shadow-lg">
            Powered by{' '}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://hovidastechnologies.com', '_blank')}
              className="text-blue-300 hover:text-blue-200 underline font-semibold transition-colors"
            >
              Hovidastechnologies
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Side - Checkout Form */}
      <div className="w-1/2 bg-gray-50 flex flex-col min-h-screen">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(isAdminContext ? '/admin' : '/desk')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to {isAdminContext ? 'Admin Dashboard' : 'Desk'}</span>
            </motion.button>
            
            <div className="flex items-center space-x-3">
              {isAdminContext && (
                <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  <span>Admin Mode</span>
                </div>
              )}
              <GvasLogo variant="white" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isAdminContext ? 'Admin Checkout' : 'Guest Checkout'}
              </h1>
              <p className="text-gray-600">
                {isAdminContext 
                  ? 'Enter the visitor ID to verify and check out the guest'
                  : 'Enter your visitor ID to complete checkout'
                }
              </p>
            </div>

            {/* Checkout Method Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How would you like to checkout?</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCheckoutMethod('recent')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    checkoutMethod === 'recent' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Recent Visitors</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCheckoutMethod('id')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    checkoutMethod === 'id' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Search className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Visitor ID</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCheckoutMethod('qr')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    checkoutMethod === 'qr' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <QrCode className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">QR Code</span>
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {checkoutMethod === 'recent' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Select a visitor to checkout {isAdminContext ? '(Admin Verification)' : ''}:
                    </h4>
                    {recentVisitors.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No visitors currently checked in</p>
                      </div>
                    ) : (
                      recentVisitors.map((visitor) => (
                        <motion.button
                          key={visitor.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSearchResults(visitor)}
                          className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{visitor.name}</p>
                              <p className="text-sm text-gray-600">{visitor.company}</p>
                              <p className="text-xs text-gray-500">ID: {visitor.id}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Checked in</p>
                              <p className="text-xs text-gray-500">{visitor.checkinTime.toLocaleTimeString()}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-xs text-green-600">Active</span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </motion.div>
                )}

                {checkoutMethod === 'id' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Visitor ID
                      </label>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={visitorId}
                          onChange={(e) => {
                            setVisitorId(e.target.value)
                            setValidationError('')
                          }}
                          placeholder="e.g., V1234 or 1234"
                          className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationError ? 'border-red-300' : 'border-gray-300'
                          }`}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                      </div>
                      
                      {/* Test IDs Info */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <div className="text-sm text-green-700">
                            <strong>✅ Test Data Available:</strong> Database now has test visitors!
                            <br />
                            <strong>Available for checkout:</strong> V1234 (John Doe), V1235 (Jane Smith)
                            <br />
                            <strong>Already checked out:</strong> V1236 (Bob Johnson)
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSearch}
                          disabled={loading || !visitorId.trim()}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                          {loading ? (
                            <Loader className="h-5 w-5 animate-spin" />
                          ) : (
                            <Search className="h-5 w-5" />
                          )}
                          <span>Verify ID</span>
                        </motion.button>
                      </div>
                      
                      {/* Validation Error */}
                      {validationError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3"
                        >
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-700 text-sm font-medium">{validationError}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {checkoutMethod === 'qr' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center py-8"
                  >
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">QR Code scanner functionality coming soon</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                    Visitor Found
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{searchResults.name}</p>
                        <p className="text-sm text-gray-600">{searchResults.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Visiting: {searchResults.host}</p>
                        <p className="text-sm text-gray-600">Purpose: {searchResults.purpose}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Checked in: {new Date(searchResults.check_in_time || searchResults.checkinTime).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Duration: {formatDuration(searchResults.check_in_time || searchResults.checkinTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {checkingOut ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Processing Checkout...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-5 w-5" />
                        <span>Complete Checkout</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {searchResults === null && visitorId && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-6"
                >
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Visitor Not Found</h3>
                    <p className="text-gray-600 mb-4">
                      No active visitor found with ID "{visitorId}". Please check the ID and try again.
                    </p>
                    <p className="text-sm text-gray-500">
                      If you need assistance, please contact reception.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutFlow