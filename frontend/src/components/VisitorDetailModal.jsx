import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Building2, MapPin, Calendar, Clock, QrCode, Hash, CheckCircle, XCircle, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

const VisitorDetailModal = ({ visitor, isOpen, onClose, onRefresh, onEdit }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Auto-refresh when modal opens
  useEffect(() => {
    if (isOpen && onRefresh) {
      handleRefresh()
    }
  }, [isOpen])

  useEffect(() => {
    if (visitor?.guest_code) {
      generateQRCode(visitor.guest_code)
    }
  }, [visitor?.guest_code, visitor?.id]) // Re-generate when visitor changes

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const copyGuestCode = async () => {
    if (visitor?.guest_code) {
      try {
        await navigator.clipboard.writeText(visitor.guest_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  const generateQRCode = async (code) => {
    try {
      const url = await QRCode.toDataURL(code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertCircle, label: 'Pending Check-in' },
      'checked-in': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Checked In' },
      'checked-out': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Checked Out' },
      'pre-registered': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Calendar, label: 'Pre-registered' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Cancelled' }
    }
    const badge = badges[status] || badges['pending']
    const Icon = badge.icon
    
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${badge.bg} ${badge.text} font-semibold`}>
        <Icon className="w-5 h-5" />
        {badge.label}
      </div>
    )
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A'
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!visitor) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{visitor.name || visitor.full_name}</h2>
                        <p className="text-slate-200 mt-1">{visitor.company || 'No company'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
                        title="Refresh visitor data"
                      >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Visitor Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-slate-900" />
                          Visitor Information
                        </h3>
                        
                        <div className="space-y-4 bg-slate-50 rounded-xl p-6">
                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                              <p className="text-gray-900 font-medium">{visitor.email || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-slate-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                              <p className="text-gray-900 font-medium">{visitor.phone || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 text-slate-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</p>
                              <p className="text-gray-900 font-medium">{visitor.company || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-slate-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Host</p>
                              <p className="text-gray-900 font-medium">{visitor.host_name || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Floor</p>
                              <p className="text-gray-900 font-medium">Floor {visitor.floor_number || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Hash className="w-5 h-5 text-slate-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Badge Number</p>
                              <p className="text-gray-900 font-medium">
                                {visitor.badge_number ? `#${visitor.badge_number}` : 'Not Assigned'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-slate-900" />
                          Timeline
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-4">
                            <Calendar className="w-5 h-5 text-slate-600" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</p>
                              <p className="text-gray-900 font-medium">{formatDateTime(visitor.created_at)}</p>
                            </div>
                          </div>

                          {visitor.check_in_time && (
                            <div className="flex items-center gap-3 bg-green-50 rounded-lg p-4">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Check-in Time</p>
                                <p className="text-gray-900 font-medium">{formatDateTime(visitor.check_in_time)}</p>
                              </div>
                            </div>
                          )}

                          {visitor.check_out_time && (
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                              <XCircle className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Check-out Time</p>
                                <p className="text-gray-900 font-medium">{formatDateTime(visitor.check_out_time)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - QR Code & Guest Code */}
                    <div className="space-y-6">
                      {/* QR Code */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <QrCode className="w-5 h-5 text-slate-900" />
                          QR Code for Check-in
                        </h3>
                        
                        {qrCodeUrl ? (
                          <div className="bg-white rounded-xl p-6 shadow-sm">
                            <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto" />
                            <p className="text-center text-sm text-gray-500 mt-4">
                              Scan this code at reception to check in
                            </p>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-8 text-center">
                            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">QR code not available</p>
                            <p className="text-xs text-gray-400 mt-1">This visitor was created before QR codes were implemented</p>
                          </div>
                        )}
                      </div>

                      {/* Guest Code */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Hash className="w-5 h-5 text-blue-900" />
                          Guest Code
                        </h3>
                        
                        {visitor.guest_code ? (
                          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                            <div className="relative inline-block">
                              <div className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-mono text-3xl font-bold tracking-wider">
                                {visitor.guest_code}
                              </div>
                              <button
                                onClick={copyGuestCode}
                                className="absolute -top-2 -right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                                title="Copy guest code"
                              >
                                {copied ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                              {copied ? 'Code copied to clipboard!' : 'Share this code with reception for manual check-in'}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-8 text-center">
                            <Hash className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Guest code not available</p>
                            <p className="text-xs text-gray-400 mt-1">This visitor was created before guest codes were implemented</p>
                          </div>
                        )}
                      </div>

                      {/* Purpose */}
                      {visitor.purpose && (
                        <div className="bg-slate-50 rounded-xl p-6">
                          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Purpose of Visit</h3>
                          <p className="text-gray-900">{visitor.purpose}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-t border-slate-200">
                  <p className="text-sm text-gray-500">
                    Visitor ID: <span className="font-mono font-semibold text-gray-900">{visitor.visitor_id || visitor.id}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(visitor)
                          onClose()
                        }}
                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Visitor
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default VisitorDetailModal
