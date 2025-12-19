import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    UserMinus,
    Edit2,
    Save,
    X,
    RefreshCw,
    Jira,
    Zap,
    Settings,
    Trophy,
    Target,
    BarChart3,
    AlertTriangle,
    Shield,
    Trash2,
    CheckCircle2,
    Mail,
    Plus,
    ChevronRight,
    Search,
    Download
} from 'lucide-react';
import { apiRequest, API_ENDPOINTS } from '../config/api';

const TeamManagement = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sprintSettings, setSprintSettings] = useState({
        sprintLength: '2 weeks',
        velocityTarget: 'auto-calculate',
        storyPointScale: 'fibonacci'
    });
    const [gamificationSettings, setGamificationSettings] = useState({
        enableLeaderboard: true,
        awardBadges: true,
        showIndividualMetrics: true,
        publicRankings: false
    });

    const [newMember, setNewMember] = useState({
        name: '',
        email: '',
        role: 'developer',
        capacity: 20
    });

    useEffect(() => {
        loadTeamMembers();
    }, []);

    const loadTeamMembers = async () => {
        try {
            setIsLoading(true);
            const data = await apiRequest(API_ENDPOINTS.team);
            if (data.success) {
                setTeamMembers(data.data);
            }
        } catch (error) {
            console.error('Failed to load team members:', error);
            // Mock data for demo if fetch fails
            setTeamMembers([
                { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'tech_lead', capacity: 25, load: 85, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                { id: 2, name: 'Mike Chen', email: 'mike@example.com', role: 'developer', capacity: 20, load: 110, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
                { id: 3, name: 'Lisa Anderson', email: 'lisa@example.com', role: 'developer', capacity: 20, load: 45, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
                { id: 4, name: 'Emma Wilson', email: 'emma@example.com', role: 'qa_lead', capacity: 15, load: 70, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const result = await apiRequest(API_ENDPOINTS.team, {
                method: 'POST',
                body: JSON.stringify(newMember)
            });
            if (result.success) {
                setTeamMembers(prev => [...prev, result.data]);
                setNewMember({ name: '', email: '', role: 'developer', capacity: 20 });
                setShowAddMember(false);
            }
        } catch (error) {
            console.error('Failed to add member:', error);
        }
    };

    const handleUpdateMember = async (memberId, updates) => {
        try {
            const result = await apiRequest(`${API_ENDPOINTS.team}/${memberId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            if (result.success) {
                setTeamMembers(prev =>
                    prev.map(member =>
                        member.id === memberId ? { ...member, ...result.data } : member
                    )
                );
                setEditingMember(null);
            }
        } catch (error) {
            console.error('Failed to update member:', error);
        }
    };

    const handleDeleteMember = async (memberId) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            const result = await apiRequest(`${API_ENDPOINTS.team}/${memberId}`, {
                method: 'DELETE'
            });
            if (result.success) {
                setTeamMembers(prev => prev.filter(member => member.id !== memberId));
            }
        } catch (error) {
            console.error('Failed to delete member:', error);
        }
    };

    const handleImportFromJira = async () => {
        try {
            setIsLoading(true);
            // Mock Jira import
            setTimeout(() => {
                loadTeamMembers();
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to import from Jira:', error);
            setIsLoading(false);
        }
    };

    const getRoleIcon = (role) => {
        const icons = {
            'tech_lead': Shield,
            'scrum_master': Target,
            'developer': Zap,
            'qa_lead': CheckCircle2,
            'designer': Edit2,
            'product_owner': BarChart3
        };
        const Icon = icons[role] || Users;
        return <Icon className="w-4 h-4" />;
    };

    const getRoleStyles = (role) => {
        const styles = {
            'tech_lead': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'scrum_master': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'developer': 'bg-green-500/20 text-green-400 border-green-500/30',
            'qa_lead': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'designer': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'product_owner': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };
        return styles[role] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const getLoadColor = (load) => {
        if (load > 100) return 'text-danger';
        if (load > 80) return 'text-warning';
        return 'text-success';
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold gradient-text flex items-center gap-3">
                        <Users className="w-8 h-8 text-neutral-100" />
                        Team Management
                    </h2>
                    <p className="text-text-muted mt-2">Manage your team members, capacity, and sprint settings</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <motion.button
                        className="btn-secondary flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleImportFromJira}
                        disabled={isLoading}
                    >
                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Import from Jira
                    </motion.button>
                    <motion.button
                        className="btn-glow flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddMember(true)}
                    >
                        <Plus className="w-5 h-5" />
                        Add Member
                    </motion.button>
                </div>
            </div>

            {/* Team Table section */}
            <motion.div variants={itemVariants} className="glass-card overflow-hidden">
                <div className="p-6 border-b border-dark-600/50 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Team Directory</h3>
                    <div className="flex items-center gap-2 p-2 px-4 bg-dark-700/50 rounded-lg border border-dark-600/50">
                        <Search className="w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search team..."
                            className="bg-transparent border-none outline-none text-sm w-40"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dark-700/30 text-text-muted text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Member</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Capacity</th>
                                <th className="px-6 py-4 font-medium">Current Load</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-600/50">
                            {teamMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-dark-700/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img
                                                    src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                                    alt={member.name}
                                                    className="w-10 h-10 rounded-xl bg-dark-700 object-cover border border-dark-600/50"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-dark-800"></div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white">{member.name}</div>
                                                <div className="text-text-muted text-xs flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {member.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getRoleStyles(member.role)}`}>
                                            {getRoleIcon(member.role)}
                                            <span className="capitalize">{member.role.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingMember === member.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    defaultValue={member.capacity}
                                                    className="w-16 bg-dark-700 border border-dark-600 rounded-lg px-2 py-1 text-sm focus:border-accent outline-none"
                                                    autoFocus
                                                    onBlur={(e) => handleUpdateMember(member.id, { capacity: parseInt(e.target.value) })}
                                                />
                                                <span className="text-xs text-text-muted uppercase">pts</span>
                                            </div>
                                        ) : (
                                            <div className="font-mono text-sm text-white">
                                                {member.capacity} <span className="text-text-muted text-[10px] uppercase">pts</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 min-w-[80px] h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full ${member.load > 100 ? 'bg-danger' :
                                                        member.load > 80 ? 'bg-warning' : 'bg-success'
                                                        }`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(member.load, 100)}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                            <span className={`text-xs font-bold ${getLoadColor(member.load)}`}>
                                                {member.load}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                                                className="p-2 hover:bg-dark-600 rounded-lg text-text-muted hover:text-accent transition-colors"
                                                title="Edit capacity"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMember(member.id)}
                                                className="p-2 hover:bg-dark-600 rounded-lg text-text-muted hover:text-danger transition-colors"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Bottom settings section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-accent/20">
                            <Settings className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-xl font-semibold">Sprint Configuration</h3>
                    </div>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted ml-1 uppercase tracking-wider font-semibold">Sprint Length</label>
                            <select
                                value={sprintSettings.sprintLength}
                                onChange={(e) => setSprintSettings(prev => ({ ...prev, sprintLength: e.target.value }))}
                                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors appearance-none"
                            >
                                <option value="1 week">1 week</option>
                                <option value="2 weeks">2 weeks</option>
                                <option value="3 weeks">3 weeks</option>
                                <option value="4 weeks">4 weeks</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted ml-1 uppercase tracking-wider font-semibold">Velocity Target</label>
                            <select
                                value={sprintSettings.velocityTarget}
                                onChange={(e) => setSprintSettings(prev => ({ ...prev, velocityTarget: e.target.value }))}
                                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors"
                            >
                                <option value="auto-calculate">Auto-calculate</option>
                                <option value="manual">Manual</option>
                                <option value="historical-average">Historical Average</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted ml-1 uppercase tracking-wider font-semibold">Story Point Scale</label>
                            <select
                                value={sprintSettings.storyPointScale}
                                onChange={(e) => setSprintSettings(prev => ({ ...prev, storyPointScale: e.target.value }))}
                                className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors"
                            >
                                <option value="fibonacci">Fibonacci (1,2,3,5,8,13)</option>
                                <option value="linear">Linear (1,2,3,4,5,6)</option>
                                <option value="powers-of-2">Powers of 2 (1,2,4,8,16)</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-success/20">
                            <Trophy className="w-6 h-6 text-success" />
                        </div>
                        <h3 className="text-xl font-semibold">Gamification Settings</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            { id: 'enableLeaderboard', label: 'Enable leaderboard', icon: Trophy, desc: 'Show top performers in the team' },
                            { id: 'awardBadges', label: 'Award badges', icon: Zap, desc: 'Give rewards for sprint achievements' },
                            { id: 'showIndividualMetrics', label: 'Individual metrics', icon: BarChart3, desc: 'Track performance per member' },
                            { id: 'publicRankings', label: 'Public rankings', icon: Users, desc: 'Share rankings outside the team' }
                        ].map((item) => (
                            <label key={item.id} className="flex items-center p-3 bg-dark-700/30 rounded-xl border border-dark-600/50 hover:border-accent/30 transition-all cursor-pointer group">
                                <div className="p-2 rounded-lg bg-dark-600 group-hover:bg-accent/10 transition-colors mr-3">
                                    <item.icon className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{item.label}</p>
                                    <p className="text-[10px] text-text-muted uppercase tracking-tight">{item.desc}</p>
                                </div>
                                <div
                                    className={`relative w-10 h-5 rounded-full transition-colors ${gamificationSettings[item.id] ? 'bg-accent' : 'bg-dark-600'}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setGamificationSettings(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                    }}
                                >
                                    <motion.div
                                        className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full"
                                        animate={{ x: gamificationSettings[item.id] ? 20 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </div>
                            </label>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Add Member Modal */}
            <AnimatePresence>
                {showAddMember && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowAddMember(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-card p-8 w-full max-w-md border-accent/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-display font-bold">Add Team Member</h3>
                                <button onClick={() => setShowAddMember(false)} className="text-text-muted hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddMember} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm text-text-muted ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                                        className="input-field"
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-text-muted ml-1">Work Email</label>
                                    <input
                                        type="email"
                                        value={newMember.email}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                                        className="input-field"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-text-muted ml-1">Role</label>
                                        <select
                                            value={newMember.role}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                                            className="input-field py-2.5 text-sm"
                                        >
                                            <option value="developer">Developer</option>
                                            <option value="tech_lead">Tech Lead</option>
                                            <option value="scrum_master">Scrum Master</option>
                                            <option value="qa_lead">QA Lead</option>
                                            <option value="designer">Designer</option>
                                            <option value="product_owner">Product Owner</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-text-muted ml-1">Capacity (pts)</label>
                                        <input
                                            type="number"
                                            value={newMember.capacity}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                                            className="input-field py-2.5"
                                            min="1"
                                            max="50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddMember(false)}
                                        className="flex-1 btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-glow"
                                    >
                                        Add Member
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TeamManagement;