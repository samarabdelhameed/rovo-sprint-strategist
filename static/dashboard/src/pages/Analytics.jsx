import React from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    CheckCircle,
    AlertTriangle
} from 'lucide-react'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'

const velocityData = [
    { sprint: 'S38', planned: 45, completed: 42 },
    { sprint: 'S39', planned: 48, completed: 45 },
    { sprint: 'S40', planned: 50, completed: 48 },
    { sprint: 'S41', planned: 52, completed: 46 },
    { sprint: 'S42', planned: 52, completed: 34 },
]

const categoryData = [
    { name: 'Features', value: 45, color: '#f97316' },
    { name: 'Bugs', value: 25, color: '#ef4444' },
    { name: 'Tech Debt', value: 20, color: '#3b82f6' },
    { name: 'Other', value: 10, color: '#71717a' },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export default function Analytics() {
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
                    <h1 className="text-3xl font-display font-bold gradient-text">Analytics</h1>
                    <p className="text-text-muted mt-1">Sprint performance insights</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary">Last 5 Sprints</button>
                    <button className="btn-glow">Export Report</button>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Avg Velocity', value: '45.2', unit: 'pts', change: '+8%', icon: TrendingUp, color: 'text-success' },
                    { label: 'Completion Rate', value: '89', unit: '%', change: '-2%', icon: Target, color: 'text-accent' },
                    { label: 'Cycle Time', value: '3.2', unit: 'days', change: '-0.5d', icon: Clock, color: 'text-info' },
                    { label: 'Defect Escape', value: '2', unit: '/sprint', change: '-1', icon: AlertTriangle, color: 'text-success' },
                ].map((kpi, index) => (
                    <motion.div
                        key={kpi.label}
                        whileHover={{ y: -5 }}
                        className="stat-card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                            <span className={`text-sm font-medium ${kpi.change.startsWith('+') ? 'text-success' : kpi.change.startsWith('-') ? 'text-danger' : 'text-text-muted'}`}>
                                {kpi.change}
                            </span>
                        </div>
                        <p className="text-3xl font-bold">{kpi.value}<span className="text-lg text-text-muted ml-1">{kpi.unit}</span></p>
                        <p className="text-sm text-text-muted mt-1">{kpi.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Velocity Trend */}
                <motion.div variants={itemVariants} className="col-span-8 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-accent" />
                        Velocity Trend
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={velocityData}>
                                <XAxis dataKey="sprint" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                    }}
                                />
                                <Bar dataKey="planned" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Planned" />
                                <Bar dataKey="completed" fill="#f97316" radius={[4, 4, 0, 0]} name="Completed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Work Distribution */}
                <motion.div variants={itemVariants} className="col-span-4 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-6">Work Distribution</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {categoryData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-text-muted">{item.name} ({item.value}%)</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Sprint Health History */}
                <motion.div variants={itemVariants} className="col-span-12 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-6">Sprint Health Over Time</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { day: 'Day 1', health: 92 },
                                { day: 'Day 2', health: 88 },
                                { day: 'Day 3', health: 85 },
                                { day: 'Day 4', health: 82 },
                                { day: 'Day 5', health: 78 },
                                { day: 'Day 6', health: 75 },
                                { day: 'Day 7', health: 72 },
                            ]}>
                                <defs>
                                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="health"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    fill="url(#healthGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
