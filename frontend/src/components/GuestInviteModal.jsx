import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import ApiService from '../services/api';

const GuestInviteModal = ({ isOpen, onClose, hostName, hostId }) => {
    const [email, setEmail] = useState('');
    const [guestName, setGuestName] = useState('');
    const [personalMessage, setPersonalMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            // Construct registration link
            // Use window.location.origin to get base URL (e.g., http://localhost:5173)
            const baseUrl = window.location.origin;
            const registrationLink = `${baseUrl}/guest-register?host_id=${hostId}`;

            const response = await ApiService.inviteGuest({
                guestEmail: email,
                guestName,
                hostName,
                hostId,
                personalMessage,
                registrationLink
            });

            if (response.success) {
                setStatus('success');
                setMessage(response.mock ? 'Invitation simulated (check console)' : 'Invitation sent successfully!');
                setTimeout(() => {
                    if (response.mock && process.env.NODE_ENV === 'development') {
                        console.log('Mock email sent');
                    }
                    // Optional: close modal automatically after success?
                    // onClose();
                }, 2000);
            } else {
                throw new Error(response.error || 'Failed to send invitation');
            }
        } catch (error) {
            console.error('Invite error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to send invitation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset state on close
        setEmail('');
        setGuestName('');
        setPersonalMessage('');
        setStatus(null);
        setMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-800"
                >
                    {/* Header */}
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Mail size={18} />
                            Invite Guest
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {status === 'success' ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invitation Sent!</h4>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => {
                                            setStatus(null);
                                            setEmail('');
                                            setGuestName('');
                                            setPersonalMessage('');
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        Send Another
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Send an email invitation with a direct link for your guest to pre-register.
                                </p>

                                {status === 'error' && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                        <span>{message}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Guest Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="guest@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Personal Message (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={personalMessage}
                                        onChange={(e) => setPersonalMessage(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                        placeholder="Looking forward to our meeting..."
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Invite
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GuestInviteModal;
