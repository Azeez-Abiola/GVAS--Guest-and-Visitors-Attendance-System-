import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { CheckCircle, X, User, CreditCard } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BadgeSelector from '../../components/BadgeSelector';
import "react-datepicker/dist/react-datepicker.css";

const AdminVisitorPage = () => {
    const navigate = useNavigate();
    const [hosts, setHosts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        purpose: '',
        host_id: '',
        floor_number: '',
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        badge_id: '',
    });
    const [availableBadges, setAvailableBadges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadHosts();
        loadBadges();
    }, []);

    const loadBadges = async () => {
        try {
            const data = await ApiService.getAvailableBadges();
            setAvailableBadges(data || []);
        } catch (error) {
            console.error('Failed to load badges:', error);
        }
    };

    const loadHosts = async () => {
        try {
            const data = await ApiService.getHosts();
            setHosts(data || []);
        } catch (error) {
            console.error('Failed to load hosts:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleHostChange = (e) => {
        const hostId = e.target.value;
        const selectedHost = hosts.find((h) => h.id === hostId);
        setFormData((prev) => ({
            ...prev,
            host_id: hostId,
            floor_number: selectedHost?.floor_number || '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            const selectedHost = hosts.find((h) => h.id === formData.host_id);

            const visitorData = {
                ...formData,
                guest_code: generatedCode,
                visitor_id: crypto.randomUUID ? crypto.randomUUID() : `vis_${Date.now()}`,
                status: 'pending',
                host_name: selectedHost?.name || selectedHost?.full_name,
            };

            await ApiService.createVisitor(visitorData);
            setSuccess(`Visitor registered successfully! Access Code: ${generatedCode}`);
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                purpose: '',
                host_id: '',
                floor_number: '',
                visit_date: new Date().toISOString().split('T')[0],
                visit_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                badge_id: '',
            });
            loadBadges(); // Refresh available badges
        } catch (err) {
            setError('Failed to register visitor. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manual Visitor Registration</h2>
                        <p className="text-gray-500 dark:text-gray-400">Register a new visitor directly into the system</p>
                    </div>
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="text-gray-500" />
                    </button>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                        <CheckCircle size={20} />
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Host</label>
                            <select
                                name="host_id"
                                value={formData.host_id}
                                onChange={handleHostChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                                <option value="">Select Host</option>
                                {hosts.map((host) => (
                                    <option key={host.id} value={host.id}>
                                        {host.name || host.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose *</label>
                            <input
                                type="text"
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visit Date *</label>
                            <DatePicker
                                selected={formData.visit_date ? new Date(formData.visit_date) : null}
                                onChange={(date) => setFormData(prev => ({ ...prev, visit_date: date.toISOString().split('T')[0] }))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                dateFormat="MMMM d, yyyy"
                                minDate={new Date()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visit Time</label>
                            <DatePicker
                                selected={formData.visit_time ? new Date(`2000-01-01T${formData.visit_time}`) : null}
                                onChange={(date) => setFormData(prev => ({ ...prev, visit_time: date.toTimeString().split(' ')[0].substring(0, 5) }))}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <BadgeSelector
                                badges={availableBadges}
                                value={formData.badge_id}
                                onChange={(badgeId) => setFormData(prev => ({ ...prev, badge_id: badgeId }))}
                                label="Assign Badge"
                                required={false}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                        >
                            {loading ? 'Registering...' : (
                                <>
                                    <User size={18} />
                                    Register Visitor
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default AdminVisitorPage;
