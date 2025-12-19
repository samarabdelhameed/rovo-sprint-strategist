import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Menu,
    Bell,
    Search,
    ChevronDown,
    Clock,
    Zap,
    X
} from 'lucide-react'

export default function Header({ toggleSidebar }) {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    const notifications = [
        { id: 1, type: 'warning', message: 'Sprint health dropped to 65%', time: '2m ago' },
        { id: 2, type: 'info', message: 'Daily standup generated', time: '1h ago' },
        { id: 3, type: 'success', message: 'PROJ-123 moved to Done', time: '3h ago' },
    ]

    const sprint = {
        name: 'Sprint 42',
        daysLeft: 5,
        health: 78
    }

    return (
        <header className="h-16 bg-dark-800/50 backdrop-blur-xl border-b border-dark-600/50 px-6 flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-4">
                <motion.button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-dark-700 transition-colors lg:hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Menu className="w-5 h-5" />
                </motion.button>

                {/* Sprint Info */}
                <div className="flex items-center gap-3">
                    <motion.div
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 border border-dark-500"
                        whileHover={{ borderColor: 'rgba(249, 115, 22, 0.5)' }}
                    >
                        <Zap className="w-4 h-4 text-accent" />
                        <span className="font-semibold">{sprint.name}</span>
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                    </motion.div>

                    <motion.div
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20"
                        animate={{
                            boxShadow: ['0 0 0 rgba(249, 115, 22, 0)', '0 0 20px rgba(249, 115, 22, 0.3)', '0 0 0 rgba(249, 115, 22, 0)']
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-accent font-semibold">{sprint.daysLeft} days left</span>
                    </motion.div>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <AnimatePresence>
                        {showSearch ? (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 300, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <input
                                    type="text"
                                    placeholder="Search issues, team members..."
                                    className="input-field pl-10 pr-10"
                                    autoFocus
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <button
                                    onClick={() => setShowSearch(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button
                                onClick={() => setShowSearch(true)}
                                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-dark-700 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Search className="w-5 h-5" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-dark-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                    </motion.button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-80 glass-card p-4 z-50"
                            >
                                <h3 className="font-semibold mb-4">Notifications</h3>
                                <div className="space-y-3">
                                    {notifications.map((notif, index) => (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors cursor-pointer"
                                        >
                                            <div className={`
                        w-2 h-2 mt-2 rounded-full flex-shrink-0
                        ${notif.type === 'warning' ? 'bg-warning' : ''}
                        ${notif.type === 'info' ? 'bg-info' : ''}
                        ${notif.type === 'success' ? 'bg-success' : ''}
                      `} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">{notif.message}</p>
                                                <span className="text-xs text-text-muted">{notif.time}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 text-sm text-accent hover:text-accent-light transition-colors">
                                    View all notifications
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile */}
                <motion.div
                    className="flex items-center gap-3 pl-4 border-l border-dark-600"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold">Sarah Chen</p>
                        <p className="text-xs text-text-muted">Scrum Master</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center font-bold text-white">
                        SC
                    </div>
                </motion.div>
            </div>
        </header>
    )
}
