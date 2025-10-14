import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import KioskHome from './pages/KioskHome'
import WalkInForm from './pages/WalkInForm'
import PreRegisteredFlow from './pages/PreRegisteredFlow'
import AdminDashboard from './pages/AdminDashboard'
import CheckInSuccess from './pages/CheckInSuccess'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/kiosk" element={<KioskHome />} />
            <Route path="/walk-in" element={<WalkInForm />} />
            <Route path="/pre-registered" element={<PreRegisteredFlow />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/success" element={<CheckInSuccess />} />
          </Routes>
        </motion.div>
      </div>
    </Router>
  )
}

export default App