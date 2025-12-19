import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Users,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Loader2,
    Zap,
    Target,
    ArrowRight,
    Gauge,
    Flag,
    XCircle,
    Shuffle,
    Scissors,
    UserPlus,
    Megaphone,
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

// Recommendation type icons and colors
const recTypeConfig = {
    remove_scope: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/20', label: 'Remove Scope' },
    reassign: { icon: Shuffle, color: 'text-warning', bg: 'bg-warning/20', label: 'Reassign' },
    split_task: { icon: Scissors, color: 'text-info', bg: 'bg-info/20', label: 'Split Task' },
    add_resource: { icon: UserPlus, color: 'text-success', bg: 'bg-success/20', label: 'Add Resource' },
    escalate: { icon: Megaphone, color: 'text-purple-400', bg: 'bg-purple-400/20', label: 'Escalate' },
    other: { icon: Zap, color: 'text-accent', bg: 'bg-accent/20', label: 'Action' }
}

// Urgency badge
const urgencyConfig = {
    critical: { color: 'bg-danger text-white', label: '🚨 Critical' },
    high: { color: 'bg-warning text-dark-900', label: '⚠️ High Priority' },
    normal: { color: 'bg-success text-white', label: '✅ Normal' }
}

export default function PitStop() {
    const { sprint, metrics, issues, loading: sprintLoading, refresh } = useSprint()
    const [recommendations, setRecommendations] = useState([])
    const [urgencyLevel, setUrgencyLevel] = useState('normal')
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Fetch pit-stop recommendations
    const fetchRecommendations = async () => {
        try {
            setLoading(true)
            const response = await api.getPitStopRecommendations()
            if (response.success) {
                setRecommendations(response.data.recommendations || [])
                setUrgencyLevel(response.data.urgencyLevel || 'normal')
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecommendations()
    }, [])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refresh()
        await fetchRecommendations()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    const handleApplyRecommendation = async (id) => {
        try {
            setApplying(id)
            await api.applyPitStopRecommendation(id)
            // Remove from list
            setRecommendations(prev => prev.filter(r => r.id !== id))
            await refresh()
        } catch (error) {
            console.error('Failed to apply recommendation:', error)
        } finally {
            setApplying(null)
        }
    }

    // Get blocked issues
    const blockedIssues = issues?.filter(i => i.status === 'blocked') || []

    // Get at-risk issues (critical priority and not done)
    const atRiskIssues = issues?.filter(i =>
        i.priority === 'critical' && i.status !== 'done'
    ) || []

    // Sprint danger indicators
    const getDangerLevel = () => {
        if (!metrics) return { level: 0, label: 'Loading...' }

        const score = metrics.healthScore
        if (score >= 70) return { level: 1, label: 'On Track', color: 'text-success' }
        if (score >= 50) return { level: 2, label: 'Needs Attention', color: 'text-warning' }
        if (score >= 30) return { level: 3, label: 'At Risk', color: 'text-danger' }
        return { level: 4, label: 'Critical', color: 'text-danger animate-pulse' }
    }

    const danger = getDangerLevel()

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
                        <Flag className="w-8 h-8" />
                        Pit Stop
                    </h1>
                    <p className="text-text-muted mt-1">
                        AI-powered sprint intervention recommendations
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-full font-semibold ${urgencyConfig[urgencyLevel]?.color || urgencyConfig.normal.color}`}>
                        {urgencyConfig[urgencyLevel]?.label || 'Normal'}
                    </div>
                    <motion.button
                        className="btn-secondary flex items-center"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Refresh
                    </motion.button>
                </div>
            </motion.div>

            {/* Sprint Status Overview */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm">Sprint Health</p>
                            <p className={`text-3xl font-display font-bold mt-1 ${danger.color}`}>
                                {metrics?.healthScore || 0}%
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-700">
                            <Gauge className={`w-6 h-6 ${danger.color}`} />
                        </div>
                    </div>
                    <p className={`text-sm mt-2 ${danger.color}`}>{danger.label}</p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm">Blockers</p>
                            <p className={`text-3xl font-display font-bold mt-1 ${blockedIssues.length > 0 ? 'text-danger' : 'text-success'}`}>
                                {blockedIssues.length}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${blockedIssues.length > 0 ? 'bg-danger/20' : 'bg-success/20'}`}>
                            <AlertTriangle className={`w-6 h-6 ${blockedIssues.length > 0 ? 'text-danger' : 'text-success'}`} />
                        </div>
                    </div>
                    <p className="text-sm mt-2 text-text-muted">
                        {blockedIssues.length > 0 ? 'Needs immediate action' : 'All clear!'}
                    </p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm">Days Left</p>
                            <p className={`text-3xl font-display font-bold mt-1 ${metrics?.daysRemaining <= 2 ? 'text-danger' : 'text-accent'}`}>
                                {metrics?.daysRemaining || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-700">
                            <Clock className="w-6 h-6 text-accent" />
                        </div>
                    </div>
                    <p className="text-sm mt-2 text-text-muted">
                        Day {metrics?.dayNumber || 0} of {metrics?.totalDays || 10}
                    </p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm">Completion</p>
                            <p className="text-3xl font-display font-bold mt-1 text-accent">
                                {metrics?.completionPercentage || 0}%
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-700">
                            <Target className="w-6 h-6 text-accent" />
                        </div>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full mt-3 overflow-hidden">
                        <motion.div
                            className="h-full bg-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${metrics?.completionPercentage || 0}%` }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Recommendations */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8">
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-accent" />
                                AI Recommendations
                            </h2>
                            <span className="text-text-muted text-sm">
                                {recommendations.length} action{recommendations.length !== 1 ? 's' : ''} suggested
                            </span>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-4 bg-dark-700/50 rounded-xl animate-pulse">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-dark-600 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-5 bg-dark-600 rounded w-3/4 mb-2"></div>
                                                <div className="h-4 bg-dark-600 rounded w-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recommendations.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Pit Stop Needed!</h3>
                                <p className="text-text-muted">
                                    Your sprint is on track. Keep up the great work!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {recommendations.map((rec, index) => {
                                        const config = recTypeConfig[rec.recommendation_type || rec.type] || recTypeConfig.other
                                        const IconComponent = config.icon

                                        return (
                                            <motion.div
                                                key={rec.id || index}
                                                className="p-4 bg-dark-700/50 rounded-xl border border-dark-600 hover:border-accent/30 transition-all"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-full ${config.bg}`}>
                                                        <IconComponent className={`w-5 h-5 ${config.color}`} />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <span className={`inline-block px-2 py-0.5 rounded text-xs ${config.bg} ${config.color} mb-2`}>
                                                                    {config.label}
                                                                </span>
                                                                <h4 className="font-semibold text-lg">{rec.title}</h4>
                                                                <p className="text-text-muted text-sm mt-1">
                                                                    {rec.description}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center gap-1 text-success">
                                                                    <TrendingUp className="w-4 h-4" />
                                                                    <span className="text-sm font-semibold">
                                                                        {rec.impact || rec.impact_score || '+10%'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-text-muted">impact</span>
                                                            </div>
                                                        </div>

                                                        {rec.affected_issues?.length > 0 && (
                                                            <div className="flex items-center gap-2 mt-3">
                                                                <span className="text-xs text-text-muted">Affects:</span>
                                                                {rec.affected_issues.map(issue => (
                                                                    <span key={issue} className="px-2 py-0.5 bg-dark-600 rounded text-xs font-mono text-accent">
                                                                        {issue}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-3 mt-4">
                                                            <motion.button
                                                                className="btn-glow text-sm py-2 px-4 flex items-center gap-2"
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => handleApplyRecommendation(rec.id)}
                                                                disabled={applying === rec.id}
                                                            >
                                                                {applying === rec.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                        Apply
                                                                    </>
                                                                )}
                                                            </motion.button>
                                                            <button className="text-text-muted hover:text-white text-sm">
                                                                Dismiss
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Blocked Issues & Risks */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Blocked Issues */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-danger" />
                            Blocked Issues
                        </h3>

                        {blockedIssues.length === 0 ? (
                            <div className="text-center py-6 text-text-muted">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-success" />
                                <p>No blocked issues!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {blockedIssues.map(issue => (
                                    <div key={issue.id} className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm text-danger">{issue.key}</span>
                                            <span className="text-xs text-text-muted">
                                                {issue.story_points} pts
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1 truncate">{issue.title}</p>
                                        {issue.blocked_reason && (
                                            <p className="text-xs text-danger/80 mt-2">
                                                ⚠️ {issue.blocked_reason}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* At-Risk Issues */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-warning" />
                            Critical Priority
                        </h3>

                        {atRiskIssues.length === 0 ? (
                            <div className="text-center py-6 text-text-muted">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-success" />
                                <p>All critical issues handled!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {atRiskIssues.slice(0, 5).map(issue => (
                                    <div key={issue.id} className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm text-warning">{issue.key}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${issue.status === 'in_progress' ? 'bg-accent/20 text-accent' :
                                                    issue.status === 'review' ? 'bg-info/20 text-info' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {issue.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1 truncate">{issue.title}</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                                            <Users className="w-3 h-3" />
                                            <span>{issue.assignee?.name || 'Unassigned'}</span>
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
