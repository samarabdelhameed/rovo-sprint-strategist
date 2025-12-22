/**
 * 🤖 AI Service - Free Local AI + Anthropic Claude Integration
 */
import Anthropic from '@anthropic-ai/sdk';
import FreeAiService from './freeAiService.js';

const anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

// Initialize Free AI Service
const freeAI = new FreeAiService();

/**
 * Generate sprint analysis using AI
 */
export async function analyzeSprintWithAI(sprintData) {
    // Try Free AI Service first
    if (freeAI.isHealthy()) {
        try {
            const result = await freeAI.generateRecommendations(sprintData);
            if (result.success) {
                return {
                    summary: `تحليل السبرينت: معدل الإنجاز ${result.analysis.completionRate}% من ${result.analysis.totalTasks} مهمة`,
                    riskLevel: result.analysis.completionRate >= 70 ? 'low' : 
                              result.analysis.completionRate >= 50 ? 'medium' : 'high',
                    insights: result.recommendations.map(r => r.description),
                    recommendations: result.recommendations.map(r => ({
                        title: r.title,
                        priority: r.priority === 'high' ? 1 : r.priority === 'medium' ? 2 : 3,
                        impact: r.description
                    }))
                };
            }
        } catch (error) {
            console.error('Free AI Service Error:', error);
        }
    }

    // Fallback to Anthropic if available
    if (!anthropic) {
        return getFallbackAnalysis(sprintData);
    }

    try {
        const prompt = buildSprintAnalysisPrompt(sprintData);

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        });

        const content = response.content[0].text;
        return parseAIResponse(content);
    } catch (error) {
        console.error('AI Analysis Error:', error);
        return getFallbackAnalysis(sprintData);
    }
}

/**
 * Generate pit-stop recommendations
 */
export async function generatePitStopRecommendations(sprintData) {
    // Try Free AI Service first
    if (freeAI.isHealthy()) {
        try {
            const result = await freeAI.generateRecommendations(sprintData);
            if (result.success) {
                return result.recommendations.map(r => ({
                    type: r.action || 'improve_process',
                    title: r.title,
                    description: r.description,
                    impact: `تحسين متوقع: ${r.impact}`,
                    affectedIssues: []
                }));
            }
        } catch (error) {
            console.error('Free AI Pit-Stop Error:', error);
        }
    }

    // Fallback to Anthropic if available
    if (!anthropic) {
        return getFallbackRecommendations(sprintData);
    }

    try {
        const prompt = buildPitStopPrompt(sprintData);

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        });

        const content = response.content[0].text;
        return parsePitStopResponse(content);
    } catch (error) {
        console.error('Pit-Stop AI Error:', error);
        return getFallbackRecommendations(sprintData);
    }
}

/**
 * Generate standup summary using AI
 */
export async function generateStandupSummary(sprintData, activities) {
    // Try Free AI Service first
    if (freeAI.isHealthy()) {
        try {
            const result = await freeAI.processChat(
                'قم بإنشاء ملخص للاجتماع اليومي', 
                { sprintData, activities }
            );
            if (result.success) {
                return result.response;
            }
        } catch (error) {
            console.error('Free AI Standup Error:', error);
        }
    }

    // Fallback to Anthropic if available
    if (!anthropic) {
        return getFallbackStandup(sprintData, activities);
    }

    try {
        const prompt = buildStandupPrompt(sprintData, activities);

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        });

        return response.content[0].text;
    } catch (error) {
        console.error('Standup AI Error:', error);
        return getFallbackStandup(sprintData, activities);
    }
}

/**
 * AI Chat functionality - NEW!
 */
export async function processAIChat(message, context = {}) {
    // Use Free AI Service for chat
    if (freeAI.isHealthy()) {
        try {
            const result = await freeAI.processChat(message, context);
            if (result.success) {
                return {
                    success: true,
                    response: result.response,
                    intent: result.intent,
                    timestamp: result.timestamp
                };
            }
        } catch (error) {
            console.error('Free AI Chat Error:', error);
        }
    }

    // Fallback to Anthropic if available
    if (anthropic) {
        try {
            const response = await anthropic.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 512,
                messages: [{ 
                    role: 'user', 
                    content: `You are a smart assistant for sprint management. Answer this question in English: ${message}` 
                }]
            });

            return {
                success: true,
                response: response.content[0].text,
                intent: 'general',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Anthropic Chat Error:', error);
        }
    }

    // Final fallback
    return {
        success: false,
        response: 'Sorry, AI service is currently unavailable. Please try again later.',
        error: 'AI service unavailable'
    };
}

/**
 * Risk Analysis - NEW!
 */
export async function analyzeRisks(sprintData) {
    // Use Free AI Service for risk analysis
    if (freeAI.isHealthy()) {
        try {
            const result = await freeAI.analyzeRisks(sprintData);
            if (result.success) {
                return result;
            }
        } catch (error) {
            console.error('Free AI Risk Analysis Error:', error);
        }
    }

    // Fallback risk analysis
    return {
        success: true,
        riskScore: 50,
        risks: [
            {
                id: 'general_risk',
                title: 'General Risk',
                description: 'Basic risk analysis available',
                severity: 'medium'
            }
        ],
        recommendations: ['Regular risk review'],
        analysis: {
            totalRisks: 1,
            highRisks: 0,
            mediumRisks: 1,
            lowRisks: 0
        }
    };
}

/**
 * Get AI Service Status
 */
export function getAIServiceStatus() {
    if (freeAI.isHealthy()) {
        return {
            status: 'active',
            provider: 'Free Local AI',
            features: ['Smart Recommendations', 'AI Chat', 'Risk Analysis'],
            cost: 'Free'
        };
    } else if (anthropic) {
        return {
            status: 'active',
            provider: 'Anthropic Claude',
            features: ['Advanced AI Analysis'],
            cost: 'Paid API'
        };
    } else {
        return {
            status: 'fallback',
            provider: 'Basic Analytics',
            features: ['Basic Analysis'],
            cost: 'Free'
        };
    }
}

// =====================================================
// PROMPT BUILDERS
// =====================================================

function buildSprintAnalysisPrompt(data) {
    return `You are a Sprint Strategist AI, inspired by F1 race strategy. Analyze this sprint data and provide insights:

Sprint: ${data.name}
Health Score: ${data.healthScore}/100
Completion: ${data.completionPercentage}%
Velocity: ${data.velocity} points
Blockers: ${data.blockersCount}
Days Remaining: ${data.daysRemaining}

Team Load:
${data.teamMetrics?.map(m => `- ${m.name}: ${m.load}% load, ${m.taskCount} tasks`).join('\n') || 'No data'}

Issues:
- Total: ${data.issuesTotal}
- Completed: ${data.issuesCompleted}
- In Progress: ${data.issuesInProgress}
- Blocked: ${data.blockersCount}

Provide a JSON response with:
{
    "summary": "Brief 1-2 sentence summary",
    "riskLevel": "low|medium|high|critical",
    "insights": ["insight1", "insight2", "insight3"],
    "recommendations": [
        {"title": "...", "priority": 1, "impact": "..."}
    ]
}`;
}

function buildPitStopPrompt(data) {
    return `As an F1-inspired Sprint Strategist, analyze this sprint and suggest pit-stop interventions:

Sprint Health: ${data.healthScore}/100
Completion: ${data.completionPercentage}%
Days Remaining: ${data.daysRemaining}
Blockers: ${data.blockersCount}

Issues at risk:
${data.issues?.filter(i => i.status === 'blocked' || i.priority === 'critical')
            .map(i => `- ${i.key}: ${i.title} (${i.status}, ${i.story_points} pts, assigned to ${i.assignee?.name || 'Unassigned'})`)
            .join('\n') || 'None'}

Overloaded team members:
${data.teamMetrics?.filter(m => m.load > 100)
            .map(m => `- ${m.name}: ${m.load}% load`)
            .join('\n') || 'None'}

Provide 3 specific pit-stop recommendations as JSON:
{
    "recommendations": [
        {
            "type": "remove_scope|reassign|split_task|escalate",
            "title": "Short action title",
            "description": "Detailed explanation",
            "impact": "Expected impact percentage",
            "affectedIssues": ["PROJ-XXX"]
        }
    ]
}`;
}

function buildStandupPrompt(data, activities) {
    return `Generate a daily standup summary for Sprint ${data.name}:

Recent Activities:
${activities?.slice(0, 10).map(a => `- ${a.member?.name || 'Team'}: ${a.description}`).join('\n') || 'No recent activities'}

Current Sprint Status:
- Health: ${data.healthScore}/100
- Day: ${data.dayNumber} of ${data.totalDays}
- Completion: ${data.completionPercentage}%

Generate a concise standup summary with:
1. ✅ What was completed yesterday
2. 🔄 What's in progress today
3. 🚫 Current blockers
4. 📊 Sprint health update`;
}

// =====================================================
// RESPONSE PARSERS
// =====================================================

function parseAIResponse(content) {
    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Failed to parse AI response:', e);
    }
    return { summary: content, riskLevel: 'medium', insights: [], recommendations: [] };
}

function parsePitStopResponse(content) {
    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.recommendations || [];
        }
    } catch (e) {
        console.error('Failed to parse pit-stop response:', e);
    }
    return [];
}

// =====================================================
// FALLBACK LOGIC (When AI is not available)
// =====================================================

function getFallbackAnalysis(data) {
    const riskLevel = data.healthScore >= 70 ? 'low'
        : data.healthScore >= 50 ? 'medium'
            : data.healthScore >= 30 ? 'high' : 'critical';

    const insights = [];

    if (data.blockersCount > 0) {
        insights.push(`${data.blockersCount} blocked issue(s) requiring immediate attention`);
    }
    if (data.completionPercentage < data.idealProgress) {
        insights.push(`Sprint is ${data.idealProgress - data.completionPercentage}% behind schedule`);
    }
    if (data.teamMetrics?.some(m => m.load > 100)) {
        insights.push('Some team members are overloaded');
    }

    return {
        summary: `Sprint health is at ${data.healthScore}% with ${data.daysRemaining} days remaining.`,
        riskLevel,
        insights,
        recommendations: getFallbackRecommendations(data)
    };
}

function getFallbackRecommendations(data) {
    const recommendations = [];

    if (data.blockersCount > 0) {
        recommendations.push({
            type: 'escalate',
            title: 'Address blocked issues immediately',
            description: `${data.blockersCount} issue(s) are currently blocked and need attention.`,
            priority: 1,
            impact: '+10% completion probability'
        });
    }

    const overloaded = data.teamMetrics?.filter(m => m.load > 100) || [];
    if (overloaded.length > 0) {
        recommendations.push({
            type: 'reassign',
            title: `Rebalance workload for ${overloaded.map(m => m.name).join(', ')}`,
            description: 'Some team members are over capacity. Consider reassigning tasks.',
            priority: 2,
            impact: 'Improved team morale and velocity'
        });
    }

    if (data.completionPercentage < 50 && data.daysRemaining <= 3) {
        recommendations.push({
            type: 'remove_scope',
            title: 'Consider reducing sprint scope',
            description: 'With limited time remaining, moving lower priority items may improve success rate.',
            priority: 1,
            impact: '+15% completion probability'
        });
    }

    return recommendations;
}

function getFallbackStandup(data, activities) {
    const completed = activities?.filter(a => a.action === 'completed').slice(0, 3) || [];
    const inProgress = data.issues?.filter(i => i.status === 'in_progress').slice(0, 3) || [];
    const blockers = data.issues?.filter(i => i.status === 'blocked') || [];

    return `# 📋 Daily Standup - ${data.name}

## ✅ Completed Yesterday
${completed.length > 0
            ? completed.map(a => `- ${a.description}`).join('\n')
            : '- No completions yesterday'}

## 🔄 In Progress Today
${inProgress.length > 0
            ? inProgress.map(i => `- ${i.key}: ${i.title}`).join('\n')
            : '- No items in progress'}

## 🚫 Blockers
${blockers.length > 0
            ? blockers.map(i => `- ${i.key}: ${i.blocked_reason || 'Reason not specified'}`).join('\n')
            : '- No blockers 🎉'}

## 📊 Sprint Status
- Health Score: ${data.healthScore}/100
- Completion: ${data.completionPercentage}%
- Days Remaining: ${data.daysRemaining}`;
}

export default {
    analyzeSprintWithAI,
    generatePitStopRecommendations,
    generateStandupSummary,
    processAIChat,
    analyzeRisks,
    getAIServiceStatus
};
