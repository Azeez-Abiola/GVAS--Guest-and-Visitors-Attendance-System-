import { useState, useMemo } from 'react'
import { Search, Building2, Users, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const HostSelector = ({ hosts, value, onChange, label = "Select Host" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  console.log('🎯 HostSelector rendered with', hosts.length, 'hosts, selected value:', value)
  
  const selectedHost = hosts.find(h => h.id === value)

  const filteredHosts = useMemo(() => {
    if (!searchQuery.trim()) return hosts

    const query = searchQuery.toLowerCase()
    return hosts.filter(host => 
      host.name.toLowerCase().includes(query) ||
      host.tenant?.name?.toLowerCase().includes(query) ||
      `floor ${host.floor_number}`.includes(query)
    )
  }, [hosts, searchQuery])

  // Group hosts by floor
  const hostsByFloor = useMemo(() => {
    const grouped = {}
    filteredHosts.forEach(host => {
      const floor = host.floor_number
      if (!grouped[floor]) grouped[floor] = []
      grouped[floor].push(host)
    })
    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b))
  }, [filteredHosts])

  const getFloorColor = (floor) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-rose-500',
      'bg-amber-500', 'bg-emerald-500', 'bg-violet-500', 'bg-fuchsia-500'
    ]
    return colors[(floor - 1) % colors.length]
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} *
      </label>

      {/* Selected Host Display / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all duration-200 text-left flex items-center justify-between group"
      >
        {selectedHost ? (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {getInitials(selectedHost.name)}
            </div>
            
            {/* Host Info */}
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{selectedHost.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-medium ${getFloorColor(selectedHost.floor_number)}`}>
                  <MapPin className="w-3 h-3" />
                  Floor {selectedHost.floor_number}
                </span>
                <span className="text-gray-400">•</span>
                <Building2 className="w-3 h-3" />
                {selectedHost.tenant?.name || 'No Company'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-400">
            <Users className="w-5 h-5" />
            <span>Choose a host...</span>
          </div>
        )}

        {/* Chevron */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-hidden"
            >
              {/* Search Bar */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-gray-50 p-4 border-b-2 border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, company, or floor..."
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none transition-all bg-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Host List */}
              <div className="overflow-y-auto max-h-80 custom-scrollbar">
                {hostsByFloor.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hosts found</p>
                  </div>
                ) : (
                  hostsByFloor.map(([floor, floorHosts]) => (
                    <div key={floor} className="border-b border-gray-100 last:border-b-0">
                      {/* Floor Header */}
                      <div className="sticky top-0 bg-gray-50 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold ${getFloorColor(Number(floor))}`}>
                          <MapPin className="w-3.5 h-3.5" />
                          Floor {floor}
                        </span>
                        <span className="text-xs text-gray-500">
                          {floorHosts.length} {floorHosts.length === 1 ? 'host' : 'hosts'}
                        </span>
                      </div>

                      {/* Hosts in this floor */}
                      {floorHosts.map((host) => (
                        <motion.button
                          key={host.id}
                          type="button"
                          whileHover={{ backgroundColor: 'rgb(248, 250, 252)' }}
                          onClick={() => {
                            onChange(host.id)
                            setIsOpen(false)
                            setSearchQuery('')
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-150 border-l-4 ${
                            value === host.id
                              ? 'border-slate-900 bg-slate-50'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                            value === host.id
                              ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                              : 'bg-gradient-to-br from-gray-400 to-gray-600'
                          }`}>
                            {getInitials(host.name)}
                          </div>

                          {/* Host Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {host.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{host.tenant?.name || 'No Company'}</span>
                              {host.office_number && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span>Office {host.office_number}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Selected Indicator */}
                          {value === host.id && (
                            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default HostSelector
