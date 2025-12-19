import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    RefreshCw,
    Loader2,
    Calendar,
    Zap,
    Copy,
    Check,
    MessageSquare,
    TrendingUp,
    Users,
    Target,
    ChevronLeft,
    ChevronRight,
    Sparkles
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

export default function Standup() {
    const { sprint, metrics, issues, loading: sprintLoading, refresh } = useSprint()
    const [standup, setStandup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [copied, setCopied] = useState(false)
    const [standupHistory, setStandupHistory] = useState([])

    // Fetch today's standup
    const fetchStandup = async () => {
        try {
            setLoading(true)
            const response = await api.getTodayStandup()
            if (response.success) {
                setStandup(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch standup:', error)
            // Generate local standup from sprint data
            generateLocalStandup()
        } finally {
            setLoading(false)
        }
    }

    // Fetch standup history
    const fetchHistory = async () => {
        try {
            const response = await api.getStandupHistory()
            if (response.success) {
                setStandupHistory(response.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch history:', error)
        }
    }

    // Generate local standup from sprint data
    const generateLocalStandup = () => {
        if (!issues) return

        const today = new Date().toISOString().split('T')[0]
        const completedItems = issues.filter(i => i.status === 'done').map(i => ({
            key: i.key,
            title: i.title,
            assignee: i.assignee?.name || 'Unassigned'
        }))
        const inProgressItems = issues.filter(i => ['in_progress', 'review'].includes(i.status)).map(i => ({
            key: i.key,
            title: i.title,
            assignee: i.assignee?.name || 'Unassigned'
        }))
        const blockers = issues.filter(i => i.status === 'blocked').map(i => ({
            key: i.key,
            title: i.title,
            reason: i.blocked_reason || 'Reason not specified'
        }))

        setStandup({
            date: today,
            day_number: metrics?.dayNumber || 1,
            completed_items: completedItems,
            in_progress_items: inProgressItems,
            blockers: blockers,
            health_score: metrics?.healthScore || 0,
            notes: generateStandupNotes()
        })
    }

    const generateStandupNotes = () => {
        const dayNum = metrics?.dayNumber || 1
        const totalDays = metrics?.totalDays || 10
        const completion = metrics?.completionPercentage || 0
        const blockers = issues?.filter(i => i.status === 'blocked').length || 0

        return `# 📋 Daily Standup - ${sprint?.name || 'Sprint'}

## 📊 Sprint Status
- **Day:** ${dayNum} of ${totalDays}
- **Health Score:** ${metrics?.healthScore || 0}/100
- **Completion:** ${completion}%
- **Velocity:** ${metrics?.velocity || 0} / ${metrics?.totalPoints || 0} points

## 🎯 Key Focus Today
${blockers > 0 ? `- ⚠️ Resolve ${blockers} blocked issue(s)` : '- Continue momentum on in-progress items'}
- Complete code reviews for items in review
- Maintain sprint health above 70%

## 💡 AI Insights
${completion < metrics?.idealProgress
                ? `⚠️ Sprint is ${metrics?.idealProgress - completion}% behind ideal progress. Consider scope adjustment.`
                : `✅ Sprint is on track or ahead of schedule. Great work!`}
${blockers > 0 ? `\n🚫 ${blockers} blocker(s) detected - immediate attention required.` : ''}
`
    }

    useEffect(() => {
        fetchStandup()
        fetchHistory()
    }, [])

    useEffect(() => {
        if (!sprintLoading && issues && !standup) {
            generateLocalStandup()
        }
    }, [sprintLoading, issues])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refresh()
        await fetchStandup()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    const handleCopy = () => {
        if (!standup?.notes) return

        navigator.clipboard.writeText(standup.notes)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Page Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold gradient-text flex items-center gap-3">
                        <MessageSquare className="w-8 h-8" />
                        Daily Standup
                    </h1>
                    <p className="text-text-muted mt-1">
                        {loading ? 'Loading...' : formatDate(standup?.date || new Date())}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        className="btn-secondary flex items-center"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopy}
                        disabled={!standup?.notes}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2 text-success" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy to Clipboard
                            </>
                        )}
                    </motion.button>
                    <motion.button
                        className="btn-glow flex items-center"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Regenerate
                    </motion.button>
                </div>
            </motion.div>

            {/* Sprint Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/20">
                            <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-text-muted text-xs">Day</p>
                            <p className="text-xl font-bold">
                                {standup?.day_number || metrics?.dayNumber || 1}/{metrics?.totalDays || 10}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/20">
                            <TrendingUp className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-text-muted text-xs">Health</p>
                            <p className="text-xl font-bold">{standup?.health_score || metrics?.healthScore || 0}%</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-info/20">
                            <Target className="w-5 h-5 text-info" />
                        </div>
                        <div>
                            <p className="text-text-muted text-xs">Velocity</p>
                            <p className="text-xl font-bold">{metrics?.velocity || 0} pts</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${(standup?.blockers?.length || 0) > 0 ? 'bg-danger/20' : 'bg-success/20'}`}>
                            <AlertTriangle className={`w-5 h-5 ${(standup?.blockers?.length || 0) > 0 ? 'text-danger' : 'text-success'}`} />
                        </div>
                        <div>
                            <p className="text-text-muted text-xs">Blockers</p>
                            <p className="text-xl font-bold">{standup?.blockers?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-6">
                {/* Standup Sections */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Completed Yesterday */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            ✅ Completed
                        </h3>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-3 bg-dark-700/50 rounded-lg animate-pulse">
                                        <div className="h-4 bg-dark-600 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : standup?.completed_items?.length === 0 ? (
                            <p className="text-text-muted text-center py-4">No completed items yet</p>
                        ) : (
                            <div className="space-y-2">
                                {standup?.completed_items?.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="p-3 bg-success/10 border border-success/20 rounded-lg flex items-center justify-between"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                            <span className="font-mono text-sm text-success">{item.key}</span>
                                            <span className="text-sm truncate max-w-md">{item.title}</span>
                                        </div>
                                        <span className="text-xs text-text-muted">{item.assignee}</span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* In Progress Today */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-accent" />
                            🔄 In Progress
                        </h3>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-3 bg-dark-700/50 rounded-lg animate-pulse">
                                        <div className="h-4 bg-dark-600 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : standup?.in_progress_items?.length === 0 ? (
                            <p className="text-text-muted text-center py-4">No items in progress</p>
                        ) : (
                            <div className="space-y-2">
                                {standup?.in_progress_items?.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="p-3 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-between"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                                            <span className="font-mono text-sm text-accent">{item.key}</span>
                                            <span className="text-sm truncate max-w-md">{item.title}</span>
                                        </div>
                                        <span className="text-xs text-text-muted">{item.assignee}</span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Blockers */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-danger" />
                            🚫 Blockers
                        </h3>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="p-3 bg-dark-700/50 rounded-lg animate-pulse">
                                        <div className="h-4 bg-dark-600 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : standup?.blockers?.length === 0 ? (
                            <div className="text-center py-6">
                                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
                                <p className="text-text-muted">No blockers! 🎉</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {standup?.blockers?.map((blocker, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="p-3 bg-danger/10 border border-danger/20 rounded-lg"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
                                            <span className="font-mono text-sm text-danger">{blocker.key}</span>
                                            <span className="text-sm truncate">{blocker.title}</span>
                                        </div>
                                        <p className="text-xs text-danger/80 ml-7">
                                            ⚠️ {blocker.reason}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* AI Summary & Notes */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 space-y-6">
                    {/* AI Generated Notes */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-accent" />
                            AI Summary
                        </h3>

                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-dark-600 rounded w-full"></div>
                                <div className="h-4 bg-dark-600 rounded w-5/6"></div>
                                <div className="h-4 bg-dark-600 rounded w-4/6"></div>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm bg-dark-700/50 p-4 rounded-lg overflow-auto max-h-96 text-text-muted">
                                    {standup?.notes || 'No summary available'}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">📊 Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">Completed</span>
                                <span className="font-bold text-success">
                                    {standup?.completed_items?.length || 0} items
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">In Progress</span>
                                <span className="font-bold text-accent">
                                    {standup?.in_progress_items?.length || 0} items
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">Blockers</span>
                                <span className={`font-bold ${(standup?.blockers?.length || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                                    {standup?.blockers?.length || 0} items
                                </span>
                            </div>
                            <hr className="border-dark-600" />
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">Completion</span>
                                <span className="font-bold text-accent">
                                    {metrics?.completionPercentage || 0}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">Days Remaining</span>
                                <span className="font-bold">
                                    {metrics?.daysRemaining || 0} days
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Previous Standups */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">📅 Previous Standups</h3>
                        {standupHistory.length === 0 ? (
                            <p className="text-text-muted text-center py-4">No previous standups</p>
                        ) : (
                            <div className="space-y-2">
                                {standupHistory.slice(0, 5).map((prev, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Day {prev.day_number}</span>
                                            <span className="text-xs text-text-muted">
                                                {new Date(prev.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                                            <span className="text-success">✓ {prev.completed_items?.length || 0}</span>
                                            <span className="text-accent">⏳ {prev.in_progress_items?.length || 0}</span>
                                            <span className="text-danger">⚠ {prev.blockers?.length || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
