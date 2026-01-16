import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
            <div className="max-w-xl w-full text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative"
                >
                    <div className="text-[12rem] font-black text-slate-200 dark:text-slate-900 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <Search size={64} className="text-[#070f2b] dark:text-white" />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-[#070f2b] dark:text-white mb-4"
                >
                    Lost in the Corridor?
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-600 dark:text-slate-400 text-lg mb-12"
                >
                    The page you're looking for was either checked out or never existed in our register.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-8 py-4 rounded-full border border-slate-200 dark:border-slate-800 text-[#070f2b] dark:text-white font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#070f2b] dark:bg-white text-white dark:text-[#070f2b] font-semibold flex items-center justify-center gap-2 hover:shadow-xl transition-all"
                    >
                        <Home size={18} />
                        Back to Home
                    </button>
                </motion.div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-slate-200/50 dark:bg-slate-900/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-slate-200/50 dark:bg-slate-900/20 blur-[120px] rounded-full" />
            </div>
        </div>
    )
}

export default NotFound
