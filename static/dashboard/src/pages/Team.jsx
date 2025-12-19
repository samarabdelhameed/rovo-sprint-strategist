import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    User,
    BarChart3,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Loader2,
    Mail,
    Shield,
    Target
} from 'lucide-react'
import { useSprint } from '../context/SprintContext'

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

// Role badge colors
const roleColors = {
    tech_lead: 'bg-purple-500/20 text-purple-400',
    developer: 'bg-blue-500/20 text-blue-400',
    qa_lead: 'bg-green-500/20 text-green-400',
    scrum_master: 'bg-orange-500/20 text-orange-400',
    designer: 'bg-pink-500/20 text-pink-400'
}

// Role display names
const roleNames = {
    tech_lead: 'Tech Lead',
    developer: 'Developer',
    qa_lead: 'QA Lead',
    scrum_master: 'Scrum Master',
    designer: 'Designer'
}

// Loading skeleton
function TeamMemberSkeleton() {
    return (
        <div className="glass-card p-6 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-dark-700 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-5 bg-dark-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-dark-700 rounded w-24 mb-3"></div>
                    <div className="h-3 bg-dark-700 rounded w-full"></div>
                </div>
            </div>
        </div>
    )
}

export default function Team() {
    const { team, teamMetrics, issues, sprint, loading, refresh } = useSprint()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refresh()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    // Calculate team summary
    const teamSummary = {
        totalMembers: teamMetrics?.length || 0,
        averageLoad: teamMetrics?.length > 0
            ? Math.round(teamMetrics.reduce((sum, m) => sum + m.load, 0) / teamMetrics.length)
            : 0,
        overloaded: teamMetrics?.filter(m => m.load > 100).length || 0,
        underutilized: teamMetrics?.filter(m => m.load < 50).length || 0,
        totalCapacity: team?.reduce((sum, m) => sum + (m.capacity || 20), 0) || 0,
        totalAssigned: teamMetrics?.reduce((sum, m) => sum + m.points, 0) || 0
    }

    // Get load color
    const getLoadColor = (load) => {
        if (load >= 100) return 'text-danger'
        if (load >= 80) return 'text-warning'
        if (load >= 50) return 'text-success'
        return 'text-info'
    }

    // Get load bar color
    const getLoadBarColor = (load) => {
        if (load >= 100) return 'bg-danger'
        if (load >= 80) return 'bg-warning'
        if (load >= 50) return 'bg-success'
        return 'bg-info'
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
                    <h1 className="text-3xl font-display font-bold gradient-text">Team</h1>
                    <p className="text-text-muted mt-1">
                        {sprint?.name || 'Active Sprint'} • {teamSummary.totalMembers} members
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

            {/* Team Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm">Team Members</p>
                            <p className="text-3xl font-display font-bold mt-1">{teamSummary.totalMembers}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-700 text-accent">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm">Average Load</p>
                            <p className={`text-3xl font-display font-bold mt-1 ${getLoadColor(teamSummary.averageLoad)}`}>
                                {teamSummary.averageLoad}%
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-700 text-info">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm">Overloaded</p>
                            <p className={`text-3xl font-display font-bold mt-1 ${teamSummary.overloaded > 0 ? 'text-danger' : 'text-success'}`}>
                                {teamSummary.overloaded}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${teamSummary.overloaded > 0 ? 'bg-danger/20' : 'bg-success/20'}`}>
                            <AlertTriangle className={`w-6 h-6 ${teamSummary.overloaded > 0 ? 'text-danger' : 'text-success'}`} />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm">Total Points</p>
                            <p className="text-3xl font-display font-bold mt-1 text-accent">
                                {teamSummary.totalAssigned}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-700 text-accent">
                            <Target className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Team Capacity Bar */}
            <motion.div variants={itemVariants} className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Team Capacity Overview</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Assigned: {teamSummary.totalAssigned} pts</span>
                        <span className="text-text-muted">Capacity: {teamSummary.totalCapacity} pts</span>
                    </div>
                    <div className="h-4 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${getLoadBarColor(teamSummary.averageLoad)} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (teamSummary.totalAssigned / teamSummary.totalCapacity) * 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex items-center justify-center gap-6 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-success"></div>
                            <span>Healthy (50-80%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-warning"></div>
                            <span>High (80-100%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-danger"></div>
                            <span>Overload (100%+)</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Team Members Grid */}
            <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <>
                            <TeamMemberSkeleton />
                            <TeamMemberSkeleton />
                            <TeamMemberSkeleton />
                            <TeamMemberSkeleton />
                            <TeamMemberSkeleton />
                            <TeamMemberSkeleton />
                        </>
                    ) : (
                        teamMetrics?.map((member, index) => (
                            <motion.div
                                key={member.id}
                                className="glass-card p-6 hover:border-accent/30 transition-all cursor-pointer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                                onClick={() => setSelectedMember(member)}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <img
                                            src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                            alt={member.name}
                                            className="w-16 h-16 rounded-full bg-dark-700"
                                        />
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-dark-800 flex items-center justify-center
                                            ${member.load >= 100 ? 'bg-danger' : member.load >= 80 ? 'bg-warning' : 'bg-success'}`}>
                                            {member.load >= 100 ? (
                                                <AlertTriangle className="w-3 h-3" />
                                            ) : (
                                                <CheckCircle2 className="w-3 h-3" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg">{member.name}</h4>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${roleColors[member.role] || 'bg-gray-500/20 text-gray-400'}`}>
                                            {roleNames[member.role] || member.role}
                                        </span>

                                        {/* Load Bar */}
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-text-muted">Load</span>
                                                <span className={getLoadColor(member.load)}>{member.load}%</span>
                                            </div>
                                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full ${getLoadBarColor(member.load)} rounded-full`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, member.load)}%` }}
                                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                                            <div className="flex items-center gap-1">
                                                <Target className="w-3 h-3" />
                                                <span>{member.points} pts</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>{member.taskCount} tasks</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {member.completionRate >= 50 ? (
                                                    <TrendingUp className="w-3 h-3 text-success" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3 text-warning" />
                                                )}
                                                <span>{member.completionRate}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Member Detail Modal */}
            {selectedMember && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedMember(null)}
                >
                    <motion.div
                        className="glass-card p-8 max-w-lg w-full"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-6">
                            <img
                                src={selectedMember.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.name}`}
                                alt={selectedMember.name}
                                className="w-24 h-24 rounded-full bg-dark-700"
                            />
                            <div className="flex-1">
                                <h2 className="text-2xl font-display font-bold">{selectedMember.name}</h2>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${roleColors[selectedMember.role] || 'bg-gray-500/20 text-gray-400'}`}>
                                    {roleNames[selectedMember.role] || selectedMember.role}
                                </span>
                                {selectedMember.email && (
                                    <div className="flex items-center gap-2 mt-3 text-text-muted">
                                        <Mail className="w-4 h-4" />
                                        <span>{selectedMember.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-4 bg-dark-700/50 rounded-xl">
                                <p className={`text-2xl font-bold ${getLoadColor(selectedMember.load)}`}>
                                    {selectedMember.load}%
                                </p>
                                <p className="text-text-muted text-sm mt-1">Load</p>
                            </div>
                            <div className="text-center p-4 bg-dark-700/50 rounded-xl">
                                <p className="text-2xl font-bold text-accent">{selectedMember.points}</p>
                                <p className="text-text-muted text-sm mt-1">Points</p>
                            </div>
                            <div className="text-center p-4 bg-dark-700/50 rounded-xl">
                                <p className="text-2xl font-bold text-success">{selectedMember.completionRate}%</p>
                                <p className="text-text-muted text-sm mt-1">Completion</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-semibold mb-3">Assigned Issues ({selectedMember.taskCount})</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {issues?.filter(i => i.assignee_id === selectedMember.id).map(issue => (
                                    <div key={issue.id} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-mono text-sm">{issue.key}</span>
                                            <span className="text-sm truncate max-w-[200px]">{issue.title}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-xs ${issue.status === 'done' ? 'bg-success/20 text-success' :
                                                issue.status === 'in_progress' ? 'bg-accent/20 text-accent' :
                                                    issue.status === 'blocked' ? 'bg-danger/20 text-danger' :
                                                        'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {issue.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <motion.button
                            className="btn-secondary w-full mt-6"
                            onClick={() => setSelectedMember(null)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Close
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    )
}
