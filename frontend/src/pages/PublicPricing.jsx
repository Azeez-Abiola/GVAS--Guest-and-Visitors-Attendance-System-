import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Flex
} from '@tremor/react';
import {
    CheckCircle,
    X,
    Zap,
    Shield,
    Users,
    ArrowRight,
    ChevronLeft,
    Sun,
    Moon,
    Menu,
    X as CloseIcon
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import GvasLogo from '../components/GvasLogo';
import { useTheme } from '../contexts/ThemeContext';

const PublicPricing = () => {
    const [isYearly, setIsYearly] = React.useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* Floating Navbar */}
            <div className="fixed top-6 w-full z-50 flex justify-center px-4">
                <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full px-6 py-3 shadow-xl max-w-5xl w-full flex items-center justify-between transition-colors duration-300">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                        <GvasLogo className="h-8 w-8 text-[#070f2b] dark:text-white" />
                        <span className="text-xl font-bold tracking-tight text-[#070f2b] dark:text-white">GVAS</span>
                    </div>

                    <div className="hidden lg:flex items-center space-x-8">
                        <Link to="/" className="text-sm font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
                        <a href="/#features" className="text-sm font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
                        <span className="text-sm font-bold text-[#070f2b] dark:text-white">Pricing</span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-[#070f2b] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:block px-5 py-2 rounded-full text-[#070f2b] dark:text-white font-medium text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/guest-register')}
                            className="px-5 py-2 rounded-full bg-[#070f2b] dark:bg-white text-white dark:text-[#070f2b] font-semibold text-sm hover:bg-[#070f2b]/90 dark:hover:bg-white/90 transition-all shadow-md"
                        >
                            Get Started
                        </button>
                    </div>
                </nav>
            </div>

            <div className="pt-32 pb-20 px-4 container mx-auto">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Badge color="blue" size="xl" className="rounded-full px-6 py-1 font-bold">PRICING PLANS</Badge>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1]"
                    >
                        Simple, Transparent <br />
                        <span className="text-blue-600 dark:text-blue-400">Pricing for Everyone.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium"
                    >
                        Start securing your facility today. Choose the plan that fits your needs.
                        All plans include core security features.
                    </motion.p>
                </div>

                {/* Billing Toggle */}
                <div className="flex flex-col items-center justify-center gap-4 mt-12">
                    <div className="flex items-center gap-4 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-inner">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${!isYearly
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xl'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2 ${isYearly
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xl'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Yearly
                            <Badge color="emerald" size="xs" className="px-2 py-0.5 animate-bounce">20% Off</Badge>
                        </button>
                    </div>
                    <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {isYearly ? '✓ Best value: 2 months free applied' : 'Switch to yearly to save 20%!'}
                    </Text>
                </div>

                {/* Pricing Cards */}
                <Grid numItems={1} numItemsMd={3} className="gap-8 mt-16 max-w-7xl mx-auto">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="relative h-full"
                        >
                            {plan.isBestValue && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black px-6 py-2 rounded-full shadow-2xl border-2 border-white dark:border-slate-900 tracking-widest uppercase">
                                        Most Popular
                                    </div>
                                </div>
                            )}
                            <Card className={`h-full border-0 ${plan.isBestValue
                                    ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 bg-white dark:bg-slate-900'
                                    : 'ring-1 ring-gray-200 dark:ring-slate-800 bg-white/80 dark:bg-slate-900/80'
                                } rounded-[2.5rem] p-10 overflow-hidden group transition-all duration-500 shadow-2xl backdrop-blur-xl`}>

                                {/* Decorative Pattern */}
                                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 ${plan.color === 'blue' ? 'bg-blue-500' :
                                        plan.color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'
                                    }`} />

                                <div className="flex flex-col h-full relative z-10">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className={`p-4 rounded-2xl ${plan.color === 'blue' ? 'bg-blue-100/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                                                plan.color === 'emerald' ? 'bg-emerald-100/50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' :
                                                    'bg-indigo-100/50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                                            }`}>
                                            <plan.icon size={32} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <Title className="text-gray-900 dark:text-white font-black text-2xl">{plan.name}</Title>
                                            {plan.savings && <Text className="text-xs font-black text-emerald-500 uppercase tracking-tight">{plan.savings}</Text>}
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-2">
                                            <Metric className="text-gray-900 dark:text-white font-black text-5xl tracking-tight">{plan.price}</Metric>
                                            <Text className="text-gray-500 dark:text-gray-400 font-bold text-lg">{plan.period}</Text>
                                        </div>
                                    </div>

                                    <Text className="text-gray-500 dark:text-gray-400 font-semibold mb-10 text-lg leading-relaxed min-h-[60px]">
                                        {plan.description}
                                    </Text>

                                    <div className="space-y-5 flex-1">
                                        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Included Features</p>
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-4">
                                                <div className={`mt-1 p-1 rounded-full ${plan.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                        plan.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'
                                                    }`}>
                                                    <CheckCircle size={16} className={
                                                        plan.color === 'blue' ? 'text-blue-500' :
                                                            plan.color === 'emerald' ? 'text-emerald-500' : 'text-indigo-500'
                                                    } />
                                                </div>
                                                <Text className="text-md font-medium text-gray-700 dark:text-gray-300">{feature}</Text>
                                            </div>
                                        ))}

                                        {plan.notIncluded.length > 0 && (
                                            <div className="pt-6 space-y-4">
                                                <p className="text-[11px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-2">Not Included</p>
                                                {plan.notIncluded.map((feature) => (
                                                    <div key={feature} className="flex items-start gap-4 opacity-30 italic">
                                                        <X size={18} className="text-gray-400 shrink-0 mt-0.5" />
                                                        <Text className="text-sm font-medium text-gray-500">{feature}</Text>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => navigate('/guest-register')}
                                        className={`w-full mt-12 py-5 rounded-[1.5rem] font-black text-lg tracking-wide transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${plan.isBestValue
                                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-2xl shadow-emerald-500/30'
                                                : 'bg-[#070f2b] dark:bg-white text-white dark:text-[#070f2b] hover:opacity-90 shadow-xl'
                                            }`}
                                    >
                                        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started Now'}
                                        <ArrowRight size={22} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </Grid>

                {/* Comparison Section Footer */}
                <div className="mt-24 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Still have questions?</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Our security experts are here to help you find the right fit.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-white rounded-full font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Book a Demo</button>
                        <button className="px-8 py-3 border-2 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-white rounded-full font-bold hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">Contact Support</button>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-gray-100 dark:border-slate-900 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6 text-center text-sm text-gray-400">
                    <p>© 2024 Global Visitor Access System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicPricing;
