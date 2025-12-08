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
  Monitor,
  Camera,
  Bell,
  BarChart3,
  Lock,
  ChevronRight,
  Menu,
  X,
  PlayCircle,
  Star,
  Quote,
  Sun,
  Moon
} from 'lucide-react'
import GvasLogo from '../components/GvasLogo'
import { useTheme } from '../contexts/ThemeContext'

const LandingPage = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const features = [
    {
      icon: <CheckCircle className="h-6 w-6 text-[#070f2b]" />,
      title: "Digital Entry",
      description: "Seamless guest registration without paper logbooks"
    },
    {
      icon: <Shield className="h-6 w-6 text-[#070f2b]" />,
      title: "Security Verification",
      description: "Instant background checks and ID verification"
    },
    {
      icon: <Bell className="h-6 w-6 text-[#070f2b]" />,
      title: "Instant Alerts",
      description: "Real-time host notifications upon arrival"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-[#070f2b]" />,
      title: "Analytics",
      description: "Detailed insights into visitor traffic and trends"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-[#070f2b] dark:text-white font-sans selection:bg-[#070f2b] selection:text-white dark:selection:bg-white dark:selection:text-[#070f2b] overflow-x-hidden transition-colors duration-300">

      {/* Floating Navbar */}
      <div className="fixed top-6 w-full z-50 flex justify-center px-4">
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-[#070f2b]/10 dark:border-white/10 rounded-full px-6 py-3 shadow-sm max-w-5xl w-full flex items-center justify-between transition-colors duration-300">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <GvasLogo className="h-8 w-8 text-[#070f2b] dark:text-white" />
            <span className="text-xl font-bold tracking-tight text-[#070f2b] dark:text-white">GVAS</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {['Features', 'Solutions', 'Enterprise', 'Resources'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-[#070f2b]/70 dark:text-white/70 hover:text-[#070f2b] dark:hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[#070f2b] dark:text-white hover:bg-[#070f2b]/5 dark:hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-full text-[#070f2b] dark:text-white font-medium text-sm hover:bg-[#070f2b]/5 dark:hover:bg-white/10 transition-colors"
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

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-[#070f2b] dark:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-24 z-40 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#070f2b]/10 dark:border-white/10 p-6 lg:hidden"
          >
            <div className="flex flex-col space-y-4">
              {['Features', 'Solutions', 'Enterprise', 'Resources'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-lg font-medium text-[#070f2b] dark:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 flex flex-col space-y-3 border-t border-[#070f2b]/10 dark:border-white/10">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-5 py-3 rounded-xl border border-[#070f2b]/20 dark:border-white/20 text-[#070f2b] dark:text-white font-medium"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/guest-register')}
                  className="w-full px-5 py-3 rounded-xl bg-[#070f2b] dark:bg-white text-white dark:text-[#070f2b] font-bold"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">

          {/* Badge */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="inline-flex items-center space-x-2 bg-[#070f2b]/5 dark:bg-white/10 rounded-full px-1 py-1 pr-4 mb-6"
          >
            <span className="bg-[#070f2b] dark:bg-white text-white dark:text-[#070f2b] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              New
            </span>
            <span className="text-[#070f2b]/80 dark:text-white/80 text-sm font-medium">
              Enterprise Visitor Management System
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold text-[#070f2b] dark:text-white mb-6 leading-[1.1] tracking-tight max-w-5xl mx-auto"
          >
            Streamline Visitor Access with <br />
            <span className="relative whitespace-nowrap">
              Intelligent Security
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#070f2b] dark:text-white opacity-20" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7262 3.8647 62.1932 2.62886 100 2.5C146.401 2.34182 196.248 4.242 198 6.99997" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#070f2b]/70 dark:text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Professional visitor management that enhances security, impresses guests, and automates compliance. Trusted by industry leaders.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 lg:mb-12"
          >
            <button
              onClick={() => navigate('/guest-register')}
              className="group w-full sm:w-auto min-w-[180px] px-8 py-4 rounded-full bg-[#070f2b] dark:bg-white text-white dark:text-[#070f2b] font-semibold text-lg hover:bg-[#070f2b]/90 dark:hover:bg-white/90 transition-all shadow-xl shadow-[#070f2b]/20 dark:shadow-white/10"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Register as Guest</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              className="group w-full sm:w-auto min-w-[180px] px-8 py-4 rounded-full bg-white dark:bg-slate-800 border border-[#070f2b]/20 dark:border-white/20 text-[#070f2b] dark:text-white font-semibold text-lg hover:bg-[#070f2b]/5 dark:hover:bg-slate-700 transition-all"
            >
              Book a Demo
            </button>
          </motion.div>

          {/* Hero Images Container */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative mx-auto max-w-7xl px-0 sm:px-4"
          >
            <div className="relative">
              {/* Desktop Dashboard Image */}
              <div className="relative z-10 bg-white rounded-none sm:rounded-xl md:rounded-2xl shadow-2xl border border-[#070f2b]/10 overflow-hidden transform md:-translate-x-4">
                <img
                  src="/images/dashboard-hero-real.jpg"
                  alt="GVAS Desktop Dashboard"
                  className="w-full h-auto object-cover scale-100 md:scale-100"
                />
              </div>

              {/* Mobile Dashboard Image - Positioned Absolute */}
              <div className="hidden md:block absolute -right-8 -bottom-8 z-20 w-[240px] lg:w-[280px] rounded-[2.5rem] bg-[#070f2b] p-2 shadow-2xl transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500 hover:z-30 hover:scale-105 border-[6px] border-[#070f2b]">
                <div className="rounded-[2rem] overflow-hidden bg-white h-full relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#070f2b] rounded-b-lg z-10"></div>
                  <img
                    src="/images/dashboard-mobile.jpg"
                    alt="GVAS Mobile App"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#070f2b]/5 blur-[80px] -z-10 rounded-full"></div>
          </motion.div>

        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-[#070f2b]/5 dark:border-white/5 bg-[#070f2b]/[0.02] dark:bg-white/[0.02] overflow-hidden">
        <div className="container mx-auto px-6">
          <p className="text-[#070f2b]/50 dark:text-white/50 text-xs md:text-sm mb-8 text-center font-bold tracking-[0.2em] uppercase">Trusted by forward-thinking companies</p>

          {/* Infinite Scrolling Carousel */}
          <div className="relative">
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-scroll {
                animation: scroll 30s linear infinite;
              }
              .animate-scroll:hover {
                animation-play-state: paused;
              }
            `}} />

            <div className="flex animate-scroll">
              {/* First set of companies */}
              <div className="flex items-center gap-16 md:gap-24 px-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                <h3 className="text-xl md:text-2xl font-bold font-serif text-[#070f2b] dark:text-white tracking-tight whitespace-nowrap">Acme Corp</h3>
                <h3 className="text-xl md:text-2xl font-bold font-sans text-[#070f2b] dark:text-white tracking-widest whitespace-nowrap">GLOBAL</h3>
                <h3 className="text-xl md:text-2xl font-black font-mono text-[#070f2b] dark:text-white whitespace-nowrap">NEXUS</h3>
                <h3 className="text-xl md:text-2xl font-bold font-sans text-[#070f2b] dark:text-white italic whitespace-nowrap">Vertex</h3>
                <h3 className="text-xl md:text-2xl font-bold font-serif text-[#070f2b] dark:text-white whitespace-nowrap">Stark Industries</h3>
                <h3 className="text-xl md:text-2xl font-bold font-sans text-[#070f2b] dark:text-white whitespace-nowrap">TechFlow</h3>
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-16 md:gap-24 px-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                <h3 className="text-xl md:text-2xl font-bold font-serif text-[#070f2b] dark:text-white tracking-tight whitespace-nowrap">Acme Corp</h3>
                <h3 className="text-xl md:text-2xl font-bold font-sans text-[#070f2b] dark:text-white tracking-widest whitespace-nowrap">GLOBAL</h3>
                <h3 className="text-xl md:text-2xl font-black font-mono text-[#070f2b] dark:text-white whitespace-nowrap">NEXUS</h3>
                <h3 className="text-xl md:text-2xl font-bold font-sans text-[#070f2b] dark:text-white italic whitespace-nowrap">Vertex</h3>
                <h3 className="text-xl md:text-2xl font-bold font-serif text-[#070f2b] dark:text-white whitespace-nowrap">Stark Industries</h3>
                <h3 className="text-xl md:text-2xl font-bold font-sans text-[#070f2b] dark:text-white whitespace-nowrap">TechFlow</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-[#070f2b] dark:text-white mb-6 leading-tight">
                Everything needed to run <br />
                <span className="text-[#070f2b]/60 dark:text-white/60">modern facilities.</span>
              </h2>
              <p className="text-[#070f2b]/70 dark:text-white/70 text-lg max-w-xl leading-relaxed">
                Replace outdated logbooks with a system that secures your building, delights visitors, and gives you complete visibility.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <button className="text-[#070f2b] dark:text-white border-b-2 border-[#070f2b] dark:border-white pb-1 hover:text-[#070f2b]/70 dark:hover:text-white/70 hover:border-[#070f2b]/70 dark:hover:border-white/70 transition-all flex items-center space-x-2 font-semibold">
                <span>View all features</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-[#070f2b]/10 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-[#070f2b]/20 dark:hover:border-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#070f2b]/5 dark:bg-white/10 flex items-center justify-center mb-6 text-[#070f2b] dark:text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[#070f2b] dark:text-white mb-3">{feature.title}</h3>
                <p className="text-[#070f2b]/70 dark:text-white/70 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#070f2b] text-white overflow-hidden relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Voices of Leadership</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                quote: "GVAS transformed how we handle security. The difference was night and day compared to our old paper-based system.",
                author: "Sarah Jenkins",
                role: "Head of Operations, TechFlow"
              },
              {
                quote: "The interface is incredibly intuitive. Our reception staff mastered it in minutes, and our visitors love the quick check-in.",
                author: "Michael Chang",
                role: "Facility Director, Skyline Towers"
              }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/10 backdrop-blur-sm border border-white/10 p-10 rounded-3xl relative hover:bg-white/15 transition-colors"
              >
                <Quote className="absolute top-8 right-8 w-8 h-8 text-white/20" />
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-white fill-white" />)}
                </div>
                <p className="text-lg text-white/90 mb-8 leading-relaxed">"{t.quote}"</p>
                <div>
                  <p className="text-white font-bold">{t.author}</p>
                  <p className="text-white/60 text-sm">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-white dark:bg-slate-950">
        <div className="container mx-auto relative z-10">
          <div className="bg-[#070f2b] dark:bg-white rounded-[3rem] p-12 md:p-24 text-center shadow-2xl max-w-6xl mx-auto relative overflow-hidden">

            {/* Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative z-10"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-[#070f2b] mb-6">
                Ready to secure your facility?
              </h2>
              <p className="text-white/80 dark:text-[#070f2b]/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
                Join thousands of companies using GVAS to manage visitors securely and efficiently.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate('/guest-register')}
                  className="px-10 py-5 bg-white dark:bg-[#070f2b] text-[#070f2b] dark:text-white rounded-full font-bold text-lg hover:bg-gray-100 dark:hover:bg-[#070f2b]/90 transition-colors shadow-lg"
                >
                  Get Started Now
                </button>
                <button className="px-10 py-5 bg-transparent border border-white/30 dark:border-[#070f2b]/30 text-white dark:text-[#070f2b] rounded-full font-bold text-lg hover:bg-white/10 dark:hover:bg-[#070f2b]/10 transition-colors">
                  Contact Sales
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 pt-20 pb-10 border-t border-[#070f2b]/5 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6 cursor-pointer">
                <GvasLogo className="w-8 h-8 text-[#070f2b] dark:text-white" />
                <span className="text-xl font-bold text-[#070f2b] dark:text-white">GVAS</span>
              </div>
              <p className="text-[#070f2b]/60 dark:text-white/60 text-sm leading-relaxed">
                The enterprise standard for visitor management and facility security.
              </p>
            </div>

            <div>
              <h4 className="text-[#070f2b] dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-4 text-sm text-[#070f2b]/70 dark:text-white/70">
                <li><a href="#" className="hover:text-[#070f2b] dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#070f2b] dark:hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-[#070f2b] dark:hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#070f2b] dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-4 text-sm text-[#070f2b]/70 dark:text-white/70">
                <li><a href="#" className="hover:text-[#070f2b] dark:hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#070f2b] dark:hover:text-white transition-colors">Customers</a></li>
                <li><a href="#" className="hover:text-[#070f2b] dark:hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#070f2b] dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Connect</h4>
              <div className="flex space-x-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 rounded-full bg-[#070f2b]/5 dark:bg-white/10 flex items-center justify-center hover:bg-[#070f2b] dark:hover:bg-white hover:text-white dark:hover:text-[#070f2b] transition-all cursor-pointer text-[#070f2b] dark:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#070f2b]/5 dark:bg-white/10 flex items-center justify-center hover:bg-[#070f2b] dark:hover:bg-white hover:text-white dark:hover:text-[#070f2b] transition-all cursor-pointer text-[#070f2b] dark:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#070f2b]/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center text-[#070f2b]/60 dark:text-white/60 text-sm">
            <p>&copy; 2024 Global Visitor Access System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage