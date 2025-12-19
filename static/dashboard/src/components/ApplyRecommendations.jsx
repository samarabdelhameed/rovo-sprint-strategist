import React, { useState, useEffect } from 'react';
import './ApplyRecommendations.css';

const ApplyRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [appliedActions, setAppliedActions] = useState(new Set());

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = async (recommendation) => {
    setApplying(prev => ({ ...prev, [recommendation.id]: true }));
    
    try {
      const response = await fetch('/api/apply-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          action: recommendation.action,
          parameters: recommendation.parameters
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAppliedActions(prev => new Set([...prev, recommendation.id]));
        alert(`✅ Recommendation applied successfully: ${recommendation.title}`);
        
        // Refresh recommendations after applying
        setTimeout(fetchRecommendations, 2000);
      } else {
        alert(`❌ Failed to apply recommendation: ${result.error}`);
      }
    } catch (error) {
      console.error('Error applying recommendation:', error);
      alert('❌ Error applying recommendation');
    } finally {
      setApplying(prev => ({ ...prev, [recommendation.id]: false }));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#f1c40f';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'reassign_task': return '👥';
      case 'reduce_scope': return '✂️';
      case 'add_resources': return '➕';
      case 'extend_sprint': return '📅';
      case 'split_task': return '🔄';
      case 'escalate': return '📢';
      default: return '⚙️';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Analyzing sprint and generating recommendations...</p>
      </div>
    );
  }

  return (
    <div className="apply-recommendations">
      <div className="recommendations-header">
        <h2>🎯 Apply Pit-Stop Recommendations</h2>
        <p>Smart recommendations to improve current sprint performance</p>
        <button className="refresh-btn" onClick={fetchRecommendations}>
          🔄 Refresh Recommendations
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <div className="success-icon">✅</div>
          <h3>Excellent! No urgent recommendations</h3>
          <p>The sprint is running well currently. We'll monitor the situation and notify you when any intervention is needed.</p>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map(recommendation => (
            <div 
              key={recommendation.id} 
              className={`recommendation-card ${recommendation.priority}`}
              style={{ borderLeftColor: getPriorityColor(recommendation.priority) }}
            >
              <div className="recommendation-header">
                <div className="priority-badge">
                  <span className="priority-icon">
                    {getPriorityIcon(recommendation.priority)}
                  </span>
                  <span className="priority-text">
                    {recommendation.priority === 'critical' ? 'Critical' :
                     recommendation.priority === 'high' ? 'High' :
                     recommendation.priority === 'medium' ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="action-icon">
                  {getActionIcon(recommendation.action)}
                </div>
              </div>

              <div className="recommendation-content">
                <h3>{recommendation.title}</h3>
                <p className="description">{recommendation.description}</p>
                
                <div className="recommendation-details">
                  <div className="detail-item">
                    <strong>Problem:</strong>
                    <span>{recommendation.problem}</span>
                  </div>
                  
                  <div className="detail-item">
                    <strong>Proposed Solution:</strong>
                    <span>{recommendation.solution}</span>
                  </div>
                  
                  <div className="detail-item">
                    <strong>Expected Impact:</strong>
                    <span className="impact">{recommendation.expectedImpact}</span>
                  </div>

                  {recommendation.affectedTasks && (
                    <div className="detail-item">
                      <strong>Affected Tasks:</strong>
                      <div className="affected-tasks">
                        {recommendation.affectedTasks.map(task => (
                          <span key={task.id} className="task-tag">
                            {task.key}: {task.summary}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendation.parameters && (
                    <div className="detail-item">
                      <strong>Implementation Details:</strong>
                      <div className="parameters">
                        {Object.entries(recommendation.parameters).map(([key, value]) => (
                          <div key={key} className="parameter">
                            <span className="param-key">{key}:</span>
                            <span className="param-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="recommendation-metrics">
                  <div className="metric">
                    <span className="metric-label">Success Probability:</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill success"
                        style={{ width: `${recommendation.successProbability}%` }}
                      ></div>
                    </div>
                    <span className="metric-value">{recommendation.successProbability}%</span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">Time Required:</span>
                    <span className="metric-value">{recommendation.estimatedTime}</span>
                  </div>
                </div>
              </div>

              <div className="recommendation-actions">
                {appliedActions.has(recommendation.id) ? (
                  <div className="applied-status">
                    <span className="applied-icon">✅</span>
                    <span>Successfully Applied</span>
                  </div>
                ) : (
                  <>
                    <button
                      className={`apply-btn ${recommendation.priority}`}
                      onClick={() => applyRecommendation(recommendation)}
                      disabled={applying[recommendation.id]}
                    >
                      {applying[recommendation.id] ? (
                        <>
                          <span className="spinner"></span>
                          Applying...
                        </>
                      ) : (
                        <>
                          ⚡ Apply Now
                        </>
                      )}
                    </button>
                    
                    <button className="details-btn">
                      📋 More Details
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="recommendations-summary">
        <div className="summary-stats">
          <div className="stat-item critical">
            <span className="stat-number">
              {recommendations.filter(r => r.priority === 'critical').length}
            </span>
            <span className="stat-label">Critical</span>
          </div>
          <div className="stat-item high">
            <span className="stat-number">
              {recommendations.filter(r => r.priority === 'high').length}
            </span>
            <span className="stat-label">High</span>
          </div>
          <div className="stat-item medium">
            <span className="stat-number">
              {recommendations.filter(r => r.priority === 'medium').length}
            </span>
            <span className="stat-label">Medium</span>
          </div>
          <div className="stat-item low">
            <span className="stat-number">
              {recommendations.filter(r => r.priority === 'low').length}
            </span>
            <span className="stat-label">Low</span>
          </div>
        </div>
        
        <div className="summary-actions">
          <button className="bulk-apply-btn">
            ⚡ Apply All Critical Recommendations
          </button>
          <button className="export-btn">
            📄 Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyRecommendations;