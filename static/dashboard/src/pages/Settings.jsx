import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Settings as SettingsIcon,
    Bell,
    Mail,
    Slack,
    Moon,
    Sun,
    Globe,
    Shield,
    Save,
    RefreshCw,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    User,
    Palette,
    Volume2,
    Eye
} from 'lucide-react'
import { useSprint } from '../context/SprintContext'
import api from '../api/client'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

// Toggle Switch Component
function Toggle({ enabled, onChange, disabled = false }) {
    return (
        <button
            onClick={() => !disabled && onChange(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${enabled ? 'bg-accent' : 'bg-dark-600'}`}
        >
            <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                animate={{ left: enabled ? '1.5rem' : '0.25rem' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    )
}

// Slider Component
function Slider({ value, onChange, min = 0, max = 100, step = 1 }) {
    return (
        <div className="relative w-full">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-dark-600 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-accent
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>{min}</span>
                <span className="font-bold text-accent">{value}</span>
                <span>{max}</span>
            </div>
        </div>
    )
}

export default function Settings() {
    const { sprint, refresh } = useSprint()
    const [settings, setSettings] = useState({
        notifications_enabled: true,
        email_alerts: true,
        slack_alerts: false,
        alert_threshold: 60,
        theme: 'dark',
        language: 'en'
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Fetch settings
    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await api.getSettings()
            if (response.success && response.data) {
                setSettings(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    // Save settings
    const handleSave = async () => {
        try {
            setSaving(true)
            await api.updateSettings(settings)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (error) {
            console.error('Failed to save settings:', error)
        } finally {
            setSaving(false)
        }
    }

    // Update single setting
    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-4xl"
        >
            {/* Page Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold gradient-text flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8" />
                        Settings
                    </h1>
                    <p className="text-text-muted mt-1">
                        Configure your Sprint Strategist preferences
                    </p>
                </div>
                <motion.button
                    className={`btn-glow flex items-center ${saved ? 'bg-success' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : saved ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {saved ? 'Saved!' : 'Save Changes'}
                </motion.button>
            </motion.div>

            {/* Notifications Section */}
            <motion.div variants={itemVariants} className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-accent" />
                    Notifications
                </h2>

                <div className="space-y-6">
                    {/* Enable Notifications */}
                    <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-accent/20">
                                <Bell className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <p className="font-medium">Enable Notifications</p>
                                <p className="text-sm text-text-muted">Receive alerts about sprint health and blockers</p>
                            </div>
                        </div>
                        <Toggle
                            enabled={settings.notifications_enabled}
                            onChange={(v) => updateSetting('notifications_enabled', v)}
                        />
                    </div>

                    {/* Email Alerts */}
                    <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-info/20">
                                <Mail className="w-5 h-5 text-info" />
                            </div>
                            <div>
                                <p className="font-medium">Email Alerts</p>
                                <p className="text-sm text-text-muted">Get daily sprint summaries via email</p>
                            </div>
                        </div>
                        <Toggle
                            enabled={settings.email_alerts}
                            onChange={(v) => updateSetting('email_alerts', v)}
                            disabled={!settings.notifications_enabled}
                        />
                    </div>

                    {/* Slack Alerts */}
                    <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Slack className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="font-medium">Slack Integration</p>
                                <p className="text-sm text-text-muted">Send alerts to your Slack channel</p>
                            </div>
                        </div>
                        <Toggle
                            enabled={settings.slack_alerts}
                            onChange={(v) => updateSetting('slack_alerts', v)}
                            disabled={!settings.notifications_enabled}
                        />
                    </div>

                    {/* Alert Threshold */}
                    <div className="p-4 bg-dark-700/50 rounded-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 rounded-lg bg-warning/20">
                                <AlertTriangle className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <p className="font-medium">Alert Threshold</p>
                                <p className="text-sm text-text-muted">
                                    Trigger alerts when health score drops below this value
                                </p>
                            </div>
                        </div>
                        <div className="ml-12">
                            <Slider
                                value={settings.alert_threshold}
                                onChange={(v) => updateSetting('alert_threshold', v)}
                                min={30}
                                max={90}
                                step={5}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Appearance Section */}
            <motion.div variants={itemVariants} className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-accent" />
                    Appearance
                </h2>

                <div className="space-y-6">
                    {/* Theme */}
                    <div className="p-4 bg-dark-700/50 rounded-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 rounded-lg bg-accent/20">
                                <Moon className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <p className="font-medium">Theme</p>
                                <p className="text-sm text-text-muted">Choose your preferred color scheme</p>
                            </div>
                        </div>
                        <div className="ml-12 flex gap-3">
                            {[
                                { id: 'dark', icon: Moon, label: 'Dark' },
                                { id: 'light', icon: Sun, label: 'Light' },
                                { id: 'system', icon: Eye, label: 'System' }
                            ].map(theme => (
                                <motion.button
                                    key={theme.id}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${settings.theme === theme.id
                                            ? 'bg-accent text-dark-900'
                                            : 'bg-dark-600 hover:bg-dark-500'
                                        }`}
                                    onClick={() => updateSetting('theme', theme.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <theme.icon className="w-4 h-4" />
                                    {theme.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Language */}
                    <div className="p-4 bg-dark-700/50 rounded-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 rounded-lg bg-info/20">
                                <Globe className="w-5 h-5 text-info" />
                            </div>
                            <div>
                                <p className="font-medium">Language</p>
                                <p className="text-sm text-text-muted">Select your preferred language</p>
                            </div>
                        </div>
                        <div className="ml-12">
                            <select
                                value={settings.language}
                                onChange={(e) => updateSetting('language', e.target.value)}
                                className="bg-dark-600 border border-dark-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Sprint Configuration */}
            <motion.div variants={itemVariants} className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    Sprint Configuration
                </h2>

                <div className="space-y-4">
                    {/* Current Sprint Info */}
                    <div className="p-4 bg-dark-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{sprint?.name || 'No Active Sprint'}</p>
                                <p className="text-sm text-text-muted">
                                    {sprint?.goal || 'Sprint goal not set'}
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-success/20 text-success rounded-full text-sm">
                                {sprint?.status || 'active'}
                            </span>
                        </div>
                    </div>

                    {/* API Status */}
                    <div className="p-4 bg-dark-700/50 rounded-lg">
                        <h4 className="font-medium mb-3">API Connectivity</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Backend API</span>
                                <span className="flex items-center gap-2 text-success">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                                    Connected
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Supabase</span>
                                <span className="flex items-center gap-2 text-success">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                                    Connected
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">AI Service</span>
                                <span className="flex items-center gap-2 text-success">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                                    Ready
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* About Section */}
            <motion.div variants={itemVariants} className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <div className="space-y-2 text-sm text-text-muted">
                    <p><strong className="text-white">Rovo Sprint Strategist</strong> v1.0.0</p>
                    <p>AI-powered sprint intelligence for agile teams, inspired by F1 race strategy.</p>
                    <p className="mt-4">Built for <strong className="text-accent">Codegeist 2025</strong> Hackathon</p>
                    <div className="flex gap-4 mt-4">
                        <a href="https://github.com/samarabdelhameed/rovo-sprint-strategist"
                            target="_blank" rel="noopener noreferrer"
                            className="text-accent hover:underline">
                            GitHub
                        </a>
                        <a href="https://build-9aufuthni-samarabdelhameeds-projects-df99c328.vercel.app"
                            target="_blank" rel="noopener noreferrer"
                            className="text-accent hover:underline">
                            Live Demo
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
