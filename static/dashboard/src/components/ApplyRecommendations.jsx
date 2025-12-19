import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  Info,
  Users,
  Scissors,
  Plus,
  Calendar,
  Repeat,
  Megaphone,
  Search,
  Download
} from 'lucide-react';
import { apiRequest, API_ENDPOINTS } from '../config/api';

const ApplyRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [appliedActions, setAppliedActions] = useState(new Set());

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(API_ENDPOINTS.recommendations);
      setRecommendations(data.recommendations || data.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = async (recommendation) => {
    setApplying(prev => ({ ...prev, [recommendation.id]: true }));

    try {
      const result = await apiRequest(API_ENDPOINTS.applyRecommendation, {
        method: 'POST',
        body: JSON.stringify({
          recommendationId: recommendation.id,
          action: recommendation.action,
          parameters: recommendation.parameters
        })
      });

      if (result.success) {
        setAppliedActions(prev => new Set([...prev, recommendation.id]));
        // Success feedback handled in UI via state
      }
    } catch (error) {
      console.error('Error applying recommendation:', error);
    } finally {
      setApplying(prev => ({ ...prev, [recommendation.id]: false }));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-danger border-danger/50 shadow-danger/20';
      case 'high': return 'text-warning border-warning/50 shadow-warning/20';
      case 'medium': return 'text-accent border-accent/50 shadow-accent/20';
      case 'low': return 'text-success border-success/50 shadow-success/20';
      default: return 'text-text-muted border-dark-600';
    }
  };

  const getActionIcon = (actionType) => {
    const props = { className: "w-6 h-6" };
    switch (actionType) {
      case 'reassign_task': return <Users {...props} />;
      case 'reduce_scope': return <Scissors {...props} />;
      case 'add_resources': return <Plus {...props} />;
      case 'extend_sprint': return <Calendar {...props} />;
      case 'split_task': return <Repeat {...props} />;
      case 'escalate': return <Megaphone {...props} />;
      default: return <Zap {...props} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-12 h-12 text-accent animate-spin" />
        <p className="text-text-muted animate-pulse">Analyzing sprint trajectory and potential interventions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold gradient-text">Pit-Stop Recommendations</h2>
          <p className="text-text-muted mt-2">AI-driven actionable insights to keep your sprint on track</p>
        </div>
        <motion.button
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchRecommendations}
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Analysis
        </motion.button>
      </div>

      {recommendations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold mb-3">All Systems Nominal</h3>
          <p className="text-text-muted max-w-md mx-auto">
            The current sprint health is optimal. No urgent interventions are required at this time.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card p-6 border-l-4 overflow-hidden relative group ${getPriorityColor(recommendation.priority)}`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  {getActionIcon(recommendation.action)}
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-current/10`}>
                      {getActionIcon(recommendation.action)}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-current/10`}>
                      {recommendation.priority} Priority
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-muted mb-1">Success Probability</div>
                    <div className="text-lg font-bold text-accent">{recommendation.successProbability}%</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-text-primary">{recommendation.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{recommendation.description}</p>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                      <div className="text-xs text-text-muted mb-1 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-danger" /> DETECTED PROBLEM
                      </div>
                      <div className="text-sm">{recommendation.problem}</div>
                    </div>
                    <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="text-xs text-accent mb-1 font-semibold flex items-center gap-2">
                        <Zap className="w-3 h-3" /> PROPOSED SOLUTION
                      </div>
                      <div className="text-sm">{recommendation.solution}</div>
                    </div>
                  </div>

                  {recommendation.affectedTasks && (
                    <div className="flex flex-wrap gap-2 py-2">
                      {recommendation.affectedTasks.map(task => (
                        <span key={task.id} className="text-[10px] bg-dark-700 text-text-muted px-2 py-1 rounded border border-dark-600">
                          {task.key}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      <span className="text-sm font-medium text-text-muted">{recommendation.estimatedTime} effort</span>
                    </div>

                    <div className="flex gap-3">
                      {appliedActions.has(recommendation.id) ? (
                        <div className="flex items-center gap-2 text-success font-bold px-4 py-2 bg-success/10 rounded-xl">
                          <CheckCircle className="w-5 h-5" />
                          Applied
                        </div>
                      ) : (
                        <>
                          <button className="btn-secondary text-xs px-4">
                            View Details
                          </button>
                          <motion.button
                            className="btn-glow flex items-center gap-2 text-xs px-6"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => applyRecommendation(recommendation)}
                            disabled={applying[recommendation.id]}
                          >
                            {applying[recommendation.id] ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Zap className="w-4 h-4" />
                            )}
                            {applying[recommendation.id] ? 'Executing...' : 'Execute'}
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { label: 'Critical', color: 'text-danger', count: recommendations.filter(r => r.priority === 'critical').length },
            { label: 'High', color: 'text-warning', count: recommendations.filter(r => r.priority === 'high').length },
            { label: 'Medium', color: 'text-accent', count: recommendations.filter(r => r.priority === 'medium').length },
            { label: 'Low', color: 'text-success', count: recommendations.filter(r => r.priority === 'low').length }
          ].map(stat => (
            <div key={stat.label} className="text-center min-w-[80px]">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 px-6">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <motion.button
            className="flex-1 md:flex-none btn-glow flex items-center justify-center gap-2 px-8 py-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="w-5 h-5 text-white" /> Apply All Critical
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ApplyRecommendations;