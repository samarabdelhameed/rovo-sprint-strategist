import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings as SettingsIcon,
    Bell,
    Palette,
    Sliders,
    Key,
    Save,
    Moon,
    Sun,
    Zap
} from 'lucide-react'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export default function Settings() {
    const [settings, setSettings] = useState({
        alertThreshold: 60,
        stuckTaskDays: 2,
        enableNotifications: true,
        enableGamification: true,
        darkMode: true,
        aiProvider: 'anthropic'
    })

    const handleChange = (key, value) => {
        setSettings({ ...settings, [key]: value })
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold gradient-text">Settings</h1>
                    <p className="text-text-muted mt-1">Configure your Sprint Strategist</p>
                </div>
                <motion.button
                    className="btn-glow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </motion.button>
            </motion.div>

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* Alert Settings */}
                <motion.div variants={itemVariants} className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-accent" />
                        Alert Settings
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Health Score Alert Threshold</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.alertThreshold}
                                    onChange={(e) => handleChange('alertThreshold', e.target.value)}
                                    className="flex-1 accent-accent"
                                />
                                <span className="w-16 text-center font-mono bg-dark-700 rounded-lg px-3 py-2">
                                    {settings.alertThreshold}%
                                </span>
                            </div>
                            <p className="text-xs text-text-muted mt-2">
                                Trigger alerts when sprint health drops below this value
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Stuck Task Threshold (days)</label>
                            <input
                                type="number"
                                min="1"
                                max="7"
                                value={settings.stuckTaskDays}
                                onChange={(e) => handleChange('stuckTaskDays', parseInt(e.target.value))}
                                className="input-field w-32"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Enable Notifications</p>
                                <p className="text-sm text-text-muted">Receive alerts about sprint health</p>
                            </div>
                            <button
                                onClick={() => handleChange('enableNotifications', !settings.enableNotifications)}
                                className={`w-14 h-8 rounded-full transition-colors relative ${settings.enableNotifications ? 'bg-accent' : 'bg-dark-600'
                                    }`}
                            >
                                <motion.div
                                    className="absolute top-1 w-6 h-6 rounded-full bg-white"
                                    animate={{ left: settings.enableNotifications ? 'calc(100% - 28px)' : '4px' }}
                                />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Gamification */}
                <motion.div variants={itemVariants} className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Gamification
                    </h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Enable Gamification</p>
                            <p className="text-sm text-text-muted">Points, badges, and leaderboard</p>
                        </div>
                        <button
                            onClick={() => handleChange('enableGamification', !settings.enableGamification)}
                            className={`w-14 h-8 rounded-full transition-colors relative ${settings.enableGamification ? 'bg-accent' : 'bg-dark-600'
                                }`}
                        >
                            <motion.div
                                className="absolute top-1 w-6 h-6 rounded-full bg-white"
                                animate={{ left: settings.enableGamification ? 'calc(100% - 28px)' : '4px' }}
                            />
                        </button>
                    </div>
                </motion.div>

                {/* AI Settings */}
                <motion.div variants={itemVariants} className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Key className="w-5 h-5 text-accent" />
                        AI Configuration
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">AI Provider</label>
                            <div className="flex gap-4">
                                {['anthropic', 'openai'].map((provider) => (
                                    <button
                                        key={provider}
                                        onClick={() => handleChange('aiProvider', provider)}
                                        className={`flex-1 p-4 rounded-xl border transition-all ${settings.aiProvider === provider
                                                ? 'bg-accent/10 border-accent text-accent'
                                                : 'bg-dark-700 border-dark-500 hover:border-dark-400'
                                            }`}
                                    >
                                        <p className="font-semibold capitalize">{provider}</p>
                                        <p className="text-xs text-text-muted mt-1">
                                            {provider === 'anthropic' ? 'Claude 3 Sonnet' : 'GPT-4 Turbo'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">API Key</label>
                            <input
                                type="password"
                                placeholder="Enter your API key"
                                className="input-field"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Appearance */}
                <motion.div variants={itemVariants} className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-accent" />
                        Appearance
                    </h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-text-muted">Williams Racing theme 🏎️</p>
                        </div>
                        <button
                            onClick={() => handleChange('darkMode', !settings.darkMode)}
                            className={`w-14 h-8 rounded-full transition-colors relative ${settings.darkMode ? 'bg-accent' : 'bg-dark-600'
                                }`}
                        >
                            <motion.div
                                className="absolute top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                                animate={{ left: settings.darkMode ? 'calc(100% - 28px)' : '4px' }}
                            >
                                {settings.darkMode ? <Moon className="w-4 h-4 text-dark-800" /> : <Sun className="w-4 h-4 text-dark-800" />}
                            </motion.div>
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
