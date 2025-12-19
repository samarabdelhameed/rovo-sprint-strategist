import React from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, AlertTriangle, CheckCircle, Mail, MessageSquare } from 'lucide-react'

const teamMembers = [
    {
        name: 'Sarah Chen',
        avatar: 'SC',
        role: 'Lead Developer',
        tasks: 5,
        completed: 3,
        points: 21,
        load: 105,
        online: true,
        skills: ['React', 'Node.js', 'AWS']
    },
    {
        name: 'John Davis',
        avatar: 'JD',
        role: 'Senior Developer',
        tasks: 4,
        completed: 2,
        points: 18,
        load: 90,
        online: true,
        skills: ['Python', 'Django', 'PostgreSQL']
    },
    {
        name: 'Mike Wilson',
        avatar: 'MW',
        role: 'Developer',
        tasks: 3,
        completed: 1,
        points: 12,
        load: 60,
        online: false,
        skills: ['React', 'TypeScript']
    },
    {
        name: 'Lisa Kim',
        avatar: 'LK',
        role: 'Developer',
        tasks: 4,
        completed: 2,
        points: 15,
        load: 75,
        online: true,
        skills: ['Vue.js', 'GraphQL', 'MongoDB']
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

export default function Team() {
    const avgLoad = Math.round(teamMembers.reduce((sum, m) => sum + m.load, 0) / teamMembers.length)
    const overloaded = teamMembers.filter(m => m.load > 100).length
    const totalCompleted = teamMembers.reduce((sum, m) => sum + m.completed, 0)
    const totalTasks = teamMembers.reduce((sum, m) => sum + m.tasks, 0)

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
                    <h1 className="text-3xl font-display font-bold gradient-text">Team</h1>
                    <p className="text-text-muted mt-1">Sprint 42 Team Performance</p>
                </div>
                <motion.button
                    className="btn-glow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Users className="w-4 h-4 mr-2" />
                    Rebalance Workload
                </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
                {[
                    { icon: Users, label: 'Team Size', value: teamMembers.length, color: 'text-info' },
                    { icon: TrendingUp, label: 'Avg Load', value: `${avgLoad}%`, color: avgLoad > 90 ? 'text-warning' : 'text-success' },
                    { icon: AlertTriangle, label: 'Overloaded', value: overloaded, color: overloaded > 0 ? 'text-danger' : 'text-success' },
                    { icon: CheckCircle, label: 'Tasks Done', value: `${totalCompleted}/${totalTasks}`, color: 'text-accent' },
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

            {/* Team Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => {
                    const loadColor = member.load > 100 ? 'text-danger' : member.load > 80 ? 'text-warning' : 'text-success'
                    const loadBg = member.load > 100 ? 'bg-danger' : member.load > 80 ? 'bg-warning' : 'bg-success'

                    return (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="glass-card p-6 group cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="relative">
                                    <motion.div
                                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-2xl font-bold"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        {member.avatar}
                                    </motion.div>
                                    <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-dark-800 ${member.online ? 'bg-success' : 'bg-dark-500'}`} />
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg">{member.name}</h3>
                                            <p className="text-text-muted text-sm">{member.role}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {member.skills.map((skill, i) => (
                                            <span key={i} className="text-xs px-2 py-1 rounded-lg bg-dark-700 text-text-secondary">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="text-center p-3 rounded-xl bg-dark-700">
                                    <p className="text-xl font-bold">{member.completed}/{member.tasks}</p>
                                    <p className="text-xs text-text-muted">Tasks</p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-dark-700">
                                    <p className="text-xl font-bold text-accent">{member.points}</p>
                                    <p className="text-xs text-text-muted">Points</p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-dark-700">
                                    <p className={`text-xl font-bold ${loadColor}`}>{member.load}%</p>
                                    <p className="text-xs text-text-muted">Capacity</p>
                                </div>
                            </div>

                            {/* Load Bar */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-text-muted">Workload</span>
                                    <span className={loadColor}>{member.load > 100 ? 'Overloaded!' : member.load > 80 ? 'High' : 'Normal'}</span>
                                </div>
                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${loadBg}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, member.load)}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>
        </motion.div>
    )
}
