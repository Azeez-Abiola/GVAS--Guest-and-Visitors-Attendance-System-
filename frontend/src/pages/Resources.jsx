import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    BookOpen,
    Bell,
    Users,
    Smartphone,
    Shield,
    Search,
    CheckCircle2,
    Info,
    ChevronRight,
    Printer,
    MinusCircle,
    HelpCircle
} from 'lucide-react'
import GvasLogo from '../components/GvasLogo'

const Resources = () => {
    const navigate = useNavigate()

    const sections = [
        { id: 'getting-started', title: '1. Getting Started', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'notifications', title: '2. Notifications System', icon: <Bell className="w-5 h-5" /> },
        { id: 'visitor-flows', title: '3. Visitor Flows', icon: <Users className="w-5 h-5" /> },
        { id: 'self-registration', title: '4. Guest Self-Registration', icon: <Smartphone className="w-5 h-5" /> },
        { id: 'hosts', title: '5. Hosts (Employees)', icon: <CheckCircle2 className="w-5 h-5" /> },
        { id: 'receptionists', title: '6. Receptionists', icon: <Printer className="w-5 h-5" /> },
        { id: 'administrators', title: '7. Administrators', icon: <Shield className="w-5 h-5" /> },
        { id: 'security', title: '8. Security Personnel', icon: <Search className="w-5 h-5" /> },
        { id: 'troubleshooting', title: '9. Troubleshooting', icon: <HelpCircle className="w-5 h-5" /> },
    ]

    const scrollToSection = (id) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 100
            const bodyRect = document.body.getBoundingClientRect().top
            const elementRect = element.getBoundingClientRect().top
            const elementPosition = elementRect - bodyRect
            const offsetPosition = elementPosition - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">
            {/* Navigation Header */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                        <GvasLogo className="h-8 w-8 text-[#070f2b] dark:text-white" />
                        <span className="text-xl font-bold tracking-tight text-[#070f2b] dark:text-white">GVAS Documentation</span>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#070f2b] dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Website</span>
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
                        <div className="sticky top-32 space-y-1">
                            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-3">Table of Contents</h3>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-[#070f2b] dark:hover:text-white rounded-lg transition-all text-left group"
                                >
                                    <span className="text-slate-400 dark:text-slate-600 group-hover:text-[#070f2b] dark:group-hover:text-white transition-colors">
                                        {section.icon}
                                    </span>
                                    <span>{section.title.split('. ')[1]}</span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            <header className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-black text-[#070f2b] dark:text-white tracking-tight">
                                    GVAS – User Manual & Guide
                                </h1>
                                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                                    Welcome to the Guest and Visitor Attendance System (GVAS). This manual provides a comprehensive guide for navigating and using the system across all employee roles.
                                </p>
                                <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl space-x-3">
                                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        GVAS is designed to enhance building security while delivering a smooth, professional experience for all guests and visitors.
                                    </p>
                                </div>
                            </header>

                            <hr className="border-slate-200 dark:border-slate-800" />

                            {/* Getting Started */}
                            <section id="getting-started" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#070f2b] text-white rounded-lg">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">1. Getting Started</h2>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Accessing the System</h3>
                                    <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-400">
                                        <li><span className="font-bold">Login:</span> Enter your official company email and password.</li>
                                        <li><span className="font-bold">Role-Based Access:</span> After login, the system automatically redirects you to the appropriate dashboard based on your role:
                                            <ul className="ml-8 mt-2 space-y-1 list-none border-l-2 border-slate-200 dark:border-slate-800 pl-4">
                                                <li className="flex items-center space-x-2"><ChevronRight size={14} /> <span>Host</span></li>
                                                <li className="flex items-center space-x-2"><ChevronRight size={14} /> <span>Reception</span></li>
                                                <li className="flex items-center space-x-2"><ChevronRight size={14} /> <span>Administrator</span></li>
                                                <li className="flex items-center space-x-2"><ChevronRight size={14} /> <span>Security</span></li>
                                            </ul>
                                        </li>
                                    </ul>

                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                                        <img
                                            src="/images/manual/login_view.png"
                                            alt="GVAS Login Screen"
                                            className="w-full h-auto rounded-xl"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-2 italic">Figure 1.1: GVAS Login Interface with Role-Based Demo Access</p>
                                    </div>
                                </div>
                            </section>

                            {/* Notifications System */}
                            <section id="notifications" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#070f2b] text-white rounded-lg">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">2. Notifications System</h2>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-slate-600 dark:text-slate-400">
                                        The GVAS notification system ensures real-time communication between guests, receptionists, and hosts.
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <h4 className="font-bold text-[#070f2b] dark:text-white flex items-center space-x-2">
                                                <span className="p-1 bg-slate-100 dark:bg-slate-800 rounded">🪪</span>
                                                <span>Reception Notifications</span>
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receptionists receive alerts when:</p>
                                            <ul className="text-sm space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
                                                <li>A guest completes self-registration</li>
                                                <li>A host approves a walk-in visitor</li>
                                            </ul>
                                        </div>

                                        <div className="space-y-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <h4 className="font-bold text-[#070f2b] dark:text-white flex items-center space-x-2">
                                                <span className="p-1 bg-slate-100 dark:bg-slate-800 rounded">👤</span>
                                                <span>Host Notifications</span>
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Hosts receive instant alerts via:</p>
                                            <ul className="text-sm space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
                                                <li>In-app dashboard notifications</li>
                                                <li>Email notifications</li>
                                            </ul>
                                            <p className="text-xs text-slate-500 italic mt-2">Triggered when a visitor arrives at reception.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg">Visual Indicators</h3>
                                        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                                            <li className="flex items-start space-x-2">
                                                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>A red dot on the <span className="font-bold text-[#070f2b] dark:text-white">notification bell icon</span> (top-right corner) indicates unread alerts.</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>Clicking the bell displays visit details and required actions.</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                                        <img
                                            src="/images/manual/notifications_view.png"
                                            alt="GVAS Notification Panel"
                                            className="w-full h-auto rounded-xl"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-2 italic">Figure 2.1: Host Dashboard with Real-time Notification Sidebar</p>
                                    </div>
                                </div>
                            </section>

                            {/* Visitor Flows */}
                            <section id="visitor-flows" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#070f2b] text-white rounded-lg">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">3. Visitor Flows</h2>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-slate-600 dark:text-slate-400">
                                        GVAS supports two primary visitor flows to handle both planned and unplanned visits.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <h3 className="text-lg font-bold text-[#070f2b] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">3.1 Walk-in Visitor Flow (Add Guest)</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">For visitors arriving without a prior invitation:</p>
                                            <ol className="text-sm space-y-3 text-slate-600 dark:text-slate-400">
                                                <li className="flex items-start space-x-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">1</span> <span><span className="font-bold dark:text-white">Reception</span> clicks <span className="text-blue-600 dark:text-blue-400 font-semibold">Walk-in Check-in</span>.</span></li>
                                                <li className="flex items-start space-x-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">2</span> <span><span className="font-bold dark:text-white">Form Entry:</span> Enter visitor details (Name, Email, Phone, Company, Purpose).</span></li>
                                                <li className="flex items-start space-x-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">3</span> <span><span className="font-bold dark:text-white">Host Selection:</span> Choose the host the visitor intends to see.</span></li>
                                                <li className="flex items-start space-x-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">4</span> <span><span className="font-bold dark:text-white">Submission:</span> The system sends an approval request to the host.</span></li>
                                                <li className="flex items-start space-x-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center font-bold text-xs text-green-700 dark:text-green-400">5</span> <span><span className="font-bold dark:text-white">Approval:</span> Once the host clicks <span className="text-green-600 dark:text-green-400 font-semibold">Approve</span>, the receptionist can complete the check-in.</span></li>
                                            </ol>
                                        </div>

                                        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <h3 className="text-lg font-bold text-[#070f2b] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">3.2 Invitation Flow (Pre-registered Visitor)</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">For scheduled or planned visits:</p>
                                            <ol className="text-sm space-y-3 text-slate-600 dark:text-slate-400">
                                                <li className="flex items-start space-x-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">1</span> <span><span className="font-bold dark:text-white">Host</span> pre-registers the guest from their dashboard.</span></li>
                                                <li className="flex items-start space-x-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">2</span> <span>The system sends an automated invitation email to the guest.</span></li>
                                                <li className="flex items-start space-x-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-xs text-blue-700 dark:text-blue-400">3</span> <span><span className="font-bold dark:text-white">Invitation Contents</span> include a unique <span className="font-bold">6-digit Guest Code</span> and a <span className="font-bold">QR Code</span> for express check-in.</span></li>
                                            </ol>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                                        <img
                                            src="/images/manual/visitor_flow.png"
                                            alt="GVAS Add New Visitor Modal"
                                            className="w-full h-auto rounded-xl"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-2 italic">Figure 3.1: Pre-registration Form for Hosts and Receptionists</p>
                                    </div>
                                </div>
                            </section>

                            {/* Guest Self-Registration */}
                            <section id="self-registration" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#070f2b] text-white rounded-lg">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">4. Guest Self-Registration</h2>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Guests can pre-register themselves to reduce waiting time at reception.
                                    </p>

                                    <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                                        <h4 className="font-bold text-lg">How Guest Self-Registration Works</h4>
                                        <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                                            <li className="flex items-start space-x-3">
                                                <div className="w-5 h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                                                <div><span className="font-bold">Access:</span> The guest opens the public registration URL (or uses a lobby kiosk).</div>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <div className="w-5 h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                                                <div><span className="font-bold">Information Entry:</span> Personal details and Host selection.</div>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <div className="w-5 h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                                                <div><span className="font-bold">Visit Scheduling:</span> Select intended visit date and time.</div>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <div className="w-5 h-5 rounded bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                                                <div><span className="font-bold">Confirmation:</span> The system emails the guest a digital pass containing a QR Code.</div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                                        <img
                                            src="/images/manual/self_registration.png"
                                            alt="Guest Self-Registration Interface"
                                            className="w-full h-auto rounded-xl"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-2 italic">Figure 4.1: Guest-facing Registration Portal for Kiosks or Mobile Devices</p>
                                    </div>
                                </div>
                            </section>

                            {/* Hosts (Employees) */}
                            <section id="hosts" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#070f2b] text-white rounded-lg">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">5. Hosts (Employees)</h2>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Hosts are responsible for managing guest invitations and approving visitor access.
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs inline-block uppercase tracking-wider">Action 1</h4>
                                            <h3 className="text-xl font-bold">Pre-registering a Guest</h3>
                                            <ol className="text-sm space-y-4 text-slate-600 dark:text-slate-400">
                                                <li className="flex items-start space-x-3"><span className="font-bold text-[#070f2b] dark:text-white">1.</span> <span>Click <span className="font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Invite Guest</span> or <span className="font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Pre-register Visitor</span> on your dashboard.</span></li>
                                                <li className="flex items-start space-x-3"><span className="font-bold text-[#070f2b] dark:text-white">2.</span> <span>Enter guest details (Name, Email, Phone).</span></li>
                                                <li className="flex items-start space-x-3"><span className="font-bold text-[#070f2b] dark:text-white">3.</span> <span>Select the visit date and time.</span></li>
                                                <li className="flex items-start space-x-3"><span className="font-bold text-[#070f2b] dark:text-white">4.</span> <span>Click <span className="font-bold dark:text-white">Submit</span>.</span></li>
                                            </ol>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs inline-block uppercase tracking-wider">Action 2</h4>
                                            <h3 className="text-xl font-bold">Approving Visitors</h3>
                                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl space-y-4">
                                                <p className="text-sm text-slate-700 dark:text-slate-300">When a visitor arrives, check:</p>
                                                <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                                                    <li className="flex items-center space-x-2"><ChevronRight size={14} className="text-orange-500" /> <span>Notifications panel, or</span></li>
                                                    <li className="flex items-center space-x-2"><ChevronRight size={14} className="text-orange-500" /> <span>Pending Approvals list on dashboard</span></li>
                                                </ul>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 pt-2 border-t border-orange-100 dark:border-orange-900/30">
                                                    Review visitor details and click <span className="text-green-600 dark:text-green-400">Approve</span> to authorize entry.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                                        <img
                                            src="/images/manual/host_dashboard_view.png"
                                            alt="Host Dashboard Overview"
                                            className="w-full h-auto rounded-xl"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-2 italic">Figure 5.1: Host Dashboard Overview</p>
                                    </div>

                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                                        <img
                                            src="/images/manual/approving_visitors.png"
                                            alt="Reviewing and Approving Visitors"
                                            className="w-full h-auto rounded-xl"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-2 italic">Figure 5.2: Reviewing and Approving Visitors from the Dashboard</p>
                                    </div>
                                </div>
                            </section>

                            {/* Receptionists */}
                            <section id="receptionists" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#070f2b] text-white rounded-lg">
                                        <Printer className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">6. Receptionists</h2>
                                </div>

                                <div className="space-y-8">
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Receptionists manage front desk operations, visitor verification, and badge issuance.
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-bl-3xl">
                                                <CheckCircle2 size={24} className="text-blue-500" />
                                            </div>
                                            <h3 className="text-xl font-bold">Checking In Visitors</h3>
                                            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                                                <li>
                                                    <p className="font-bold text-[#070f2b] dark:text-white mb-1">QR Scan:</p>
                                                    <p>Scan the guest’s QR Code for instant check-in.</p>
                                                </li>
                                                <li>
                                                    <p className="font-bold text-[#070f2b] dark:text-white mb-1">Manual Verification:</p>
                                                    <p>Used for walk-ins. Confirm host approval before clicking Confirm Check-in.</p>
                                                </li>
                                                <li>
                                                    <p className="font-bold text-[#070f2b] dark:text-white mb-1">Badge Printing:</p>
                                                    <p>Click <span className="text-blue-600 dark:text-blue-400 font-bold">Print Badge</span> to generate the physical visitor pass.</p>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 bg-red-500/10 dark:bg-red-500/20 rounded-bl-3xl">
                                                <MinusCircle size={24} className="text-red-500" />
                                            </div>
                                            <h3 className="text-xl font-bold">Checking Out Visitors</h3>
                                            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                                                <li>
                                                    <p className="font-bold text-[#070f2b] dark:text-white mb-1">Active Visitors:</p>
                                                    <p>Locate the visitor in the Active Visitors list on your dashboard.</p>
                                                </li>
                                                <li>
                                                    <p className="font-bold text-[#070f2b] dark:text-white mb-1">Action:</p>
                                                    <p>Click <span className="text-red-500 font-bold">Check Out</span> to complete the visit and release the badge.</p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 opacity-80 hover:opacity-100 transition-opacity">
                                        <img
                                            src="/images/manual/reception_badge.png"
                                            alt="Reception Badge Printing"
                                            className="w-full h-auto rounded-xl"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-2 italic">Figure 6.1: Badge Issuance and Printing Modal</p>
                                    </div>
                                </div>
                            </section>

                            {/* Administrators */}
                            <section id="administrators" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#070f2b] text-white rounded-lg">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">7. Administrators</h2>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Administrators have complete system visibility and configuration control.
                                    </p>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        {[
                                            { title: 'User Management', desc: 'Create, edit, or deactivate staff accounts and assign roles.' },
                                            { title: 'Audit Logs', desc: 'Review a complete history of system activity and user actions.' },
                                            { title: 'Reporting', desc: 'Export visitor data in CSV or PDF format for compliance or analysis.' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="p-6 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-colors">
                                                <h4 className="font-bold mb-2 dark:text-white">{item.title}</h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                                        <img
                                            src="/images/manual/admin_full.png"
                                            alt="Admin Dashboard Overview"
                                            className="w-full h-auto rounded-xl"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-2 italic">Figure 7.1: Administrator Dashboard and Control Panel</p>
                                    </div>
                                </div>
                            </section>

                            {/* Security Personnel */}
                            <section id="security" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#070f2b] text-white rounded-lg">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">8. Security Personnel</h2>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Security personnel focus on safety, compliance, and live occupancy monitoring.
                                    </p>

                                    <div className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
                                        <h3 className="text-xl font-bold mb-6 relative z-10">Safety & Monitoring Features</h3>
                                        <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                            <div className="space-y-3">
                                                <h4 className="font-bold flex items-center space-x-2 text-blue-400">
                                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                                    <span>Evacuation List</span>
                                                </h4>
                                                <p className="text-sm text-slate-300 leading-relaxed">
                                                    Real-time list of everyone currently in the building, sortable by floor for emergency roll calls.
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-bold flex items-center space-x-2 text-red-400">
                                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                                    <span>Blacklist Management</span>
                                                </h4>
                                                <p className="text-sm text-slate-300 leading-relaxed">
                                                    Flag restricted individuals to prevent unauthorized access and trigger instant security alerts.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                                        <img
                                            src="/images/manual/security_full.png"
                                            alt="Security Evacuation List"
                                            className="w-full h-auto rounded-xl"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-2 italic">Figure 8.1: Real-time Emergency Evacuation and Monitoring List</p>
                                    </div>
                                </div>
                            </section>

                            {/* Troubleshooting */}
                            <section id="troubleshooting" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#070f2b] text-white rounded-lg">
                                        <HelpCircle className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">9. Troubleshooting</h2>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <h4 className="font-bold mb-2">QR Code Not Scanning</h4>
                                            <ul className="text-sm space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
                                                <li>Increase the visitor’s screen brightness</li>
                                                <li>Use manual verification (Guest Code) if necessary</li>
                                            </ul>
                                        </div>
                                        <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <h4 className="font-bold mb-2">Data Not Updating</h4>
                                            <ul className="text-sm space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
                                                <li>Click the <span className="font-bold text-[#070f2b] dark:text-white">Live Update</span> button to refresh real-time data</li>
                                                <li>Check your internet connection or reload the browser</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <footer className="pt-20 pb-10 border-t border-slate-200 dark:border-slate-800 text-center">
                                <p className="text-sm text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] font-bold">UAC House – Guest and Visitor Attendance System (GVAS)</p>
                                <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">© 2024 Global Visitor Access System. All rights reserved.</p>
                            </footer>
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default Resources
