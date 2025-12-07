import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Building2, UserPlus, Calendar as CalendarIcon, MapPin, Briefcase, Mail, Phone, User, Clock, CheckCircle, ChevronDown, Copy, Download, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import ApiService from '../services/api'
import GvasLogo from '../components/GvasLogo'

const GuestRegister = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [hosts, setHosts] = useState([])
  const [success, setSuccess] = useState(false)
  const [guestCode, setGuestCode] = useState('')
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
    host_id: '',
    floor_number: '',
    visit_date: new Date(),
    visit_time: '09:00'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadHosts()
  }, [])

  const loadHosts = async () => {
    try {
      const data = await ApiService.getHosts()
      console.log('Loaded hosts:', data)
      setHosts(data || [])
    } catch (error) {
      console.error('Failed to load hosts:', error)
      setHosts([])
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

      // Find selected host details
      const selectedHost = hosts.find(h => h.id === formData.host_id)

      if (!selectedHost) {
        throw new Error('Selected host not found')
      }

      const visitorData = {
        // Fields that exist in the Supabase visitors table
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || null,
        purpose: formData.purpose,
        host_id: formData.host_id,
        floor_number: formData.floor_number || null,
        visit_date: formData.visit_date.toISOString().split('T')[0],
        visit_time: formData.visit_time || null,
        guest_code: generatedCode,
        visitor_id: crypto.randomUUID ? crypto.randomUUID() : `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pre_registered',
        host_name: selectedHost.name || selectedHost.full_name
        // Note: tenant_id is handled by the API service
      }

      await ApiService.createVisitor(visitorData)

      setGuestCode(generatedCode)
      setSuccess(true)

      // TODO: Send email with guest code and QR code

    } catch (error) {
      console.error('Registration failed:', error)
      setErrors({ submit: `Registration failed: ${error.message || 'Please try again.'}` })
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

  const inputClasses = `
    w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800
    text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
    transition-all duration-200
  `

  const labelClasses = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1"

  // Copy guest code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(guestCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Download visit details as printable HTML
  const handleDownload = () => {
    const selectedHost = hosts.find(h => h.id === formData.host_id)
    const visitDate = formData.visit_date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Visit Pass - ${formData.name}</title>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"><\/script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', sans-serif; 
            background: #f8fafc; 
            padding: 40px;
            display: flex;
            justify-content: center;
          }
          .pass {
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            padding: 24px;
            text-align: center;
          }
          .header h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .header p { font-size: 13px; opacity: 0.8; }
          .content { padding: 24px; }
          .code-section {
            background: #f1f5f9;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          .code-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 1px; }
          .code { font-size: 32px; font-weight: 700; color: #0f172a; font-family: monospace; letter-spacing: 4px; margin: 8px 0; }
          #qrcode { display: flex; justify-content: center; margin: 16px 0; }
          #qrcode canvas { border-radius: 8px; }
          .details { border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #64748b; font-size: 13px; }
          .detail-value { color: #0f172a; font-weight: 500; font-size: 13px; }
          .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; }
          .print-btn {
            display: block;
            width: calc(100% - 48px);
            margin: 0 24px 24px;
            padding: 12px;
            background: #0f172a;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }
          .print-btn:hover { background: #1e293b; }
          @media print {
            body { padding: 0; background: white; }
            .print-btn { display: none; }
            .pass { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="pass">
          <div class="header">
            <h1>🏢 UAC House</h1>
            <p>Visitor Pass</p>
          </div>
          <div class="content">
            <div class="code-section">
              <p class="code-label">Guest Code</p>
              <p class="code">${guestCode}</p>
              <div id="qrcode"></div>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Present this code at reception</p>
            </div>
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Visitor Name</span>
                <span class="detail-value">${formData.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Company</span>
                <span class="detail-value">${formData.company || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Host</span>
                <span class="detail-value">${selectedHost?.name || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Visit Date</span>
                <span class="detail-value">${visitDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Expected Time</span>
                <span class="detail-value">${formData.visit_time || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Purpose</span>
                <span class="detail-value">${formData.purpose}</span>
              </div>
            </div>
          </div>
          <button class="print-btn" onclick="window.print()">🖨️ Print Pass</button>
          <div class="footer">
            Please keep this pass for your records. Valid for the scheduled visit date only.
          </div>
        </div>
        <script>
          new QRCode(document.getElementById("qrcode"), {
            text: "${guestCode}",
            width: 120,
            height: 120,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });
        <\/script>
      </body>
      </html>
    `

    const newWindow = window.open('', '_blank')
    newWindow.document.write(printContent)
    newWindow.document.close()
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Registration Successful!
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your visit has been pre-registered. Please save your guest code.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-2">Guest Code</p>

            {/* Guest Code with Copy Button */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-wider font-mono">
                {guestCode}
              </p>
              <button
                onClick={handleCopyCode}
                className={`p-2 rounded-lg transition-all ${copied
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                title={copied ? 'Copied!' : 'Copy code'}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>

            {/* QR Code */}
            <div className="flex justify-center my-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <QRCodeSVG
                  value={guestCode}
                  size={150}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Present this code or scan the QR at reception upon arrival
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-5 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <CalendarIcon size={16} /> Visit Details
            </p>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex justify-between">
                <span className="text-blue-600 dark:text-blue-400">Name:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 dark:text-blue-400">Host:</span>
                <span className="font-medium">{hosts.find(h => h.id === formData.host_id)?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 dark:text-blue-400">Date:</span>
                <span className="font-medium">{formData.visit_date.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 dark:text-blue-400">Time:</span>
                <span className="font-medium">{formData.visit_time}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
            >
              <Download size={18} />
              Download Pass
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium shadow-lg shadow-slate-900/10"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GvasLogo className="w-8 h-8" />
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Guest Registration</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome to UAC House</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Please verify your identity and visit details</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Personal Information */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5 pb-2 border-b border-gray-100 dark:border-slate-800">
                  <User size={20} className="text-blue-600 dark:text-blue-400" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClasses}
                      placeholder="e.g. Sarah Williams"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                  </div>

                  <div>
                    <label className={labelClasses}>Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClasses}
                      placeholder="sarah@company.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                  </div>

                  <div>
                    <label className={labelClasses}>Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClasses}
                      placeholder="+234..."
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              {/* Visit Information */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5 pb-2 border-b border-gray-100 dark:border-slate-800">
                  <Briefcase size={20} className="text-blue-600 dark:text-blue-400" />
                  Visit Information
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className={labelClasses}>Company / Organization *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={inputClasses}
                      placeholder="Where are you visiting from?"
                    />
                    {errors.company && <p className="text-red-500 text-xs mt-1 font-medium">{errors.company}</p>}
                  </div>

                  <div>
                    <label className={labelClasses}>Purpose of Visit *</label>
                    <textarea
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      rows={3}
                      className={inputClasses}
                      placeholder="Briefly describe the purpose of your visit..."
                    />
                    {errors.purpose && <p className="text-red-500 text-xs mt-1 font-medium">{errors.purpose}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>Who are you visiting? *</label>
                      <div className="relative">
                        <select
                          value={formData.host_id}
                          onChange={(e) => handleHostChange(e.target.value)}
                          className={`${inputClasses} appearance-none cursor-pointer`}
                        >
                          <option value="">Select a host</option>
                          {hosts.map(host => (
                            <option key={host.id} value={host.id}>
                              {host.name || host.full_name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 navbar-none pointer-events-none" size={20} />
                      </div>
                      {errors.host_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.host_id}</p>}
                    </div>

                    {formData.host_id && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-4 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Destination</span>
                        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-medium">
                          <MapPin size={18} />
                          {formData.floor_number ? getFloorName(formData.floor_number) : 'Floor check required'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visit Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>Visit Date *</label>
                      <div className="relative">
                        <DatePicker
                          selected={formData.visit_date}
                          onChange={(date) => setFormData({ ...formData, visit_date: date })}
                          minDate={new Date()}
                          className={inputClasses}
                          wrapperClassName="w-full"
                          dateFormat="MMMM d, yyyy"
                        />
                        <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" size={20} />
                      </div>
                      {errors.visit_date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.visit_date}</p>}
                    </div>

                    <div>
                      <label className={labelClasses}>Expected Time</label>
                      <div className="relative">
                        <input
                          type="time"
                          value={formData.visit_time}
                          onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            </div>

            <div className="px-8 py-6 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left max-w-md">
                By submitting this form, you acknowledge that your visit details will be recorded for security and compliance purposes.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-[#070f2b] text-white rounded-xl hover:bg-[#070f2b]/90 transition-all font-semibold shadow-lg shadow-[#070f2b]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Registration
                    <CheckCircle size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default GuestRegister
