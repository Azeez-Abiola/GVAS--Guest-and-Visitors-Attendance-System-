import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  Building2, 
  CheckCircle, 
  Phone,
  Mail,
  MapPin,
  Monitor,
  Smartphone,
  Camera,
  Clock,
  QrCode,
  UserCheck,
  Bell,
  BarChart3,
  Lock,
  Eye,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  FileText,
  Wifi,
  Database,
  Globe,
  Menu,
  X
} from 'lucide-react'
import GvasLogo from '../components/GvasLogo'

// FAQ Component with animations
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqData = [
    {
      question: "What is GVAS and how does it work?",
      answer: "GVAS (Global Visitor Access System) is a comprehensive visitor management platform that streamlines the check-in process for guests. It provides digital registration, photo capture, host notifications, and real-time tracking to enhance security and improve visitor experience."
    },
    {
      question: "Can visitors pre-register before their visit?",
      answer: "Yes! GVAS supports pre-registration where visitors can submit their information in advance. This creates a faster check-in experience and allows hosts to prepare for their arrival."
    },
    {
      question: "What security features does GVAS provide?",
      answer: "GVAS includes photo capture, digital signatures, real-time host notifications, visitor tracking, comprehensive audit trails, and integration with existing security systems to ensure maximum safety."
    },
    {
      question: "Is GVAS suitable for different types of buildings?",
      answer: "Absolutely! GVAS is designed to work in corporate offices, residential complexes, government buildings, educational institutions, and any facility that needs professional visitor management."
    },
    {
      question: "How does the mobile interface work?",
      answer: "GVAS features a responsive mobile-first design that works seamlessly on tablets and smartphones. The desk interface is optimized for touch interactions and provides an intuitive user experience."
    },
    {
      question: "Can GVAS integrate with our existing systems?",
      answer: "Yes, GVAS is built with integration in mind. It can connect with existing security systems, access control, and notification platforms through our comprehensive API."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {faqData.map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 text-sm sm:text-base">{faq.question}</span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 ml-4"
            >
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

const LandingPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const stakeholders = [
    {
      title: "Facility Managers",
      icon: <Building2 className="h-6 w-6" />,
      benefit: "Centralized control & compliance",
      description: "Complete oversight of all visitor activities across multiple buildings with real-time analytics and compliance reporting."
    },
    {
      title: "Tenants",
      icon: <Users className="h-6 w-6" />,
      benefit: "Seamless hosting experience",
      description: "Effortless guest pre-registration and automatic notifications when visitors arrive, enhancing professional hosting."
    },
    {
      title: "Security Teams",
      icon: <Shield className="h-6 w-6" />,
      benefit: "Instant visitor traceability",
      description: "Real-time visitor tracking with photo verification and immediate alerts for enhanced building security."
    },
    {
      title: "Guests",
      icon: <UserCheck className="h-6 w-6" />,
      benefit: "Smooth, fast, and paperless entry",
      description: "Quick check-in process with digital forms and QR codes, eliminating long waits and paperwork."
    }
  ]

  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Digital Guest Forms",
      description: "Replace manual logbooks with secure digital registration"
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Face & ID Capture",
      description: "Improve security with image validation and verification"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Host Notifications",
      description: "Real-time arrival alerts via SMS, email, or app"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics Dashboard",
      description: "Visualize visitor trends and compliance reporting"
    },
    {
      icon: <Wifi className="h-8 w-8" />,
      title: "Access Control Integration",
      description: "Connect doors, elevators, and camera systems"
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "GDPR & NDPA Compliant",
      description: "Data privacy guaranteed with enterprise security"
    }
  ]

  const processSteps = [
    {
      number: "01",
      title: "Pre-register guests",
      description: "Hosts create guest invitations with visit details",
      icon: <Users className="h-6 w-6" />
    },
    {
      number: "02",
      title: "Send automated QR code",
      description: "Guests receive secure QR codes via email/SMS",
      icon: <QrCode className="h-6 w-6" />
    },
    {
      number: "03",
      title: "Scan at reception desk",
      description: "Quick check-in with photo capture and signature",
      icon: <Monitor className="h-6 w-6" />
    },
    {
      number: "04",
      title: "Access granted & logged",
      description: "Secure entry with complete audit trail",
      icon: <CheckCircle className="h-6 w-6" />
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % stakeholders.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 backdrop-blur-xl border-b border-blue-500/30 shadow-lg">
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="container mx-auto px-4 sm:px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="flex items-center space-x-3"
            >
              <GvasLogo variant="white" />
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-xl tracking-wide">GVAS</h1>
                <p className="text-blue-200 text-xs">Visitor Management</p>
              </div>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <a href="#features" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium relative group">
                Features
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-3/4 transition-all duration-300"></span>
              </a>
              <a href="#how-it-works" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium relative group">
                How It Works
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-3/4 transition-all duration-300"></span>
              </a>
              <a href="#security" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium relative group">
                Security
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-3/4 transition-all duration-300"></span>
              </a>
              <a href="#contact" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium relative group">
                Contact
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-3/4 transition-all duration-300"></span>
              </a>
              <div className="ml-4 pl-4 border-l border-white/20">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/desk')}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <Monitor className="h-4 w-4" />
                  <span>Visit Desk</span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </motion.button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 text-white border border-white/20 backdrop-blur-sm"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden mt-6 pb-6 border-t border-white/20 bg-white/5 rounded-b-2xl backdrop-blur-sm"
              >
                <div className="flex flex-col space-y-2 pt-6">
                  <a 
                    href="#features" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-blue-200 hover:bg-white/10 transition-all duration-300 font-medium py-3 px-4 rounded-lg"
                  >
                    Features
                  </a>
                  <a 
                    href="#how-it-works" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-blue-200 hover:bg-white/10 transition-all duration-300 font-medium py-3 px-4 rounded-lg"
                  >
                    How It Works
                  </a>
                  <a 
                    href="#security" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-blue-200 hover:bg-white/10 transition-all duration-300 font-medium py-3 px-4 rounded-lg"
                  >
                    Security
                  </a>
                  <a 
                    href="#contact" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-blue-200 hover:bg-white/10 transition-all duration-300 font-medium py-3 px-4 rounded-lg"
                  >
                    Contact
                  </a>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      navigate('/desk')
                      setIsMobileMenuOpen(false)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg mx-4"
                  >
                    <Monitor className="h-4 w-4" />
                    <span>Visit Desk</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gray-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-blue-50/50"></div>
        <div className="absolute top-20 left-4 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-4 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="text-blue-600 text-xs sm:text-sm font-bold mb-4 uppercase tracking-wider">
                Next-Generation Visitor Management
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Reimagine Visitor Management in Your
                <span className="text-blue-600"> Facility.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                GVAS simplifies guest registration, enhances building security, and gives managers full control—all from one intelligent dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(30, 64, 175, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg transition-all duration-300"
                >
                  <span>Request Demo</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 64, 175, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-blue-200 hover:border-blue-400 bg-white/80 backdrop-blur-sm text-blue-700 hover:text-blue-800 px-6 sm:px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg"
                >
                  <PlayCircle className="h-5 w-5" />
                  <span>See How It Works</span>
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="relative">
                {/* Floating background elements */}
                <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-full h-full bg-blue-100/20 rounded-2xl sm:rounded-3xl blur-xl"></div>
                <div className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-full h-full bg-blue-100/20 rounded-2xl sm:rounded-3xl blur-xl"></div>
                
                {/* Dashboard Image */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 border border-white/50">
                  <img 
                    src="/images/dashboard.png" 
                    alt="GVAS Dashboard Interface" 
                    className="w-full h-auto rounded-xl sm:rounded-2xl shadow-lg"
                  />
                  <div className="absolute top-4 sm:top-8 right-4 sm:right-8">
                    <div className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="hidden sm:inline">Live Dashboard</span>
                      <span className="sm:hidden">Live</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating stats */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-4 sm:-left-8 top-1/4 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-4 border border-white/50"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg">
                      <Users className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-lg font-bold text-gray-900">127</div>
                      <div className="text-xs text-gray-600">Visitors Today</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute -right-4 sm:-right-8 bottom-1/4 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-4 border border-white/50"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-green-500 p-1.5 sm:p-2 rounded-lg">
                      <Shield className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-lg font-bold text-gray-900">100%</div>
                      <div className="text-xs text-gray-600">Secure</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How GVAS Works */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 bg-blue-50 relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-100/50"></div>
          <div className="absolute top-1/4 left-1/4 w-32 sm:w-48 h-32 sm:h-48 bg-blue-300/30 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-56 h-40 sm:h-56 bg-blue-300/30 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 h-24 sm:h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block text-blue-600 text-xs sm:text-sm font-bold mb-4 uppercase tracking-wider bg-white/80 px-4 py-2 rounded-full shadow-lg"
            >
              ✨ Simple & Effective
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">How GVAS Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 leading-relaxed">
              Streamlined visitor management in four simple steps
            </p>
          </motion.div>

          {/* Mobile-first responsive grid */}
          <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 lg:gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center relative group"
              >
                {/* Connection line for desktop */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-14 left-full w-full h-0.5 bg-blue-400 transform -translate-y-1/2 rounded-full opacity-60"></div>
                )}
                
                {/* Step number circle */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-lg sm:text-xl lg:text-2xl font-bold shadow-md group-hover:shadow-lg transition-all duration-300 relative"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {step.number}
                </motion.div>
                
                {/* Content card */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-white/50 group-hover:shadow-md group-hover:border-blue-200/50 transition-all duration-300 mx-2 sm:mx-0"
                >
                  <div className="text-blue-600 mb-3 flex justify-center group-hover:text-blue-700 transition-colors duration-300 transform group-hover:scale-110">
                    {step.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">{step.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{step.description}</p>
                </motion.div>
                
                {/* Mobile connection arrow */}
                {index < 3 && (
                  <div className="sm:hidden flex justify-center mt-6 mb-2">
                    <ChevronDown className="h-6 w-6 text-blue-400 animate-bounce" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-blue-50 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="text-blue-600 text-xs sm:text-sm font-bold mb-4 uppercase tracking-wider">
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Everything you need for modern visitor management
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group relative overflow-hidden"
              >
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="bg-blue-600 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors text-sm sm:text-base">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(30, 64, 175, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-2xl font-semibold flex items-center space-x-2 mx-auto transition-all duration-300 shadow-lg"
            >
              <span>See Full Feature List</span>
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Benefits for Stakeholders */}
      <section className="py-20 px-4 sm:px-6 bg-blue-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-blue-100/30"></div>
        <div className="absolute top-1/3 left-4 sm:left-10 w-32 sm:w-64 h-32 sm:h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-4 sm:right-10 w-40 sm:w-72 h-40 sm:h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="text-blue-600 text-xs sm:text-sm font-bold mb-4 uppercase tracking-wider">
              Universal Value
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Benefits for Everyone</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              GVAS delivers value across your entire organization
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-4 order-2 lg:order-1">
              {stakeholders.map((stakeholder, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, x: 10 }}
                  onClick={() => setActiveTab(index)}
                  className={`p-4 sm:p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeTab === index
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-white shadow-lg border border-white/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`p-2 rounded-lg ${activeTab === index ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'}`}>
                      {stakeholder.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg">{stakeholder.title}</h3>
                      <p className={`text-sm ${activeTab === index ? 'text-blue-100' : 'text-gray-600'}`}>
                        {stakeholder.benefit}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg border border-white/50 relative overflow-hidden order-1 lg:order-2"
            >
              {/* Background overlay */}
              <div className="absolute inset-0 bg-blue-50/50 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="bg-blue-600 p-3 rounded-xl w-fit mb-4">
                  <div className="text-white">
                    {stakeholders[activeTab].icon}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  {stakeholders[activeTab].title}
                </h3>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                  {stakeholders[activeTab].description}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">System Architecture</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Cloud-native, scalable, and secure infrastructure
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
              <div className="text-center">
                <div className="bg-blue-100 rounded-xl p-4 mb-3 mx-auto w-fit">
                  <Monitor className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Frontend</h4>
                <p className="text-xs sm:text-sm text-gray-600">Web + Desk</p>
              </div>
              <div className="hidden sm:flex justify-center">
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-xl p-4 mb-3 mx-auto w-fit">
                  <BarChart3 className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Dashboard</h4>
                <p className="text-xs sm:text-sm text-gray-600">Admin Control</p>
              </div>
              <div className="hidden sm:flex justify-center">
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-xl p-4 mb-3 mx-auto w-fit">
                  <Database className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">API Layer</h4>
                <p className="text-xs sm:text-sm text-gray-600">Secure Backend</p>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                <strong>Multi-building support</strong> • <strong>Cloud-native scaling</strong> • <strong>Enterprise security</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-20 px-4 sm:px-6 bg-gray-900 text-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="bg-blue-600 w-12 sm:w-16 h-12 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Security & Compliance</h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Enterprise-grade security you can trust
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: <Lock className="h-5 sm:h-6 w-5 sm:w-6" />,
                title: "End-to-end encryption",
                description: "AES-256, TLS 1.3"
              },
              {
                icon: <Users className="h-5 sm:h-6 w-5 sm:w-6" />,
                title: "Role-based access",
                description: "Granular permissions"
              },
              {
                icon: <FileText className="h-5 sm:h-6 w-5 sm:w-6" />,
                title: "Immutable audit logs",
                description: "Complete traceability"
              },
              {
                icon: <Globe className="h-5 sm:h-6 w-5 sm:w-6" />,
                title: "GDPR & NDPA Compliant",
                description: "Data privacy guaranteed"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 mb-4 w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center mx-auto">
                  <div className="text-blue-400">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-gray-300 text-xs sm:text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about GVAS and how it can transform your visitor management
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <FAQSection />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 bg-blue-600 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-blue-700/50"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-4 left-4 w-2 h-2 bg-white/20 rounded-full"></div>
          <div className="absolute top-12 left-16 w-2 h-2 bg-white/20 rounded-full"></div>
          <div className="absolute top-20 left-8 w-2 h-2 bg-white/20 rounded-full"></div>
          <div className="absolute top-8 left-32 w-2 h-2 bg-white/20 rounded-full"></div>
          <div className="absolute top-24 left-24 w-2 h-2 bg-white/20 rounded-full"></div>
        </div>
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-blue-200 text-xs sm:text-sm font-bold mb-4 uppercase tracking-wider">
              Ready to Transform?
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight px-4">
              Upgrade Your Building Security & Experience Today
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto px-4">
              Join hundreds of facilities already transforming their visitor management with GVAS
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-700 px-8 sm:px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg inline-flex items-center space-x-3"
            >
              <span>Book a Free Demo</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 sm:px-6 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <GvasLogo variant="white" className="mb-4" />
              <p className="text-gray-400 text-sm sm:text-base">
                Transforming visitor management for modern facilities
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Contact</h4>
              <div className="space-y-3 text-gray-400 text-sm">
                <div className="flex items-center space-x-3">
                  <Phone className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
                  <span>+234 (0) 123-GVAS</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
                  <span>hello@gvas.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © 2025 GVAS. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage