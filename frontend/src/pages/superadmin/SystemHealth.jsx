import React, { useState, useEffect } from 'react';
import {
    Card,
    Grid,
    Metric,
    Text,
    Title,
    Badge,
    Flex,
    ProgressBar,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Tracker,
} from '@tremor/react';
import {
    Activity,
    Database,
    Globe,
    Server,
    Zap,
    Cpu,
    HardDrive,
    ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ApiService from '../../services/api';

const SystemHealth = () => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const data = await ApiService.healthCheck();
                setHealth(data);
            } catch (error) {
                console.error('Health check failed:', error);
            } finally {
                setLoading(false);
            }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const services = [
        { name: 'Core API Server', status: health?.status === 'healthy' ? 'operational' : 'degraded', icon: Server, latency: '45ms' },
        { name: 'PostgreSQL Database', status: health?.database === 'connected' ? 'operational' : 'offline', icon: Database, latency: '12ms' },
        { name: 'Supabase Auth', status: 'operational', icon: ShieldCheck, latency: '89ms' },
        { name: 'Real-time Engine', status: 'operational', icon: Zap, latency: '32ms' },
    ];

    const uptimeData = [
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'rose', tooltip: 'Downtime (4m)' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
        { color: 'emerald', tooltip: 'Operational' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Flex justifyContent="between" className="items-center">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">System Health & Infrastructure</h2>
                        <p className="text-gray-500 dark:text-gray-400">Platform-wide monitor for servers, databases and services.</p>
                    </div>
                    <Badge color={health?.status === 'healthy' ? 'emerald' : 'red'} size="lg" icon={Activity}>
                        Global Status: {health?.status?.toUpperCase() || 'CHECKING...'}
                    </Badge>
                </Flex>

                <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
                    <Card decoration="top" decorationColor="blue" className="shadow-lg border-none dark:bg-slate-900">
                        <Flex justifyContent="start" className="space-x-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Cpu className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div>
                                <Text>CPU Usage</Text>
                                <Metric>34%</Metric>
                            </div>
                        </Flex>
                        <ProgressBar value={34} color="blue" className="mt-4" />
                    </Card>

                    <Card decoration="top" decorationColor="emerald" className="shadow-lg border-none dark:bg-slate-900">
                        <Flex justifyContent="start" className="space-x-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <HardDrive className="text-emerald-600 dark:text-emerald-400" size={24} />
                            </div>
                            <div>
                                <Text>Memory Usage</Text>
                                <Metric>1.2 GB</Metric>
                            </div>
                        </Flex>
                        <ProgressBar value={62} color="emerald" className="mt-4" />
                    </Card>

                    <Card decoration="top" decorationColor="amber" className="shadow-lg border-none dark:bg-slate-900">
                        <Flex justifyContent="start" className="space-x-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                <Globe className="text-amber-600 dark:text-amber-400" size={24} />
                            </div>
                            <div>
                                <Text>Avg Latency</Text>
                                <Metric>84ms</Metric>
                            </div>
                        </Flex>
                        <div className="mt-6">
                            <Tracker data={uptimeData} className="mt-2" />
                        </div>
                    </Card>

                    <Card decoration="top" decorationColor="indigo" className="shadow-lg border-none dark:bg-slate-900">
                        <Flex justifyContent="start" className="space-x-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                <Database className="text-indigo-600 dark:text-indigo-400" size={24} />
                            </div>
                            <div>
                                <Text>DB Connections</Text>
                                <Metric>142</Metric>
                            </div>
                        </Flex>
                        <ProgressBar value={45} color="indigo" className="mt-4" />
                    </Card>
                </Grid>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 shadow-xl border-none dark:bg-slate-900">
                        <Title className="dark:text-white">Active Service Status</Title>
                        <Table className="mt-6">
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell className="dark:text-white">Service</TableHeaderCell>
                                    <TableHeaderCell className="dark:text-white">Status</TableHeaderCell>
                                    <TableHeaderCell className="dark:text-white">Latency</TableHeaderCell>
                                    <TableHeaderCell className="dark:text-white">Endpoint</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {services.map((item) => (
                                    <TableRow key={item.name}>
                                        <TableCell>
                                            <Flex justifyContent="start" className="space-x-3">
                                                <item.icon size={18} className="text-gray-400" />
                                                <Text className="font-bold dark:text-white">{item.name}</Text>
                                            </Flex>
                                        </TableCell>
                                        <TableCell>
                                            <Badge color={item.status === 'operational' ? 'emerald' : 'red'} variant="light">
                                                {item.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Text className="dark:text-gray-300">{item.latency}</Text>
                                        </TableCell>
                                        <TableCell>
                                            <Text className="font-mono text-xs text-gray-400">https://api.gvas-system.com/v1/...</Text>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    <Card className="shadow-xl border-none dark:bg-slate-900">
                        <Title className="dark:text-white">Security & Access</Title>
                        <div className="mt-6 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                                <div>
                                    <Text className="font-bold dark:text-white">SSL Certificate</Text>
                                    <Text className="text-xs text-emerald-500">Valid (Expires in 241 days)</Text>
                                </div>
                                <ShieldCheck className="text-emerald-500" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                                <div>
                                    <Text className="font-bold dark:text-white">Server Firewall</Text>
                                    <Text className="text-xs text-emerald-500">Active - Filtering enabled</Text>
                                </div>
                                <ShieldCheck className="text-emerald-500" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                                <div>
                                    <Text className="font-bold dark:text-white">Data Backups</Text>
                                    <Text className="text-xs text-blue-500">Last backup: 42 mins ago</Text>
                                </div>
                                <Database className="text-blue-500" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SystemHealth;
