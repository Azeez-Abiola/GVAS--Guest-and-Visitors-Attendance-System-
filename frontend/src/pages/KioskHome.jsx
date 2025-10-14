import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, Clock, QrCode } from 'lucide-react'
import GvasLogo from '../components/GvasLogo'

const KioskHome = () => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
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
      </div>

      {/* Right Side - Visitor Flows */}
      <div className="w-1/2 bg-gray-50 flex flex-col justify-center items-center min-h-screen py-12">
        {/* Welcome Section with White GVAS Icon */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          {/* White GVAS Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="mb-8 flex justify-center"
          >
            <GvasLogo variant="white" className="scale-150" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome
          </h1>
          <p className="text-gray-600 text-xl">
            Please select your visitor type
          </p>
        </motion.div>

        {/* Visitor Flow Options */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl w-full px-8"
        >
            {/* Walk-in Option */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/walk-in')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl cursor-pointer group relative overflow-hidden border border-gray-200 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-blue-100 group-hover:bg-blue-200 p-4 rounded-full transition-colors duration-300">
                    <Users className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  Walk-In Guest
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  First time visitor? Start here to register and check in securely.
                </p>
                <div className="text-center">
                  <span className="inline-block px-4 py-2 bg-blue-600 group-hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors duration-300">
                    Start Registration →
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Pre-registered Option */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pre-registered')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl cursor-pointer group relative overflow-hidden border border-gray-200 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-green-100 group-hover:bg-green-200 p-4 rounded-full transition-colors duration-300">
                    <QrCode className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                  Pre-Registered
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Have a QR code or invitation? Express check-in for faster entry.
                </p>
                <div className="text-center">
                  <span className="inline-block px-4 py-2 bg-green-600 group-hover:bg-green-700 text-white rounded-full text-sm font-medium transition-colors duration-300">
                    Quick Check-In →
                  </span>
                </div>
              </div>
            </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="flex justify-center items-center space-x-8">
            <div className="text-sm text-gray-500">
              Powered by GVAS • Secure Visitor Management
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-blue-600 transition-colors duration-300 text-sm flex items-center space-x-2 font-medium"
            >
              <Building2 className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default KioskHome