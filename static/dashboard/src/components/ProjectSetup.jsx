import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu,
    Globe,
    Mail,
    Shield,
    Zap,
    Check,
    AlertCircle,
    ChevronRight,
    Lock,
    ExternalLink,
    Rocket,
    Clock,
    Layout,
    RefreshCw
} from 'lucide-react';
import { apiRequest, API_ENDPOINTS } from '../config/api';

const ProjectSetup = ({ onComplete }) => {
    const [step, setStep] = useState(1);
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

    const [loading, setLoading] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionResult, setConnectionResult] = useState(null);

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
            const result = await apiRequest(API_ENDPOINTS.projectSetupTest, {
                method: 'POST',
                body: JSON.stringify({
                    jiraUrl: formData.jiraUrl,
                    jiraUsername: formData.jiraUsername,
                    jiraApiToken: formData.jiraApiToken
                })
            });

            setConnectionResult(result);
            if (result.success) {
                setTimeout(() => setStep(2), 1500);
            }
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
            const result = await apiRequest(API_ENDPOINTS.projectSetupDemo, {
                method: 'POST'
            });

            if (result.success) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Demo mode error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await apiRequest(API_ENDPOINTS.projectSetup, {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    sprintLength: 14,
                    teamCapacity: 40,
                    workingHoursStart: '09:00',
                    workingHoursEnd: '17:00',
                    timezone: 'UTC'
                })
            });

            if (result.success) {
                if (onComplete) onComplete();
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Connectivity', icon: Globe },
        { id: 2, title: 'Selection', icon: Layout },
        { id: 3, title: 'Intelligence', icon: Cpu },
        { id: 4, title: 'Automation', icon: Zap }
    ];

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 bg-sphere">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl"
            >
                {/* Progress Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent border border-accent/30 shadow-glow-sm">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold gradient-text">Sprint Strategist</h1>
                                <p className="text-text-muted text-sm px-1">AI Intelligence Setup</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {steps.map((s) => (
                                <div
                                    key={s.id}
                                    className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-accent shadow-glow-sm' : 'bg-dark-700'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between">
                        {steps.map((s) => (
                            <div key={s.id} className={`flex flex-col items-center gap-2 ${step === s.id ? 'text-accent' : 'text-text-muted'}`}>
                                <div className={`p-2 rounded-xl transition-colors ${step === s.id ? 'bg-accent/10 border border-accent/30 text-accent font-semibold' : 'text-text-muted opacity-50'}`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Setup Card */}
                <div className="glass-card overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 md:p-12 space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-display font-bold">Connect your Core</h2>
                                    <p className="text-text-muted">Link your Jira workspace to enable real-time sprint intelligence.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-accent" /> Jira Workspace URL
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.jiraUrl}
                                                onChange={(e) => handleInputChange('jiraUrl', e.target.value)}
                                                className="input-field"
                                                placeholder="https://company.atlassian.net"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-accent" /> Atlassian Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.jiraUsername}
                                                onChange={(e) => handleInputChange('jiraUsername', e.target.value)}
                                                className="input-field"
                                                placeholder="scrum-master@company.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-accent" /> API Token
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.jiraApiToken}
                                                onChange={(e) => handleInputChange('jiraApiToken', e.target.value)}
                                                className="input-field font-mono"
                                                placeholder="ATATT..."
                                            />
                                            <a
                                                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                                                target="_blank"
                                                className="text-[10px] text-accent flex items-center gap-1 hover:underline"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Get your Token here
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex flex-col items-center gap-4">
                                    <button
                                        onClick={testConnection}
                                        disabled={testingConnection}
                                        className="btn-glow w-full md:w-auto px-12 py-4 flex items-center justify-center gap-3 text-lg"
                                    >
                                        {testingConnection ? <RefreshCw className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                                        {testingConnection ? 'Validating Core...' : 'Initialize Connection'}
                                    </button>

                                    <button
                                        onClick={enableDemoMode}
                                        className="text-text-muted hover:text-accent transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4 text-warning" /> Or launch in Simulation Mode (Demo)
                                    </button>
                                </div>

                                {connectionResult && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`p-4 rounded-xl border flex items-center gap-4 ${connectionResult.success ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'
                                            }`}
                                    >
                                        {connectionResult.success ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                        <span className="font-semibold">{connectionResult.success ? 'Connection Synchronized!' : connectionResult.error}</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 md:p-12 space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-display font-bold">Target Workspace</h2>
                                    <p className="text-text-muted">Select the specific board and project for analysis.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="p-6 bg-dark-700/50 rounded-2xl border border-dark-600 hover:border-accent/50 transition-colors group cursor-pointer">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                                    <Layout className="w-5 h-5" />
                                                </div>
                                                <Check className="w-5 h-5 text-accent" />
                                            </div>
                                            <h4 className="font-bold text-lg mb-1">Bug Tracking System</h4>
                                            <p className="text-text-muted text-xs">Standard agile board for development</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-secondary">Project Context</label>
                                            <select
                                                className="input-field appearance-none cursor-pointer"
                                                value={formData.projectKey}
                                                onChange={(e) => handleInputChange('projectKey', e.target.value)}
                                            >
                                                <option value="BTS">Bug Tracking System (BTS)</option>
                                                <option value="PROJ">Payment Gateway (PROJ)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-secondary">Active Board</label>
                                            <select
                                                className="input-field appearance-none cursor-pointer"
                                                value={formData.boardId}
                                                onChange={(e) => handleInputChange('boardId', e.target.value)}
                                            >
                                                <option value="1">Main Engineering Board</option>
                                                <option value="2">Backend Sprint Board</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-between items-center">
                                    <button onClick={() => setStep(1)} className="btn-secondary px-8 py-3 ring-0 text-text-muted hover:text-accent">
                                        Go Back
                                    </button>
                                    <button onClick={() => setStep(3)} className="btn-glow px-10 py-3 flex items-center gap-2">
                                        Continue <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 md:p-12 space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-display font-bold">Health Thresholds</h2>
                                    <p className="text-text-muted">Configure how the AI evaluates your sprint vitals.</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="glass-card p-6 border-l-4 border-l-success">
                                            <span className="text-xs font-bold text-success uppercase tracking-widest block mb-4">Healthy Level</span>
                                            <div className="flex items-end gap-2 mb-4">
                                                <input
                                                    type="number"
                                                    value={formData.healthThresholds.healthy}
                                                    onChange={(e) => handleNestedInputChange('healthThresholds', 'healthy', parseInt(e.target.value))}
                                                    className="bg-transparent text-4xl font-bold w-20 outline-none border-b border-dark-600 focus:border-accent"
                                                />
                                                <span className="text-lg text-text-muted font-bold">%</span>
                                            </div>
                                            <p className="text-[10px] text-text-muted">Minimum score for positive indicators.</p>
                                        </div>
                                        <div className="glass-card p-6 border-l-4 border-l-warning">
                                            <span className="text-xs font-bold text-warning uppercase tracking-widest block mb-4">Warning Level</span>
                                            <div className="flex items-end gap-2 mb-4">
                                                <input
                                                    type="number"
                                                    value={formData.healthThresholds.atRisk}
                                                    onChange={(e) => handleNestedInputChange('healthThresholds', 'atRisk', parseInt(e.target.value))}
                                                    className="bg-transparent text-4xl font-bold w-20 outline-none border-b border-dark-600 focus:border-accent"
                                                />
                                                <span className="text-lg text-text-muted font-bold">%</span>
                                            </div>
                                            <p className="text-[10px] text-text-muted">Score where AI begins intervention.</p>
                                        </div>
                                        <div className="glass-card p-6 border-l-4 border-l-danger flex flex-col justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-danger uppercase tracking-widest block mb-4">Critical level</span>
                                                <div className="text-4xl font-bold mb-4 opacity-50 flex items-end gap-2">
                                                    &lt; {formData.healthThresholds.atRisk} <span className="text-lg">%</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-text-muted">Auto-generated based on warning level.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-between items-center">
                                    <button onClick={() => setStep(2)} className="btn-secondary px-8 py-3 ring-0">
                                        Go Back
                                    </button>
                                    <button onClick={() => setStep(4)} className="btn-glow px-10 py-3 flex items-center gap-2">
                                        Configure Alerts <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 md:p-12 space-y-10"
                            >
                                <div className="space-y-2 text-center max-w-lg mx-auto">
                                    <h2 className="text-3xl font-display font-bold text-white">Final Synchronization</h2>
                                    <p className="text-text-muted">Set up automated reporting channels and finalize initialization.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-dark-700/30 rounded-3xl p-8 border border-dark-600/50">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold">Email Updates</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={formData.alerts.email} onChange={(e) => handleNestedInputChange('alerts', 'email', e.target.checked)} />
                                                <div className="w-11 h-6 bg-dark-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#4A154B]/20 rounded-xl flex items-center justify-center text-[#4A154B]">
                                                    <Zap className="w-5 h-5 shadow-glow-sm" />
                                                </div>
                                                <span className="font-semibold">Slack Webhook</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={formData.alerts.slack} onChange={(e) => handleNestedInputChange('alerts', 'slack', e.target.checked)} />
                                                <div className="w-11 h-6 bg-dark-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-text-muted">Notification Core (Emails)</label>
                                        <textarea
                                            value={formData.emailList}
                                            onChange={(e) => handleInputChange('emailList', e.target.value)}
                                            className="input-field min-h-[100px] resize-none pt-4"
                                            placeholder="dev-leads@corp.com, project-owners@corp.com"
                                        />
                                        <p className="text-[10px] text-text-muted">Separate multiple receivers using commas.</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col items-center gap-6">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="btn-glow w-full md:w-auto px-20 py-5 text-xl font-display font-bold flex items-center justify-center gap-4 shadow-glow"
                                    >
                                        {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Rocket className="w-6 h-6" />}
                                        {loading ? 'Powering Up...' : 'COMPLETE INITIALIZATION'}
                                    </button>

                                    <div className="flex items-center gap-4 text-xs text-text-muted">
                                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted Storage</span>
                                        <span className="w-1 h-1 bg-dark-600 rounded-full" />
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Real-time Sync</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-text-muted text-xs">
                        &copy; 2025 Sprint Strategist by samarabdelhamed. Powered by Anthropic Claude 3.5 & Jira Intelligence.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectSetup;