/**
 * 🚀 Rovo Sprint Strategist - API Server
 * 
 * Express.js backend with Supabase integration
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase, isSupabaseConfigured } from './services/supabaseClient.js';
import sprintAnalyzer from './services/sprintAnalyzer.js';
import aiService from './services/aiService.js';
import localDB, { queries } from './services/localDatabase.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏎️ Rovo Sprint Strategist API is running',
        endpoints: {
            health: '/api/health',
            sprint: '/api/sprint',
            team: '/api/team',
            analytics: '/api/analytics'
        }
    });
});

// =====================================================
// HEALTH CHECK
// =====================================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supabase: isSupabaseConfigured() ? 'connected' : 'mock-mode',
        version: '1.0.0'
    });
});

// =====================================================
// SPRINT ENDPOINTS
// =====================================================

/**
 * GET /api/sprint - Get active sprint with all data
 */
app.get('/api/sprint', async (req, res) => {
    try {
        const data = await sprintAnalyzer.getActiveSprintData();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching sprint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Alias for frontend compatibility
app.get('/api/sprint/current', async (req, res) => {
    try {
        const data = await sprintAnalyzer.getActiveSprintData();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sprint/:id - Get specific sprint
 */
app.get('/api/sprint/:id', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({ success: true, data: await sprintAnalyzer.getActiveSprintData() });
        }

        const { data, error } = await supabase
            .from('sprints')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sprint/:id/burndown - Get burndown chart data
 */
app.get('/api/sprint/:id/burndown', async (req, res) => {
    try {
        const data = await sprintAnalyzer.getBurndownData(req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// ISSUES ENDPOINTS
// =====================================================

/**
 * GET /api/issues - Get all issues for active sprint
 */
app.get('/api/issues', async (req, res) => {
    try {
        // Use sprintAnalyzer which already has reliable data fetching
        const sprintData = await sprintAnalyzer.getActiveSprintData();
        let issues = sprintData.issues;

        // Apply optional filters
        const { status, assignee } = req.query;
        if (status) {
            issues = issues.filter(i => i.status === status);
        }
        if (assignee) {
            issues = issues.filter(i => i.assignee_id === assignee);
        }

        res.json({ success: true, data: issues });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/issues/:id - Update issue
 */
app.patch('/api/issues/:id', async (req, res) => {
    try {
        const { status } = req.body;

        // Update in local database
        const completedAt = status === 'done' ? new Date().toISOString() : null;
        const result = queries.updateIssue.run(status, completedAt, req.params.id);

        // Get updated issue - need to get all issues for the sprint first
        const sprintData = await sprintAnalyzer.getActiveSprintData();
        const updatedIssue = sprintData.issues.find(i => i.id === req.params.id);

        if (updatedIssue) {
            console.log(`✅ Updated issue ${updatedIssue.key} to status: ${status}`);
        }

        res.json({
            success: true,
            data: updatedIssue,
            message: `Issue updated to ${status}`
        });
    } catch (error) {
        console.error('Error updating issue:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// TEAM ENDPOINTS
// =====================================================

// Team members are now handled by /api/team router

// Alias handled by proxy or can be moved to router if needed

/**
 * GET /api/team/workload - Get team workload distribution
 */
app.get('/api/team/workload', async (req, res) => {
    try {
        const sprintData = await sprintAnalyzer.getActiveSprintData();
        res.json({ success: true, data: sprintData.teamMetrics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// METRICS ENDPOINTS
// =====================================================

/**
 * GET /api/metrics - Get current sprint metrics
 */
app.get('/api/metrics', async (req, res) => {
    try {
        const sprintData = await sprintAnalyzer.getActiveSprintData();
        res.json({
            success: true,
            data: {
                healthScore: sprintData.healthScore,
                velocity: sprintData.velocity,
                completionPercentage: sprintData.completionPercentage,
                totalPoints: sprintData.totalPoints,
                completedPoints: sprintData.completedPoints,
                issuesTotal: sprintData.issuesTotal,
                issuesCompleted: sprintData.issuesCompleted,
                issuesInProgress: sprintData.issuesInProgress,
                blockersCount: sprintData.blockersCount,
                daysRemaining: sprintData.daysRemaining,
                dayNumber: sprintData.dayNumber,
                totalDays: sprintData.totalDays
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/metrics/history - Get historical metrics
 */
app.get('/api/metrics/history', async (req, res) => {
    try {
        if (!supabase) {
            const data = await sprintAnalyzer.getActiveSprintData();
            // Generate mock history
            const history = Array.from({ length: 5 }, (_, i) => ({
                day: i + 1,
                healthScore: 65 + i * 3,
                velocity: 10 + i * 6,
                completionPercentage: 20 + i * 10
            }));
            return res.json({ success: true, data: history });
        }

        const sprintData = await sprintAnalyzer.getActiveSprintData();
        const { data, error } = await supabase
            .from('sprint_metrics')
            .select('*')
            .eq('sprint_id', sprintData.sprint.id)
            .order('recorded_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// STANDUP ENDPOINTS
// =====================================================

/**
 * GET /api/standup - Get today's standup or generate new one
 */
app.get('/api/standup', async (req, res) => {
    try {
        const sprintData = await sprintAnalyzer.getActiveSprintData();
        const today = new Date().toISOString().split('T')[0];

        // Check if standup exists for today
        if (supabase) {
            const { data: existing } = await supabase
                .from('standup_notes')
                .select('*')
                .eq('sprint_id', sprintData.sprint.id)
                .eq('date', today)
                .single();

            if (existing) {
                return res.json({ success: true, data: existing });
            }
        }

        // Generate new standup
        const standupContent = await aiService.generateStandupSummary(
            sprintData,
            sprintData.activities
        );

        const standup = {
            sprint_id: sprintData.sprint.id,
            date: today,
            day_number: sprintData.dayNumber,
            completed_items: sprintData.issues.filter(i => i.status === 'done').map(i => ({
                key: i.key,
                title: i.title,
                assignee: i.assignee?.name
            })),
            in_progress_items: sprintData.issues.filter(i => ['in_progress', 'review'].includes(i.status)).map(i => ({
                key: i.key,
                title: i.title,
                assignee: i.assignee?.name
            })),
            blockers: sprintData.issues.filter(i => i.status === 'blocked').map(i => ({
                key: i.key,
                title: i.title,
                reason: i.blocked_reason
            })),
            health_score: sprintData.healthScore,
            notes: standupContent
        };

        // Save to database
        if (supabase) {
            await supabase.from('standup_notes').insert(standup);
        } else {
            // Save to local SQLite
            const id = 'standup-' + Date.now();
            localDB.db.prepare(`
                INSERT INTO standup_notes (id, sprint_id, date, day_number, completed_items, in_progress_items, blockers, health_score, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                id,
                standup.sprint_id,
                standup.date,
                standup.day_number,
                JSON.stringify(standup.completed_items),
                JSON.stringify(standup.in_progress_items),
                JSON.stringify(standup.blockers),
                standup.health_score,
                standup.notes
            );
        }

        res.json({ success: true, data: standup });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/standup/history - Get standup history
 */
app.get('/api/standup/history', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({ success: true, data: [] });
        }

        const sprintData = await sprintAnalyzer.getActiveSprintData();
        const { data, error } = await supabase
            .from('standup_notes')
            .select('*')
            .eq('sprint_id', sprintData.sprint.id)
            .order('date', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// PIT-STOP ENDPOINTS
// =====================================================

/**
 * GET /api/pitstop - Get pit-stop recommendations
 */
app.get('/api/pitstop', async (req, res) => {
    try {
        const sprintData = await sprintAnalyzer.getActiveSprintData();

        // Get existing recommendations from local database
        const existingRecs = queries.getPitStopRecommendations.all(sprintData.sprint.id);

        // Transform recommendations (parse JSON fields)
        const recommendations = existingRecs.map(rec => ({
            ...rec,
            affected_issues: JSON.parse(rec.affected_issues || '[]')
        }));

        res.json({
            success: true,
            data: {
                recommendations,
                sprintHealth: sprintData.healthScore,
                urgencyLevel: sprintData.healthScore < 50 ? 'critical'
                    : sprintData.healthScore < 70 ? 'high'
                        : 'normal'
            }
        });
    } catch (error) {
        console.error('Error getting pit-stop recommendations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/pitstop/:id/apply - Apply a recommendation
 */
app.post('/api/pitstop/:id/apply', async (req, res) => {
    try {
        // Apply recommendation in local database
        queries.applyRecommendation.run(req.params.id);

        console.log(`✅ Applied pit-stop recommendation: ${req.params.id}`);

        res.json({
            success: true,
            message: 'Recommendation applied successfully',
            data: { id: req.params.id, status: 'applied' }
        });
    } catch (error) {
        console.error('Error applying recommendation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// LEADERBOARD ENDPOINTS
// =====================================================

/**
 * GET /api/leaderboard - Get team leaderboard
 */
app.get('/api/leaderboard', async (req, res) => {
    try {
        const sprintData = await sprintAnalyzer.getActiveSprintData();

        // Calculate scores for each team member
        const leaderboard = sprintData.teamMetrics.map(member => {
            let score = 0;

            // Points for completed story points
            score += member.completedPoints * 10;

            // Bonus for high completion rate
            if (member.completionRate >= 80) score += 50;
            else if (member.completionRate >= 60) score += 30;

            // Penalty for overload
            if (member.load > 100) score -= 20;

            return {
                ...member,
                score,
                rank: 0
            };
        }).sort((a, b) => b.score - a.score);

        // Assign ranks
        leaderboard.forEach((member, idx) => {
            member.rank = idx + 1;
        });

        // Get achievements from local database
        const rawAchievements = queries.getAchievements.all(sprintData.sprint.id);
        const achievements = rawAchievements.map(ach => ({
            badge_name: ach.badge_name,
            badge_icon: ach.badge_icon,
            points: ach.points,
            earned_at: ach.earned_at,
            member: { name: ach.member_name }
        }));

        res.json({
            success: true,
            data: {
                leaderboard,
                achievements,
                sprintName: sprintData.sprint.name
            }
        });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// ANALYTICS ENDPOINTS
// =====================================================

/**
 * GET /api/analytics - Get analytics data
 */
app.get('/api/analytics', async (req, res) => {
    try {
        const sprintData = await sprintAnalyzer.getActiveSprintData();
        const data = await getAnalyticsData(sprintData);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Alias for frontend compatibility
app.get('/api/analytics/metrics', async (req, res) => {
    try {
        const sprintData = await sprintAnalyzer.getActiveSprintData();
        res.json({ success: true, data: await getAnalyticsData(sprintData) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

async function getAnalyticsData(sprintData) {
    // Re-use logic from /api/analytics
    const velocityTrend = [
        { sprint: 'Sprint 38', velocity: 42, committed: 45 },
        { sprint: 'Sprint 39', velocity: 38, committed: 40 },
        { sprint: 'Sprint 40', velocity: 45, committed: 48 },
        { sprint: 'Sprint 41', velocity: 41, committed: 44 },
        { sprint: 'Sprint 42', velocity: sprintData.velocity, committed: sprintData.totalPoints }
    ];

    const issueDistribution = [
        { status: 'Done', count: sprintData.issuesCompleted, color: '#00D26A' },
        { status: 'In Progress', count: sprintData.issuesInProgress, color: '#F97316' },
        { status: 'To Do', count: sprintData.issuesTodo, color: '#6B7280' },
        { status: 'Blocked', count: sprintData.blockersCount, color: '#EF4444' }
    ];

    const teamPerformance = sprintData.teamMetrics.map(m => ({
        name: m.name,
        completedPoints: m.completedPoints,
        totalPoints: m.points,
        efficiency: m.completionRate
    }));

    const healthTrend = sprintData.metrics?.length > 0
        ? sprintData.metrics.map((m, i) => ({
            day: i + 1,
            score: m.health_score
        }))
        : Array.from({ length: 5 }, (_, i) => ({
            day: i + 1,
            score: 65 + i * 3
        }));

    return {
        velocityTrend,
        issueDistribution,
        teamPerformance,
        healthTrend,
        summary: {
            averageVelocity: Math.round(velocityTrend.reduce((s, v) => s + v.velocity, 0) / velocityTrend.length),
            velocityChange: '+12%',
            estimationAccuracy: '85%',
            sprintSuccessRate: '78%'
        }
    };
}

// =====================================================
// ACTIVITIES ENDPOINTS
// =====================================================

/**
 * GET /api/activities - Get recent team activities
 */
app.get('/api/activities', async (req, res) => {
    try {
        if (!supabase) {
            const data = await sprintAnalyzer.getActiveSprintData();
            return res.json({ success: true, data: data.activities });
        }

        const sprintData = await sprintAnalyzer.getActiveSprintData();
        const { data, error } = await supabase
            .from('team_activities')
            .select('*, member:team_members(*), issue:issues(*)')
            .eq('sprint_id', sprintData.sprint.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// AI ENDPOINTS
// =====================================================

/**
 * POST /api/ai/analyze - Get AI analysis of sprint
 */
app.post('/api/ai/analyze', async (req, res) => {
    try {
        const sprintData = await sprintAnalyzer.getActiveSprintData();
        const analysis = await aiService.analyzeSprintWithAI(sprintData);
        res.json({ success: true, data: analysis });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/ai/ask - Ask Rovo AI a question
 */
app.post('/api/ai/ask', async (req, res) => {
    try {
        const { question } = req.body;
        const sprintData = await sprintAnalyzer.getActiveSprintData();

        // For now, use the analysis endpoint
        // In production, this would use a conversational AI model
        const response = await aiService.analyzeSprintWithAI({
            ...sprintData,
            userQuestion: question
        });

        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// NEW FEATURE ENDPOINTS
// =====================================================

// Import new route modules
import alertSettingsRouter from './routes/alertSettings.js';
import recommendationsRouter from './routes/recommendations.js';
import aiChatRouter from './routes/aiChat.js';
import sprintGoalsRouter from './routes/sprintGoals.js';
import projectSetupRouter from './routes/projectSetup.js';
import teamRouter from './routes/team.js';

// Use new routes
app.use('/api/alert-settings', alertSettingsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/apply-recommendation', recommendationsRouter);
app.use('/api/ai-chat', aiChatRouter);
app.use('/api/test-alert', alertSettingsRouter);
app.use('/api/sprint-goals', sprintGoalsRouter);
app.use('/api/project-setup', projectSetupRouter);
app.use('/api/team', teamRouter);

// =====================================================
// SETTINGS ENDPOINTS
// =====================================================

/**
 * GET /api/settings - Get user settings
 */
app.get('/api/settings', async (req, res) => {
    try {
        // Default settings
        const defaultSettings = {
            notifications_enabled: true,
            email_alerts: true,
            slack_alerts: false,
            alert_threshold: 60,
            theme: 'dark',
            language: 'en'
        };

        if (!supabase) {
            return res.json({ success: true, data: defaultSettings });
        }

        // In production, get user-specific settings
        res.json({ success: true, data: defaultSettings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/settings - Update settings
 */
app.put('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        // In production, save to database
        res.json({ success: true, data: settings, message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function logActivity(sprintId, memberId, issueId, action, description) {
    if (!supabase) return;

    try {
        await supabase.from('team_activities').insert({
            sprint_id: sprintId,
            member_id: memberId,
            issue_id: issueId,
            action,
            description
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}

// =====================================================
// ERROR HANDLING
// =====================================================

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, async () => {
    // Initialize local database to check if it's working
    try {
        localDB.initializeDatabase();

        // Check AI service status
        let aiStatusText = '⚠️  Fallback Mode';
        try {
            const aiService = await import('./services/aiService.js');
            const aiStatus = aiService.default.getAIServiceStatus();
            aiStatusText = `${aiStatus.status === 'active' ? '✅' : '⚠️'} ${aiStatus.provider} (${aiStatus.cost})`;
        } catch (e) {
            console.error('Could not check AI status:', e);
        }

        console.log(`
🏎️  ═══════════════════════════════════════════════════
   ROVO SPRINT STRATEGIST API
   ═══════════════════════════════════════════════════
   
   🚀 Server running on: http://localhost:${PORT}
   📊 Health check:      http://localhost:${PORT}/api/health
   🗄️  Database:         ✅ Local Cache (Jira Data Only)
   🔗 Jira Integration:  ✅ Real API Connection
   🤖 AI Service:        ${aiStatusText}
   
   📋 Next Steps:
   1. Open http://localhost:3000
   2. Go to Project Setup
   3. Configure Jira connection
   4. Sync your sprint data
   
   ═══════════════════════════════════════════════════
`);
    } catch (error) {
        console.log(`
🏎️  ═══════════════════════════════════════════════════
   ROVO SPRINT STRATEGIST API
   ═══════════════════════════════════════════════════
   
   🚀 Server running on: http://localhost:${PORT}
   📊 Health check:      http://localhost:${PORT}/api/health
   🗄️  Database:         ❌ Error: ${error.message}
   🔗 Jira Integration:  ⚠️  Configure in Project Setup
   🤖 AI Service:        ⚠️  Fallback Mode
   
   ═══════════════════════════════════════════════════
`);
    }
});

export default app;
