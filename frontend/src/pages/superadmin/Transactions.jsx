import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';
import {
    Card,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Text,
    Title,
    Badge,
    Flex,
    TextInput,
    Icon,
} from '@tremor/react';
import {
    Search,
    Download,
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    Filter
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const Transactions = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await ApiService.getTransactions();
                if (data && data.length > 0) {
                    setPayments(data);
                } else {
                    setPayments([]);
                }
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Flex justifyContent="between" className="items-center">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">Financial Transactions</h2>
                        <p className="text-gray-500 dark:text-gray-400">Track all incoming payments and subscription renewals platform-wide.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                </Flex>

                <Card className="shadow-xl border-none dark:bg-slate-900">
                    <Flex className="gap-4 flex-col md:flex-row mb-6">
                        <div className="relative w-full md:max-w-md">
                            <TextInput
                                icon={Search}
                                placeholder="Search by Transaction ID or Organization..."
                                className="rounded-xl"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-white rounded-xl font-semibold border border-gray-200 dark:border-slate-700">
                            <Filter size={18} />
                            <span>More Filters</span>
                        </button>
                    </Flex>

                    <Table className="mt-8">
                        <TableHead>
                            <TableRow className="border-b border-gray-100 dark:border-slate-800">
                                <TableHeaderCell className="dark:text-white">TXN ID</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Organization</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Amount</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Payment Method</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white text-right">Date</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white text-center">Status</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((item) => (
                                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell>
                                        <Text className="font-mono font-bold dark:text-blue-400">
                                            {item.id.substring(0, 8).toUpperCase()}
                                        </Text>
                                    </TableCell>
                                    <TableCell>
                                        <Text className="font-bold dark:text-white">{item.organization?.name || 'Unknown'}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Text className="font-black dark:text-white">
                                            ₦{Intl.NumberFormat().format(item.amount_paid || 0)}
                                        </Text>
                                    </TableCell>
                                    <TableCell>
                                        <Flex justifyContent="start" className="space-x-2">
                                            <CreditCard size={14} className="text-gray-400" />
                                            <Text className="dark:text-gray-300 capitalize">{item.payment_method || '-'}</Text>
                                        </Flex>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Text className="dark:text-gray-400">
                                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                                        </Text>
                                    </TableCell>
                                    <TableCell>
                                        <Flex justifyContent="center">
                                            <Badge
                                                color={(item.status || '').toLowerCase() === 'active' || (item.status || '').toLowerCase() === 'success' ? 'emerald' : (item.status || '').toLowerCase() === 'failed' ? 'red' : 'amber'}
                                                icon={(item.status || '').toLowerCase() === 'active' || (item.status || '').toLowerCase() === 'success' ? CheckCircle2 : (item.status || '').toLowerCase() === 'failed' ? XCircle : Clock}
                                                className="rounded-full capitalize"
                                            >
                                                {item.status || 'pending'}
                                            </Badge>
                                        </Flex>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Transactions;
