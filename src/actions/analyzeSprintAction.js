/**
 * 📊 Analyze Sprint Action
 */

import Resolver from '@forge/resolver';
import { getSprintData, getCurrentSprint } from '../services/sprintAnalyzer';

const resolver = new Resolver();

resolver.define('analyzeSprintAction', async ({ payload, context }) => {
    const { cloudId } = context;
    const { sprintId, includeRisks = true } = payload || {};

    try {
        const sprint = sprintId
            ? { id: sprintId }
            : await getCurrentSprint(cloudId);

        if (!sprint) {
            return { success: false, error: 'No active sprint found' };
        }

        const data = await getSprintData(sprint.id);

        return {
            success: true,
            healthScore: data.healthScore,
            healthStatus: getStatusLabel(data.healthScore),
            progress: {
                completed: data.completedIssues,
                inProgress: data.inProgressIssues,
                todo: data.todoIssues,
                total: data.totalIssues,
                percentage: data.progressPercentage
            },
            velocity: {
                current: data.completedPoints,
                committed: data.totalPoints,
                remaining: data.remainingPoints
            },
            team: data.teamMetrics,
            risks: includeRisks ? identifyRisks(data) : [],
            daysRemaining: data.remainingDays
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

function getStatusLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'At Risk';
    return 'Critical';
}

function identifyRisks(data) {
    const risks = [];

    if (data.blockedCount > 0) {
        risks.push({ type: 'blockers', severity: 'high', description: `${data.blockedCount} blocked issues` });
    }

    if (data.teamMetrics?.overloadedCount > 0) {
        risks.push({ type: 'overload', severity: 'medium', description: 'Team members overloaded' });
    }

    if (data.progressPercentage < data.idealProgress - 20) {
        risks.push({ type: 'velocity', severity: 'high', description: 'Behind schedule' });
    }

    return risks;
}

export const handler = resolver.getDefinitions();
