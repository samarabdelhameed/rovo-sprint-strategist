import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Trophy,
    Medal,
    Star,
    Crown,
    Zap,
    Target,
    Award,
    TrendingUp,
    RefreshCw,
    Loader2,
    Users,
    CheckCircle2,
    Flame,
    Shield,
    Clock
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

// Badge configurations
const badgeConfig = {
    pole_position: { icon: '🏎️', color: 'from-yellow-500 to-orange-500', label: 'Pole Position' },
    champion: { icon: '🏆', color: 'from-yellow-400 to-yellow-600', label: 'Champion' },
    fast_finisher: { icon: '⚡', color: 'from-blue-400 to-blue-600', label: 'Fast Finisher' },
    clean_code: { icon: '🧹', color: 'from-green-400 to-green-600', label: 'Clean Code' },
    test_champion: { icon: '🎯', color: 'from-purple-400 to-purple-600', label: 'Test Champion' },
    team_player: { icon: '🤝', color: 'from-pink-400 to-pink-600', label: 'Team Player' },
    on_fire: { icon: '🔥', color: 'from-red-400 to-red-600', label: 'On Fire' },
    bullseye: { icon: '🎯', color: 'from-indigo-400 to-indigo-600', label: 'Bullseye' }
}

// Rank medal colors
const rankColors = {
    1: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-dark-900',
    2: 'bg-gradient-to-br from-gray-300 to-gray-500 text-dark-900',
    3: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
}

export default function Leaderboard() {
    const { sprint, teamMetrics, loading: sprintLoading, refresh } = useSprint()
    const [leaderboard, setLeaderboard] = useState([])
    const [achievements, setAchievements] = useState([])
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
        try {
            setLoading(true)
            const response = await api.getLeaderboard()
            if (response.success) {
                setLeaderboard(response.data.leaderboard || [])
                setAchievements(response.data.achievements || [])
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error)
            // Generate from team metrics
            if (teamMetrics) {
                const generated = teamMetrics.map((m, idx) => ({
                    ...m,
                    score: m.completedPoints * 10 + (m.completionRate >= 80 ? 50 : m.completionRate >= 60 ? 30 : 0),
                    rank: idx + 1
                })).sort((a, b) => b.score - a.score).map((m, idx) => ({ ...m, rank: idx + 1 }))
                setLeaderboard(generated)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaderboard()
    }, [teamMetrics])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refresh()
        await fetchLeaderboard()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    // Get top 3 performers
    const topThree = leaderboard.slice(0, 3)
    const restOfLeaderboard = leaderboard.slice(3)

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
                        <Trophy className="w-8 h-8" />
                        Leaderboard
                    </h1>
                    <p className="text-text-muted mt-1">
                        {sprint?.name || 'Active Sprint'} • Team Performance Rankings
                    </p>
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
            </motion.div>

            {/* Top 3 Podium */}
            <motion.div variants={itemVariants} className="glass-card p-8">
                <h2 className="text-xl font-display font-bold text-center mb-8">🏆 Top Performers</h2>

                {loading ? (
                    <div className="flex justify-center items-end gap-8 h-64">
                        {[2, 1, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="w-24 h-24 bg-dark-700 rounded-full mb-4"></div>
                                <div className={`w-28 ${i === 1 ? 'h-40' : i === 2 ? 'h-32' : 'h-28'} bg-dark-700 rounded-t-lg`}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center items-end gap-4 md:gap-8">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <motion.div
                                className="flex flex-col items-center"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="relative mb-4">
                                    <img
                                        src={topThree[1].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[1].name}`}
                                        alt={topThree[1].name}
                                        className="w-20 h-20 rounded-full border-4 border-gray-400"
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-dark-900 font-bold">
                                        2
                                    </div>
                                </div>
                                <div className="w-28 bg-gradient-to-t from-gray-600 to-gray-400 rounded-t-lg p-4 text-center h-32 flex flex-col justify-end">
                                    <Medal className="w-6 h-6 mx-auto mb-2 text-gray-200" />
                                    <p className="text-sm font-semibold truncate text-white">{topThree[1].name.split(' ')[0]}</p>
                                    <p className="text-xs text-gray-200">{topThree[1].score} pts</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <motion.div
                                className="flex flex-col items-center"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="relative mb-4">
                                    <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400" />
                                    <img
                                        src={topThree[0].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[0].name}`}
                                        alt={topThree[0].name}
                                        className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-lg shadow-yellow-400/30"
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-dark-900 font-bold">
                                        1
                                    </div>
                                </div>
                                <div className="w-32 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg p-4 text-center h-40 flex flex-col justify-end">
                                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-100" />
                                    <p className="text-md font-bold truncate text-dark-900">{topThree[0].name.split(' ')[0]}</p>
                                    <p className="text-sm text-yellow-900 font-semibold">{topThree[0].score} pts</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <motion.div
                                className="flex flex-col items-center"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="relative mb-4">
                                    <img
                                        src={topThree[2].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[2].name}`}
                                        alt={topThree[2].name}
                                        className="w-20 h-20 rounded-full border-4 border-amber-600"
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                                        3
                                    </div>
                                </div>
                                <div className="w-28 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg p-4 text-center h-28 flex flex-col justify-end">
                                    <Award className="w-6 h-6 mx-auto mb-2 text-amber-200" />
                                    <p className="text-sm font-semibold truncate text-white">{topThree[2].name.split(' ')[0]}</p>
                                    <p className="text-xs text-amber-200">{topThree[2].score} pts</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Full Leaderboard */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-accent" />
                            Full Rankings
                        </h3>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="p-4 bg-dark-700/50 rounded-lg animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-dark-600 rounded-full"></div>
                                            <div className="w-12 h-12 bg-dark-600 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-dark-600 rounded w-32 mb-2"></div>
                                                <div className="h-3 bg-dark-600 rounded w-24"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((member, idx) => (
                                    <motion.div
                                        key={member.id}
                                        className={`p-4 rounded-lg flex items-center gap-4 transition-all
                                            ${idx < 3 ? 'bg-gradient-to-r from-accent/10 to-transparent border border-accent/20' : 'bg-dark-700/50 hover:bg-dark-700'}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ x: 5 }}
                                    >
                                        {/* Rank */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                            ${rankColors[member.rank] || 'bg-dark-600 text-text-muted'}`}>
                                            {member.rank}
                                        </div>

                                        {/* Avatar */}
                                        <img
                                            src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                            alt={member.name}
                                            className="w-12 h-12 rounded-full bg-dark-600"
                                        />

                                        {/* Info */}
                                        <div className="flex-1">
                                            <p className="font-semibold">{member.name}</p>
                                            <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-success" />
                                                    {member.completedPoints || 0} pts completed
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Target className="w-3 h-3 text-accent" />
                                                    {member.taskCount || 0} tasks
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <p className="text-2xl font-display font-bold text-accent">
                                                {member.score}
                                            </p>
                                            <p className="text-xs text-text-muted">points</p>
                                        </div>

                                        {/* Trend */}
                                        <div className="w-8">
                                            {member.completionRate >= 50 ? (
                                                <TrendingUp className="w-5 h-5 text-success" />
                                            ) : (
                                                <TrendingUp className="w-5 h-5 text-text-muted opacity-30" />
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Achievements & Badges */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Recent Achievements */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            Recent Achievements
                        </h3>

                        {achievements.length === 0 ? (
                            <p className="text-text-muted text-center py-6">No achievements yet this sprint</p>
                        ) : (
                            <div className="space-y-3">
                                {achievements.slice(0, 5).map((achievement, idx) => {
                                    const config = badgeConfig[achievement.badge_type] || badgeConfig.champion

                                    return (
                                        <motion.div
                                            key={idx}
                                            className="p-3 bg-dark-700/50 rounded-lg flex items-center gap-3"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-xl`}>
                                                {config.icon || achievement.badge_icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{achievement.badge_name}</p>
                                                <p className="text-xs text-text-muted">
                                                    {achievement.member?.name || 'Team Member'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Available Badges */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">🏅 Available Badges</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {Object.entries(badgeConfig).map(([key, config]) => (
                                <motion.div
                                    key={key}
                                    className="aspect-square rounded-xl bg-dark-700/50 flex items-center justify-center text-2xl cursor-pointer hover:bg-dark-600 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={config.label}
                                >
                                    {config.icon}
                                </motion.div>
                            ))}
                        </div>
                        <p className="text-xs text-text-muted text-center mt-4">
                            Complete objectives to earn badges!
                        </p>
                    </div>

                    {/* Sprint Stats */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">📊 Sprint Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Participants
                                </span>
                                <span className="font-bold">{leaderboard.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Total Points
                                </span>
                                <span className="font-bold text-accent">
                                    {leaderboard.reduce((sum, m) => sum + (m.score || 0), 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted flex items-center gap-2">
                                    <Trophy className="w-4 h-4" />
                                    Achievements
                                </span>
                                <span className="font-bold">{achievements.length}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
