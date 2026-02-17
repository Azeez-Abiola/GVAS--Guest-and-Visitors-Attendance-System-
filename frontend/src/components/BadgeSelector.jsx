import { useState, useMemo } from 'react'
import { Search, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const BadgeSelector = ({ badges, value, onChange, label = "Select Badge", required = false }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const selectedBadge = badges.find(b => b.id === value)

    const filteredBadges = useMemo(() => {
        if (!searchQuery.trim()) return badges

        const query = searchQuery.toLowerCase()
        return badges.filter(badge =>
            badge.badge_number.toLowerCase().includes(query) ||
            badge.badge_type.toLowerCase().includes(query)
        )
    }, [badges, searchQuery])

    const getBadgeTypeColor = (type) => {
        const types = {
            visitor: 'bg-blue-500',
            contractor: 'bg-amber-500',
            vip: 'bg-indigo-500',
            delivery: 'bg-green-500'
        }
        return types[type.toLowerCase()] || 'bg-slate-500'
    }

    return (
        <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {label} {required && '*'}
            </label>

            {/* Selected Badge Display / Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-slate-400 dark:hover:border-slate-500 focus:border-slate-900 dark:focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all duration-200 text-left flex items-center justify-between group"
            >
                {selectedBadge ? (
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${getBadgeTypeColor(selectedBadge.badge_type)} flex items-center justify-center text-white shadow-md`}>
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Badge #{selectedBadge.badge_number}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{selectedBadge.badge_type} Badge</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                        <CreditCard className="w-5 h-5" />
                        <span>Select a badge to assign...</span>
                    </div>
                )}

                {/* Chevron */}
                <svg
                    className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[60]"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown Content */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-[70] mt-2 w-full bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-hidden"
                        >
                            {/* Search Bar */}
                            <div className="sticky top-0 bg-gray-50 dark:bg-slate-800 p-3 border-b border-gray-100 dark:border-slate-700">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search badges..."
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            {/* Badge List */}
                            <div className="overflow-y-auto max-h-60 custom-scrollbar">
                                {filteredBadges.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400">
                                        <p>No available badges found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 divide-y divide-gray-50 dark:divide-slate-800">
                                        {filteredBadges.map((badge) => (
                                            <button
                                                key={badge.id}
                                                type="button"
                                                onClick={() => {
                                                    onChange(badge.id)
                                                    setIsOpen(false)
                                                    setSearchQuery('')
                                                }}
                                                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${value === badge.id ? 'bg-slate-50 dark:bg-slate-800/80' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded ${getBadgeTypeColor(badge.badge_type)} flex items-center justify-center text-white text-xs`}>
                                                        <CreditCard size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">#{badge.badge_number}</div>
                                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{badge.badge_type}</div>
                                                    </div>
                                                </div>
                                                {value === badge.id && (
                                                    <CheckCircle2 size={18} className="text-slate-900 dark:text-white" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
        </div>
    )
}

export default BadgeSelector
