import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

const risks = [
    {
        id: 1,
        type: 'blocker',
        severity: 'high',
        title: '2 Blocked Tasks',
        description: 'PROJ-123, PROJ-456 blocked for 3+ days'
    },
    {
        id: 2,
        type: 'overload',
        severity: 'medium',
        title: 'Team Overload',
        description: 'John is at 120% capacity'
    },
    {
        id: 3,
        type: 'velocity',
        severity: 'low',
        title: 'Slight Velocity Drop',
        description: 'Velocity 5% below average'
    },
]

const getSeverityConfig = (severity) => {
    switch (severity) {
        case 'high':
            return {
                color: 'text-danger',
                bg: 'bg-danger/20',
                border: 'border-danger/30',
                icon: AlertTriangle
            }
        case 'medium':
            return {
                color: 'text-warning',
                bg: 'bg-warning/20',
                border: 'border-warning/30',
                icon: AlertCircle
            }
        case 'low':
            return {
                color: 'text-info',
                bg: 'bg-info/20',
                border: 'border-info/30',
                icon: Info
            }
        default:
            return {
                color: 'text-success',
                bg: 'bg-success/20',
                border: 'border-success/30',
                icon: CheckCircle
            }
    }
}

export default function RiskRadar() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    Risk Radar
                </h3>
                <span className="badge-warning">{risks.length} Active</span>
            </div>

            {risks.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                >
                    <span className="text-6xl">✅</span>
                    <p className="mt-4 text-lg font-semibold text-success">No Risks Detected!</p>
                    <p className="text-text-muted text-sm mt-2">Sprint is running smoothly</p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {risks.map((risk, index) => {
                        const config = getSeverityConfig(risk.severity)
                        const Icon = config.icon

                        return (
                            <motion.div
                                key={risk.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ x: 5 }}
                                className={`
                  p-4 rounded-xl border-l-4 cursor-pointer transition-all
                  ${config.bg} ${config.border}
                  hover:shadow-lg
                `}
                            >
                                <div className="flex items-start gap-3">
                                    <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-sm">{risk.title}</p>
                                            <span className={`text-xs font-medium uppercase ${config.color}`}>
                                                {risk.severity}
                                            </span>
                                        </div>
                                        <p className="text-text-muted text-xs mt-1">{risk.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            <motion.button
                className="w-full mt-4 btn-secondary text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                View All Risks
            </motion.button>
        </div>
    )
}
