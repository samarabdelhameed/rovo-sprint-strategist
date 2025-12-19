import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Calendar,
    Settings,
    Download,
    Eye,
    CheckCircle2,
    BarChart3,
    Activity,
    Users,
    Clock,
    Zap,
    Sparkles,
    FileSpreadsheet,
    Layout
} from 'lucide-react';

const CustomReportBuilder = () => {
    const [config, setConfig] = useState({
        dateRange: {
            start: new Date().toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        },
        metrics: {
            velocity: true,
            cycleTime: true,
            throughput: false,
            healthScore: true,
            teamPerformance: true
        },
        format: 'pdf',
        filters: {
            team: 'all',
            member: 'all'
        },
        includeAIInsights: true
    });

    const [generating, setGenerating] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const handleMetricToggle = (metric) => {
        setConfig(prev => ({
            ...prev,
            metrics: {
                ...prev.metrics,
                [metric]: !prev.metrics[metric]
            }
        }));
    };

    const handleGenerate = () => {
        setGenerating(true);
        // Simulate generation
        setTimeout(() => {
            setGenerating(false);
            alert('Report generated successfully!');
        }, 2000);
    };

    const metricsList = [
        { id: 'velocity', label: 'Sprint Velocity', icon: Zap, color: 'text-accent' },
        { id: 'cycleTime', label: 'Cycle Time', icon: Clock, color: 'text-info' },
        { id: 'throughput', label: 'Throughput', icon: BarChart3, color: 'text-purple-400' },
        { id: 'healthScore', label: 'Health Score', icon: Activity, color: 'text-success' },
        { id: 'teamPerformance', label: 'Team Performance', icon: Users, color: 'text-warning' }
    ];

    const formats = [
        { id: 'pdf', label: 'PDF Document', icon: FileText },
        { id: 'excel', label: 'Excel Sheet', icon: FileSpreadsheet },
        { id: 'interactive', label: 'Interactive Dashboard', icon: Layout }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold gradient-text">Custom Report Builder</h2>
                    <p className="text-text-muted mt-2">Design and generate specialized sprint intelligence reports</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Configuration Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 space-y-8"
                    >
                        {/* Date Range */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Time Window
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-text-muted mb-1 block">Start Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={config.dateRange.start}
                                        onChange={(e) => setConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted mb-1 block">End Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={config.dateRange.end}
                                        onChange={(e) => setConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Metric Selection */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Intelligence Matrix
                            </h4>
                            <div className="space-y-2">
                                {metricsList.map(metric => (
                                    <button
                                        key={metric.id}
                                        onClick={() => handleMetricToggle(metric.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${config.metrics[metric.id]
                                            ? 'bg-accent/10 border-accent/50 text-accent'
                                            : 'bg-dark-700/50 border-dark-600 text-text-muted grayscale'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <metric.icon className={`w-4 h-4 ${config.metrics[metric.id] ? metric.color : ''}`} />
                                            <span className="text-sm font-medium">{metric.label}</span>
                                        </div>
                                        {config.metrics[metric.id] && <CheckCircle2 className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI Insights Toggle */}
                        <div className="pt-4 border-t border-dark-700">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-accent/20 text-accent group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold block">AI Analysis</span>
                                        <span className="text-[10px] text-text-muted">Generate narrative insights</span>
                                    </div>
                                </div>
                                <div className={`w-11 h-6 rounded-full transition-colors relative ${config.includeAIInsights ? 'bg-accent' : 'bg-dark-700'}`}>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={config.includeAIInsights}
                                        onChange={() => setConfig(prev => ({ ...prev, includeAIInsights: !prev.includeAIInsights }))}
                                    />
                                    <motion.div
                                        animate={{ x: config.includeAIInsights ? 20 : 2 }}
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
                                    />
                                </div>
                            </label>
                        </div>
                    </motion.div>
                </div>

                {/* Main Preview/Options Area */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Format Selection */}
                    <div className="glass-card p-6">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Delivery Format</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {formats.map(format => (
                                <button
                                    key={format.id}
                                    onClick={() => setConfig(prev => ({ ...prev, format: format.id }))}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${config.format === format.id
                                        ? 'border-accent bg-accent/5 text-accent shadow-glow-sm'
                                        : 'border-dark-600 bg-dark-700/30 text-text-muted hover:border-dark-500'
                                        }`}
                                >
                                    <format.icon className="w-8 h-8" />
                                    <span className="text-sm font-bold">{format.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Report Preview Placeholder */}
                    <div className="glass-card p-8 min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-sphere opacity-5" />

                        <div className="w-20 h-20 bg-dark-700 rounded-3xl flex items-center justify-center text-dark-500 border border-dark-600">
                            <FileText className="w-10 h-10" />
                        </div>

                        <div className="max-w-md space-y-2">
                            <h3 className="text-xl font-bold">Report Preview Configuration</h3>
                            <p className="text-text-muted text-sm leading-relaxed">
                                Select your metrics and date range to initialize the intelligence generator.
                                Your report will include {Object.values(config.metrics).filter(Boolean).length} key matrices
                                {config.includeAIInsights ? ' and AI-powered narrative analysis' : ''}.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className="btn-secondary px-8 py-3 flex items-center gap-2"
                                onClick={() => setPreviewMode(!previewMode)}
                            >
                                <Eye className="w-4 h-4" /> {previewMode ? 'Edit Config' : 'Live Preview'}
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-glow px-10 py-3 flex items-center gap-2"
                                onClick={handleGenerate}
                                disabled={generating}
                            >
                                {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                {generating ? 'Processing Matrix...' : 'Generate Report'}
                            </motion.button>
                        </div>
                    </div>

                    {/* Quick Suggestions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-dark-700/50 transition-all border-l-4 border-l-accent">
                            <div className="p-2 rounded bg-accent/20 text-accent">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm">Sprint Health Summary</h5>
                                <p className="text-xs text-text-muted">Focused on velocity and blockers</p>
                            </div>
                        </div>
                        <div className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-dark-700/50 transition-all border-l-4 border-l-success">
                            <div className="p-2 rounded bg-success/20 text-success">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm">Team Efficiency Audit</h5>
                                <p className="text-xs text-text-muted">Detailed member matrix analysis</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomReportBuilder;
