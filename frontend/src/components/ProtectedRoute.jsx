import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader } from 'lucide-react'

const ProtectedRoute = ({ children, requiredRole, feature }) => {
  const { loading, isAuthenticated, hasRole, canAccess, profile, user } = useAuth()

  console.log('ProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user?.email, 'profile:', profile?.role)

  // Show loading spinner while checking auth
  // This prevents redirecting to login during the initial session check
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-slate-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated AFTER loading is complete
  if (!loading && !isAuthenticated) {
    console.log('Not authenticated after loading complete, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    console.log('Access denied - Required role:', requiredRole, 'User role:', profile?.role)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Check feature-based access
  if (feature && !canAccess(feature)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            Your role doesn't have access to this feature.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // User is authenticated and has permission
  return children
}

export default ProtectedRoute
