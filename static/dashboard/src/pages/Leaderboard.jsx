import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star, Flame, Target, Users, Zap } from 'lucide-react'

const rankings = [
    { rank: 1, name: 'Sarah Chen', avatar: 'SC', points: 450, velocity: 34, badges: ['🏎️', '🏆', '🔥'], streak: 5 },
    { rank: 2, name: 'John Davis', avatar: 'JD', points: 380, velocity: 28, badges: ['🎯', '🤝'], streak: 3 },
    { rank: 3, name: 'Mike Wilson', avatar: 'MW', points: 320, velocity: 25, badges: ['🧹'], streak: 2 },
    { rank: 4, name: 'Lisa Kim', avatar: 'LK', points: 290, velocity: 22, badges: ['🏎️'], streak: 1 },
    { rank: 5, name: 'Alex Brown', avatar: 'AB', points: 250, velocity: 20, badges: [], streak: 0 },
]

const badges = [
    { icon: '🏎️', name: 'Pole Position', desc: 'First to complete a task in sprint' },
    { icon: '🏆', name: 'Champion', desc: 'Highest velocity in sprint' },
    { icon: '🎯', name: 'Bullseye', desc: '100% estimation accuracy' },
    { icon: '🔥', name: 'On Fire', desc: '5 tasks completed in one day' },
    { icon: '🤝', name: 'Team Player', desc: 'Helped unblock 3+ teammates' },
    { icon: '🧹', name: 'Clean Code', desc: 'Zero bugs in sprint' },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export default function Leaderboard() {
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
                    <h1 className="text-3xl font-display font-bold gradient-text">Leaderboard</h1>
                    <p className="text-text-muted mt-1">Sprint 42 Rankings</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="badge-accent">🏁 5 days left</span>
                </div>
            </motion.div>

            {/* Podium */}
            <motion.div variants={itemVariants} className="glass-card p-8">
                <div className="flex items-end justify-center gap-6">
                    {/* 2nd Place */}
                    <motion.div
                        className="text-center"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="relative">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-2xl font-bold text-dark-900 ring-4 ring-gray-400/30">
                                {rankings[1].avatar}
                            </div>
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl">🥈</span>
                        </div>
                        <p className="mt-4 font-semibold">{rankings[1].name.split(' ')[0]}</p>
                        <p className="text-accent font-bold">{rankings[1].points} pts</p>
                        <div className="h-24 w-24 mx-auto mt-4 rounded-t-xl bg-gradient-to-t from-gray-600 to-gray-500 flex items-end justify-center pb-2">
                            <span className="text-4xl font-bold text-white/50">2</span>
                        </div>
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div
                        className="text-center"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="relative">
                            <motion.div
                                className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-3xl font-bold text-dark-900 ring-4 ring-yellow-400/30"
                                animate={{
                                    boxShadow: ['0 0 20px rgba(250, 204, 21, 0.3)', '0 0 40px rgba(250, 204, 21, 0.6)', '0 0 20px rgba(250, 204, 21, 0.3)']
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {rankings[0].avatar}
                            </motion.div>
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-4xl">🥇</span>
                        </div>
                        <p className="mt-4 font-semibold text-lg">{rankings[0].name.split(' ')[0]}</p>
                        <p className="text-accent font-bold text-xl">{rankings[0].points} pts</p>
                        <div className="flex justify-center gap-1 mt-2">
                            {rankings[0].badges.map((b, i) => <span key={i} className="text-lg">{b}</span>)}
                        </div>
                        <div className="h-32 w-28 mx-auto mt-4 rounded-t-xl bg-gradient-to-t from-yellow-600 to-yellow-500 flex items-end justify-center pb-2">
                            <span className="text-5xl font-bold text-white/50">1</span>
                        </div>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                        className="text-center"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="relative">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-amber-600/30">
                                {rankings[2].avatar}
                            </div>
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl">🥉</span>
                        </div>
                        <p className="mt-4 font-semibold">{rankings[2].name.split(' ')[0]}</p>
                        <p className="text-accent font-bold">{rankings[2].points} pts</p>
                        <div className="h-16 w-24 mx-auto mt-4 rounded-t-xl bg-gradient-to-t from-amber-800 to-amber-700 flex items-end justify-center pb-2">
                            <span className="text-3xl font-bold text-white/50">3</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Full Rankings */}
            <motion.div variants={itemVariants} className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    Full Rankings
                </h3>

                <div className="space-y-3">
                    {rankings.map((player, index) => (
                        <motion.div
                            key={player.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 10, backgroundColor: 'rgba(249, 115, 22, 0.05)' }}
                            className={`
                flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer
                ${player.rank <= 3
                                    ? 'bg-gradient-to-r from-accent/10 to-transparent border border-accent/20'
                                    : 'bg-dark-700/50 hover:bg-dark-700'
                                }
              `}
                        >
                            {/* Rank */}
                            <div className="w-10 text-center">
                                {player.rank === 1 && <span className="text-2xl">🥇</span>}
                                {player.rank === 2 && <span className="text-2xl">🥈</span>}
                                {player.rank === 3 && <span className="text-2xl">🥉</span>}
                                {player.rank > 3 && <span className="text-xl font-bold text-text-muted">#{player.rank}</span>}
                            </div>

                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/50 to-accent/20 flex items-center justify-center font-bold text-lg">
                                {player.avatar}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <p className="font-semibold">{player.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {player.badges.map((b, i) => <span key={i}>{b}</span>)}
                                    {player.streak > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-accent">
                                            <Flame className="w-3 h-3" /> {player.streak} day streak
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="text-right">
                                <p className="text-2xl font-bold text-accent">{player.points}</p>
                                <p className="text-xs text-text-muted">{player.velocity} pts velocity</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Badges Legend */}
            <motion.div variants={itemVariants} className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent" />
                    Badge Collection
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {badges.map((badge, index) => (
                        <motion.div
                            key={badge.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="p-4 rounded-xl bg-dark-700/50 text-center group cursor-pointer hover:bg-dark-700 transition-all"
                        >
                            <span className="text-4xl group-hover:scale-125 transition-transform inline-block">{badge.icon}</span>
                            <p className="font-semibold text-sm mt-2">{badge.name}</p>
                            <p className="text-xs text-text-muted mt-1">{badge.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}
