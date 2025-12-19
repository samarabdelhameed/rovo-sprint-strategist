import React from 'react'
import { motion } from 'framer-motion'
import {
    Flag,
    MessageSquare,
    BarChart3,
    RefreshCw,
    Download,
    Sparkles
} from 'lucide-react'

const actions = [
    {
        icon: Flag,
        label: 'Pit-Stop Analysis',
        description: 'Get AI recommendations',
        color: 'from-accent to-orange-600'
    },
    {
        icon: MessageSquare,
        label: 'Generate Standup',
        description: 'Auto-create standup summary',
        color: 'from-info to-blue-600'
    },
    {
        icon: BarChart3,
        label: 'Sprint Report',
        description: 'Download sprint metrics',
        color: 'from-success to-green-600'
    },
    {
        icon: RefreshCw,
        label: 'Sync Data',
        description: 'Refresh from Jira',
        color: 'from-purple-500 to-purple-700'
    },
]

export default function QuickActions() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    Quick Actions
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {actions.map((action, index) => (
                    <motion.button
                        key={action.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative group p-4 rounded-xl bg-dark-700/50 border border-dark-500 hover:border-accent/50 transition-all overflow-hidden text-left"
                    >
                        {/* Gradient Background on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                        <div className="relative">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                                <action.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="font-semibold text-sm">{action.label}</p>
                            <p className="text-xs text-text-muted mt-1">{action.description}</p>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* AI Suggestion */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-transparent border border-accent/20"
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                        <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">AI Suggestion</p>
                        <p className="text-xs text-text-muted mt-1">
                            Consider removing PROJ-106 from sprint. Current velocity suggests 85% completion probability.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button className="btn-glow text-xs py-1.5 px-3">
                                Apply
                            </button>
                            <button className="btn-secondary text-xs py-1.5 px-3">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
