import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, UserPlus, CheckCircle } from 'lucide-react'

const NotificationListener = ({ userRole, floorNumber }) => {
  const [notifications, setNotifications] = useState([])
  const [showToast, setShowToast] = useState(null)

  useEffect(() => {
    // Only receptionists get visitor notifications
    if (userRole !== 'reception') return

    console.log('🔔 Setting up notification listener for floor:', floorNumber)

    // Subscribe to new visitors assigned to this floor
    const channel = supabase
      .channel('visitor-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visitors',
          filter: `floor_number=eq.${floorNumber}`
        },
        (payload) => {
          console.log('🆕 New visitor notification:', payload)
          
          const newVisitor = payload.new
          const notification = {
            id: Date.now(),
            type: 'new_visitor',
            title: 'New Visitor Assigned',
            message: `${newVisitor.name} from ${newVisitor.company || 'Unknown Company'} is coming to Floor ${floorNumber}`,
            visitor: newVisitor,
            timestamp: new Date().toISOString()
          }

          setNotifications(prev => [notification, ...prev])
          setShowToast(notification)

          // Auto-hide toast after 5 seconds
          setTimeout(() => {
            setShowToast(null)
          }, 5000)

          // Play notification sound (optional)
          playNotificationSound()
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      console.log('🔕 Removing notification listener')
      supabase.removeChannel(channel)
    }
  }, [userRole, floorNumber])

  // Subscribe to status changes (when visitor checks in)
  useEffect(() => {
    if (userRole !== 'reception') return

    const channel = supabase
      .channel('visitor-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'visitors',
          filter: `floor_number=eq.${floorNumber}`
        },
        (payload) => {
          const oldStatus = payload.old.status
          const newStatus = payload.new.status

          // Notify when visitor checks in
          if (oldStatus === 'pending' && newStatus === 'checked-in') {
            console.log('✅ Visitor checked in:', payload.new)
            
            const notification = {
              id: Date.now(),
              type: 'checked_in',
              title: 'Visitor Checked In',
              message: `${payload.new.name} has checked in on Floor ${floorNumber}`,
              visitor: payload.new,
              timestamp: new Date().toISOString()
            }

            setNotifications(prev => [notification, ...prev])
            setShowToast(notification)

            setTimeout(() => setShowToast(null), 5000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userRole, floorNumber])

  const playNotificationSound = () => {
    // Play a subtle notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVbHp66hVEApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZ')
      audio.volume = 0.3
      audio.play().catch(e => console.log('Could not play notification sound:', e))
    } catch (error) {
      console.log('Notification sound error:', error)
    }
  }

  const dismissToast = () => {
    setShowToast(null)
  }

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[100] max-w-md"
          >
            <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-900 p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                showToast.type === 'new_visitor' 
                  ? 'bg-blue-100' 
                  : 'bg-green-100'
              }`}>
                {showToast.type === 'new_visitor' ? (
                  <UserPlus className="w-5 h-5 text-blue-700" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-700" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{showToast.title}</h4>
                <p className="text-sm text-gray-600">{showToast.message}</p>
              </div>

              <button
                onClick={dismissToast}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Badge (could be used in navbar) */}
      {notifications.length > 0 && (
        <div className="hidden">
          {/* This can be exposed via a context to show badge count */}
          {notifications.length}
        </div>
      )}
    </>
  )
}

export default NotificationListener
