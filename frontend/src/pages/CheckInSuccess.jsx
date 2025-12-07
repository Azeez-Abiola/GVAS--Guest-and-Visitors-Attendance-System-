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
      <div className="w-1/2 relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-[#052e16]/90 z-10"></div>
        <img 
          src="/images/gvasblack.jpg" 
          alt="GVAS Logo" 
          className="w-full h-screen object-cover"
        />
        
        {/* Success indicator at bottom */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-20 w-full px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/20"
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Check-in Complete</h2>
          <p className="text-emerald-100 text-lg">Thank you for visiting</p>
        </div>
        
        {/* Powered by Hovidastechnologies - Below Logo */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
          <div className="text-white/60 text-sm">
            Powered by{' '}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://hovidastechnologies.com', '_blank')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Hovidastechnologies
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <div className="p-6 flex items-center justify-between">
            <div className="lg:hidden">
              <span className="text-[#052e16] font-bold text-xl">GVAS</span>
            </div>
            
            <div className="hidden lg:block"></div>
            
            <div className="text-gray-500 font-medium bg-gray-100 px-4 py-2 rounded-full text-sm">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center space-y-8"
            >
              {/* Mobile Success Icon */}
              <div className="lg:hidden flex justify-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
              </div>

              {/* Success Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <h1 className="text-3xl font-bold text-[#052e16]">
                  {message || 'Check-In Successful!'}
                </h1>
                <p className="text-gray-600">
                  Welcome! Your visit has been registered successfully.
                </p>
              </motion.div>

              {/* Visitor ID Card - Prominent Display */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-[#052e16] rounded-2xl p-6 text-white shadow-lg shadow-emerald-900/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
                
                <div className="relative z-10 text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-emerald-200">
                    <Hash className="h-5 w-5" />
                    <span className="font-medium uppercase tracking-wider text-sm">Your Visitor ID</span>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-4xl font-bold tracking-widest font-mono">{visitorId}</div>
                  </div>
                  
                  <button
                    onClick={copyVisitorId}
                    className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    <Copy className="h-4 w-4" />
                    <span>{copiedId ? 'Copied to clipboard' : 'Copy ID'}</span>
                  </button>
                  
                  <p className="text-emerald-200/80 text-xs">
                    Please keep this ID safe for checkout
                  </p>
                </div>
              </motion.div>

              {/* Visitor Details */}
              {visitorData && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-emerald-600" />
                    Visit Summary
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-500 text-xs mb-1">Visitor Name</p>
                      <p className="text-gray-900 font-medium">{visitorData.name}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-500 text-xs mb-1">Host</p>
                      <p className="text-gray-900 font-medium">{visitorData.host}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-500 text-xs mb-1">Check-in Time</p>
                      <p className="text-gray-900 font-medium">{getCurrentTime()}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-500 text-xs mb-1">Purpose</p>
                      <p className="text-gray-900 font-medium">{visitorData.purpose}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Instructions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-emerald-50/50 rounded-2xl p-6 text-left border border-emerald-100"
              >
                <h3 className="font-semibold text-[#052e16] mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
                  Next Steps
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Your host has been notified of your arrival
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Please wait in the reception area until escorted
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Use your Visitor ID <strong>{visitorId}</strong> for checkout
                  </li>
                </ul>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-3 pt-2"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/desk')}
                  className="w-full bg-[#052e16] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#0a4f26] transition-all shadow-lg shadow-emerald-900/10 flex items-center justify-center space-x-2"
                >
                  <Home className="h-5 w-5" />
                  <span>Return to Desk</span>
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