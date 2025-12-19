import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import {
  Target,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit3,
  ArrowUpRight,
  Trophy,
  TrendingUp,
  Zap,
  Shield,
  Activity,
  Save,
  X,
  ChevronRight
} from 'lucide-react';

const SprintGoals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    priority: 'medium',
    target_value: '',
    current_value: 0,
    unit: 'points'
  });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.sprintGoals);
      if (data.success) {
        setGoals(data.goals || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Load mock data for demo
      setGoals([
        {
          id: 1,
          title: 'Complete Authentication Feature',
          description: 'Develop new login and registration system with enhanced security audits.',
          priority: 'high',
          target_value: 25,
          current_value: 18,
          unit: 'points',
          status: 'in_progress',
          created_at: '2024-01-01'
        },
        {
          id: 2,
          title: 'Improve Performance',
          description: 'Reduce page load time to under 2 seconds across all core application screens.',
          priority: 'medium',
          target_value: 2,
          current_value: 3.2,
          unit: 'seconds',
          status: 'at_risk',
          created_at: '2024-01-01'
        },
        {
          id: 3,
          title: 'Fix Critical Bugs',
          description: 'Resolve all high-priority bugs reported during the last security sprint.',
          priority: 'critical',
          target_value: 0,
          current_value: 2,
          unit: 'bugs',
          status: 'at_risk',
          created_at: '2024-01-01'
        }
      ]);
    }
  };

  const addGoal = async () => {
    if (!newGoal.title.trim()) return;

    try {
      const data = await apiRequest(API_ENDPOINTS.sprintGoals, {
        method: 'POST',
        body: JSON.stringify(newGoal)
      });

      if (data.success) {
        setGoals(prev => [...prev, data.goal || data.data]);
        resetNewGoal();
      }
    } catch (error) {
      const goal = {
        id: Date.now(),
        ...newGoal,
        status: 'not_started',
        created_at: new Date().toISOString()
      };
      setGoals(prev => [...prev, goal]);
      resetNewGoal();
    }
  };

  const resetNewGoal = () => {
    setNewGoal({
      title: '',
      description: '',
      priority: 'medium',
      target_value: '',
      current_value: 0,
      unit: 'points'
    });
    setIsAddingGoal(false);
  };

  const updateGoal = async (goalId, updates) => {
    try {
      const data = await apiRequest(`${API_ENDPOINTS.sprintGoals}/${goalId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });

      if (data.success) {
        setGoals(prev => prev.map(goal =>
          goal.id === goalId ? { ...goal, ...updates } : goal
        ));
      }
    } catch (error) {
      setGoals(prev => prev.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      ));
    }
  };

  const deleteGoal = async (goalId) => {
    // Confirmation could be added here
    try {
      await apiRequest(`${API_ENDPOINTS.sprintGoals}/${goalId}`, { method: 'DELETE' });
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (error) {
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    }
  };

  const calculateProgress = (goal) => {
    if (goal.unit === 'seconds' || goal.unit === 'bugs') {
      const progress = Math.min(100, (goal.target_value / Math.max(goal.current_value, 0.1)) * 100);
      return Math.max(0, progress);
    } else {
      return Math.min(100, (goal.current_value / Math.max(goal.target_value, 1)) * 100);
    }
  };

  const getGoalStatus = (goal) => {
    const progress = calculateProgress(goal);
    if (progress >= 100) return 'completed';
    if (progress >= 80) return 'on_track';
    if (progress >= 50) return 'in_progress';
    return 'at_risk';
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10 border-success/20 shadow-glow-sm shadow-success/10';
      case 'on_track': return 'text-info bg-info/10 border-info/20';
      case 'in_progress': return 'text-accent bg-accent/10 border-accent/20';
      case 'at_risk': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-text-muted bg-dark-700/50 border-dark-600';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold gradient-text">Sprint Strategic Goals</h2>
          <p className="text-text-muted mt-2">Track key outcomes that define success for this sprint cycle.</p>
        </div>

        <motion.button
          className="btn-glow flex items-center gap-2 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddingGoal(true)}
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Define New Goal
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Completed', value: goals.filter(g => getGoalStatus(g) === 'completed').length, icon: Trophy, color: 'text-success' },
          { label: 'On Track', value: goals.filter(g => getGoalStatus(g) === 'on_track').length, icon: Target, color: 'text-info' },
          { label: 'In Progress', value: goals.filter(g => getGoalStatus(g) === 'in_progress').length, icon: Zap, color: 'text-accent' },
          { label: 'At Risk', value: goals.filter(g => getGoalStatus(g) === 'at_risk').length, icon: AlertCircle, color: 'text-danger' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col group hover:border-accent/30 transition-all cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-dark-700/50 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-display font-bold text-text-primary">{stat.value}</span>
            </div>
            <div className="text-xs text-text-muted font-bold uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, index) => {
            const status = getGoalStatus(goal);
            const progress = calculateProgress(goal);
            const isEditing = editingGoal === goal.id;

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 flex flex-col justify-between group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                  <Target className="w-32 h-32" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${getStatusStyles(status)}`}>
                      {status.replace('_', ' ')}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingGoal(isEditing ? null : goal.id)}
                        className="p-1.5 hover:bg-dark-700/50 rounded-lg text-text-muted hover:text-accent transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors leading-tight">
                      {goal.title}
                    </h3>
                    <p className="text-text-muted text-sm line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-dark-700/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Target</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-text-primary">{goal.target_value}</span>
                        <span className="text-[10px] font-medium text-text-muted">{goal.unit}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Current</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full bg-dark-700 border border-accent/30 rounded px-1.5 py-0.5 text-sm outline-none text-accent font-bold"
                          defaultValue={goal.current_value}
                          autoFocus
                          onBlur={(e) => {
                            updateGoal(goal.id, { current_value: parseFloat(e.target.value) });
                            setEditingGoal(null);
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-accent">{goal.current_value}</span>
                          <Activity className="w-3 h-3 text-accent/50" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      <span>Progress Efficiency</span>
                      <span className="text-accent">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full rounded-full bg-accent shadow-glow transition-all duration-1000`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!isAddingGoal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddingGoal(true)}
            className="glass-card border-dashed border-2 border-dark-600 p-8 flex flex-col items-center justify-center gap-4 group hover:border-accent transition-all min-h-[250px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-dark-700/50 flex items-center justify-center text-text-muted group-hover:text-accent group-hover:scale-110 transition-all border border-dark-600 group-hover:border-accent/30 shadow-glow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-lg text-text-muted group-hover:text-text-primary transition-colors">Strategic Link</h4>
              <p className="text-sm text-text-muted max-w-[180px]">Add specific metrics for AI analysis</p>
            </div>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isAddingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-dark-900/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl border-accent/20"
            >
              <div className="p-8 border-b border-dark-700 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-display font-bold gradient-text">Initialize Strategic Goal</h3>
                  <p className="text-text-muted">Define measurable outcomes for the current intelligence cycle.</p>
                </div>
                <button onClick={resetNewGoal} className="p-2 hover:bg-dark-700/50 rounded-xl text-text-muted hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Goal Specification</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Latency Reduction"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Narrative Description</label>
                  <textarea
                    className="input-field min-h-[100px] py-4"
                    placeholder="Contextualize this goal for the AI..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Metric Unit</label>
                    <select
                      className="input-field text-text-primary appearance-none cursor-pointer"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    >
                      <option value="points">Points</option>
                      <option value="tasks">Tasks</option>
                      <option value="bugs">Bugs</option>
                      <option value="seconds">Seconds</option>
                      <option value="percent">% Reach</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Target Vector</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="25"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Priority</label>
                    <select
                      className="input-field text-text-primary appearance-none cursor-pointer"
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High Velocity</option>
                      <option value="medium">Standard</option>
                      <option value="low">Evolutionary</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-dark-700/30 flex justify-end gap-4">
                <button className="btn-secondary px-8 py-3 ring-0 text-text-muted" onClick={resetNewGoal}>
                  Abort
                </button>
                <button className="btn-glow px-10 py-3 flex items-center gap-3" onClick={addGoal}>
                  <Save className="w-5 h-5" /> Initialize Goal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SprintGoals;