import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Users,
    Zap,
    Target,
    Activity
} from 'lucide-react'
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

export default function Dashboard() {
    const stats = [
        {
            label: 'Health Score',
            value: '78',
            unit: '/100',
            change: '+5%',
            trend: 'up',
            icon: Activity,
            color: 'text-success'
        },
        {
            label: 'Velocity',
            value: '34',
            unit: 'pts',
            change: '+12%',
            trend: 'up',
            icon: Zap,
            color: 'text-accent'
        },
        {
            label: 'Completion',
            value: '65',
            unit: '%',
            change: '-3%',
            trend: 'down',
            icon: Target,
            color: 'text-warning'
        },
        {
            label: 'Team Load',
            value: '82',
            unit: '%',
            change: '0%',
            trend: 'neutral',
            icon: Users,
            color: 'text-info'
        },
    ]

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
                    <p className="text-text-muted mt-1">Sprint 42 • Day 5 of 10</p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        className="btn-secondary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        Last updated: 2 min ago
                    </motion.button>
                    <motion.button
                        className="btn-glow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Ask Rovo AI
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
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
                                    <span>{stat.change} from last sprint</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl bg-dark-700 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>
                ))}
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
                    <HealthGauge score={78} trend="improving" />
                </motion.div>

                {/* Velocity Chart */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-8 glass-card p-6"
                >
                    <VelocityChart />
                </motion.div>

                {/* Sprint Progress */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-8 glass-card p-6"
                >
                    <SprintProgress />
                </motion.div>

                {/* Risk Radar */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-4 glass-card p-6"
                >
                    <RiskRadar />
                </motion.div>

                {/* Team Activity */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-6 glass-card p-6"
                >
                    <TeamActivity />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-12 lg:col-span-6 glass-card p-6"
                >
                    <QuickActions />
                </motion.div>
            </div>
        </motion.div>
    )
}
