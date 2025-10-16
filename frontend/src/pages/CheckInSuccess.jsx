import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Home, User, Clock, Building, Hash, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'

const CheckInSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState(false)
  
  const { visitorData, message } = location.state || {}

  // Generate a visitor ID (in real app, this would come from backend)
  const visitorId = `V${String(Math.floor(Math.random() * 9000) + 1000)}`
 
  const getCurrentTime = () => {
    return new Date().toLocaleString()
  }

  const copyVisitorId = () => {
    navigator.clipboard.writeText(visitorId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-1/2 relative overflow-hidden">
        <img 
          src="/images/gvasblack.jpg" 
          alt="GVAS Logo" 
          className="w-full h-screen object-cover"
        />
        
        {/* Success indicator at bottom */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-20">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <div className="text-gray-800 font-semibold">Check-in Complete</div>
        </div>
        
        {/* Powered by Hovidastechnologies - Below Logo */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
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

      {/* Right Content Area */}
      <div className="w-1/2 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="p-6 flex items-center justify-between">
            <div></div>
            
            <h2 className="text-xl font-semibold text-gray-800">Check-In Successful!</h2>
            
            <div className="text-gray-500">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-lg p-8 text-center space-y-8"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-4"
              >
                <h1 className="text-4xl font-bold text-green-600">
                  {message || 'Check-In Successful!'}
                </h1>
                <p className="text-gray-600 text-lg">
                  Welcome! Your visit has been registered successfully.
                </p>
              </motion.div>

              {/* Visitor ID Card - Prominent Display */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
              >
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Hash className="h-6 w-6" />
                    <span className="text-xl font-semibold">Your Visitor ID</span>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-3xl font-bold tracking-wider">{visitorId}</div>
                  </div>
                  <button
                    onClick={copyVisitorId}
                    className="inline-flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">{copiedId ? 'Copied!' : 'Copy ID'}</span>
                  </button>
                  <p className="text-blue-100 text-sm">
                    Keep this ID safe - you'll need it for checkout
                  </p>
                </div>
              </motion.div>

              {/* Visitor Details */}
              {visitorData && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="bg-gray-50 rounded-xl p-6 space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Visit Summary</h2>
                  
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-gray-600 text-sm">Visitor</p>
                        <p className="text-gray-900 font-medium">{visitorData.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-gray-600 text-sm">Host</p>
                        <p className="text-gray-900 font-medium">{visitorData.host}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-gray-600 text-sm">Check-in Time</p>
                        <p className="text-gray-900 font-medium">{getCurrentTime()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-yellow-400 rounded-full" />
                      <div>
                        <p className="text-gray-600 text-sm">Purpose</p>
                        <p className="text-gray-900 font-medium">{visitorData.purpose}</p>
                      </div>
                    </div>
                  </div>

                  {/* Visitor Photo */}
                  {visitorData.photo && (
                    <div className="flex justify-center mt-6">
                      <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-300 shadow-md">
                        <img 
                          src={visitorData.photo} 
                          alt="Visitor" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Instructions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="space-y-4"
              >
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Important Information</h3>
                  <div className="text-gray-700 text-sm space-y-2 text-left">
                    <p>• Your host has been notified of your arrival</p>
                    <p>• Please wait in the reception area until escorted</p>
                    <p>• <strong>Save your Visitor ID ({visitorId})</strong> - you'll need it for checkout</p>
                    <p>• When leaving, use the "Guest Checkout" option at any desk</p>
                    <p>• Keep your visitor information accessible for security</p>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="space-y-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/desk')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 w-full"
                >
                  <Home className="h-5 w-5" />
                  <span>Return to Desk</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin')}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors w-full"
                >
                  View Admin Dashboard
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckInSuccess