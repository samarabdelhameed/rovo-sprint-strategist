import React from 'react'
import { motion } from 'framer-motion'

const teamMembers = [
    { name: 'Sarah Chen', role: 'Lead', avatar: 'SC', tasks: 5, points: 21, load: 105, online: true },
    { name: 'John Davis', role: 'Dev', avatar: 'JD', tasks: 4, points: 18, load: 90, online: true },
    { name: 'Mike Wilson', role: 'Dev', avatar: 'MW', tasks: 3, points: 12, load: 60, online: false },
    { name: 'Lisa Kim', role: 'Dev', avatar: 'LK', tasks: 4, points: 15, load: 75, online: true },
]

const getLoadColor = (load) => {
    if (load > 100) return { bar: 'bg-danger', text: 'text-danger' }
    if (load > 80) return { bar: 'bg-warning', text: 'text-warning' }
    return { bar: 'bg-success', text: 'text-success' }
}

export default function TeamActivity() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Team Workload
                </h3>
                <span className="badge-info">{teamMembers.filter(m => m.online).length} Online</span>
            </div>

            <div className="space-y-4">
                {teamMembers.map((member, index) => {
                    const loadColor = getLoadColor(member.load)

                    return (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-all cursor-pointer"
                            whileHover={{ x: 5 }}
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center font-bold text-lg">
                                        {member.avatar}
                                    </div>
                                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-700 ${member.online ? 'bg-success' : 'bg-dark-500'}`} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{member.name}</span>
                                        <span className="text-xs text-text-muted bg-dark-600 px-2 py-0.5 rounded">{member.role}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                                        <span>{member.tasks} tasks</span>
                                        <span>{member.points} pts</span>
                                    </div>
                                </div>

                                {/* Load */}
                                <div className="text-right">
                                    <p className={`text-lg font-bold ${loadColor.text}`}>{member.load}%</p>
                                    <p className="text-xs text-text-muted">Capacity</p>
                                </div>
                            </div>

                            {/* Load Bar */}
                            <div className="mt-3 h-2 bg-dark-600 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${loadColor.bar}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, member.load)}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                />
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
