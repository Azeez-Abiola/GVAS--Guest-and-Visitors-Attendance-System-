import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../services/api';
import {
    Card,
    Grid,
    Metric,
    Text,
    Title,
    BarChart,
    DonutChart,
    Badge,
    Flex,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Icon,
    AreaChart,
} from '@tremor/react';
import {
    DollarSign,
    Users,
    Building2,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Globe,
    Zap,
    CreditCard
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const SuperAdminDashboard = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await ApiService.getSuperAdminStats();
                setStatsData(data);
            } catch (error) {
                console.error('Failed to fetch platform stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Data arrays initialized to empty (will be populated by real data if available)
    const revenueData = statsData?.revenue_history || [];
    const clientDistribution = statsData?.plan_distribution || [];
    const recentSignups = statsData?.recent_organizations || [];

    const stats = [
        {
            title: 'Total Revenue',
            metric: statsData?.total_revenue ? `₦${Intl.NumberFormat().format(statsData.total_revenue)}` : '₦0',
            progress: statsData?.revenue_growth || 0,
            icon: DollarSign,
            color: 'emerald',
            detail: 'Life-time earnings'
        },
        {
            title: 'Active Clients',
            metric: statsData?.active_organizations || '0',
            progress: statsData?.client_growth || 0,
            icon: Building2,
            color: 'blue',
            detail: 'Paying organizations'
        },
        {
            title: 'Total Visitors',
            metric: statsData?.total_visitors_logged ? Intl.NumberFormat().format(statsData.total_visitors_logged) : '0',
            progress: statsData?.visitor_growth || 0,
            icon: Users,
            color: 'indigo',
            detail: 'Across all sites'
        },
        {
            title: 'System Uptime',
            metric: '100%',
            progress: 0,
            icon: Zap,
            color: 'amber',
            detail: 'Current availability'
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Platform Overview</h2>
                    <p className="text-gray-500 dark:text-gray-400">Monitoring growth and performance across all GVAS instances.</p>
                </div>

                {/* Performance Stats */}
                <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
                    {stats.map((item) => (
                        <Card key={item.title} decoration="top" decorationColor={item.color} className="shadow-lg border-none dark:bg-slate-900">
                            <Flex justifyContent="start" className="space-x-4">
                                <Icon
                                    icon={item.icon}
                                    variant="light"
                                    size="xl"
                                    color={item.color}
                                />
                                <div className="truncate">
                                    <Text className="font-medium text-gray-500">{item.title}</Text>
                                    <Metric className="font-black dark:text-white">{item.metric}</Metric>
                                </div>
                            </Flex>
                            <Flex className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                                <Badge
                                    color={item.progress > 0 ? 'emerald' : 'red'}
                                    icon={item.progress > 0 ? ArrowUpRight : ArrowDownRight}
                                    variant="light"
                                    className="rounded-full"
                                >
                                    {Math.abs(item.progress)}%
                                </Badge>
                                <Text className="text-xs text-gray-400 truncate">{item.detail}</Text>
                            </Flex>
                        </Card>
                    ))}
                </Grid>

                {/* Charts Section */}
                <Grid numItems={1} numItemsLg={3} className="gap-6">
                    <Card className="lg:col-span-2 shadow-lg border-none dark:bg-slate-900 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <Title className="dark:text-white font-bold">Revenue Trends</Title>
                                <Text className="dark:text-gray-400">Monthly recurring revenue (NGN)</Text>
                            </div>
                            <Badge color="blue" size="sm" className="rounded-full px-4">Weekly View</Badge>
                        </div>
                        <AreaChart
                            className="h-72 mt-4"
                            data={revenueData}
                            index="date"
                            categories={["revenue"]}
                            colors={["blue"]}
                            valueFormatter={(number) => `₦${Intl.NumberFormat("en-US").format(number)}`}
                            showAnimation={true}
                            curveType="smooth"
                        />
                    </Card>

                    <Card className="shadow-lg border-none dark:bg-slate-900">
                        <Title className="dark:text-white font-bold mb-6">Plan Distribution</Title>
                        <DonutChart
                            className="h-64 mt-4"
                            data={clientDistribution}
                            category="value"
                            index="name"
                            colors={["blue", "emerald", "indigo"]}
                            valueFormatter={(number) => `${number} Clients`}
                            showAnimation={true}
                        />
                        <div className="mt-8 space-y-3">
                            {clientDistribution.map((item, idx) => (
                                <Flex key={item.name} justifyContent="start" className="space-x-4">
                                    <div className={`w-3 h-3 rounded-full bg-${idx === 0 ? 'blue' : idx === 1 ? 'emerald' : 'indigo'}-500`} />
                                    <Text className="flex-1 dark:text-gray-400">{item.name}</Text>
                                    <Text className="font-bold dark:text-white">{item.value}</Text>
                                </Flex>
                            ))}
                        </div>
                    </Card>
                </Grid>

                {/* Recent Clients Table */}
                <Card className="shadow-lg border-none dark:bg-slate-900">
                    <Flex className="mb-6">
                        <div>
                            <Title className="dark:text-white font-bold">Recent Onboarded Clients</Title>
                            <Text className="dark:text-gray-400">Showing the latest organizations to join the platform.</Text>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all">View All Organizations</button>
                    </Flex>
                    <Table className="mt-4">
                        <TableHead>
                            <TableRow className="border-b border-gray-100 dark:border-slate-800">
                                <TableHeaderCell className="dark:text-white">Organization Name</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Subscription Plan</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Status</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white text-right">Life-time Value</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Join Date</TableHeaderCell>
                                <TableHeaderCell className="dark:text-white">Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recentSignups.map((item) => (
                                <TableRow key={item.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell>
                                        <Flex justifyContent="start" className="space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Building2 size={16} className="text-gray-500" />
                                            </div>
                                            <Text className="font-bold dark:text-white">{item.name}</Text>
                                        </Flex>
                                    </TableCell>
                                    <TableCell>
                                        <Badge color={item.plan === 'Enterprise' ? 'indigo' : item.plan === 'Business' ? 'emerald' : 'blue'} className="rounded-full">
                                            {item.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${item.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            <Text className="dark:text-gray-300">{item.status}</Text>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Text className="font-black dark:text-white">{item.revenue}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Text className="text-sm dark:text-gray-400">{item.date}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Icon
                                            icon={ArrowUpRight}
                                            variant="simple"
                                            className="text-gray-400 hover:text-blue-500 cursor-pointer transition-colors"
                                        />
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

export default SuperAdminDashboard;
