import React from 'react'
import { motion } from 'framer-motion'

export default function HealthGauge({ score = 78, trend = 'stable' }) {
    const getColor = (score) => {
        if (score >= 80) return { main: '#22c55e', gradient: ['#22c55e', '#4ade80'] }
        if (score >= 60) return { main: '#f97316', gradient: ['#f97316', '#fb923c'] }
        if (score >= 40) return { main: '#eab308', gradient: ['#eab308', '#fde047'] }
        return { main: '#ef4444', gradient: ['#ef4444', '#f87171'] }
    }

    const getLabel = (score) => {
        if (score >= 80) return 'Excellent'
        if (score >= 60) return 'Good'
        if (score >= 40) return 'At Risk'
        return 'Critical'
    }

    const color = getColor(score)
    const circumference = 2 * Math.PI * 70
    const strokeDashoffset = circumference - (score / 100) * circumference

    return (
        <div className="relative">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">🏥</span>
                Sprint Health
            </h3>

            <div className="flex flex-col items-center">
                {/* SVG Gauge */}
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                        {/* Background Circle */}
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="12"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke={`url(#gradient-${score})`}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            style={{ filter: `drop-shadow(0 0 10px ${color.main})` }}
                        />
                        {/* Gradient Definition */}
                        <defs>
                            <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={color.gradient[0]} />
                                <stop offset="100%" stopColor={color.gradient[1]} />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            className="text-5xl font-display font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            style={{ color: color.main }}
                        >
                            {score}
                        </motion.span>
                        <span className="text-text-muted text-sm">/100</span>
                    </div>
                </div>

                {/* Status */}
                <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{ backgroundColor: `${color.main}20` }}
                    >
                        <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: color.main }}
                        />
                        <span style={{ color: color.main }} className="font-semibold">
                            {getLabel(score)}
                        </span>
                    </div>

                    {/* Trend */}
                    <p className="mt-3 text-text-muted text-sm">
                        {trend === 'improving' && '📈 Trending up from last check'}
                        {trend === 'declining' && '📉 Declining - attention needed'}
                        {trend === 'stable' && '➡️ Stable performance'}
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
