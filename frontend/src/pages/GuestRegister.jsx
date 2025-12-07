import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, UserPlus, Calendar, MapPin, Briefcase, Mail, Phone, User, Clock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import ApiService from '../services/api'
import GvasLogo from '../components/GvasLogo'

const GuestRegister = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [hosts, setHosts] = useState([])
  const [success, setSuccess] = useState(false)
  const [guestCode, setGuestCode] = useState('')
  
  const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  company: '',
  purpose: '',
  host_id: '',
  floor_number: '',
  visit_date: new Date().toISOString().split('T')[0],
  visit_time: '09:00',
  duration: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadHosts()
  }, [])

  const loadHosts = async () => {
    try {
      const data = await ApiService.getHosts()
      setHosts(data)
    } catch (error) {
      console.error('Failed to load hosts:', error)
    }
  }

  const handleHostChange = (hostId) => {
    const selectedHost = hosts.find(h => h.id === hostId)
    setFormData({
      ...formData,
      host_id: hostId,
      floor_number: selectedHost?.floor_number || ''
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }
    if (!formData.company.trim()) newErrors.company = 'Company is required'
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose of visit is required'
    if (!formData.host_id) newErrors.host_id = 'Please select a host'
    if (!formData.visit_date) newErrors.visit_date = 'Visit date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      // Generate 6-digit guest code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      const visitorData = {
        ...formData,
        guest_code: generatedCode,
        status: 'pre_registered',
        check_in_time: null,
        check_out_time: null,
        badge_number: null
      }

      await ApiService.createVisitor(visitorData)
      
      setGuestCode(generatedCode)
      setSuccess(true)

      // TODO: Send email with guest code and QR code
      
    } catch (error) {
      console.error('Registration failed:', error)
      setErrors({ submit: 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const getFloorName = (floorNum) => {
    if (floorNum === 0) return 'Ground Floor'
    if (floorNum === 1) return '1st Floor'
    if (floorNum === 2) return '2nd Floor'
    if (floorNum === 3) return '3rd Floor'
    return `${floorNum}th Floor`
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your visit has been pre-registered. Please save your guest code.
          </p>

          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Guest Code</p>
            <p className="text-4xl font-bold text-slate-900 tracking-wider">
              {guestCode}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Show this code to the receptionist when you arrive
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-blue-900 mb-2">Visit Details:</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Floor:</strong> {getFloorName(formData.floor_number)}</p>
              <p><strong>Date:</strong> {new Date(formData.visit_date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {formData.visit_time}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GvasLogo className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-white">Guest Registration</h1>
              <p className="text-xs text-white/70">Pre-register your visit</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <UserPlus size={24} className="text-slate-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Visitor Pre-Registration</h2>
              <p className="text-sm text-gray-600">Fill in your details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User size={18} />
                Personal Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+234 123 456 7890"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Visit Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase size={18} />
                Visit Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company/Organization *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.company ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ABC Corporation"
                />
                {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Visit *
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none ${
                    errors.purpose ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Business meeting, Interview, Delivery, etc."
                />
                {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Person to Visit (Host) *
                </label>
                <select
                  value={formData.host_id}
                  onChange={(e) => handleHostChange(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.host_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a host</option>
                  {hosts.map(host => (
                    <option key={host.id} value={host.id}>
                      {host.full_name}
                    </option>
                  ))}
                </select>
                {errors.host_id && <p className="text-red-500 text-xs mt-1">{errors.host_id}</p>}
              </div>

              {formData.floor_number !== '' && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin size={18} />
                    <span className="font-medium">Floor: {getFloorName(formData.floor_number)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Date *
                  </label>
                  <input
                    type="date"
                    value={formData.visit_date}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                      errors.visit_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.visit_date && <p className="text-red-500 text-xs mt-1">{errors.visit_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Time
                  </label>
                  <input
                    type="time"
                    value={formData.visit_time}
                    onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="">Select duration</option>
                    <option value="30min">30 minutes</option>
                    <option value="1hour">1 hour</option>
                    <option value="2hours">2 hours</option>
                    <option value="half-day">Half day (4 hours)</option>
                    <option value="full-day">Full day (8 hours)</option>
                  </select>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Register Visit
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By submitting this form, you agree to the visitor policies and data protection terms.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default GuestRegister
