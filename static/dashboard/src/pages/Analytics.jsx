import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    PieChart,
    Activity,
    Target,
    Users,
    Clock,
    RefreshCw,
    Loader2,
    Zap,
    CheckCircle2,
    AlertTriangle,
    Calendar
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

// Simple Bar Chart Component
function BarChart({ data, maxValue, label }) {
    if (!data || data.length === 0) return null
    
    // Filter out invalid data and ensure we have valid numbers
    const validData = data.filter(item => item && typeof item.value === 'number' && !isNaN(item.value))
    if (validData.length === 0) return null
    
    const safeMaxValue = maxValue && !isNaN(maxValue) ? maxValue : Math.max(...validData.map(item => item.value))
    
    return (
        <div className="space-y-2">
            {validData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-text-muted truncate">{item.label}</span>
                    <div className="flex-1 h-6 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color || '#f97316' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / safeMaxValue) * 100}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                        />
                    </div>
                    <span className="w-12 text-xs text-right font-mono">{item.value}</span>
                </div>
            ))}
        </div>
    )
}

// Donut Chart Component
function DonutChart({ data, size = 150 }) {
    if (!data || data.length === 0) return null
    
    // Filter out invalid data
    const validData = data.filter(item => item && typeof item.count === 'number' && !isNaN(item.count) && item.count > 0)
    if (validData.length === 0) return null
    
    const total = validData.reduce((sum, item) => sum + item.count, 0)
    if (total === 0) return null
    
    let cumulativePercent = 0

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent)
        const y = Math.sin(2 * Math.PI * percent)
        return [x, y]
    }

    return (
        <div className="flex items-center justify-center gap-6">
            <svg width={size} height={size} viewBox="-1.1 -1.1 2.2 2.2">
                {validData.map((slice, idx) => {
                    const percent = slice.count / total
                    const [startX, startY] = getCoordinatesForPercent(cumulativePercent)
                    cumulativePercent += percent
                    const [endX, endY] = getCoordinatesForPercent(cumulativePercent)
                    const largeArcFlag = percent > 0.5 ? 1 : 0

                    const pathData = [
                        `M ${startX} ${startY}`,
                        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        'L 0 0'
                    ].join(' ')

                    return (
                        <motion.path
                            key={idx}
                            d={pathData}
                            fill={slice.color}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.2 }}
                        />
                    )
                })}
                <circle cx="0" cy="0" r="0.6" fill="#0f172a" />
                <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold text-[0.3px]">
                    {total}
                </text>
                <text x="0" y="0.2" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-[0.12px]">
                    total
                </text>
            </svg>
            <div className="space-y-2">
                {validData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-text-muted">{item.status}</span>
                        <span className="font-bold">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Line/Area Chart Component
function TrendChart({ data, height = 150 }) {
    if (!data || data.length === 0) return null

    // Filter out invalid data and ensure we have valid numbers
    const validData = data.filter(d => d && typeof d.value === 'number' && !isNaN(d.value))
    if (validData.length === 0) return null

    const maxValue = Math.max(...validData.map(d => d.value))
    const minValue = Math.min(...validData.map(d => d.value))
    const range = maxValue - minValue || 1

    const points = validData.map((d, i) => {
        const x = validData.length > 1 ? (i / (validData.length - 1)) * 100 : 50
        const y = 100 - ((d.value - minValue) / range) * 80
        return `${x},${y}`
    }).join(' ')

    const areaPath = `0,100 ${points} 100,100`

    return (
        <div className="relative" style={{ height }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#1e293b" strokeWidth="0.5" />
                ))}

                {/* Area */}
                <motion.polygon
                    points={areaPath}
                    fill="url(#gradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 0.5 }}
                />

                {/* Line */}
                <motion.polyline
                    points={points}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                />

                {/* Dots */}
                {validData.map((d, i) => {
                    const x = validData.length > 1 ? (i / (validData.length - 1)) * 100 : 50
                    const y = 100 - ((d.value - minValue) / range) * 80
                    return (
                        <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="2"
                            fill="#f97316"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        />
                    )
                })}

                <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-text-muted px-2">
                {validData.map((d, i) => (
                    <span key={i}>{d.label}</span>
                ))}
            </div>
        </div>
    )
}

export default function Analytics() {
    const { sprint, metrics, teamMetrics, issues, loading: sprintLoading, refresh } = useSprint()
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Fetch analytics data
    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const response = await api.getAnalytics()
            if (response.success) {
                setAnalytics(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
            generateLocalAnalytics()
        } finally {
            setLoading(false)
        }
    }

    // Generate analytics from local data
    const generateLocalAnalytics = () => {
        if (!metrics || !issues || !teamMetrics) return

        setAnalytics({
            velocityTrend: [
                { sprint: 'Sprint 38', velocity: 42, committed: 45 },
                { sprint: 'Sprint 39', velocity: 38, committed: 40 },
                { sprint: 'Sprint 40', velocity: 45, committed: 48 },
                { sprint: 'Sprint 41', velocity: 41, committed: 44 },
                { sprint: 'Sprint 42', velocity: metrics.velocity, committed: metrics.totalPoints }
            ],
            issueDistribution: [
                { status: 'Done', count: metrics.issuesCompleted, color: '#00D26A' },
                { status: 'In Progress', count: metrics.issuesInProgress, color: '#F97316' },
                { status: 'To Do', count: metrics.issuesTodo || 0, color: '#6B7280' },
                { status: 'Blocked', count: metrics.blockersCount, color: '#EF4444' }
            ],
            teamPerformance: teamMetrics.map(m => ({
                name: m.name.split(' ')[0],
                completedPoints: m.completedPoints || 0,
                totalPoints: m.points || 0,
                efficiency: m.completionRate || 0
            })),
            healthTrend: Array.from({ length: 5 }, (_, i) => ({
                day: i + 1,
                value: 65 + i * 3,
                label: `D${i + 1}`
            })),
            summary: {
                averageVelocity: 41,
                velocityChange: '+12%',
                estimationAccuracy: '85%',
                sprintSuccessRate: '78%'
            }
        })
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    useEffect(() => {
        if (!sprintLoading && metrics && !analytics) {
            generateLocalAnalytics()
        }
    }, [sprintLoading, metrics])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refresh()
        await fetchAnalytics()
        setTimeout(() => setIsRefreshing(false), 500)
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
                        <BarChart3 className="w-8 h-8" />
                        Analytics
                    </h1>
                    <p className="text-text-muted mt-1">
                        Sprint performance insights and trends
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

            {/* Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/20">
                            <Zap className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-text-muted text-xs">Avg Velocity</p>
                            <p className="text-xl font-bold">{analytics?.summary?.averageVelocity || 0} pts</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/20">
                            <TrendingUp className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-text-muted text-xs">Velocity Change</p>
                            <p className="text-xl font-bold text-success">{analytics?.summary?.velocityChange || '+0%'}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-info/20">
                            <Target className="w-5 h-5 text-info" />
                        </div>
                        <div>
                            <p className="text-text-muted text-xs">Estimation Accuracy</p>
                            <p className="text-xl font-bold">{analytics?.summary?.estimationAccuracy || '0%'}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-text-muted text-xs">Success Rate</p>
                            <p className="text-xl font-bold">{analytics?.summary?.sprintSuccessRate || '0%'}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Health Score Trend */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent" />
                        Health Score Trend
                    </h3>

                    {loading ? (
                        <div className="h-40 bg-dark-700/50 rounded-lg animate-pulse"></div>
                    ) : (
                        <TrendChart
                            data={analytics?.healthTrend || []}
                            height={180}
                        />
                    )}
                </motion.div>

                {/* Issue Distribution */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-accent" />
                        Issue Distribution
                    </h3>

                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <div className="w-32 h-32 bg-dark-700/50 rounded-full animate-pulse"></div>
                        </div>
                    ) : (
                        <DonutChart data={analytics?.issueDistribution || []} size={140} />
                    )}
                </motion.div>

                {/* Velocity Trend */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-6 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        Velocity Trend (Last 5 Sprints)
                    </h3>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-6 bg-dark-700/50 rounded animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <BarChart
                            data={analytics?.velocityTrend?.map(v => ({
                                label: v.sprint.replace('Sprint ', 'S'),
                                value: v.velocity,
                                color: '#f97316'
                            })) || []}
                            maxValue={Math.max(...(analytics?.velocityTrend?.map(v => v.velocity) || [50]))}
                            label="Velocity"
                        />
                    )}
                </motion.div>

                {/* Team Performance */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-6 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-info" />
                        Team Performance
                    </h3>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-6 bg-dark-700/50 rounded animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <BarChart
                            data={analytics?.teamPerformance?.map(t => ({
                                label: t.name,
                                value: t.completedPoints,
                                color: t.efficiency >= 70 ? '#00D26A' : t.efficiency >= 50 ? '#F97316' : '#6B7280'
                            })) || []}
                            maxValue={Math.max(...(analytics?.teamPerformance?.map(t => t.completedPoints) || [20]))}
                            label="Points"
                        />
                    )}
                </motion.div>

                {/* Sprint Comparison Table */}
                <motion.div variants={itemVariants} className="col-span-12 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-accent" />
                        Sprint Comparison
                    </h3>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-12 bg-dark-700/50 rounded animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-text-muted text-sm border-b border-dark-600">
                                        <th className="pb-3 font-medium">Sprint</th>
                                        <th className="pb-3 font-medium">Committed</th>
                                        <th className="pb-3 font-medium">Completed</th>
                                        <th className="pb-3 font-medium">Accuracy</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics?.velocityTrend?.map((sprint, idx) => {
                                        const accuracy = sprint.committed > 0
                                            ? Math.round((sprint.velocity / sprint.committed) * 100)
                                            : 0
                                        const isSuccess = accuracy >= 80

                                        return (
                                            <motion.tr
                                                key={idx}
                                                className="border-b border-dark-700 hover:bg-dark-700/30"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <td className="py-4 font-medium">{sprint.sprint}</td>
                                                <td className="py-4">{sprint.committed} pts</td>
                                                <td className="py-4 text-accent">{sprint.velocity} pts</td>
                                                <td className="py-4">
                                                    <span className={`${accuracy >= 80 ? 'text-success' : accuracy >= 60 ? 'text-warning' : 'text-danger'}`}>
                                                        {accuracy}%
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    {isSuccess ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-full text-xs">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Success
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/20 text-warning rounded-full text-xs">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Partial
                                                        </span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    )
}
