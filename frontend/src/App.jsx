import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import DeskHome from './pages/DeskHome'
import WalkInForm from './pages/WalkInForm'
import PreRegisteredFlow from './pages/PreRegisteredFlow'
import AdminDashboard from './pages/AdminDashboard'
import ReceptionDashboard from './pages/ReceptionDashboard'
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard'
import ApprovalsDashboard from './pages/ApprovalsDashboard'
import SecurityDashboard from './pages/SecurityDashboard'
import CheckInSuccess from './pages/CheckInSuccess'
import CheckoutFlow from './pages/CheckoutFlow'
import BadgeManagement from './pages/BadgeManagement'
import EvacuationDashboard from './pages/EvacuationDashboard'
import Blacklist from './pages/Blacklist'
import Settings from './pages/Settings'
import SystemSettings from './pages/admin/SystemSettings'
import UserManagement from './pages/admin/UserManagement'
import AuditLogs from './pages/admin/AuditLogs'
import ReportsAnalytics from './pages/admin/ReportsAnalytics'
import PricingPlans from './pages/admin/PricingPlans'
import PublicPricing from './pages/PublicPricing'
import PreRegistrationPortal from './pages/PreRegistrationPortal'
import ProfilePage from './pages/ProfilePage'
import ReceptionAnalytics from './pages/ReceptionAnalytics'
import GuestRegister from './pages/GuestRegister'
import HostAnalytics from './pages/host/HostAnalytics'
import BadgeManagementHost from './pages/host/BadgeManagement'
import VisitorKiosk from './pages/receptionist/VisitorKiosk'
import AdminVisitorPage from './pages/admin/AdminVisitorPage'
import Resources from './pages/Resources'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import ClientManagement from './pages/superadmin/ClientManagement'
import Transactions from './pages/superadmin/Transactions'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/guest-register" element={<GuestRegister />} />
              <Route path="/desk" element={<DeskHome />} />
              <Route path="/kiosk" element={<DeskHome />} /> {/* Legacy route */}
              <Route path="/walk-in" element={<WalkInForm />} />
              <Route path="/pre-registered" element={<PreRegisteredFlow />} />
              <Route path="/pre-registration" element={<PreRegistrationPortal />} />
              <Route path="/checkout" element={<CheckoutFlow />} />
              <Route path="/success" element={<CheckInSuccess />} />
              <Route path="/pricing" element={<PublicPricing />} />
              <Route path="/resources" element={<Resources />} />

              {/* Protected Routes - Role-based Dashboards */}
              <Route
                path="/admin/visitor-registration"
                element={
                  <ProtectedRoute>
                    <AdminVisitorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reception"
                element={
                  <ProtectedRoute feature="reception">
                    <ReceptionDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receptionist"
                element={
                  <ProtectedRoute requiredRole="reception">
                    <ReceptionistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reception/visitor-kiosk"
                element={
                  <ProtectedRoute requiredRole="reception">
                    <VisitorKiosk />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute feature="approvals">
                    <ApprovalsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/security"
                element={
                  <ProtectedRoute requiredRole="security">
                    <SecurityDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Feature-specific Routes */}
              <Route
                path="/badges"
                element={
                  <ProtectedRoute feature="badges">
                    <BadgeManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evacuation"
                element={
                  <ProtectedRoute feature="evacuation">
                    <EvacuationDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blacklist"
                element={
                  <ProtectedRoute feature="blacklist">
                    <Blacklist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute feature="settings">
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system-settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <SystemSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-management"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports-analytics"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ReportsAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pricing"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <PricingPlans />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Routes */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/organizations"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <ClientManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/transactions"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reception-analytics"
                element={
                  <ProtectedRoute requiredRole="reception">
                    <ReceptionAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/host/host-analytics"
                element={
                  <ProtectedRoute feature="host-analytics">
                    <HostAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/host/badge-management"
                element={
                  <ProtectedRoute feature="host-badges">
                    <BadgeManagementHost />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </motion.div>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App