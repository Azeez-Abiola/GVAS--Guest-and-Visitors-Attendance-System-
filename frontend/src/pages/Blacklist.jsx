import { useState, useEffect } from 'react'
import { Card, Title, Text, Badge, Flex, Grid } from '@tremor/react'
import { Shield, UserX, Search, AlertTriangle, Plus, X, Mail, Phone, CreditCard, Calendar, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import ApiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Blacklist = () => {
  const { profile } = useAuth()
  const [blacklist, setBlacklist] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id_number: '',
    reason: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getBlacklist()
      console.log('📋 Loaded blacklist:', data?.length || 0, 'entries')
      setBlacklist(data || [])
    } catch (error) {
      console.error('Failed to load blacklist:', error)
      showToast('Failed to load blacklist', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'info') => {
    // Simple toast notification
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
      }`
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const handleAddToBlacklist = async (e) => {
    e.preventDefault()
    try {
      await ApiService.addToBlacklist(formData, formData.reason)
      showToast('Successfully added to blacklist', 'success')
      setShowAddModal(false)
      setFormData({ name: '', email: '', phone: '', id_number: '', reason: '', notes: '' })
      await loadData()
    } catch (error) {
      console.error('Failed to add to blacklist:', error)
      showToast('Failed to add to blacklist', 'error')
    }
  }

  const handleRevoke = async (item) => {
    if (!confirm(`Are you sure you want to remove "${item.name}" from the blacklist?`)) {
      return
    }

    try {
      // Update the active status to false
      const { data, error } = await ApiService.supabase
        .from('blacklist')
        .update({ active: false })
        .eq('id', item.id)

      if (error) throw error

      showToast('Successfully removed from blacklist', 'success')
      await loadData()
    } catch (error) {
      console.error('Failed to revoke:', error)
      showToast('Failed to revoke from blacklist', 'error')
    }
  }

  const handleViewDetails = (item) => {
    setSelectedItem(item)
    setShowDetailsModal(true)
  }

  // Filter blacklist based on search
  const filteredBlacklist = blacklist.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blacklist Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage restricted visitors and security alerts</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <UserX size={18} />
            Add to Blacklist
          </button>
        </div>

        <Card className="rounded-2xl shadow-sm border-none ring-1 ring-gray-100 dark:ring-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blacklisted visitors..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield size={16} />
              <span>{filteredBlacklist.length} Restricted</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading blacklist...</p>
            </div>
          ) : filteredBlacklist.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
              <div className="bg-white dark:bg-slate-700 p-4 rounded-full shadow-sm inline-block mb-4">
                <Shield size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No matches found' : 'No Active Restrictions'}
              </h3>
              <p className="text-sm mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'There are currently no visitors on the blacklist. The facility is clear of known security threats.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlacklist.map((item) => (
                <div key={item.id} className="group p-4 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm border border-red-100 dark:border-red-900/30">
                      <UserX className="text-red-600 dark:text-red-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800">
                          High Risk
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Added on {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-start gap-2">
                        <AlertTriangle size={14} className="mt-0.5 text-red-500 dark:text-red-400 shrink-0" />
                        {item.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-14 md:pl-0">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRevoke(item)}
                      className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Add to Blacklist Modal */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add to Blacklist</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Restrict access for security purposes</p>
                      </div>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <form onSubmit={handleAddToBlacklist} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all outline-none"
                            placeholder="John Doe"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all outline-none"
                            placeholder="john@example.com"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all outline-none"
                            placeholder="+234 800 000 0000"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            ID Number (Passport/National ID)
                          </label>
                          <input
                            type="text"
                            value={formData.id_number}
                            onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all outline-none"
                            placeholder="A12345678"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Reason for Blacklisting <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all outline-none resize-none"
                          placeholder="e.g., Security threat, Previous incident, Unauthorized entry attempt..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Additional Notes
                        </label>
                        <textarea
                          rows={2}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all outline-none resize-none"
                          placeholder="Optional internal notes..."
                        />
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-lg shadow-red-600/20 transition-all transform active:scale-[0.98]"
                        >
                          Add to Blacklist
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedItem && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDetailsModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                          <UserX className="text-red-600 dark:text-red-400" size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedItem.name}</h2>
                          <p className="text-red-600 dark:text-red-400 text-sm font-medium">Blacklisted</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedItem.email && (
                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                              <p className="text-gray-900 dark:text-white font-medium">{selectedItem.email}</p>
                            </div>
                          </div>
                        )}

                        {selectedItem.phone && (
                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</p>
                              <p className="text-gray-900 dark:text-white font-medium">{selectedItem.phone}</p>
                            </div>
                          </div>
                        )}

                        {selectedItem.id_number && (
                          <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID Number</p>
                              <p className="text-gray-900 dark:text-white font-medium">{selectedItem.id_number}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Added</p>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(selectedItem.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">Reason for Blacklisting</p>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{selectedItem.reason}</p>
                          </div>
                        </div>
                      </div>

                      {selectedItem.notes && (
                        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                          <p className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Internal Notes</p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{selectedItem.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-slate-800 mt-6">
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false)
                          handleRevoke(selectedItem)
                        }}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Remove from Blacklist
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}

export default Blacklist
