import React, { Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Users,
    Zap,
    Target,
    Activity,
    RefreshCw,
    Loader2
} from 'lucide-react'
import { useSprint } from '../context/SprintContext'
import HealthGauge from '../components/dashboard/HealthGauge'
import VelocityChart from '../components/dashboard/VelocityChart'
import RiskRadar from '../components/dashboard/RiskRadar'
import SprintProgress from '../components/dashboard/SprintProgress'
import TeamActivity from '../components/dashboard/TeamActivity'
import QuickActions from '../components/dashboard/QuickActions'

// 3D Background Component
function AnimatedSphere() {
    return (
        <Sphere args={[1, 100, 200]} scale={2}>
            <MeshDistortMaterial
                color="#f97316"
                attach="material"
                distort={0.3}
                speed={1.5}
                roughness={0.4}
                metalness={0.8}
            />
        </Sphere>
    )
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

// Loading Skeleton Component
function StatSkeleton() {
    return (
        <div className="stat-card animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="h-4 bg-dark-700 rounded w-24 mb-3"></div>
                    <div className="h-10 bg-dark-700 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-dark-700 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-dark-700 rounded-xl"></div>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const { sprint, metrics, loading, error, lastUpdated, refresh } = useSprint()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const navigate = useNavigate()

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refresh()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    // Format last updated time
    const formatLastUpdated = () => {
        if (!lastUpdated) return 'Never'
        const diff = Math.floor((new Date() - lastUpdated) / 1000)
        if (diff < 60) return `${diff}s ago`
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        return `${Math.floor(diff / 3600)}h ago`
    }

    // Generate stats from real metrics
    const stats = metrics ? [
        {
            label: 'Health Score',
            value: metrics.healthScore?.toString() || '0',
            unit: '/100',
            change: metrics.healthScore >= 70 ? '+' + (metrics.healthScore - 70) + '%' : (metrics.healthScore - 70) + '%',
            trend: metrics.healthScore >= 70 ? 'up' : metrics.healthScore >= 50 ? 'neutral' : 'down',
            icon: Activity,
            color: metrics.healthScore >= 70 ? 'text-success' : metrics.healthScore >= 50 ? 'text-warning' : 'text-danger'
        },
        {
            label: 'Velocity',
            value: metrics.velocity?.toString() || '0',
            unit: 'pts',
            change: `${metrics.completedPoints || 0}/${metrics.totalPoints || 0}`,
            trend: 'up',
            icon: Zap,
            color: 'text-accent'
        },
        {
            label: 'Completion',
            value: metrics.completionPercentage?.toString() || '0',
            unit: '%',
            change: `Day ${metrics.dayNumber}/${metrics.totalDays}`,
            trend: metrics.completionPercentage >= metrics.idealProgress ? 'up' : 'down',
            icon: Target,
            color: metrics.completionPercentage >= metrics.idealProgress ? 'text-success' : 'text-warning'
        },
        {
            label: 'Blockers',
            value: metrics.blockersCount?.toString() || '0',
            unit: '',
            change: metrics.blockersCount === 0 ? 'All clear!' : 'Needs attention',
            trend: metrics.blockersCount === 0 ? 'up' : 'down',
            icon: AlertTriangle,
            color: metrics.blockersCount === 0 ? 'text-success' : 'text-danger'
        },
    ] : []

    // Error state
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full"
            >
                <AlertTriangle className="w-16 h-16 text-warning mb-4" />
                <h2 className="text-xl font-bold mb-2">Failed to Load Sprint Data</h2>
                <p className="text-text-muted mb-4">{error}</p>
                <motion.button
                    className="btn-glow"
                    onClick={handleRefresh}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </motion.button>
            </motion.div>
        )
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
                    <h1 className="text-3xl font-display font-bold gradient-text">Dashboard</h1>
                    <p className="text-text-muted mt-1">
                        {loading ? (
                            <span className="animate-pulse">Loading...</span>
                        ) : (
                            <>
                                {sprint?.name || 'Sprint'} • Day {metrics?.dayNumber || 0} of {metrics?.totalDays || 10}
                            </>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
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
                            <Clock className="w-4 h-4 mr-2" />
                        )}
                        Updated: {formatLastUpdated()}
                    </motion.button>
                    <motion.button
                        className="btn-glow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            console.log('Navigating to AI Chat...');
                            navigate('/ai-chat');
                        }}
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Ask Rovo AI
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <>
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                    </>
                ) : (
                    stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="stat-card relative overflow-hidden group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex items-start justify-between">
                                <div>
                                    <p className="text-text-muted text-sm">{stat.label}</p>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-4xl font-display font-bold">{stat.value}</span>
                                        <span className="text-text-muted text-lg">{stat.unit}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-danger' : 'text-text-muted'
                                        }`}>
                                        {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : stat.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                                        <span>{stat.change}</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl bg-dark-700 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Health Gauge with 3D */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-4 glass-card p-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 opacity-30">
                        <Canvas>
                            <ambientLight intensity={0.5} />
                            <directionalLight position={[10, 10, 5]} intensity={1} />
                            <Suspense fallback={null}>
                                <AnimatedSphere />
                            </Suspense>
                            <OrbitControls enableZoom={false} autoRotate />
                        </Canvas>
                    </div>
                    <HealthGauge
                        score={metrics?.healthScore || 0}
                        trend={metrics?.healthScore >= 70 ? 'improving' : 'declining'}
                        loading={loading}
                    />
                </motion.div>

                {/* Velocity Chart */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-8 glass-card p-6"
                >
                    <VelocityChart loading={loading} />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-8 glass-card p-6"
                >
                    <SprintProgress issues={sprint?.issues} loading={loading} />
                </motion.div>

                {/* Risk Radar */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-4 glass-card p-6"
                >
                    <RiskRadar loading={loading} />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-6 glass-card p-6"
                >
                    <TeamActivity teamMetrics={sprint?.teamMetrics} loading={loading} />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-6 glass-card p-6"
                >
                    <QuickActions onRefresh={handleRefresh} loading={loading} />
                </motion.div>

                {/* Sprint Goals (New Section for Interconnection) */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 glass-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <span className="text-2xl">🎯</span>
                            Sprint Goals
                        </h3>
                        <motion.button
                            className="text-accent text-sm font-medium hover:underline"
                            onClick={() => navigate('/sprint-goals')}
                        >
                            Manage Goals
                        </motion.button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {sprint?.goal ? (
                            <div className="col-span-full p-4 rounded-xl bg-accent/5 border border-accent/20">
                                <p className="text-sm font-semibold text-accent mb-1">Main Sprint Goal</p>
                                <p className="text-lg">{sprint.goal}</p>
                            </div>
                        ) : (
                            <div className="col-span-full py-8 text-center text-text-muted text-sm bg-dark-700/30 rounded-xl border border-dashed border-dark-600">
                                No main sprint goal set.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
