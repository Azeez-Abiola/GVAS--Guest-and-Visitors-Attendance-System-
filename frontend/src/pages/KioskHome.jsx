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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <GvasLogo variant="white" className="mr-4" />
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Welcome
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Guest & Visitor Experience System
        </p>
        <div className="text-lg text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>{currentTime.toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Options */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full"
      >
        {/* Walk-in Option */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, rotateY: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/walk-in')}
          className="card cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <Users className="h-16 w-16 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
              Walk-In Guest
            </h2>
            <p className="text-gray-600 text-center text-lg">
              First time visitor? Start here to register and check in.
            </p>
            <div className="mt-6 text-center">
              <span className="inline-block px-6 py-2 bg-blue-50 rounded-full text-blue-600 text-sm">
                Quick Registration
              </span>
            </div>
          </div>
        </motion.div>

        {/* Pre-registered Option */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, rotateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/pre-registered')}
          className="card cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <QrCode className="h-16 w-16 text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 group-hover:text-yellow-700 transition-colors duration-300">
              Pre-Registered
            </h2>
            <p className="text-gray-600 text-center text-lg">
              Have a QR code or invitation? Express check-in here.
            </p>
            <div className="mt-6 text-center">
              <span className="inline-block px-6 py-2 bg-yellow-50 rounded-full text-yellow-600 text-sm">
                Fast Track Entry
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Admin Access */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-16"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/admin')}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-300 text-sm flex items-center space-x-2"
        >
          <span>Admin Dashboard</span>
          <span className="text-xs">→</span>
        </motion.button>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-xl animate-pulse-slow" />
      <div className="absolute top-1/2 left-20 w-16 h-16 bg-blue-300/10 rounded-full blur-xl animate-bounce-gentle" />
    </div>
  )
}

export default KioskHome