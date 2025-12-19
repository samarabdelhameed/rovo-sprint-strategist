/**
 * 🏁 Suggest Pit-Stop Action
 */

import Resolver from '@forge/resolver';
import { getSprintData, getCurrentSprint } from '../services/sprintAnalyzer';
import { generateRecommendations } from '../services/aiService';

const resolver = new Resolver();

resolver.define('suggestPitStopAction', async ({ payload, context }) => {
    const { cloudId } = context;
    const { sprintId, urgency = 'medium' } = payload || {};

    try {
        const sprint = sprintId ? { id: sprintId } : await getCurrentSprint(cloudId);
        if (!sprint) {
            return { success: false, error: 'No active sprint found' };
        }

        const sprintData = await getSprintData(sprint.id);

        // Check if pit-stop is needed
        if (sprintData.healthScore >= 80 && sprintData.blockedCount === 0) {
            return {
                success: true,
                needed: false,
                message: '✅ No pit-stop needed - sprint running smoothly!',
                healthScore: sprintData.healthScore
            };
        }

        // Generate recommendations
        const recommendations = await generateRecommendations({
            health: { score: sprintData.healthScore },
            velocity: { completionPercentage: sprintData.progressPercentage },
            sprint: { daysRemaining: sprintData.remainingDays },
            blockers: [],
            team: sprintData.teamMetrics
        });

        return {
            success: true,
            needed: true,
            healthScore: sprintData.healthScore,
            recommendations: recommendations.length > 0
                ? recommendations
                : getDefaultRecommendations(sprintData),
            urgency: getUrgencyLevel(sprintData)
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

function getUrgencyLevel(data) {
    if (data.healthScore < 40) return 'critical';
    if (data.healthScore < 60) return 'high';
    if (data.blockedCount > 2) return 'high';
    return 'medium';
}

function getDefaultRecommendations(data) {
    const recs = [];

    if (data.blockedCount > 0) {
        recs.push({
            title: 'Unblock Issues',
            description: `${data.blockedCount} issues need attention`,
            impact: 'High',
            priority: 1
        });
    }

    if (data.teamMetrics?.overloadedCount > 0) {
        recs.push({
            title: 'Rebalance Workload',
            description: 'Some team members are overloaded',
            impact: 'Medium',
            priority: 2
        });
    }

    if (data.progressPercentage < 50 && data.remainingDays <= 3) {
        recs.push({
            title: 'Reduce Scope',
            description: 'Consider moving low-priority items to backlog',
            impact: 'High',
            priority: 1
        });
    }

    return recs;
}

export const handler = resolver.getDefinitions();
