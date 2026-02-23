import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, Plus, Search, Filter,
    Clock, MapPin, User, Building2,
    UserCheck, LogOut, MoreVertical,
    Calendar, Phone, CreditCard, AlertCircle,
    ChevronDown, X
} from 'lucide-react'
import { Card, Title, Text, Metric, Grid, Badge, Button, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react'
import DashboardLayout from '../components/DashboardLayout'
import ApiService from '../services/api'
import showToast from '../utils/toast'
import DeliveryFormModal from '../components/DeliveryFormModal'
import DeliveryDetailModal from '../components/DeliveryDetailModal'

const DeliveryManagement = () => {
    const [deliveries, setDeliveries] = useState([])
    const [hosts, setHosts] = useState([])
    const [availableBadges, setAvailableBadges] = useState([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedDelivery, setSelectedDelivery] = useState(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [deliveryToCheckout, setDeliveryToCheckout] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterDate, setFilterDate] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)

    useEffect(() => {
        loadData()
        loadMasters()

        const subscription = ApiService.subscribeToVisitors(() => {
            loadData()
        })

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await ApiService.getDeliveries()
            setDeliveries(data || [])
        } catch (error) {
            console.error('Failed to load deliveries:', error)
            showToast('Error loading delivery logs', 'error')
        } finally {
            setLoading(false)
        }
    }

    const loadMasters = async () => {
        try {
            const [hostsData, badgesData] = await Promise.all([
                ApiService.getHosts(),
                ApiService.getBadges('available')
            ])
            setHosts(hostsData || [])
            setAvailableBadges(badgesData || [])
        } catch (err) {
            console.error('Failed to load master data:', err)
        }
    }

    const handleCheckoutIntent = (e, delivery) => {
        e.stopPropagation()
        setDeliveryToCheckout(delivery)
        setIsConfirmOpen(true)
    }

    const handleConfirmCheckOut = async () => {
        if (!deliveryToCheckout) return
        try {
            await ApiService.checkOut(deliveryToCheckout.id)
            showToast('Delivery completed and checked out', 'success')
            setIsConfirmOpen(false)
            setDeliveryToCheckout(null)
            loadData()
            loadMasters()
        } catch (error) {
            showToast('Failed to process checkout', 'error')
        }
    }

    const handleRowClick = (delivery) => {
        setSelectedDelivery(delivery)
        setIsDetailOpen(true)
    }

    const filteredDeliveries = deliveries.filter(d => {
        const matchesSearch = (d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.purpose?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = (filterStatus === 'all' || d.status === filterStatus);

        let matchesDate = true;
        if (filterDate) {
            const deliveryDate = d.check_in_time ? d.check_in_time.split('T')[0] : '';
            matchesDate = deliveryDate === filterDate;
        }

        return matchesSearch && matchesStatus && matchesDate;
    })

    const displayedDeliveries = filteredDeliveries.slice(0, visibleCount)

    const stats = {
        active: deliveries.filter(d => d.status === 'checked_in').length,
        completed: deliveries.filter(d => d.status === 'checked_out').length,
        total: deliveries.length
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">Track and manage building deliveries and couriers</p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Record New Delivery
                    </button>
                </div>

                {/* Stats */}
                <Grid numItemsMd={2} numItemsLg={3} className="gap-6">
                    <Card decoration="top" decorationColor="blue">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Package className="text-blue-600" size={20} />
                            </div>
                            <Text>Active Deliveries</Text>
                        </div>
                        <Metric>{stats.active}</Metric>
                    </Card>
                    <Card decoration="top" decorationColor="green">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <UserCheck className="text-green-600" size={20} />
                            </div>
                            <Text>Completed Today</Text>
                        </div>
                        <Metric>{stats.completed}</Metric>
                    </Card>
                    <Card decoration="top" decorationColor="slate">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <Calendar className="text-slate-600" size={20} />
                            </div>
                            <Text>Total Deliveries</Text>
                        </div>
                        <Metric>{stats.total}</Metric>
                    </Card>
                </Grid>

                {/* Filter/Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search driver, company, or purpose..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none text-gray-900 dark:text-white cursor-pointer w-full"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="flex-1 md:flex-none px-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none text-gray-900 dark:text-white cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="checked_in">In Building</option>
                            <option value="checked_out">Completed</option>
                        </select>
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                title="Clear date filter"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Deliveries Table */}
                <Card className="p-0 overflow-hidden border-none shadow-sm ring-1 ring-gray-100 dark:ring-slate-800">
                    <Table>
                        <TableHead className="bg-gray-50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHeaderCell>Driver Details</TableHeaderCell>
                                <TableHeaderCell>Company</TableHeaderCell>
                                <TableHeaderCell>Destination</TableHeaderCell>
                                <TableHeaderCell>Badge</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Time In</TableHeaderCell>
                                <TableHeaderCell>Time Out</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full mx-auto mb-2" />
                                        <Text>Loading deliveries...</Text>
                                    </TableCell>
                                </TableRow>
                            ) : filteredDeliveries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-20 grayscale opacity-50">
                                        <Package size={48} className="mx-auto mb-4" />
                                        <Title>No records found</Title>
                                        <Text>Start by recording a new delivery</Text>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayedDeliveries.map((delivery) => (
                                    <TableRow
                                        key={delivery.id}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                                        onClick={() => handleRowClick(delivery)}
                                    >
                                        <TableCell>
                                            <div>
                                                <Text className="font-bold dark:text-white">{delivery.name}</Text>
                                                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                                                    <Phone size={10} />
                                                    {delivery.phone || 'No phone'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge color="blue" size="xs">{delivery.company}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-gray-100">
                                                    <Building2 size={14} className="text-gray-400" />
                                                    <span className="truncate max-w-[150px]">{delivery.host_name || (delivery.host ? (delivery.host.name || delivery.host.full_name) : 'Front Desk')}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                                    <MapPin size={12} />
                                                    <span>Floor {delivery.floor_number || delivery.floor || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {delivery.badge_number ? (
                                                <div className="flex items-center gap-2">
                                                    <CreditCard size={14} className="text-slate-500" />
                                                    <Text className="font-mono text-xs">{delivery.badge_number}</Text>
                                                </div>
                                            ) : (
                                                <Text className="text-gray-400 italic text-xs">No badge</Text>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                color={delivery.status === 'checked_in' ? 'green' : 'gray'}
                                                icon={delivery.status === 'checked_in' ? UserCheck : Clock}
                                            >
                                                {delivery.status === 'checked_in' ? 'In Building' : 'Completed'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Text className="text-xs dark:text-gray-200">
                                                {new Date(delivery.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </TableCell>
                                        <TableCell>
                                            <Text className="text-xs dark:text-gray-200">
                                                {delivery.check_out_time
                                                    ? new Date(delivery.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : '--:--'}
                                            </Text>
                                        </TableCell>
                                        <TableCell>
                                            {delivery.status === 'checked_in' ? (
                                                <button
                                                    onClick={(e) => handleCheckoutIntent(e, delivery)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-lg hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all text-xs font-bold group shadow-sm"
                                                >
                                                    <LogOut size={14} className="group-hover:scale-110 transition-transform" />
                                                    <span>Check Out</span>
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3 py-1.5 text-gray-400 dark:text-gray-600 text-xs italic">
                                                    <Clock size={14} />
                                                    <span>Completed</span>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* See More Button */}
                {!loading && filteredDeliveries.length > visibleCount && (
                    <div className="flex flex-col items-center justify-center pt-2 pb-6">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 10)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
                        >
                            <span>See More Deliveries</span>
                            <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
                        </button>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Showing {Math.min(visibleCount, filteredDeliveries.length)} of {filteredDeliveries.length} deliveries
                        </p>
                    </div>
                )}
            </div>

            <DeliveryFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    loadData()
                    loadMasters()
                }}
                hosts={hosts}
                availableBadges={availableBadges}
            />

            <DeliveryDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                delivery={selectedDelivery}
            />

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isConfirmOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsConfirmOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Check-Out</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to mark this delivery for <span className="font-bold text-gray-900 dark:text-white">{deliveryToCheckout?.name}</span> as completed?
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsConfirmOpen(false)}
                                    className="py-2.5 px-4 rounded-xl border-2 border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmCheckOut}
                                    className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}

export default DeliveryManagement
