import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'

const issues = [
    { key: 'PROJ-101', title: 'User authentication flow', status: 'done', points: 5, assignee: 'SC' },
    { key: 'PROJ-102', title: 'Dashboard redesign', status: 'done', points: 8, assignee: 'JD' },
    { key: 'PROJ-103', title: 'API optimization', status: 'progress', points: 5, assignee: 'MW' },
    { key: 'PROJ-104', title: 'Payment integration', status: 'progress', points: 8, assignee: 'LK' },
    { key: 'PROJ-105', title: 'Email notifications', status: 'blocked', points: 3, assignee: 'SC' },
    { key: 'PROJ-106', title: 'Mobile responsiveness', status: 'todo', points: 5, assignee: 'JD' },
    { key: 'PROJ-107', title: 'Performance testing', status: 'todo', points: 3, assignee: 'MW' },
]

const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || 'todo';
    switch (s) {
        case 'done':
        case 'completed':
            return { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/20', label: 'Done' }
        case 'progress':
        case 'in_progress':
        case 'review':
            return { icon: Clock, color: 'text-accent', bg: 'bg-accent/20', label: 'In Progress' }
        case 'blocked':
            return { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/20', label: 'Blocked' }
        default:
            return { icon: Circle, color: 'text-text-muted', bg: 'bg-dark-600', label: 'To Do' }
    }
}

export default function SprintProgress({ issues = [], loading = false }) {
    const completed = issues.filter(i => {
        const s = i.status?.toLowerCase();
        return s === 'done' || s === 'completed';
    }).length;
    const total = issues.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-6 bg-dark-700 rounded w-1/3" />
                <div className="h-20 bg-dark-700 rounded" />
                <div className="h-64 bg-dark-700 rounded" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    Sprint Progress
                </h3>
                <span className="text-text-muted text-sm">{completed}/{total} completed</span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-muted">Overall Progress</span>
                    <span className="text-sm font-semibold text-accent">{progress}%</span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)' }}
                    />
                </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                    { key: 'done', label: 'Done' },
                    { key: 'progress', label: 'In Progress' },
                    { key: 'blocked', label: 'Blocked' },
                    { key: 'todo', label: 'To Do' }
                ].map((status) => {
                    const config = getStatusConfig(status.key)
                    const count = issues.filter(i => {
                        const s = i.status?.toLowerCase();
                        if (status.key === 'done') return s === 'done' || s === 'completed';
                        if (status.key === 'progress') return s === 'progress' || s === 'in_progress' || s === 'review';
                        if (status.key === 'blocked') return s === 'blocked';
                        if (status.key === 'todo') return s === 'todo' || !s;
                        return false;
                    }).length;

                    return (
                        <motion.div
                            key={status.key}
                            className={`p-3 rounded-xl text-center ${config.bg}`}
                            whileHover={{ scale: 1.05 }}
                        >
                            <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
                            <p className="text-xs text-text-muted">{config.label}</p>
                        </motion.div>
                    )
                })}
            </div>

            {/* Issues List */}
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {issues.length > 0 ? (
                    issues.map((issue, index) => {
                        const config = getStatusConfig(issue.status)
                        const Icon = config.icon

                        return (
                            <motion.div
                                key={issue.key || issue.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors cursor-pointer group"
                            >
                                <Icon className={`w-5 h-5 ${config.color}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-accent font-mono">{issue.key}</span>
                                        <span className="text-sm truncate">{issue.title}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-text-muted whitespace-nowrap">{issue.story_points || 0} pts</span>
                                {issue.assignee && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-[10px] font-bold overflow-hidden" title={issue.assignee.name}>
                                        {issue.assignee.avatar ? (
                                            <img src={issue.assignee.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            issue.assignee.name?.charAt(0) || '?'
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )
                    })
                ) : (
                    <div className="text-center py-8 text-text-muted text-sm bg-dark-700/30 rounded-xl border border-dashed border-dark-600">
                        No issues found in this sprint.
                    </div>
                )}
            </div>
        </div>
    )
}
