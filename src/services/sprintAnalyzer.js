/**
 * 📊 Sprint Analyzer Service
 * 
 * Core service for analyzing sprint health, progress,
 * and generating comprehensive metrics.
 */

import api, { route } from '@forge/api';
import { storage } from '@forge/api';
import { differenceInDays, parseISO, isAfter, isBefore } from 'date-fns';

// Health score weights
const HEALTH_WEIGHTS = {
    progressOnTrack: 0.25,
    noBlockers: 0.20,
    teamBalance: 0.15,
    velocityTrend: 0.15,
    scopeStability: 0.10,
    estimationAccuracy: 0.10,
    burndownHealth: 0.05
};

/**
 * Get current active sprint for the project
 */
export async function getCurrentSprint(cloudId, projectKey = null) {
    try {
        // If no project key provided, get from first board
        if (!projectKey) {
            const boardsResponse = await api.asApp().requestJira(
                route`/rest/agile/1.0/board`,
                { method: 'GET' }
            );
            const boards = await boardsResponse.json();

            if (!boards.values || boards.values.length === 0) {
                return null;
            }

            // Get active sprint from first scrum board
            const scrumBoard = boards.values.find(b => b.type === 'scrum');
            if (!scrumBoard) return null;

            const sprintResponse = await api.asApp().requestJira(
                route`/rest/agile/1.0/board/${scrumBoard.id}/sprint?state=active`,
                { method: 'GET' }
            );
            const sprints = await sprintResponse.json();

            return sprints.values?.[0] || null;
        }

        // Get sprint by project key
        const response = await api.asApp().requestJira(
            route`/rest/agile/1.0/sprint?projectKey=${projectKey}&state=active`,
            { method: 'GET' }
        );
        const data = await response.json();
        return data.values?.[0] || null;
    } catch (error) {
        console.error('Error getting current sprint:', error);
        throw error;
    }
}

/**
 * Get comprehensive sprint data with all metrics
 */
export async function getSprintData(sprintId) {
    try {
        // Parallel fetch for efficiency
        const [sprintInfo, issues, previousMetrics] = await Promise.all([
            getSprintInfo(sprintId),
            getSprintIssues(sprintId),
            getPreviousMetrics(sprintId)
        ]);

        // Calculate current metrics
        const metrics = calculateMetrics(sprintInfo, issues);

        // Calculate health score
        const healthScore = calculateHealthScore(metrics);

        // Determine trend
        const healthTrend = determineHealthTrend(healthScore, previousMetrics);

        // Store current metrics
        await storeMetrics(sprintId, { ...metrics, healthScore });

        return {
            sprint: sprintInfo,
            ...metrics,
            healthScore,
            healthTrend,
            issues
        };
    } catch (error) {
        console.error('Error getting sprint data:', error);
        throw error;
    }
}

/**
 * Get sprint info from Jira
 */
async function getSprintInfo(sprintId) {
    const response = await api.asApp().requestJira(
        route`/rest/agile/1.0/sprint/${sprintId}`,
        { method: 'GET' }
    );
    return response.json();
}

/**
 * Get all issues in sprint
 */
async function getSprintIssues(sprintId) {
    const response = await api.asApp().requestJira(
        route`/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=500`,
        { method: 'GET' }
    );
    const data = await response.json();
    return data.issues || [];
}

/**
 * Calculate all sprint metrics
 */
function calculateMetrics(sprintInfo, issues) {
    const totalIssues = issues.length;

    // Status categorization
    const statusGroups = categorizeByStatus(issues);
    const completedIssues = statusGroups.done.length;
    const inProgressIssues = statusGroups.inProgress.length;
    const todoIssues = statusGroups.todo.length;

    // Story points
    const storyPoints = calculateStoryPoints(issues, statusGroups);

    // Team metrics
    const teamMetrics = calculateTeamMetrics(issues);

    // Time metrics
    const timeMetrics = calculateTimeMetrics(sprintInfo, issues);

    // Blocker count
    const blockedCount = issues.filter(i =>
        i.fields.status?.statusCategory?.key === 'indeterminate' &&
        isStuckIssue(i)
    ).length;

    return {
        totalIssues,
        completedIssues,
        inProgressIssues,
        todoIssues,
        blockedCount,
        ...storyPoints,
        teamMetrics,
        ...timeMetrics
    };
}

/**
 * Categorize issues by status
 */
function categorizeByStatus(issues) {
    const groups = {
        done: [],
        inProgress: [],
        todo: []
    };

    issues.forEach(issue => {
        const category = issue.fields.status?.statusCategory?.key;
        switch (category) {
            case 'done':
                groups.done.push(issue);
                break;
            case 'indeterminate':
                groups.inProgress.push(issue);
                break;
            default:
                groups.todo.push(issue);
        }
    });

    return groups;
}

/**
 * Calculate story points metrics
 */
function calculateStoryPoints(issues, statusGroups) {
    const storyPointField = 'customfield_10016'; // Common story points field

    const getPoints = (issue) => {
        return issue.fields[storyPointField] || 0;
    };

    const totalPoints = issues.reduce((sum, i) => sum + getPoints(i), 0);
    const completedPoints = statusGroups.done.reduce((sum, i) => sum + getPoints(i), 0);
    const inProgressPoints = statusGroups.inProgress.reduce((sum, i) => sum + getPoints(i), 0);
    const remainingPoints = totalPoints - completedPoints;

    return {
        totalPoints,
        completedPoints,
        inProgressPoints,
        remainingPoints,
        progressPercentage: totalPoints > 0
            ? Math.round((completedPoints / totalPoints) * 100)
            : 0
    };
}

/**
 * Calculate team workload metrics
 */
function calculateTeamMetrics(issues) {
    const memberMap = new Map();

    issues.forEach(issue => {
        const assignee = issue.fields.assignee;
        if (!assignee) return;

        const memberId = assignee.accountId;
        const current = memberMap.get(memberId) || {
            id: memberId,
            name: assignee.displayName,
            avatar: assignee.avatarUrls?.['24x24'],
            tasks: [],
            points: 0
        };

        current.tasks.push(issue.key);
        current.points += issue.fields['customfield_10016'] || 0;
        memberMap.set(memberId, current);
    });

    const members = Array.from(memberMap.values()).map(m => ({
        ...m,
        taskCount: m.tasks.length,
        load: calculateLoad(m.points),
    }));

    // Sort by load (descending)
    members.sort((a, b) => b.load - a.load);

    return {
        memberCount: members.length,
        members,
        averageLoad: members.length > 0
            ? Math.round(members.reduce((sum, m) => sum + m.load, 0) / members.length)
            : 0,
        overloadedCount: members.filter(m => m.load > 100).length,
        underutilizedCount: members.filter(m => m.load < 50).length
    };
}

/**
 * Calculate member load percentage
 * Assumes ~20 points per sprint per developer
 */
function calculateLoad(points) {
    const standardCapacity = 20;
    return Math.round((points / standardCapacity) * 100);
}

/**
 * Calculate time-based metrics
 */
function calculateTimeMetrics(sprintInfo, issues) {
    const startDate = parseISO(sprintInfo.startDate);
    const endDate = parseISO(sprintInfo.endDate);
    const now = new Date();

    const totalDays = differenceInDays(endDate, startDate);
    const elapsedDays = differenceInDays(now, startDate);
    const remainingDays = differenceInDays(endDate, now);

    // Calculate ideal progress
    const idealProgress = totalDays > 0
        ? Math.round((elapsedDays / totalDays) * 100)
        : 0;

    return {
        totalDays,
        elapsedDays,
        remainingDays,
        idealProgress,
        isOnTrack: (progressPercentage) => progressPercentage >= idealProgress - 10
    };
}

/**
 * Check if issue is stuck (no activity for 2+ days)
 */
function isStuckIssue(issue) {
    const lastUpdate = parseISO(issue.fields.updated);
    const daysSinceUpdate = differenceInDays(new Date(), lastUpdate);
    return daysSinceUpdate >= 2;
}

/**
 * Calculate overall health score (0-100)
 */
function calculateHealthScore(metrics) {
    const scores = {};

    // Progress on track (0-100)
    scores.progressOnTrack = Math.min(100,
        (metrics.progressPercentage / Math.max(1, metrics.idealProgress)) * 100
    );

    // No blockers (100 = no blockers, decreases with blockers)
    scores.noBlockers = Math.max(0, 100 - (metrics.blockedCount * 20));

    // Team balance (100 = balanced, decreases with imbalance)
    const imbalancePenalty = (metrics.teamMetrics.overloadedCount * 15) +
        (metrics.teamMetrics.underutilizedCount * 5);
    scores.teamBalance = Math.max(0, 100 - imbalancePenalty);

    // Velocity trend (placeholder - needs historical data)
    scores.velocityTrend = 70; // Default neutral

    // Scope stability (placeholder - needs change tracking)
    scores.scopeStability = 80; // Default good

    // Estimation accuracy (placeholder - needs historical data)
    scores.estimationAccuracy = 75; // Default neutral

    // Burndown health
    const burndownDeviation = Math.abs(metrics.progressPercentage - metrics.idealProgress);
    scores.burndownHealth = Math.max(0, 100 - burndownDeviation);

    // Weighted average
    let totalScore = 0;
    for (const [key, weight] of Object.entries(HEALTH_WEIGHTS)) {
        totalScore += (scores[key] || 0) * weight;
    }

    return Math.round(Math.max(0, Math.min(100, totalScore)));
}

/**
 * Determine health trend compared to previous metrics
 */
function determineHealthTrend(currentScore, previousMetrics) {
    if (!previousMetrics || !previousMetrics.healthScore) {
        return 'stable';
    }

    const diff = currentScore - previousMetrics.healthScore;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
}

/**
 * Store metrics for historical tracking
 */
async function storeMetrics(sprintId, metrics) {
    const key = `sprint_metrics_${sprintId}_${Date.now()}`;
    await storage.set(key, {
        ...metrics,
        timestamp: new Date().toISOString()
    });

    // Update latest metrics reference
    await storage.set(`sprint_metrics_latest_${sprintId}`, key);
}

/**
 * Get previous metrics for comparison
 */
async function getPreviousMetrics(sprintId) {
    const latestKey = await storage.get(`sprint_metrics_latest_${sprintId}`);
    if (!latestKey) return null;
    return storage.get(latestKey);
}

/**
 * Get sprint burndown data
 */
export async function getSprintBurndown(sprintId) {
    try {
        const [sprintInfo, issues] = await Promise.all([
            getSprintInfo(sprintId),
            getSprintIssues(sprintId)
        ]);

        const startDate = parseISO(sprintInfo.startDate);
        const endDate = parseISO(sprintInfo.endDate);
        const totalDays = differenceInDays(endDate, startDate);

        // Get total story points
        const storyPointField = 'customfield_10016';
        const totalPoints = issues.reduce((sum, i) =>
            sum + (i.fields[storyPointField] || 0), 0
        );

        // Generate ideal burndown line
        const ideal = [];
        for (let i = 0; i <= totalDays; i++) {
            ideal.push({
                day: i,
                remaining: Math.round(totalPoints * (1 - i / totalDays))
            });
        }

        // Calculate actual burndown (simplified - would need issue history)
        const completedPoints = issues
            .filter(i => i.fields.status?.statusCategory?.key === 'done')
            .reduce((sum, i) => sum + (i.fields[storyPointField] || 0), 0);

        const now = new Date();
        const currentDay = Math.min(totalDays, differenceInDays(now, startDate));

        return {
            totalPoints,
            completedPoints,
            remainingPoints: totalPoints - completedPoints,
            totalDays,
            currentDay,
            ideal,
            isOnTrack: completedPoints >= ideal[currentDay]?.remaining
        };
    } catch (error) {
        console.error('Error getting burndown data:', error);
        throw error;
    }
}

export default {
    getCurrentSprint,
    getSprintData,
    getSprintBurndown
};
