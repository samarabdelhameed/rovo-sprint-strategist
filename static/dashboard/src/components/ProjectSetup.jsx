import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ProjectSetup.css';

const ProjectSetup = ({ onComplete }) => {
    const [formData, setFormData] = useState({
        jiraUrl: 'https://samarabdelhamed77.atlassian.net',
        jiraUsername: 'samarabdelhamed77@gmail.com',
        jiraApiToken: 'ATATT3xFfGF0gt3Fb8qMh9IfdU8h7wTNUsoUzDKK5dPVvcwhX5FjAATYmvF_Hh5bVmsvqOHxKF0Q-DuUxyi6vxdB4_pvuVwgC1IkecUc_j9qHSdYHOucIewd1DT0vU2n67ldDdC4N4JGWYuRbLE22ANKcWj7Lf4KlAJmHG0EHrJLzChHmG-MvKo=0DFAC784',
        projectKey: 'BTS',
        boardId: '1',
        healthThresholds: {
            healthy: 85,
            atRisk: 60,
            critical: 30
        },
        alerts: {
            email: true,
            slack: false,
            teams: false
        },
        slackChannel: '#sprint-alerts',
        emailList: ''
    });

    const [projects, setProjects] = useState([]);
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionResult, setConnectionResult] = useState(null);

    useEffect(() => {
        // Load available projects
        setProjects([
            { key: 'BTS', name: 'Bug Tracking System' },
            { key: 'PROJ', name: 'Payment Gateway Project' },
            { key: 'ECOM', name: 'E-commerce Platform' },
        ]);

        // Load available boards
        setBoards([
            { id: '1', name: 'Bug Tracking System Board' },
            { id: '2', name: 'Payment Team Sprint Board' },
            { id: '3', name: 'Backend Development Board' },
        ]);
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedInputChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const testConnection = async () => {
        setTestingConnection(true);
        setConnectionResult(null);

        try {
            const response = await fetch('/api/project-setup/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jiraUrl: formData.jiraUrl,
                    jiraUsername: formData.jiraUsername,
                    jiraApiToken: formData.jiraApiToken
                })
            });

            const result = await response.json();
            setConnectionResult(result);
        } catch (error) {
            setConnectionResult({
                success: false,
                error: 'Connection failed: ' + error.message
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const enableDemoMode = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/project-setup/enable-demo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (result.success) {
                alert('🚀 Demo Mode enabled! The application will now use sample data for testing.');
                if (onComplete) {
                    onComplete();
                }
                // Redirect to dashboard
                window.location.href = '/';
            } else {
                alert('Failed to enable demo mode: ' + result.error);
            }
        } catch (error) {
            alert('Error enabling demo mode: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/project-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jiraUrl: formData.jiraUrl,
                    jiraUsername: formData.jiraUsername,
                    jiraApiToken: formData.jiraApiToken,
                    projectKey: formData.projectKey,
                    boardId: formData.boardId,
                    sprintLength: 14,
                    teamCapacity: 40,
                    workingHoursStart: '09:00',
                    workingHoursEnd: '17:00',
                    timezone: 'UTC'
                })
            });

            if (response.ok) {
                alert('Settings saved successfully!');
                if (onComplete) {
                    onComplete();
                }
                // Redirect to dashboard
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                alert('Failed to save settings: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Error saving settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="project-setup">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="setup-container"
            >
                <div className="setup-header">
                    <h1>🏎️ Welcome to Sprint Strategist</h1>
                    <p>Let's set up your AI-powered sprint intelligence</p>
                </div>

                <div className="setup-form">
                    {/* Jira Configuration */}
                    <div className="form-section">
                        <h3>🔗 Jira Configuration</h3>
                        
                        <div className="form-group">
                            <label>Jira URL:</label>
                            <input
                                type="url"
                                value={formData.jiraUrl}
                                onChange={(e) => handleInputChange('jiraUrl', e.target.value)}
                                placeholder="https://your-domain.atlassian.net"
                            />
                        </div>

                        <div className="form-group">
                            <label>Username (Email):</label>
                            <input
                                type="email"
                                value={formData.jiraUsername}
                                onChange={(e) => handleInputChange('jiraUsername', e.target.value)}
                                placeholder="your-email@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>API Token:</label>
                            <input
                                type="password"
                                value={formData.jiraApiToken}
                                onChange={(e) => handleInputChange('jiraApiToken', e.target.value)}
                                placeholder="Paste your Jira API token here"
                            />
                        </div>

                        <button 
                            className="test-connection-btn"
                            onClick={testConnection}
                            disabled={testingConnection}
                        >
                            {testingConnection ? 'Testing...' : 'Test Connection'}
                        </button>

                        {connectionResult && (
                            <div className={`connection-result ${connectionResult.success ? 'success' : 'error'}`}>
                                {connectionResult.success ? (
                                    <div>
                                        <div>✅ Connection successful!</div>
                                        <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
                                            Server: {connectionResult.serverInfo?.serverTitle}<br/>
                                            Version: {connectionResult.serverInfo?.version}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div>❌ Connection Failed</div>
                                        <div style={{ fontSize: '14px', marginTop: '8px' }}>
                                            {connectionResult.error}
                                        </div>
                                        {connectionResult.suggestion && (
                                            <div style={{ fontSize: '12px', marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                                                <strong>💡 Suggestions:</strong><br/>
                                                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '5px 0 0 0' }}>
                                                    {connectionResult.suggestion}
                                                </pre>
                                            </div>
                                        )}
                                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                            <button 
                                                className="demo-mode-btn"
                                                onClick={enableDemoMode}
                                                style={{
                                                    background: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                🚀 Try Demo Mode
                                            </button>
                                            <a 
                                                href="https://www.atlassian.com/software/jira/free" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{
                                                    background: '#007bff',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                🆓 Create Free Jira
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Project Selection */}
                    <div className="form-section">
                        <h3>📋 Select Your Jira Project</h3>
                        
                        <div className="form-group">
                            <label>Project:</label>
                            <select
                                value={formData.projectKey}
                                onChange={(e) => handleInputChange('projectKey', e.target.value)}
                            >
                                <option value="">Choose Project...</option>
                                {projects.map(project => (
                                    <option key={project.key} value={project.key}>
                                        {project.name} ({project.key})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Sprint Board:</label>
                            <select
                                value={formData.boardId}
                                onChange={(e) => handleInputChange('boardId', e.target.value)}
                            >
                                <option value="">Choose Board...</option>
                                {boards.map(board => (
                                    <option key={board.id} value={board.id}>
                                        {board.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Health Score Thresholds */}
                    <div className="form-section">
                        <h3>⚙️ Health Score Thresholds</h3>
                        
                        <div className="threshold-controls">
                            <div className="threshold-item">
                                <label>🟢 Healthy:</label>
                                <input
                                    type="number"
                                    value={formData.healthThresholds.healthy}
                                    onChange={(e) => handleNestedInputChange('healthThresholds', 'healthy', parseInt(e.target.value))}
                                    min="0"
                                    max="100"
                                />
                                <span>and above</span>
                            </div>
                            
                            <div className="threshold-item">
                                <label>🟡 At Risk:</label>
                                <input
                                    type="number"
                                    value={formData.healthThresholds.atRisk}
                                    onChange={(e) => handleNestedInputChange('healthThresholds', 'atRisk', parseInt(e.target.value))}
                                    min="0"
                                    max="100"
                                />
                                <span>to {formData.healthThresholds.healthy - 1}</span>
                            </div>
                            
                            <div className="threshold-item">
                                <label>🔴 Critical:</label>
                                <span>Below {formData.healthThresholds.atRisk}</span>
                            </div>
                        </div>
                    </div>

                    {/* Alert Settings */}
                    <div className="form-section">
                        <h3>📧 Alert Settings</h3>
                        
                        <div className="alert-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.alerts.email}
                                    onChange={(e) => handleNestedInputChange('alerts', 'email', e.target.checked)}
                                />
                                Email notifications
                            </label>
                            
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.alerts.slack}
                                    onChange={(e) => handleNestedInputChange('alerts', 'slack', e.target.checked)}
                                />
                                Slack integration
                            </label>
                            
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.alerts.teams}
                                    onChange={(e) => handleNestedInputChange('alerts', 'teams', e.target.checked)}
                                />
                                Microsoft Teams
                            </label>
                        </div>

                        {formData.alerts.email && (
                            <div className="form-group">
                                <label>Email Recipients:</label>
                                <input
                                    type="text"
                                    value={formData.emailList}
                                    onChange={(e) => handleInputChange('emailList', e.target.value)}
                                    placeholder="team-leads@company.com, scrum-master@company.com"
                                />
                                <small>Separate multiple emails with commas</small>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <button 
                            className="cancel-btn"
                            onClick={() => window.location.href = '/'}
                        >
                            Cancel
                        </button>
                        
                        <button 
                            className="save-btn"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save & Continue'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectSetup;