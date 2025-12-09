import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Building2, UserPlus, Calendar as CalendarIcon, MapPin, Briefcase, Mail, Phone, User, Clock, CheckCircle, ChevronDown, Copy, Download, Check, RefreshCw, X } from 'lucide-react'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import ApiService from '../../services/api'
import GvasLogo from '../../components/GvasLogo'

const VisitorKiosk = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [hosts, setHosts] = useState([])
    const [success, setSuccess] = useState(false)
    const [guestCode, setGuestCode] = useState('')
    const [copied, setCopied] = useState(false)

    const initialFormState = {
        name: '',
        email: '',
        phone: '',
        company: '',
        purpose: '',
        host_id: '',
        floor_number: '',
        visit_date: new Date(),
        visit_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    }

    const [formData, setFormData] = useState(initialFormState)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        loadHosts()
    }, [])

    const loadHosts = async () => {
        try {
            const data = await ApiService.getHosts()
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
                throw new Error('The selected host could not be found.')
            }

            const visitorData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company || null,
                purpose: formData.purpose,
                host_id: formData.host_id,
                floor_number: formData.floor_number || selectedHost.floor_number || null,
                visit_date: formData.visit_date.toISOString().split('T')[0],
                visit_time: formData.visit_time || null,
                guest_code: generatedCode,
                visitor_id: crypto.randomUUID ? crypto.randomUUID() : `vis_${Date.now()}`,
                status: 'pending',
                host_name: selectedHost.name || selectedHost.full_name
            }

            await ApiService.createVisitor(visitorData)

            setGuestCode(generatedCode)
            setSuccess(true)

        } catch (error) {
            console.error('Registration failed:', error)
            setErrors({ submit: `Registration failed: ${error.message || 'Please try again.'}` })
        } finally {
            setLoading(false)
        }
    }

    const handleNextVisitor = () => {
        setSuccess(false)
        setGuestCode('')
        setCopied(false)
        setFormData({
            ...initialFormState,
            visit_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        })
        setErrors({})
        window.scrollTo(0, 0)
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
                        Your visit has been registered. Please save your guest code.
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-100 dark:border-slate-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-2">Guest Code</p>

                        <div className="flex items-center justify-center gap-3 mb-4">
                            <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-wider font-mono">
                                {guestCode}
                            </p>
                        </div>

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
                            Please take a photo of this code
                        </p>
                    </div>

                    <button
                        onClick={handleNextVisitor}
                        className="w-full px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={20} />
                        Register Next Visitor
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
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Visitor Registration Kiosk</h1>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm('Exit kiosk mode?')) {
                                navigate(-1)
                            }
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Exit Kiosk"
                    >
                        <X size={24} />
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
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Please enter your details to register</p>
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
                                        Register Check-In
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

export default VisitorKiosk
