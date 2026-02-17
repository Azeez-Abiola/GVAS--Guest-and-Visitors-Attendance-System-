import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, UserPlus, MapPin, Building2, Phone, CreditCard, User } from 'lucide-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import HostSelector from './HostSelector'
import FloorSelector from './FloorSelector'
import BadgeSelector from './BadgeSelector'
import ApiService from '../services/api'
import showToast from '../utils/toast'

const DeliveryFormModal = ({ isOpen, onClose, onSuccess, hosts, availableBadges }) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        driver_address: '',
        host_id: '',
        floor: '',
        badge_id: '',
        purpose: '', // Removed default value
        visitor_type: 'delivery',
        status: 'checked_in', // Deliveries are usually instant check-ins
        check_in_time: new Date().toISOString()
    })

    // Helper to format floor number to name
    const getFloorName = (number) => {
        if (number === 0) return 'Ground Floor';
        const j = number % 10, k = number % 100;
        if (j === 1 && k !== 11) return number + "st Floor";
        if (j === 2 && k !== 12) return number + "nd Floor";
        if (j === 3 && k !== 13) return number + "rd Floor";
        return number + "th Floor";
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        // If purpose is empty, use default hidden purpose for record keeping
        const finalPurpose = formData.purpose || 'Package Delivery';

        if (!formData.name) {
            showToast('Please fill in driver name', 'error')
            return
        }

        setLoading(true)
        try {
            await ApiService.createVisitor({ ...formData, purpose: finalPurpose })
            showToast('Delivery recorded successfully!', 'success')
            onSuccess()
            onClose()
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                driver_address: '',
                host_id: '',
                floor: '',
                badge_id: '',
                purpose: '',
                visitor_type: 'delivery',
                status: 'checked_in',
                check_in_time: new Date().toISOString()
            })
        } catch (error) {
            console.error('Failed to record delivery:', error)
            showToast('Failed to record delivery', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div key="delivery-modal-wrapper">
                        <motion.div
                            key="delivery-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                        />
                        <div className="fixed inset-0 z-[101] overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <motion.div
                                    key="delivery-modal-content"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
                                >
                                    <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center">
                                                <Package className="text-white dark:text-slate-900" size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record New Delivery</h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Enter courier and delivery details</p>
                                            </div>
                                        </div>
                                        <button onClick={onClose} type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                            <X size={20} className="text-gray-500" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                                        {/* Section 1: Driver Information */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                                                <User size={16} className="text-slate-400" />
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Driver Information</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Driver Full Name *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-slate-900 dark:focus:border-slate-500 outline-none transition-all"
                                                        placeholder="Full name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company/Courier *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.company}
                                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-slate-900 dark:focus:border-slate-500 outline-none transition-all"
                                                        placeholder="FedEx, DHL, Uber, etc."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-slate-900 dark:focus:border-slate-500 outline-none transition-all"
                                                        placeholder="+234..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Driver Address</label>
                                                    <input
                                                        type="text"
                                                        value={formData.driver_address}
                                                        onChange={(e) => setFormData({ ...formData, driver_address: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-slate-900 dark:focus:border-slate-500 outline-none transition-all"
                                                        placeholder="Courier office or residential address"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 2: Delivery Details */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                                                <Package size={16} className="text-slate-400" />
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Delivery Details</h3>
                                            </div>

                                            <div className="space-y-6">
                                                <HostSelector
                                                    hosts={hosts}
                                                    value={formData.host_id}
                                                    onChange={(hostId) => {
                                                        const selectedHost = hosts.find(h => h.id === hostId);
                                                        setFormData({
                                                            ...formData,
                                                            host_id: hostId,
                                                            floor: selectedHost?.floor_number !== undefined ? getFloorName(selectedHost.floor_number) : ''
                                                        });
                                                    }}
                                                    label="To Employee (Optional)"
                                                    required={false}
                                                />

                                                <FloorSelector
                                                    value={formData.floor}
                                                    onChange={(floor) => setFormData({ ...formData, floor })}
                                                    label="Destination Floor"
                                                    required={false}
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <BadgeSelector
                                                        badges={availableBadges.filter(b => b.badge_type === 'delivery' || b.badge_type === 'visitor')}
                                                        value={formData.badge_id}
                                                        onChange={(badgeId) => setFormData({ ...formData, badge_id: badgeId })}
                                                        label="Assign Delivery Badge"
                                                        required={false}
                                                    />

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purpose/Item Detail</label>
                                                        <input
                                                            type="text"
                                                            value={formData.purpose}
                                                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-slate-900 dark:focus:border-slate-500 outline-none transition-all"
                                                            placeholder="e.g. Package Delivery, Documents, Food"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-gray-200 dark:border-slate-700"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {loading ? 'Recording...' : (
                                                    <>
                                                        <UserPlus size={18} />
                                                        Record & Check-In
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
        </>
    )
}

export default DeliveryFormModal
