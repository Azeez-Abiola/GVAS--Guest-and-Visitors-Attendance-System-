import React from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    Title,
    Text,
    Grid,
    Badge,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Metric,
    Flex,
    Icon
} from '@tremor/react';
import {
    CheckCircle,
    X,
    Zap,
    Shield,
    Building2,
    Users,
    Printer,
    BarChart3,
    MonitorPlay,
    ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const PricingPlans = () => {
    const [isYearly, setIsYearly] = React.useState(true);

    const plans = [
        {
            name: 'Standard',
            price: isYearly ? '₦720,000' : '₦75,000',
            period: isYearly ? '/ year' : '/ month',
            savings: isYearly ? 'Save ₦180,000 yearly' : null,
            description: 'Essential toolkit for smaller offices.',
            features: [
                'Visitor Pre-Registration',
                'Manual Check-In/Out',
                'Email Notifications',
                'Basic Analytics',
                'Single Reception View',
                'Standard Audit Logs'
            ],
            notIncluded: [
                'Visitor Kiosk Mode',
                'Badge Printing Support',
                'Multi-Floor Management',
                'Security Blacklist',
                'Advanced Peaks Data'
            ],
            color: 'blue',
            icon: Users
        },
        {
            name: 'Business',
            isBestValue: true,
            price: isYearly ? '₦1,440,000' : '₦150,000',
            period: isYearly ? '/ year' : '/ month',
            savings: isYearly ? 'Save ₦360,000 yearly' : null,
            description: 'High-traffic corporate environments.',
            features: [
                'Everything in Standard',
                'Visitor Kiosk Mode (Self-Service)',
                'Professional Badge Printing',
                'Multi-Floor/Dept Management',
                'Security Blacklist Management',
                'Real-time Dashboard Alerts',
                'Advanced Data Analytics',
                'Priority Technical Support'
            ],
            notIncluded: [
                'Custom API Integrations',
                'Single Sign-On (SSO)',
                'On-Premise Deployment'
            ],
            color: 'emerald',
            icon: Zap
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            savings: 'Tailored for scale',
            description: 'Tailored for large organizations.',
            features: [
                'Everything in Business',
                'Custom API Integrations',
                'Active Directory / SSO',
                'Unlimited User Accounts',
                'Global Multi-Site Management',
                'On-Premise Deployment Option',
                'Dedicated Account Manager',
                'Custom Branding (White-label)'
            ],
            notIncluded: [],
            color: 'indigo',
            icon: Shield
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <Badge color="blue" size="xl" className="rounded-full px-4">Pricing & Subscriptions</Badge>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Plans that grow with your organization
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        Choose the perfect level of security and efficiency for your facility.
                        Save 20% with annual billing.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex flex-col items-center justify-center gap-4 mt-8">
                    <div className="flex items-center gap-4 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-inner">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isYearly
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isYearly
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Yearly
                            <Badge color="emerald" size="xs" className="px-1.5 py-0.5">20% Off</Badge>
                        </button>
                    </div>
                    <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400 animate-pulse">
                        {isYearly ? '✓ Currently viewing annual value' : 'Get 2 months free with annual billing!'}
                    </Text>
                </div>

                {/* Pricing Cards */}
                <Grid numItems={1} numItemsMd={3} className="gap-8 mt-12">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.name}
                            whileHover={{ y: -8 }}
                            className="relative h-full"
                        >
                            {plan.isBestValue && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 tracking-widest uppercase">
                                        Most Popular
                                    </div>
                                </div>
                            )}
                            <Card className={`h-full border-0 ${plan.isBestValue
                                    ? 'ring-2 ring-emerald-500/50 dark:ring-emerald-400/30 bg-white dark:bg-slate-900 shadow-emerald-500/10'
                                    : 'ring-1 ring-gray-200 dark:ring-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl'
                                } rounded-3xl p-8 overflow-hidden group transition-all duration-500`}>
                                {/* Decorative Background Blob */}
                                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${plan.color === 'blue' ? 'bg-blue-500' :
                                        plan.color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'
                                    }`} />

                                <div className="flex flex-col h-full relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-3 rounded-2xl ${plan.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                                                plan.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                                                    'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                            }`}>
                                            <plan.icon size={26} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <Title className="text-gray-900 dark:text-white font-black text-xl">{plan.name}</Title>
                                            {plan.savings && <Text className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{plan.savings}</Text>}
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <Metric className="text-gray-900 dark:text-white font-black tracking-tight">{plan.price}</Metric>
                                            <Text className="text-gray-500 dark:text-gray-400 font-medium">{plan.period}</Text>
                                        </div>
                                    </div>

                                    <Text className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                                        {plan.description}
                                    </Text>

                                    <div className="space-y-4 flex-1">
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-8 h-[1px] bg-gray-200 dark:bg-slate-800" /> Key Benefits
                                        </p>
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3 group/item">
                                                <div className={`mt-1 p-0.5 rounded-full ${plan.color === 'blue' ? 'bg-blue-100/50 dark:bg-blue-900/30' :
                                                        plan.color === 'emerald' ? 'bg-emerald-100/50 dark:bg-emerald-900/30' : 'bg-indigo-100/50 dark:bg-indigo-900/30'
                                                    }`}>
                                                    <CheckCircle size={14} className={
                                                        plan.color === 'blue' ? 'text-blue-500' :
                                                            plan.color === 'emerald' ? 'text-emerald-500' : 'text-indigo-500'
                                                    } />
                                                </div>
                                                <Text className="text-sm text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{feature}</Text>
                                            </div>
                                        ))}

                                        {plan.notIncluded.length > 0 && (
                                            <>
                                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pt-4 flex items-center gap-2">
                                                    <span className="w-8 h-[1px] bg-gray-200 dark:bg-slate-800" /> Limitations
                                                </p>
                                                {plan.notIncluded.map((feature) => (
                                                    <div key={feature} className="flex items-start gap-3 opacity-40">
                                                        <X size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                                        <Text className="text-sm text-gray-500">{feature}</Text>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>

                                    <button className={`w-full mt-10 py-4 rounded-2xl font-black text-sm tracking-wide transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${plan.isBestValue
                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30'
                                            : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-lg'
                                        }`}>
                                        {plan.name === 'Enterprise' ? 'Request Consultation' : 'Select Plan'}
                                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </Grid>

                {/* Feature Comparison Table */}
                <div className="mt-16">
                    <Card className="rounded-2xl shadow-xl overflow-hidden border-none dark:bg-slate-900">
                        <div className="p-6 bg-slate-900 text-white">
                            <Title className="text-white">Detailed Feature Comparison</Title>
                            <Text className="text-slate-400">Compare specific capabilities across different plans.</Text>
                        </div>
                        <Table>
                            <TableHead>
                                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableHeaderCell className="text-slate-900 dark:text-white py-4">Capability</TableHeaderCell>
                                    <TableHeaderCell className="text-center text-slate-900 dark:text-white py-4">Standard</TableHeaderCell>
                                    <TableHeaderCell className="text-center text-slate-900 dark:text-white py-4 bg-emerald-50/30 dark:bg-emerald-900/10">Business</TableHeaderCell>
                                    <TableHeaderCell className="text-center text-slate-900 dark:text-white py-4">Enterprise</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[
                                    { name: 'Visitor Pre-Registration', s: true, b: true, e: true },
                                    { name: 'Manual Check-In/Out', s: true, b: true, e: true },
                                    { name: 'Visitor Kiosk Mode (Tablet UI)', s: false, b: true, e: true },
                                    { name: 'Badge Printing Support', s: false, b: true, e: true },
                                    { name: 'Multi-Floor Management', s: false, b: true, e: true },
                                    { name: 'Security Blacklist', s: false, b: true, e: true },
                                    { name: 'Advanced Peak Hours Analysis', s: false, b: true, e: true },
                                    { name: 'Audit Logs Retention', s: '30 Days', b: '1 Year', e: 'Unlimited' },
                                    { name: 'API / Webhooks', s: false, b: false, e: true },
                                    { name: 'Active Directory / SSO', s: false, b: false, e: true },
                                ].map((row, i) => (
                                    <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium text-gray-900 dark:text-white">{row.name}</TableCell>
                                        <TableCell className="text-center">
                                            {typeof row.s === 'boolean' ? (row.s ? <CheckCircle size={20} className="text-emerald-500 mx-auto" /> : <X size={20} className="text-gray-300 mx-auto" />) : <Text className="mx-auto">{row.s}</Text>}
                                        </TableCell>
                                        <TableCell className="text-center bg-emerald-50/20 dark:bg-emerald-900/5">
                                            {typeof row.b === 'boolean' ? (row.b ? <CheckCircle size={20} className="text-emerald-500 mx-auto" /> : <X size={20} className="text-gray-300 mx-auto" />) : <Text className="mx-auto font-bold text-emerald-600 dark:text-emerald-400">{row.b}</Text>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {typeof row.e === 'boolean' ? (row.e ? <CheckCircle size={20} className="text-emerald-500 mx-auto" /> : <X size={20} className="text-gray-300 mx-auto" />) : <Text className="mx-auto">{row.e}</Text>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* FAQ Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 px-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Can I upgrade later?</h3>
                        <p className="text-gray-500 dark:text-gray-400">Yes! You can upgrade from Standard to Business at any time. The difference will be pro-rated for the remainder of your billing cycle.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">What hardware is required?</h3>
                        <p className="text-gray-500 dark:text-gray-400">For the Business plan, we recommend any iPad or Android tablet for Kiosk mode, and a standard label printer (Dymo or Brother) for badges.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PricingPlans;
