import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    Flag,
    Trophy,
    BarChart3,
    Settings,
    MessageSquare,
    Zap,
    ChevronLeft,
    Sparkles
} from 'lucide-react'

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { path: '/team', icon: Users, label: 'Team', badge: '8' },
    { path: '/pitstop', icon: Flag, label: 'Pit-Stop', badge: '3' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard', badge: null },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', badge: null },
    { path: '/standup', icon: MessageSquare, label: 'Standup', badge: 'NEW' },
]

const bottomItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation()

    const sidebarVariants = {
        open: { width: 280, transition: { duration: 0.3, ease: 'easeInOut' } },
        closed: { width: 80, transition: { duration: 0.3, ease: 'easeInOut' } }
    }

    return (
        <motion.aside
            variants={sidebarVariants}
            animate={isOpen ? 'open' : 'closed'}
            className="relative h-screen bg-dark-800/50 backdrop-blur-xl border-r border-dark-600/50 flex flex-col"
        >
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <motion.div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-glow"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Zap className="w-6 h-6 text-white" />
                </motion.div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex flex-col"
                        >
                            <span className="font-display font-bold text-lg gradient-text">Sprint</span>
                            <span className="text-xs text-text-muted -mt-1">Strategist</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <motion.div animate={{ rotate: isOpen ? 0 : 180 }}>
                    <ChevronLeft className="w-4 h-4" />
                </motion.div>
            </motion.button>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <AnimatePresence>
                    {isOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-4 text-xs font-medium text-text-muted uppercase tracking-wider"
                        >
                            Main Menu
                        </motion.span>
                    )}
                </AnimatePresence>

                <div className="mt-3 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                                    ? 'bg-accent/10 text-accent'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-700'
                                }
              `}
                        >
                            {({ isActive }) => (
                                <>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full"
                                            />
                                        )}
                                    </motion.div>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="font-medium flex-1"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {isOpen && item.badge && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`
                        px-2 py-0.5 text-xs font-bold rounded-full
                        ${item.badge === 'NEW'
                                                    ? 'bg-accent text-white'
                                                    : 'bg-dark-600 text-text-secondary'
                                                }
                      `}
                                        >
                                            {item.badge}
                                        </motion.span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Bottom Items */}
            <div className="px-3 py-4 border-t border-dark-600/50">
                {bottomItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive
                                ? 'bg-accent/10 text-accent'
                                : 'text-text-secondary hover:text-text-primary hover:bg-dark-700'
                            }
            `}
                    >
                        <item.icon className="w-5 h-5" />
                        <AnimatePresence>
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-medium"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}

                {/* AI Assistant Card */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-accent" />
                                <span className="font-semibold text-sm">Rovo AI</span>
                            </div>
                            <p className="text-xs text-text-muted mb-3">
                                Ask anything about your sprint
                            </p>
                            <button className="w-full btn-glow text-sm py-2">
                                Ask Rovo
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.aside>
    )
}
