/**
 * 📊 Sprint Analyzer Service
 * Core business logic for sprint analysis with real Jira integration
 */
import { supabase, getAll } from './supabaseClient.js';
import localDB, { queries } from './localDatabase.js';
import jiraService from './jiraService.js';

/**
 * Get active sprint with all related data
 */
export async function getActiveSprintData() {
    try {
        // Initialize local database schema
        localDB.initializeDatabase();
        
        // Check if Jira is configured
        if (!jiraService.isConfigured()) {
            return {
                error: 'JIRA_NOT_CONFIGURED',
                message: 'Please configure Jira connection in Project Setup',
                sprint: null,
                issues: [],
                team: [],
                healthScore: 0
            };
        }
        
        // Try to sync data from Jira
        try {
            await jiraService.syncAllData();
        } catch (syncError) {
            console.warn('⚠️ Failed to sync from Jira, using cached data:', syncError.message);
        }
        
        // Get sprint from local database (either fresh from Jira or cached)
        const sprint = queries.getActiveSprint.get('active');
        
        if (!sprint) {
            return {
                error: 'NO_ACTIVE_SPRINT',
                message: 'No active sprint found. Please start a sprint in Jira.',
                sprint: null,
                issues: [],
                team: [],
                healthScore: 0
            };
        }

        // Get all related data
        const rawIssues = queries.getSprintIssues.all(sprint.id);
        const metrics = queries.getSprintMetrics.all(sprint.id);
        const team = queries.getTeamMembers.all();
        const rawActivities = queries.getTeamActivities.all(sprint.id);

        // Transform issues to include assignee data
        const issues = rawIssues.map(issue => ({
            id: issue.id,
            key: issue.key,
            title: issue.title,
            description: issue.description,
            status: issue.status,
            story_points: issue.story_points,
            assignee_id: issue.assignee_id,
            priority: issue.priority,
            issue_type: issue.issue_type,
            blocked_reason: issue.blocked_reason,
            blocked_since: issue.blocked_since,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            completed_at: issue.completed_at,
            assignee: issue.assignee_id ? {
                id: issue.assignee_id,
                name: issue.assignee_name,
                email: issue.assignee_email,
                avatar: issue.assignee_avatar
            } : null
        }));

        // Transform activities
        const activities = rawActivities.map(activity => ({
            id: activity.id,
            sprint_id: activity.sprint_id,
            member_id: activity.member_id,
            action: activity.action,
            description: activity.description,
            created_at: activity.created_at,
            member: activity.member_id ? {
                name: activity.member_name,
                avatar: activity.member_avatar
            } : null
        }));

        // Calculate current metrics
        const calculatedMetrics = calculateSprintMetrics(sprint, issues, team);

        console.log(`✅ REAL DATA LOADED: ${issues.length} issues, ${team.length} team members, health score: ${calculatedMetrics.healthScore}`);
        console.log(`📊 Sprint: "${sprint.name}" | Completed: ${calculatedMetrics.issuesCompleted}/${calculatedMetrics.issuesTotal} | Points: ${calculatedMetrics.completedPoints}/${calculatedMetrics.totalPoints}`);

        return {
            sprint,
            issues,
            metrics,
            team,
            activities,
            ...calculatedMetrics
        };
    } catch (error) {
        console.error('❌ Error fetching sprint data from local database:', error);
        // Force re-initialization and try again
        try {
            localDB.initializeDatabase();
            const sprint = queries.getActiveSprint.get('active');
            if (sprint) {
                console.log('✅ Database re-initialized successfully');
                // Retry the whole function
                return getActiveSprintData();
            }
        } catch (retryError) {
            console.error('❌ Failed to recover database:', retryError);
        }
        throw new Error('Failed to load real sprint data');
    }
}

/**
 * Calculate real-time sprint metrics
 */
function calculateSprintMetrics(sprint, issues, team) {
    const now = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

    // Issue counts by status
    const issuesTotal = issues.length;
    const issuesCompleted = issues.filter(i => i.status === 'done').length;
    const issuesInProgress = issues.filter(i => i.status === 'in_progress' || i.status === 'review').length;
    const issuesTodo = issues.filter(i => i.status === 'todo').length;
    const blockersCount = issues.filter(i => i.status === 'blocked').length;

    // Story points
    const totalPoints = issues.reduce((sum, i) => sum + (i.story_points || 0), 0);
    const completedPoints = issues.filter(i => i.status === 'done')
        .reduce((sum, i) => sum + (i.story_points || 0), 0);
    const velocity = completedPoints;
    const completionPercentage = totalPoints > 0
        ? Math.round((completedPoints / totalPoints) * 100)
        : 0;

    // Ideal progress based on time elapsed
    const idealProgress = totalDays > 0
        ? Math.round((elapsedDays / totalDays) * 100)
        : 0;

    // Team metrics
    const teamMetrics = calculateTeamMetrics(issues, team);

    // Health score calculation
    const healthScore = calculateHealthScore({
        completionPercentage,
        idealProgress,
        blockersCount,
        teamMetrics,
        velocity,
        totalPoints
    });

    return {
        healthScore,
        velocity,
        completionPercentage,
        totalPoints,
        completedPoints,
        issuesTotal,
        issuesCompleted,
        issuesInProgress,
        issuesTodo,
        blockersCount,
        totalDays,
        elapsedDays,
        daysRemaining,
        idealProgress,
        dayNumber: elapsedDays,
        teamMetrics
    };
}

/**
 * Calculate team workload metrics
 */
function calculateTeamMetrics(issues, team) {
    const memberMap = new Map();

    // Initialize team members
    team.forEach(member => {
        memberMap.set(member.id, {
            id: member.id,
            name: member.name,
            email: member.email,
            avatar: member.avatar_url,
            role: member.role,
            capacity: member.capacity || 20,
            tasks: [],
            points: 0,
            completedPoints: 0
        });
    });

    // Aggregate issue data
    issues.forEach(issue => {
        if (!issue.assignee_id) return;

        const member = memberMap.get(issue.assignee_id);
        if (!member) return;

        member.tasks.push(issue.key);
        member.points += issue.story_points || 0;

        if (issue.status === 'done') {
            member.completedPoints += issue.story_points || 0;
        }
    });

    // Calculate load percentages
    return Array.from(memberMap.values()).map(m => ({
        ...m,
        taskCount: m.tasks.length,
        load: m.capacity > 0 ? Math.round((m.points / m.capacity) * 100) : 0,
        completionRate: m.points > 0 ? Math.round((m.completedPoints / m.points) * 100) : 0
    })).sort((a, b) => b.load - a.load);
}

/**
 * Calculate overall health score (0-100)
 */
function calculateHealthScore(metrics) {
    const weights = {
        progressOnTrack: 0.25,
        noBlockers: 0.20,
        teamBalance: 0.15,
        velocityHealth: 0.15,
        scopeProgress: 0.15,
        burndownHealth: 0.10
    };

    const scores = {};

    // Progress on track (compare actual vs ideal)
    const progressDiff = metrics.completionPercentage - metrics.idealProgress;
    scores.progressOnTrack = Math.max(0, Math.min(100, 70 + progressDiff));

    // No blockers (100 if none, decreases with each blocker)
    scores.noBlockers = Math.max(0, 100 - (metrics.blockersCount * 25));

    // Team balance (penalize overloaded members)
    const overloadedCount = metrics.teamMetrics?.filter(m => m.load > 100).length || 0;
    const underutilizedCount = metrics.teamMetrics?.filter(m => m.load < 30).length || 0;
    scores.teamBalance = Math.max(0, 100 - (overloadedCount * 20) - (underutilizedCount * 10));

    // Velocity health (compare current velocity to committed)
    const velocityRatio = metrics.totalPoints > 0
        ? metrics.velocity / metrics.totalPoints
        : 0;
    scores.velocityHealth = Math.min(100, velocityRatio * 100 * 1.5);

    // Scope progress
    scores.scopeProgress = metrics.completionPercentage;

    // Burndown health (are we on track?)
    const burndownDeviation = Math.abs(metrics.completionPercentage - metrics.idealProgress);
    scores.burndownHealth = Math.max(0, 100 - burndownDeviation);

    // Calculate weighted average
    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
        totalScore += (scores[key] || 0) * weight;
    }

    return Math.round(Math.max(0, Math.min(100, totalScore)));
}

/**
 * Get burndown chart data
 */
export async function getBurndownData(sprintId) {
    if (!supabase) return getMockBurndownData();

    try {
        const { data: metrics } = await supabase
            .from('sprint_metrics')
            .select('*')
            .eq('sprint_id', sprintId)
            .order('recorded_at', { ascending: true });

        const { data: sprint } = await supabase
            .from('sprints')
            .select('*')
            .eq('id', sprintId)
            .single();

        if (!sprint) return getMockBurndownData();

        const totalPoints = sprint.velocity_committed || 52;
        const totalDays = Math.ceil(
            (new Date(sprint.end_date) - new Date(sprint.start_date)) / (1000 * 60 * 60 * 24)
        );

        // Generate ideal burndown line
        const ideal = [];
        for (let i = 0; i <= totalDays; i++) {
            ideal.push({
                day: i,
                remaining: Math.round(totalPoints * (1 - i / totalDays))
            });
        }

        // Generate actual burndown from metrics
        const actual = metrics?.map((m, idx) => ({
            day: idx + 1,
            remaining: totalPoints - (m.velocity || 0)
        })) || [];

        return { ideal, actual, totalPoints, totalDays };
    } catch (error) {
        console.error('Error getting burndown data:', error);
        return getMockBurndownData();
    }
}

/**
 * Record sprint metrics snapshot
 */
export async function recordMetricsSnapshot(sprintId, metrics) {
    if (!supabase) return { success: false };

    try {
        const { data, error } = await supabase
            .from('sprint_metrics')
            .insert({
                sprint_id: sprintId,
                health_score: metrics.healthScore,
                velocity: metrics.velocity,
                completion_percentage: metrics.completionPercentage,
                blockers_count: metrics.blockersCount,
                team_load_average: Math.round(
                    metrics.teamMetrics.reduce((sum, m) => sum + m.load, 0) /
                    (metrics.teamMetrics.length || 1)
                ),
                issues_total: metrics.issuesTotal,
                issues_completed: metrics.issuesCompleted,
                issues_in_progress: metrics.issuesInProgress
            })
            .select()
            .single();

        return { success: !error, data };
    } catch (error) {
        console.error('Error recording metrics:', error);
        return { success: false };
    }
}

// =====================================================
// MOCK DATA (Fallback when Supabase not configured)
// =====================================================

function getMockSprintData() {
    const mockTeam = [
        { id: '1', name: 'Sarah Johnson', email: 'sarah@team.io', role: 'tech_lead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', capacity: 25 },
        { id: '2', name: 'Mike Chen', email: 'mike@team.io', role: 'developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', capacity: 20 },
        { id: '3', name: 'Lisa Anderson', email: 'lisa@team.io', role: 'developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', capacity: 20 },
        { id: '4', name: 'John Smith', email: 'john@team.io', role: 'developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', capacity: 20 },
        { id: '5', name: 'Emma Wilson', email: 'emma@team.io', role: 'qa_lead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', capacity: 15 },
    ];

    const mockIssues = [
        { id: '1', key: 'PROJ-101', title: 'Setup Stripe SDK', status: 'done', story_points: 5, assignee_id: '1', priority: 'high' },
        { id: '2', key: 'PROJ-102', title: 'Payment form component', status: 'done', story_points: 3, assignee_id: '3', priority: 'high' },
        { id: '3', key: 'PROJ-103', title: 'Card validation', status: 'done', story_points: 2, assignee_id: '2', priority: 'medium' },
        { id: '4', key: 'PROJ-104', title: 'Success page design', status: 'done', story_points: 2, assignee_id: '3', priority: 'medium' },
        { id: '5', key: 'PROJ-105', title: 'Unit tests', status: 'done', story_points: 3, assignee_id: '5', priority: 'medium' },
        { id: '6', key: 'PROJ-106', title: 'Payment API', status: 'in_progress', story_points: 8, assignee_id: '1', priority: 'critical' },
        { id: '7', key: 'PROJ-107', title: 'Stripe webhooks', status: 'in_progress', story_points: 5, assignee_id: '2', priority: 'high' },
        { id: '8', key: 'PROJ-108', title: 'Error handling', status: 'in_progress', story_points: 3, assignee_id: '4', priority: 'high' },
        { id: '9', key: 'PROJ-109', title: 'Invoice service', status: 'review', story_points: 5, assignee_id: '4', priority: 'medium' },
        { id: '10', key: 'PROJ-110', title: 'Apple Pay', status: 'blocked', story_points: 5, assignee_id: '4', priority: 'medium', blocked_reason: 'Waiting for Apple Developer approval' },
        { id: '11', key: 'PROJ-111', title: 'Google Pay', status: 'todo', story_points: 5, assignee_id: '4', priority: 'medium' },
        { id: '12', key: 'PROJ-112', title: 'Analytics dashboard', status: 'todo', story_points: 8, assignee_id: '3', priority: 'low' },
    ];

    return {
        sprint: {
            id: 'mock-sprint-1',
            name: 'Sprint 42 - Payment Gateway',
            project_key: 'PROJ',
            start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            goal: 'Complete payment gateway integration',
            status: 'active',
            velocity_committed: 52
        },
        issues: mockIssues,
        team: mockTeam,
        activities: [],
        metrics: [],
        healthScore: 78,
        velocity: 34,
        completionPercentage: 65,
        totalPoints: 52,
        completedPoints: 15,
        issuesTotal: 12,
        issuesCompleted: 5,
        issuesInProgress: 4,
        issuesTodo: 2,
        blockersCount: 1,
        totalDays: 10,
        elapsedDays: 5,
        daysRemaining: 5,
        idealProgress: 50,
        dayNumber: 5,
        teamMetrics: mockTeam.map((m, i) => ({
            ...m,
            taskCount: [3, 2, 3, 4, 1][i] || 0,
            points: [13, 7, 13, 18, 3][i] || 0,
            load: [52, 35, 65, 90, 20][i] || 0,
            completedPoints: [5, 2, 5, 0, 3][i] || 0,
            completionRate: [38, 28, 38, 0, 100][i] || 0
        }))
    };
}

function getMockBurndownData() {
    const totalPoints = 52;
    const totalDays = 10;

    return {
        ideal: Array.from({ length: totalDays + 1 }, (_, i) => ({
            day: i,
            remaining: Math.round(totalPoints * (1 - i / totalDays))
        })),
        actual: [
            { day: 1, remaining: 47 },
            { day: 2, remaining: 42 },
            { day: 3, remaining: 38 },
            { day: 4, remaining: 32 },
            { day: 5, remaining: 28 },
        ],
        totalPoints,
        totalDays
    };
}

export default {
    getActiveSprintData,
    getBurndownData,
    recordMetricsSnapshot
};
