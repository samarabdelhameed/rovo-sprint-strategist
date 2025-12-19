import React, { useState, useEffect } from 'react';
import './SprintGoals.css';

const SprintGoals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    priority: 'medium',
    targetValue: '',
    currentValue: 0,
    unit: 'points'
  });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/sprint-goals');
      const data = await response.json();
      if (data.success) {
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Load mock data for demo
      setGoals([
        {
          id: 1,
          title: 'Complete Authentication Feature',
          description: 'Develop new login and registration system',
          priority: 'high',
          targetValue: 25,
          currentValue: 18,
          unit: 'points',
          status: 'in_progress',
          createdAt: '2024-01-01'
        },
        {
          id: 2,
          title: 'Improve Performance',
          description: 'Reduce page load time to under 2 seconds',
          priority: 'medium',
          targetValue: 2,
          currentValue: 3.2,
          unit: 'seconds',
          status: 'at_risk',
          createdAt: '2024-01-01'
        },
        {
          id: 3,
          title: 'Fix Critical Bugs',
          description: 'Resolve all high-priority bugs',
          priority: 'critical',
          targetValue: 0,
          currentValue: 2,
          unit: 'bugs',
          status: 'at_risk',
          createdAt: '2024-01-01'
        }
      ]);
    }
  };

  const addGoal = async () => {
    if (!newGoal.title.trim()) return;

    try {
      const response = await fetch('/api/sprint-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGoal)
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(prev => [...prev, data.goal]);
        setNewGoal({
          title: '',
          description: '',
          priority: 'medium',
          targetValue: '',
          currentValue: 0,
          unit: 'points'
        });
        setIsAddingGoal(false);
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      // For demo, add locally
      const goal = {
        id: Date.now(),
        ...newGoal,
        status: 'not_started',
        createdAt: new Date().toISOString()
      };
      setGoals(prev => [...prev, goal]);
      setNewGoal({
        title: '',
        description: '',
        priority: 'medium',
        targetValue: '',
        currentValue: 0,
        unit: 'points'
      });
      setIsAddingGoal(false);
    }
  };

  const updateGoal = async (goalId, updates) => {
    try {
      const response = await fetch(`/api/sprint-goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? { ...goal, ...updates } : goal
        ));
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      // For demo, update locally
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      ));
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`/api/sprint-goals/${goalId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      // For demo, delete locally
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    }
  };

  const getGoalStatus = (goal) => {
    const progress = goal.unit === 'seconds' || goal.unit === 'bugs' 
      ? (goal.targetValue / Math.max(goal.currentValue, 0.1)) * 100
      : (goal.currentValue / Math.max(goal.targetValue, 1)) * 100;

    if (progress >= 100) return 'completed';
    if (progress >= 80) return 'on_track';
    if (progress >= 50) return 'in_progress';
    return 'at_risk';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'on_track': return '#2ecc71';
      case 'in_progress': return '#f39c12';
      case 'at_risk': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'on_track': return '🎯';
      case 'in_progress': return '⚡';
      case 'at_risk': return '⚠️';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#3498db';
      case 'low': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const calculateProgress = (goal) => {
    if (goal.unit === 'seconds' || goal.unit === 'bugs') {
      // For metrics where lower is better
      const progress = Math.min(100, (goal.targetValue / Math.max(goal.currentValue, 0.1)) * 100);
      return Math.max(0, progress);
    } else {
      // For metrics where higher is better
      return Math.min(100, (goal.currentValue / Math.max(goal.targetValue, 1)) * 100);
    }
  };

  return (
    <div className="sprint-goals">
      <div className="goals-header">
        <div className="header-content">
          <h2>🎯 Sprint Goals</h2>
          <p>Track and manage current sprint objectives</p>
        </div>
        
        <button 
          className="add-goal-btn"
          onClick={() => setIsAddingGoal(true)}
        >
          ➕ Add New Goal
        </button>
      </div>

      {/* Goals Overview */}
      <div className="goals-overview">
        <div className="overview-stats">
          <div className="stat-card completed">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-number">
                {goals.filter(g => getGoalStatus(g) === 'completed').length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          
          <div className="stat-card on-track">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-number">
                {goals.filter(g => getGoalStatus(g) === 'on_track').length}
              </span>
              <span className="stat-label">On Track</span>
            </div>
          </div>
          
          <div className="stat-card in-progress">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <span className="stat-number">
                {goals.filter(g => getGoalStatus(g) === 'in_progress').length}
              </span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          
          <div className="stat-card at-risk">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <span className="stat-number">
                {goals.filter(g => getGoalStatus(g) === 'at_risk').length}
              </span>
              <span className="stat-label">At Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Goal Form */}
      {isAddingGoal && (
        <div className="add-goal-form">
          <div className="form-header">
            <h3>Add New Goal</h3>
            <button 
              className="close-btn"
              onClick={() => setIsAddingGoal(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label>Goal Title:</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({...prev, title: e.target.value}))}
                  placeholder="e.g., Complete Payment Feature"
                />
              </div>
              
              <div className="form-group">
                <label>Priority:</label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal(prev => ({...prev, priority: e.target.value}))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({...prev, description: e.target.value}))}
                placeholder="Detailed description of the goal..."
                rows="3"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Target Value:</label>
                <input
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal(prev => ({...prev, targetValue: parseFloat(e.target.value)}))}
                  placeholder="25"
                />
              </div>
              
              <div className="form-group">
                <label>Unit:</label>
                <select
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal(prev => ({...prev, unit: e.target.value}))}
                >
                  <option value="points">Points</option>
                  <option value="tasks">Tasks</option>
                  <option value="bugs">Bugs</option>
                  <option value="features">Features</option>
                  <option value="seconds">Seconds</option>
                  <option value="percent">Percentage</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button className="save-btn" onClick={addGoal}>
                💾 Save Goal
              </button>
              <button className="cancel-btn" onClick={() => setIsAddingGoal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="goals-list">
        {goals.map(goal => {
          const status = getGoalStatus(goal);
          const progress = calculateProgress(goal);
          
          return (
            <div key={goal.id} className={`goal-card ${status}`}>
              <div className="goal-header">
                <div className="goal-title-section">
                  <div className="goal-status">
                    <span className="status-icon">
                      {getStatusIcon(status)}
                    </span>
                    <span className="status-text">
                      {status === 'completed' ? 'Completed' :
                       status === 'on_track' ? 'On Track' :
                       status === 'in_progress' ? 'In Progress' : 'At Risk'}
                    </span>
                  </div>
                  
                  <div className="priority-badge" style={{ backgroundColor: getPriorityColor(goal.priority) }}>
                    {goal.priority === 'critical' ? 'Critical' :
                     goal.priority === 'high' ? 'High' :
                     goal.priority === 'medium' ? 'Medium' : 'Low'}
                  </div>
                </div>
                
                <div className="goal-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => setEditingGoal(goal.id)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="goal-content">
                <h3>{goal.title}</h3>
                <p className="goal-description">{goal.description}</p>
                
                <div className="goal-metrics">
                  <div className="metric-info">
                    <span className="current-value">{goal.currentValue}</span>
                    <span className="separator">/</span>
                    <span className="target-value">{goal.targetValue}</span>
                    <span className="unit">{goal.unit}</span>
                  </div>
                  
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: getStatusColor(status)
                        }}
                      />
                    </div>
                    <span className="progress-text">{progress.toFixed(1)}%</span>
                  </div>
                </div>
                
                {editingGoal === goal.id && (
                  <div className="inline-edit">
                    <div className="edit-row">
                      <label>Current Value:</label>
                      <input
                        type="number"
                        defaultValue={goal.currentValue}
                        onBlur={(e) => {
                          updateGoal(goal.id, { currentValue: parseFloat(e.target.value) });
                          setEditingGoal(null);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateGoal(goal.id, { currentValue: parseFloat(e.target.value) });
                            setEditingGoal(null);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !isAddingGoal && (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No goals defined yet</h3>
          <p>Start by adding clear and measurable goals for your sprint</p>
          <button 
            className="add-first-goal-btn"
            onClick={() => setIsAddingGoal(true)}
          >
            ➕ Add First Goal
          </button>
        </div>
      )}
    </div>
  );
};

export default SprintGoals;