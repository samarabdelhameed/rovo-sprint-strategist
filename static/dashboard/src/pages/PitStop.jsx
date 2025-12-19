import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Flag,
    AlertTriangle,
    ArrowRight,
    CheckCircle,
    XCircle,
    Zap,
    TrendingUp,
    Users,
    Clock
} from 'lucide-react'

const recommendations = [
    {
        id: 1,
        priority: 'critical',
        title: 'Remove Low-Priority Stories',
        description: 'PROJ-456, PROJ-789 can be moved to backlog to focus on sprint goal',
        impact: '+15% completion probability',
        effort: 'Low',
        affected: ['PROJ-456', 'PROJ-789']
    },
    {
        id: 2,
        priority: 'high',
        title: 'Rebalance Team Workload',
        description: 'Sarah is at 105% capacity. Move 2 tasks to Mike (60% capacity)',
        impact: 'Reduce burnout risk',
        effort: 'Medium',
        affected: ['Sarah Chen', 'Mike Wilson']
    },
    {
        id: 3,
        priority: 'medium',
        title: 'Split Large Story',
        description: 'PROJ-345 (8pts) is too large. Split into 3 smaller stories',
        impact: '+2 days buffer',
        effort: 'Medium',
        affected: ['PROJ-345']
    },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

const getPriorityConfig = (priority) => {
    switch (priority) {
        case 'critical':
            return { color: 'text-danger', bg: 'bg-danger/20', border: 'border-danger/30' }
        case 'high':
            return { color: 'text-warning', bg: 'bg-warning/20', border: 'border-warning/30' }
        default:
            return { color: 'text-info', bg: 'bg-info/20', border: 'border-info/30' }
    }
}

export default function PitStop() {
    const [applied, setApplied] = useState([])

    const handleApply = (id) => {
        setApplied([...applied, id])
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold gradient-text">Pit-Stop</h1>
                    <p className="text-text-muted mt-1">AI-powered sprint adjustments</p>
                </div>
                <motion.button
                    className="btn-glow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Zap className="w-4 h-4 mr-2" />
                    Run Analysis
                </motion.button>
            </motion.div>

            {/* Alert Banner */}
            <motion.div
                variants={itemVariants}
                className="glass-card p-6 border-l-4 border-warning"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-warning/20">
                        <AlertTriangle className="w-6 h-6 text-warning" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">Sprint Adjustment Recommended</h3>
                        <p className="text-text-muted mt-1">
                            Current trajectory shows 68% completion probability. Apply recommended changes to improve outcome.
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-warning">68%</p>
                        <p className="text-xs text-text-muted">Predicted Completion</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
                {[
                    { icon: Clock, label: 'Days Left', value: '5', color: 'text-accent' },
                    { icon: TrendingUp, label: 'Velocity Gap', value: '-8 pts', color: 'text-danger' },
                    { icon: Users, label: 'Overloaded', value: '1', color: 'text-warning' },
                    { icon: AlertTriangle, label: 'Blocked', value: '2', color: 'text-danger' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        whileHover={{ y: -5 }}
                        className="stat-card flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-xl bg-dark-700 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-sm text-text-muted">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recommendations */}
            <motion.div variants={itemVariants} className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-accent" />
                    Recommended Actions
                </h3>

                <div className="space-y-4">
                    {recommendations.map((rec, index) => {
                        const isApplied = applied.includes(rec.id)
                        const config = getPriorityConfig(rec.priority)

                        return (
                            <motion.div
                                key={rec.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                  p-6 rounded-xl border transition-all
                  ${isApplied
                                        ? 'bg-success/10 border-success/30'
                                        : `bg-dark-700/50 ${config.border} hover:bg-dark-700`
                                    }
                `}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Priority Badge */}
                                    <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                    ${isApplied ? 'bg-success/20 text-success' : config.bg + ' ' + config.color}
                  `}>
                                        {isApplied ? <CheckCircle className="w-6 h-6" /> : index + 1}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-semibold text-lg">{rec.title}</h4>
                                            <span className={`
                        text-xs font-medium uppercase px-2 py-0.5 rounded
                        ${isApplied ? 'bg-success/20 text-success' : config.bg + ' ' + config.color}
                      `}>
                                                {isApplied ? 'Applied' : rec.priority}
                                            </span>
                                        </div>
                                        <p className="text-text-muted mt-2">{rec.description}</p>

                                        {/* Affected Items */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {rec.affected.map((item, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-2 py-1 rounded-lg bg-dark-600 text-text-secondary"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Impact */}
                                        <div className="flex items-center gap-4 mt-4 text-sm">
                                            <span className="text-success">📈 {rec.impact}</span>
                                            <span className="text-text-muted">⏱️ {rec.effort} effort</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        {!isApplied ? (
                                            <>
                                                <motion.button
                                                    onClick={() => handleApply(rec.id)}
                                                    className="btn-glow text-sm py-2"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Apply
                                                </motion.button>
                                                <button className="btn-secondary text-sm py-2">
                                                    Dismiss
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-success text-sm font-medium">
                                                ✓ Changes applied
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Apply All Button */}
                <div className="flex justify-center mt-8 gap-4">
                    <motion.button
                        className="btn-glow px-8"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setApplied(recommendations.map(r => r.id))}
                    >
                        Apply All Recommendations
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )
}
