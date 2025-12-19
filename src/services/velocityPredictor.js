/**
 * 📈 Velocity Predictor Service
 * 
 * ML-inspired velocity prediction using historical
 * sprint data and current progress patterns.
 */

import { storage } from '@forge/api';
import api, { route } from '@forge/api';

// Configuration
const LOOKBACK_SPRINTS = 3;
const MIN_CONFIDENCE = 0.5;
const MAX_CONFIDENCE = 0.95;

/**
 * Predict sprint velocity and completion
 */
export async function predictVelocity(sprintId) {
    try {
        // Get current sprint data
        const currentData = await getCurrentSprintProgress(sprintId);

        // Get historical velocity data
        const historicalData = await getHistoricalVelocity(currentData.boardId);

        // Calculate predicted velocity
        const prediction = calculatePrediction(currentData, historicalData);

        // Store prediction for tracking
        await storePrediction(sprintId, prediction);

        return prediction;
    } catch (error) {
        console.error('Error predicting velocity:', error);
        return getDefaultPrediction();
    }
}

/**
 * Get current sprint progress
 */
async function getCurrentSprintProgress(sprintId) {
    // Get sprint info
    const sprintResponse = await api.asApp().requestJira(
        route`/rest/agile/1.0/sprint/${sprintId}`,
        { method: 'GET' }
    );
    const sprint = await sprintResponse.json();

    // Get issues
    const issuesResponse = await api.asApp().requestJira(
        route`/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=500`,
        { method: 'GET' }
    );
    const issuesData = await issuesResponse.json();
    const issues = issuesData.issues || [];

    // Calculate current velocity
    const storyPointField = 'customfield_10016';

    const totalPoints = issues.reduce((sum, i) =>
        sum + (i.fields[storyPointField] || 0), 0
    );

    const completedPoints = issues
        .filter(i => i.fields.status?.statusCategory?.key === 'done')
        .reduce((sum, i) => sum + (i.fields[storyPointField] || 0), 0);

    const inProgressPoints = issues
        .filter(i => i.fields.status?.statusCategory?.key === 'indeterminate')
        .reduce((sum, i) => sum + (i.fields[storyPointField] || 0), 0);

    // Calculate time progress
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const now = new Date();

    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const elapsedDays = Math.max(0, (now - startDate) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, (endDate - now) / (1000 * 60 * 60 * 24));

    const timeProgress = Math.min(1, elapsedDays / totalDays);

    return {
        sprintId,
        boardId: sprint.originBoardId,
        totalPoints,
        completedPoints,
        inProgressPoints,
        remainingPoints: totalPoints - completedPoints,
        timeProgress,
        elapsedDays,
        remainingDays,
        totalDays,
        issueCount: issues.length,
        completedCount: issues.filter(i => i.fields.status?.statusCategory?.key === 'done').length
    };
}

/**
 * Get historical velocity from past sprints
 */
async function getHistoricalVelocity(boardId) {
    try {
        // Get closed sprints
        const response = await api.asApp().requestJira(
            route`/rest/agile/1.0/board/${boardId}/sprint?state=closed&maxResults=${LOOKBACK_SPRINTS}`,
            { method: 'GET' }
        );
        const data = await response.json();
        const sprints = data.values || [];

        if (sprints.length === 0) {
            return null;
        }

        // Get velocity for each sprint
        const velocities = await Promise.all(
            sprints.map(async (sprint) => {
                const issuesResponse = await api.asApp().requestJira(
                    route`/rest/agile/1.0/sprint/${sprint.id}/issue?maxResults=500`,
                    { method: 'GET' }
                );
                const issuesData = await issuesResponse.json();
                const issues = issuesData.issues || [];

                const storyPointField = 'customfield_10016';
                const completedPoints = issues
                    .filter(i => i.fields.status?.statusCategory?.key === 'done')
                    .reduce((sum, i) => sum + (i.fields[storyPointField] || 0), 0);

                const totalPoints = issues.reduce((sum, i) =>
                    sum + (i.fields[storyPointField] || 0), 0
                );

                return {
                    sprintId: sprint.id,
                    sprintName: sprint.name,
                    completedPoints,
                    totalPoints,
                    completionRate: totalPoints > 0 ? completedPoints / totalPoints : 0
                };
            })
        );

        // Calculate averages
        const avgVelocity = velocities.reduce((sum, v) => sum + v.completedPoints, 0) / velocities.length;
        const avgCompletionRate = velocities.reduce((sum, v) => sum + v.completionRate, 0) / velocities.length;

        // Calculate velocity trend
        const trend = calculateTrend(velocities.map(v => v.completedPoints));

        return {
            sprints: velocities,
            avgVelocity,
            avgCompletionRate,
            trend,
            dataPoints: velocities.length
        };
    } catch (error) {
        console.error('Error getting historical velocity:', error);
        return null;
    }
}

/**
 * Calculate prediction based on current and historical data
 */
function calculatePrediction(current, historical) {
    // If no historical data, use simple linear projection
    if (!historical) {
        return simpleProjection(current);
    }

    // Calculate multiple prediction models
    const predictions = [];

    // Model 1: Linear velocity projection
    const linearPrediction = linearVelocityProjection(current, historical);
    predictions.push({ value: linearPrediction, weight: 0.3 });

    // Model 2: Historical completion rate
    const historyPrediction = historicalRatePrediction(current, historical);
    predictions.push({ value: historyPrediction, weight: 0.3 });

    // Model 3: Current burn rate
    const burnRatePrediction = burnRateProjection(current);
    predictions.push({ value: burnRatePrediction, weight: 0.25 });

    // Model 4: In-progress consideration
    const inProgressPrediction = inProgressProjection(current);
    predictions.push({ value: inProgressPrediction, weight: 0.15 });

    // Weighted average
    const predictedCompletion = predictions.reduce(
        (sum, p) => sum + (p.value * p.weight), 0
    );

    // Calculate confidence
    const confidence = calculateConfidence(current, historical, predictions);

    // Determine trend
    const trend = determineTrend(current, historical);

    return {
        current: current.completedPoints,
        predicted: Math.round(predictedCompletion * current.totalPoints / 100),
        completionPercentage: Math.round(Math.min(100, Math.max(0, predictedCompletion))),
        confidence,
        trend,
        factors: generateFactors(current, historical),
        models: predictions.map((p, i) => ({
            name: ['Linear', 'Historical', 'BurnRate', 'InProgress'][i],
            prediction: Math.round(p.value),
            weight: p.weight
        }))
    };
}

/**
 * Simple linear projection when no history available
 */
function simpleProjection(current) {
    if (current.timeProgress === 0) {
        return {
            current: 0,
            predicted: 0,
            completionPercentage: 0,
            confidence: MIN_CONFIDENCE,
            trend: 'unknown',
            factors: ['No historical data available']
        };
    }

    const currentRate = current.completedPoints / current.timeProgress;
    const predicted = Math.round(currentRate);
    const completion = current.totalPoints > 0
        ? (predicted / current.totalPoints) * 100
        : 0;

    return {
        current: current.completedPoints,
        predicted,
        completionPercentage: Math.round(Math.min(100, completion)),
        confidence: 0.6,
        trend: 'unknown',
        factors: ['Prediction based on current sprint progress only']
    };
}

/**
 * Linear velocity projection
 */
function linearVelocityProjection(current, historical) {
    if (current.timeProgress === 0) return 0;

    // Current velocity rate
    const currentVelocityRate = current.completedPoints / current.elapsedDays;

    // Predicted end velocity
    const predictedVelocity = currentVelocityRate * current.totalDays;

    // As percentage of commitment
    return current.totalPoints > 0
        ? (predictedVelocity / current.totalPoints) * 100
        : 0;
}

/**
 * Historical rate-based prediction
 */
function historicalRatePrediction(current, historical) {
    // Use historical completion rate applied to current commitment
    const predictedCompletion = historical.avgCompletionRate * 100;

    // Adjust based on historical trend
    const trendAdjustment = historical.trend === 'improving' ? 5
        : historical.trend === 'declining' ? -5
            : 0;

    return predictedCompletion + trendAdjustment;
}

/**
 * Burn rate projection
 */
function burnRateProjection(current) {
    if (current.elapsedDays === 0) return 0;

    // Daily burn rate
    const dailyRate = current.completedPoints / current.elapsedDays;

    // Project to end
    const projectedTotal = dailyRate * current.totalDays;

    return current.totalPoints > 0
        ? (projectedTotal / current.totalPoints) * 100
        : 0;
}

/**
 * In-progress work consideration
 */
function inProgressProjection(current) {
    // Assume 70% of in-progress work will complete
    const inProgressCompletion = current.inProgressPoints * 0.7;
    const projectedTotal = current.completedPoints + inProgressCompletion;

    return current.totalPoints > 0
        ? (projectedTotal / current.totalPoints) * 100
        : 0;
}

/**
 * Calculate prediction confidence
 */
function calculateConfidence(current, historical, predictions) {
    let confidence = 0.5;

    // More historical data = higher confidence
    if (historical) {
        confidence += historical.dataPoints * 0.05;
    }

    // More time elapsed = higher confidence
    confidence += current.timeProgress * 0.2;

    // Low variance in predictions = higher confidence
    const values = predictions.map(p => p.value);
    const variance = calculateVariance(values);
    if (variance < 100) confidence += 0.1;
    if (variance < 50) confidence += 0.1;

    // Cap confidence
    return Math.min(MAX_CONFIDENCE, Math.max(MIN_CONFIDENCE, confidence));
}

/**
 * Calculate variance of values
 */
function calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

/**
 * Calculate velocity trend from historical data
 */
function calculateTrend(velocities) {
    if (velocities.length < 2) return 'stable';

    // Simple linear regression
    const n = velocities.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    velocities.forEach((v, i) => {
        sumX += i;
        sumY += v;
        sumXY += i * v;
        sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (slope > 1) return 'improving';
    if (slope < -1) return 'declining';
    return 'stable';
}

/**
 * Determine current sprint trend
 */
function determineTrend(current, historical) {
    if (!historical) return 'unknown';

    const expectedProgress = current.timeProgress * historical.avgCompletionRate;
    const actualProgress = current.totalPoints > 0
        ? current.completedPoints / current.totalPoints
        : 0;

    if (actualProgress > expectedProgress + 0.1) return 'ahead';
    if (actualProgress < expectedProgress - 0.1) return 'behind';
    return 'on_track';
}

/**
 * Generate human-readable factors affecting prediction
 */
function generateFactors(current, historical) {
    const factors = [];

    if (historical) {
        if (historical.trend === 'improving') {
            factors.push('📈 Team velocity is improving');
        } else if (historical.trend === 'declining') {
            factors.push('📉 Team velocity is declining');
        }
    }

    const progress = current.totalPoints > 0
        ? current.completedPoints / current.totalPoints
        : 0;

    if (progress > current.timeProgress + 0.1) {
        factors.push('🚀 Ahead of schedule');
    } else if (progress < current.timeProgress - 0.1) {
        factors.push('⚠️ Behind schedule');
    }

    if (current.inProgressPoints > 0) {
        factors.push(`🔄 ${current.inProgressPoints} points in progress`);
    }

    if (current.remainingDays <= 2) {
        factors.push('⏰ Sprint ending soon');
    }

    return factors.length > 0 ? factors : ['📊 On track for typical completion'];
}

/**
 * Get default prediction fallback
 */
function getDefaultPrediction() {
    return {
        current: 0,
        predicted: 0,
        completionPercentage: 0,
        confidence: MIN_CONFIDENCE,
        trend: 'unknown',
        factors: ['Unable to generate prediction']
    };
}

/**
 * Store prediction for tracking
 */
async function storePrediction(sprintId, prediction) {
    const key = `velocity_prediction_${sprintId}_${Date.now()}`;
    await storage.set(key, {
        ...prediction,
        timestamp: new Date().toISOString()
    });
}

export default {
    predictVelocity
};
