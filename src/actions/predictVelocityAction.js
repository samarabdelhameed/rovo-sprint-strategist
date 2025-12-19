/**
 * 📈 Predict Velocity Action
 */

import Resolver from '@forge/resolver';
import { predictVelocity } from '../services/velocityPredictor';
import { getCurrentSprint } from '../services/sprintAnalyzer';

const resolver = new Resolver();

resolver.define('predictVelocityAction', async ({ payload, context }) => {
    const { cloudId } = context;
    const { sprintId, confidence = true } = payload || {};

    try {
        const sprint = sprintId ? { id: sprintId } : await getCurrentSprint(cloudId);
        if (!sprint) {
            return { success: false, error: 'No active sprint found' };
        }

        const prediction = await predictVelocity(sprint.id);

        return {
            success: true,
            current: prediction.current,
            predicted: prediction.predicted,
            completionPercentage: prediction.completionPercentage,
            confidence: confidence ? prediction.confidence : undefined,
            trend: prediction.trend,
            factors: prediction.factors,
            recommendation: getRecommendation(prediction.completionPercentage)
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

function getRecommendation(completion) {
    if (completion >= 95) return '🏆 On track for full completion!';
    if (completion >= 80) return '👍 Good progress, minor adjustments may help';
    if (completion >= 60) return '⚠️ At risk - consider a pit-stop';
    return '🚨 Major adjustments needed';
}

export const handler = resolver.getDefinitions();
