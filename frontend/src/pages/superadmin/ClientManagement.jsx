import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';
import { motion } from 'framer-motion';
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
    Button,
    Flex,
    TextInput,
    Icon,
    Select,
    SelectItem,
} from '@tremor/react';
import {
    Search,
    Plus,
    Building2,
    Mail,
    Phone,
    MoreHorizontal,
    ExternalLink,
    Filter,
    ShieldAlert
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const ClientManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        contact_person: '',
        contact_email: '',
        plan_tier: 'standard',
        status: 'active'
    });

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await ApiService.getOrganizations();
            if (data && data.length > 0) {
                setClients(data);
            } else {
                setClients([]);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleAddClient = async (e) => {
        e.preventDefault();
        try {
            await ApiService.createOrganization(newClient);
            setIsModalOpen(false);
            setNewClient({ name: '', contact_person: '', contact_email: '', plan_tier: 'standard', status: 'active' });
            fetchClients();
        } catch (error) {
            alert('Error adding client: ' + error.message);
        }
    };

    const filteredClients = clients.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contact_email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Flex justifyContent="between" className="items-center">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">Organization Management</h2>
                        <p className="text-gray-500 dark:text-gray-400">View and manage all client organizations on the GVAS platform.</p>
                    </div>
                    <Button
                        icon={Plus}
                        color="blue"
                        className="rounded-xl font-bold"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add New Client
                    </Button>
                </Flex>

                {/* Simple Add Client Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-slate-800"
                        >
                            <Title className="mb-6 dark:text-white">Onboard New Organization</Title>
                            <form onSubmit={handleAddClient} className="space-y-4">
                                <div>
                                    <Text className="mb-1 dark:text-gray-300">Organization Name</Text>
                                    <TextInput
                                        required
                                        value={newClient.name}
                                        onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                        placeholder="e.g. Dangote Group"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Text className="mb-1 dark:text-gray-300">Contact Person</Text>
                                        <TextInput
                                            required
                                            value={newClient.contact_person}
                                            onChange={e => setNewClient({ ...newClient, contact_person: e.target.value })}
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div>
                                        <Text className="mb-1 dark:text-gray-300">Contact Email</Text>
                                        <TextInput
                                            required
                                            type="email"
                                            value={newClient.contact_email}
                                            onChange={e => setNewClient({ ...newClient, contact_email: e.target.value })}
                                            placeholder="admin@org.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Text className="mb-1 dark:text-gray-300">Plan Tier</Text>
                                        <Select
                                            value={newClient.plan_tier}
                                            onValueChange={val => setNewClient({ ...newClient, plan_tier: val })}
                                        >
                                            <SelectItem value="standard">Standard</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                        </Select>
                                    </div>
                                    <div>
                                        <Text className="mb-1 dark:text-gray-300">Initial Status</Text>
                                        <Select
                                            value={newClient.status}
                                            onValueChange={val => setNewClient({ ...newClient, status: val })}
                                        >
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="trialing">Trialing</SelectItem>
                                        </Select>
                                    </div>
                                </div>
                                <Flex className="mt-8 gap-3">
                                    <Button variant="secondary" color="gray" className="flex-1 rounded-xl" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" color="blue" className="flex-1 rounded-xl">Create Organization</Button>
                                </Flex>
                            </form>
                        </motion.div>
                    </div>
                )}

                <Card className="shadow-xl border-none dark:bg-slate-900">
                    <Flex className="gap-4 flex-col md:flex-row mb-6">
                        <div className="relative w-full md:max-w-md">
                            <TextInput
                                icon={Search}
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-xl border-gray-200 dark:border-slate-800"
                            />
                        </div>
                        <Flex className="max-w-xs gap-3">
                            <Select placeholder="Filter by Plan" className="rounded-xl">
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                            </Select>
                            <Select placeholder="Status" className="rounded-xl">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="trialing">Trialing</SelectItem>
                            </Select>
                        </Flex>
                    </Flex>

                    <Table className="mt-8">
                        <TableHead>
                            <TableRow className="border-b border-gray-100 dark:border-slate-800">
                                <TableHeaderCell className="dark:text-white">Organization</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Contact Info</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Plan Type</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Status</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white text-right">Total Revenue</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredClients.map((item) => (
                                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Text className="font-bold dark:text-white text-lg">{item.name}</Text>
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <Building2 size={12} />
                                                <span>ID: ORG-{item.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Text className="font-medium dark:text-gray-200">{item.contact_person || 'N/A'}</Text>
                                            <Flex justifyContent="start" className="space-x-2 text-xs text-gray-400">
                                                <Mail size={12} />
                                                <span>{item.contact_email || 'N/A'}</span>
                                            </Flex>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge color={(item.plan_tier || '').toLowerCase() === 'enterprise' ? 'indigo' : (item.plan_tier || '').toLowerCase() === 'business' ? 'emerald' : 'blue'} className="rounded-full capitalize">
                                            {item.plan_tier || 'standard'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            color={(item.status || '').toLowerCase() === 'active' ? 'emerald' : (item.status || '').toLowerCase() === 'suspended' ? 'red' : 'amber'}
                                            variant="light"
                                            className="rounded-full capitalize"
                                        >
                                            {item.status || 'inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Text className="font-black dark:text-white">{item.revenue || '₦0'}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Flex className="space-x-2">
                                            <Button size="xs" variant="light" icon={ExternalLink} color="blue">Dashboard</Button>
                                            <Button size="xs" variant="light" icon={MoreHorizontal} color="gray"></Button>
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

export default ClientManagement;
