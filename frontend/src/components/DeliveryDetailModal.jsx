import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, User, Building2, MapPin, Phone, CreditCard, Clock, Calendar, CheckCircle2 } from 'lucide-react'

const DeliveryDetailModal = ({ isOpen, onClose, delivery }) => {
    if (!delivery) return null;

    const details = [
        { label: 'Driver Name', value: delivery.name, icon: User },
        { label: 'Company', value: delivery.company, icon: Building2 },
        { label: 'Phone', value: delivery.phone || 'N/A', icon: Phone },
        { label: 'Address', value: delivery.driver_address || 'N/A', icon: MapPin },
        { label: 'Destination', value: delivery.host_name || (delivery.host ? (delivery.host.name || delivery.host.full_name) : 'Front Desk'), icon: Building2 },
        { label: 'Floor', value: `Floor ${delivery.floor_number || delivery.floor || 'N/A'}`, icon: MapPin },
        { label: 'Badge', value: delivery.badge_number ? `#${delivery.badge_number}` : 'No Badge Assigned', icon: CreditCard },
        { label: 'Purpose', value: delivery.purpose, icon: Package },
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div key="detail-modal-wrapper">
                        <motion.div
                            key="detail-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
                        />
                        <div className="fixed inset-0 z-[111] overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <motion.div
                                    key="detail-content"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                                >
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold dark:text-white">Delivery Details</h2>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`w-2 h-2 rounded-full ${delivery.status === 'checked_in' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{delivery.status?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                            <X size={20} className="text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        <div className="grid grid-cols-1 gap-4">
                                            {details.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                                        <item.icon size={16} className="text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                                                        <p className="text-sm text-gray-900 dark:text-white font-medium">{item.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                                    <Clock size={16} />
                                                    <span className="text-xs font-bold uppercase">Time In</span>
                                                </div>
                                                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                                                    {new Date(delivery.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-[10px] text-green-600/70">
                                                    {new Date(delivery.check_in_time).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                    <Clock size={16} />
                                                    <span className="text-xs font-bold uppercase">Time Out</span>
                                                </div>
                                                <p className="text-lg font-bold dark:text-white">
                                                    {delivery.check_out_time
                                                        ? new Date(delivery.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : '--:--'}
                                                </p>
                                                <p className="text-[10px] text-gray-500">
                                                    {delivery.check_out_time ? new Date(delivery.check_out_time).toLocaleDateString() : 'Active'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800">
                                        <button
                                            onClick={onClose}
                                            className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            Close Record
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </>
    );
};

export default DeliveryDetailModal;
