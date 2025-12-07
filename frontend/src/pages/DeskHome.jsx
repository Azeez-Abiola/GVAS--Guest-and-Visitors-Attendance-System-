import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, Clock, QrCode, UserMinus } from 'lucide-react'
import GvasLogo from '../components/GvasLogo'

const DeskHome = () => {
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
    <div className="min-h-screen bg-white flex">
      {/* Left Side - GVAS Logo */}
      <div className="w-1/2 relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-[#052e16]/90 z-10" />
        <img 
          src="/images/gvasblack.jpg" 
          alt="GVAS Logo" 
          className="w-full h-screen object-cover"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <GvasLogo variant="white" className="scale-150" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4">Welcome to UAC House</h2>
          <p className="text-xl text-emerald-100 max-w-md">
            Secure, efficient, and seamless visitor management system.
          </p>
        </div>
        
        {/* Powered by Hovidastechnologies - Below Logo */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center z-20 w-full">
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

      {/* Right Side - Visitor Flows */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col justify-center items-center min-h-screen py-12 px-6">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <GvasLogo variant="dark" className="scale-125" />
        </div>

        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome
          </h1>
          <p className="text-gray-500 text-lg">
            Please select your visitor type
          </p>
        </motion.div>

        {/* Visitor Flow Options */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 max-w-md w-full"
        >
            {/* Walk-in Option */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/walk-in')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer group relative overflow-hidden border border-gray-100 ring-1 ring-gray-100 transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className="bg-emerald-50 group-hover:bg-emerald-100 p-4 rounded-xl transition-colors duration-300">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                    Walk-In Guest
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    First time visitor? Start here.
                  </p>
                </div>
                <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                  →
                </div>
              </div>
            </motion.div>

            {/* Pre-registered Option */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pre-registered')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer group relative overflow-hidden border border-gray-100 ring-1 ring-gray-100 transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className="bg-[#052e16]/5 group-hover:bg-[#052e16]/10 p-4 rounded-xl transition-colors duration-300">
                  <QrCode className="h-8 w-8 text-[#052e16]" />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#052e16] transition-colors duration-300">
                    Preregistered Guest
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Have a QR code or invite?
                  </p>
                </div>
                <div className="text-[#052e16] opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                  →
                </div>
              </div>
            </motion.div>

            {/* Checkout Option */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/checkout')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer group relative overflow-hidden border border-gray-100 ring-1 ring-gray-100 transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className="bg-red-50 group-hover:bg-red-100 p-4 rounded-xl transition-colors duration-300">
                  <UserMinus className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-300">
                    Guest Checkout
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Leaving? Quick checkout.
                  </p>
                </div>
                <div className="text-red-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                  →
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-[#052e16] transition-colors duration-300 text-sm flex items-center space-x-2 font-medium"
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

export default DeskHome