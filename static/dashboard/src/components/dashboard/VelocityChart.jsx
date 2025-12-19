import React from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp } from 'lucide-react'

const data = [
    { day: 'Day 1', actual: 52, ideal: 52 },
    { day: 'Day 2', actual: 48, ideal: 46 },
    { day: 'Day 3', actual: 45, ideal: 42 },
    { day: 'Day 4', actual: 38, ideal: 36 },
    { day: 'Day 5', actual: 34, ideal: 30 },
    { day: 'Day 6', actual: null, ideal: 26 },
    { day: 'Day 7', actual: null, ideal: 20 },
    { day: 'Day 8', actual: null, ideal: 16 },
    { day: 'Day 9', actual: null, ideal: 10 },
    { day: 'Day 10', actual: null, ideal: 0 },
]

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3">
                <p className="text-sm font-semibold">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value} pts
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function VelocityChart() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Burndown Chart
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        <span className="text-sm text-text-muted">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-dark-500" />
                        <span className="text-sm text-text-muted">Ideal</span>
                    </div>
                </div>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="ideal"
                            stroke="#71717a"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorIdeal)"
                            name="Ideal"
                        />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="#f97316"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorActual)"
                            name="Actual"
                            dot={{ fill: '#f97316', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2, fill: '#0a0a0f' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-600">
                <motion.div
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                >
                    <p className="text-2xl font-display font-bold text-accent">34</p>
                    <p className="text-sm text-text-muted">Remaining</p>
                </motion.div>
                <motion.div
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                >
                    <p className="text-2xl font-display font-bold text-success">18</p>
                    <p className="text-sm text-text-muted">Completed</p>
                </motion.div>
                <motion.div
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                >
                    <p className="text-2xl font-display font-bold flex items-center justify-center gap-1">
                        <TrendingUp className="w-5 h-5 text-success" />
                        3.6
                    </p>
                    <p className="text-sm text-text-muted">Daily Velocity</p>
                </motion.div>
            </div>
        </div>
    )
}
