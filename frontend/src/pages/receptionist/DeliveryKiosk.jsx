import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, UserPlus, MapPin, Building2, Phone, User, CheckCircle, X, Truck, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import ApiService from '../../services/api'
import GvasLogo from '../../components/GvasLogo'
import HostSelector from '../../components/HostSelector'
import FloorSelector from '../../components/FloorSelector'
import BadgeSelector from '../../components/BadgeSelector'
import showToast from '../../utils/toast'

const DeliveryKiosk = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [hosts, setHosts] = useState([])
    const [availableBadges, setAvailableBadges] = useState([])
    const [success, setSuccess] = useState(false)

    const initialFormState = {
        name: '',
        email: '',
        phone: '',
        company: '',
        driver_address: '',
        host_id: '',
        floor: '',
        badge_id: '',
        purpose: 'Package Delivery',
        visitor_type: 'delivery',
        status: 'checked_in',
        check_in_time: new Date().toISOString()
    }

    const [formData, setFormData] = useState(initialFormState)

    useEffect(() => {
        loadInitialData()
    }, [])

    const loadInitialData = async () => {
        try {
            const [hostsData, badgesData] = await Promise.all([
                ApiService.getHosts(),
                ApiService.getAvailableBadges()
            ])
            setHosts(hostsData || [])
            setAvailableBadges((badgesData || []).filter(b => b.badge_type === 'delivery' || b.badge_type === 'visitor'))
        } catch (error) {
            console.error('Failed to load initial data:', error)
        }
    }

    const getFloorName = (number) => {
        if (number === 0 || number === '0') return 'Ground Floor';
        const n = parseInt(number);
        if (isNaN(n)) return number;
        const j = n % 10, k = n % 100;
        if (j === 1 && k !== 11) return n + "st Floor";
        if (j === 2 && k !== 12) return n + "nd Floor";
        if (j === 3 && k !== 13) return n + "rd Floor";
        return n + "th Floor";
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.company) {
            showToast('Please fill in required fields', 'error')
            return
        }

        setLoading(true)
        try {
            await ApiService.createVisitor(formData)
            setSuccess(true)
            showToast('Delivery recorded successfully!', 'success')
        } catch (error) {
            console.error('Failed to record delivery:', error)
            showToast('Failed to record delivery', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleNextDelivery = () => {
        setSuccess(false)
        setFormData({
            ...initialFormState,
            check_in_time: new Date().toISOString()
        })
        window.scrollTo(0, 0)
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
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} className="text-blue-600 dark:text-blue-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Delivery Recorded!
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        The delivery has been registered and the notification has been sent.
                    </p>

                    <button
                        onClick={handleNextDelivery}
                        className="w-full px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2"
                    >
                        <Truck size={20} />
                        Record Next Delivery
                    </button>

                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full mt-4 px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700"
                    >
                        Back to Dashboard
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
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Recording Kiosk</h1>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Record Delivery</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Quickly log incoming packages and couriers</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5 pb-2 border-b border-gray-100 dark:border-slate-800">
                                    <User size={20} className="text-blue-600 dark:text-blue-400" />
                                    Courier Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Driver Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={inputClasses}
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Company/Courier *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className={inputClasses}
                                            placeholder="e.g. FedEx, DHL"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className={inputClasses}
                                            placeholder="+234..."
                                        />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5 pb-2 border-b border-gray-100 dark:border-slate-800">
                                    <Package size={20} className="text-blue-600 dark:text-blue-400" />
                                    Delivery Destination
                                </h3>
                                <div className="space-y-6">
                                    <HostSelector
                                        hosts={hosts}
                                        value={formData.host_id}
                                        onChange={(hostId) => {
                                            const selectedHost = hosts.find(h => h.id === hostId);
                                            setFormData({
                                                ...formData,
                                                host_id: hostId,
                                                floor: (selectedHost?.floor_number !== undefined && selectedHost?.floor_number !== null) ? getFloorName(selectedHost.floor_number) : ''
                                            });
                                        }}
                                        label="Recipient Employee"
                                        required={false}
                                    />

                                    <FloorSelector
                                        value={formData.floor}
                                        onChange={(floor) => setFormData({ ...formData, floor })}
                                        label="Delivery Floor"
                                        required={false}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <BadgeSelector
                                            badges={availableBadges}
                                            value={formData.badge_id}
                                            onChange={(badgeId) => setFormData({ ...formData, badge_id: badgeId })}
                                            label="Assign Delivery Badge"
                                            required={false}
                                        />
                                        <div>
                                            <label className={labelClasses}>Purpose/Item Detail</label>
                                            <input
                                                type="text"
                                                value={formData.purpose}
                                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                                className={inputClasses}
                                                placeholder="e.g. Documents"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="px-8 py-6 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-gray-200 dark:border-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2 min-w-[180px]"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        Record Delivery
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

export default DeliveryKiosk
