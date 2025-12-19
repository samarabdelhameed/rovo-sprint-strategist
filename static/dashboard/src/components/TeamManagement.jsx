import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TeamManagement = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
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
            const response = await fetch('/api/team');
            const data = await response.json();
            if (data.success) {
                setTeamMembers(data.data);
            }
        } catch (error) {
            console.error('Failed to load team members:', error);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/team/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });

            if (response.ok) {
                const result = await response.json();
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
            const response = await fetch(`/api/team/members/${memberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const result = await response.json();
                setTeamMembers(prev => 
                    prev.map(member => 
                        member.id === memberId ? result.data : member
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
            const response = await fetch(`/api/team/members/${memberId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setTeamMembers(prev => prev.filter(member => member.id !== memberId));
            }
        } catch (error) {
            console.error('Failed to delete member:', error);
        }
    };

    const handleImportFromJira = async () => {
        try {
            const response = await fetch('/api/team/import-from-jira', {
                method: 'POST'
            });

            if (response.ok) {
                const result = await response.json();
                setTeamMembers(result.data);
            }
        } catch (error) {
            console.error('Failed to import from Jira:', error);
        }
    };

    const getRoleIcon = (role) => {
        const icons = {
            'tech_lead': '👑',
            'scrum_master': '🎯',
            'developer': '💻',
            'qa_lead': '🧪',
            'designer': '🎨',
            'product_owner': '📋'
        };
        return icons[role] || '👤';
    };

    const getRoleColor = (role) => {
        const colors = {
            'tech_lead': 'text-yellow-400',
            'scrum_master': 'text-blue-400',
            'developer': 'text-green-400',
            'qa_lead': 'text-purple-400',
            'designer': 'text-pink-400',
            'product_owner': 'text-orange-400'
        };
        return colors[role] || 'text-slate-400';
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        👥 Team Management
                    </h1>
                    <p className="text-slate-400">
                        Manage your team members, capacity, and sprint settings
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleImportFromJira}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        📥 Import from Jira
                    </button>
                    <button
                        onClick={() => setShowAddMember(true)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        ➕ Add Member
                    </button>
                </div>
            </div>

            {/* Team Members Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">Team Members</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left p-4 text-slate-300 font-medium">Member</th>
                                <th className="text-left p-4 text-slate-300 font-medium">Role</th>
                                <th className="text-left p-4 text-slate-300 font-medium">Capacity</th>
                                <th className="text-left p-4 text-slate-300 font-medium">Current Load</th>
                                <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map((member) => (
                                <tr key={member.id} className="border-b border-slate-700 hover:bg-slate-750">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={member.avatar_url || member.avatar}
                                                alt={member.name}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <div className="text-white font-medium">{member.name}</div>
                                                <div className="text-slate-400 text-sm">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`flex items-center gap-2 ${getRoleColor(member.role)}`}>
                                            <span>{getRoleIcon(member.role)}</span>
                                            <span className="capitalize">{member.role.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {editingMember === member.id ? (
                                            <input
                                                type="number"
                                                defaultValue={member.capacity}
                                                className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                                                onBlur={(e) => handleUpdateMember(member.id, { capacity: parseInt(e.target.value) })}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleUpdateMember(member.id, { capacity: parseInt(e.target.value) });
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span className="text-white">{member.capacity} pts</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-slate-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        (member.load || 0) > 100 ? 'bg-red-500' :
                                                        (member.load || 0) > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${Math.min((member.load || 0), 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-white text-sm">{member.load || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                            >
                                                {editingMember === member.id ? 'Save' : 'Edit'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMember(member.id)}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sprint Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">⚙️ Sprint Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-300 mb-2">Sprint Length</label>
                            <select
                                value={sprintSettings.sprintLength}
                                onChange={(e) => setSprintSettings(prev => ({ ...prev, sprintLength: e.target.value }))}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="1 week">1 week</option>
                                <option value="2 weeks">2 weeks</option>
                                <option value="3 weeks">3 weeks</option>
                                <option value="4 weeks">4 weeks</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2">Velocity Target</label>
                            <select
                                value={sprintSettings.velocityTarget}
                                onChange={(e) => setSprintSettings(prev => ({ ...prev, velocityTarget: e.target.value }))}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="auto-calculate">Auto-calculate</option>
                                <option value="manual">Manual</option>
                                <option value="historical-average">Historical Average</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2">Story Point Scale</label>
                            <select
                                value={sprintSettings.storyPointScale}
                                onChange={(e) => setSprintSettings(prev => ({ ...prev, storyPointScale: e.target.value }))}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="fibonacci">Fibonacci (1,2,3,5,8,13)</option>
                                <option value="linear">Linear (1,2,3,4,5,6)</option>
                                <option value="powers-of-2">Powers of 2 (1,2,4,8,16)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Gamification Settings */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">🏆 Gamification Settings</h3>
                    <div className="space-y-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={gamificationSettings.enableLeaderboard}
                                onChange={(e) => setGamificationSettings(prev => ({ ...prev, enableLeaderboard: e.target.checked }))}
                                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
                            />
                            <span className="ml-2 text-slate-300">Enable leaderboard</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={gamificationSettings.awardBadges}
                                onChange={(e) => setGamificationSettings(prev => ({ ...prev, awardBadges: e.target.checked }))}
                                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
                            />
                            <span className="ml-2 text-slate-300">Award badges for achievements</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={gamificationSettings.showIndividualMetrics}
                                onChange={(e) => setGamificationSettings(prev => ({ ...prev, showIndividualMetrics: e.target.checked }))}
                                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
                            />
                            <span className="ml-2 text-slate-300">Show individual performance metrics</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={gamificationSettings.publicRankings}
                                onChange={(e) => setGamificationSettings(prev => ({ ...prev, publicRankings: e.target.checked }))}
                                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
                            />
                            <span className="ml-2 text-slate-300">Public team rankings</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            <AnimatePresence>
                {showAddMember && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowAddMember(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-semibold text-white mb-4">Add Team Member</h3>
                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="block text-slate-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newMember.email}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2">Role</label>
                                    <select
                                        value={newMember.role}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="developer">Developer</option>
                                        <option value="tech_lead">Tech Lead</option>
                                        <option value="scrum_master">Scrum Master</option>
                                        <option value="qa_lead">QA Lead</option>
                                        <option value="designer">Designer</option>
                                        <option value="product_owner">Product Owner</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-2">Capacity (Story Points)</label>
                                    <input
                                        type="number"
                                        value={newMember.capacity}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                                        min="1"
                                        max="50"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddMember(false)}
                                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                                    >
                                        Add Member
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeamManagement;