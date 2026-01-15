import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Loader,
  ArrowLeft
} from 'lucide-react'
import GvasLogo from '../components/GvasLogo'

const Login = () => {
  const navigate = useNavigate()
  const authContext = useAuth()
  const { signIn } = authContext || {}
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!signIn) {
        throw new Error('Authentication service is not available. Please refresh the page.')
      }

      console.log('Attempting login for:', email)
      const result = await signIn(email, password)
      console.log('SignIn result received:', result.error ? 'Error' : 'Success')

      if (result.error) {
        console.error('Login error:', result.error)
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.user) {
        console.log('Login successful - User authenticated')
        console.log('User profile:', result.profile)
        console.log('Profile role:', result.profile?.role)
        console.log('Profile object keys:', result.profile ? Object.keys(result.profile) : 'no profile')

        // Redirect based on user role (with fallback)
        const roleRoutes = {
          admin: '/admin',
          reception: '/reception',
          host: '/approvals',
          security: '/security'
        }

        const userRole = result.profile?.role || 'reception' // Default to reception if no profile
        const targetRoute = roleRoutes[userRole] || '/reception'
        console.log('User role detected:', userRole)
        console.log('Redirecting to:', targetRoute, 'for role:', userRole)

        // Important: Set loading to false before navigation to prevent UI stuck
        setLoading(false)

        // Small delay to ensure state updates
        setTimeout(() => {
          navigate(targetRoute, { replace: true })
        }, 100)
      } else {
        console.error('Login succeeded but no user returned')
        setError('Login failed. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Unexpected login error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Demo credentials helper
  const demoCredentials = [
    { role: 'Admin', email: 'admin@uachouse.com', password: 'Admin123!' },
    { role: 'Reception', email: 'reception1@uachouse.com', password: 'Reception123!' },
    { role: 'Host', email: 'host.floor1@uachouse.com', password: 'Host123!' },
    { role: 'Security', email: 'security@uachouse.com', password: 'Security123!' }
  ]

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-blue-100/60 hover:text-white transition-colors z-20 group"
      >
        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/10">
          <ArrowLeft size={20} />
        </div>
        <span className="font-medium">Back to Homepage</span>
      </Link>

      <div className="w-full max-w-6xl flex gap-8 relative z-10">
        {/* Left Side - Login Form */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <div className="max-w-md mx-auto">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <GvasLogo variant="color" className="scale-150" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to GVAS
              </h1>
              <p className="text-gray-600">
                UAC House Visitor Management System
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start space-x-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Login Failed</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-900 focus:ring-2 focus:ring-slate-200 transition-all duration-200 outline-none"
                    placeholder="your.email@uachouse.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-900 focus:ring-2 focus:ring-slate-200 transition-all duration-200 outline-none"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Forgot Password */}
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-slate-700 hover:text-slate-900 text-sm font-medium"
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Demo Credentials */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10 text-white hidden lg:block"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Demo Access</h2>
            <p className="text-blue-100/80">
              Click any credential below to auto-fill the login form
            </p>
          </div>

          <div className="space-y-4">
            {demoCredentials.map((cred, index) => (
              <motion.button
                key={cred.role}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => fillDemo(cred.email, cred.password)}
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-left transition-all duration-200 border border-white/10 hover:border-white/30 disabled:opacity-50 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-lg mb-1 text-white group-hover:text-blue-300 transition-colors">{cred.role}</p>
                    <p className="text-blue-100/80 text-sm mb-2">{cred.email}</p>
                    <p className="text-blue-100/60 text-xs font-mono">{cred.password}</p>
                  </div>
                  <Shield className="h-6 w-6 text-blue-200 group-hover:text-blue-300 transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-blue-500/20">
            <p className="text-sm text-blue-100 mb-2">
              <strong>Access Levels:</strong>
            </p>
            <ul className="text-sm text-blue-200/80 space-y-1">
              <li>• <strong>Admin:</strong> Full system access</li>
              <li>• <strong>Reception:</strong> Check-in & badges</li>
              <li>• <strong>Host:</strong> Approve visitors</li>
              <li>• <strong>Security:</strong> Evacuation & blacklist</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
