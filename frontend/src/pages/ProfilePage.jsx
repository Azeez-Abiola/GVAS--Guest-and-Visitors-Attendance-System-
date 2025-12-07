import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Shield, 
  Building2, 
  Key, 
  Eye, 
  EyeOff,
  Save,
  MapPin
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import ApiService from '../services/api'
import showToast from '../utils/toast'

const ProfilePage = () => {
  const { profile, user } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    // Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      showToast('Please fill in all password fields', 'error')
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }

    if (passwords.newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error')
      return
    }

    try {
      setLoading(true)

      // First verify current password by trying to sign in
      const { error: signInError } = await ApiService.supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.currentPassword
      })

      if (signInError) {
        showToast('Current password is incorrect', 'error')
        setLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await ApiService.supabase.auth.updateUser({
        password: passwords.newPassword
      })

      if (updateError) throw updateError

      showToast('Password updated successfully!', 'success')
      
      // Reset form
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Password update failed:', error)
      showToast(`Failed to update password: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'reception':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'security':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'host':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFloorName = (floor) => {
    if (typeof floor === 'number') {
      if (floor === 0) return 'Ground Floor'
      if (floor === 1) return '1st Floor'
      if (floor === 2) return '2nd Floor'
      if (floor === 3) return '3rd Floor'
      return `${floor}th Floor`
    }
    return floor
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information and settings</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit"
          >
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-4">
                <User className="h-12 w-12 text-slate-900" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile?.full_name || 'User'}</h2>
                <p className="text-slate-200 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile?.email || user?.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Role */}
            <div className="flex items-start gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Role</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(profile?.role)}`}>
                    {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Building2 className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="mt-1 text-gray-900 font-mono text-sm break-all">{profile?.id || 'N/A'}</p>
              </div>
            </div>

            {/* Assigned Floors (for reception role) */}
            {profile?.role === 'reception' && profile?.assigned_floors && profile.assigned_floors.length > 0 && (
              <div className="flex items-start gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Assigned Floors</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.assigned_floors.map((floor, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-slate-900 text-white"
                      >
                        {getFloorName(floor)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Account Created */}
            <div className="flex items-start gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Building2 className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="mt-1 text-gray-900">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Password Change Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-100 p-3 rounded-lg">
              <Key className="h-5 w-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 pr-10"
                  placeholder="Enter current password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 pr-10"
                  placeholder="Enter new password (min. 8 characters)"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 pr-10"
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-900 mb-2">Password Requirements:</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Include at least one number</li>
              </ul>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Updating Password...' : 'Update Password'}
            </motion.button>
          </form>
        </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
