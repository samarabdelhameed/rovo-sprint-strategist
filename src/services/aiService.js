/**
 * 🤖 AI Service - External AI Integration
 */

import api from '@forge/api';

const AI_CONFIG = {
    anthropic: {
        url: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-sonnet-20240229'
    },
    openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4-turbo-preview'
    }
};

const getProvider = () => process.env.AI_PROVIDER || 'anthropic';

export async function generateRecommendations(context) {
    try {
        const prompt = `Analyze sprint: Health ${context.health?.score}/100, 
      ${context.blockers?.length || 0} blockers, 
      ${context.velocity?.completionPercentage || 0}% complete.
      Provide 3 actionable recommendations.`;

        const response = await callAI(prompt);
        return parseResponse(response);
    } catch (error) {
        return getFallbackRecommendations(context);
    }
}

async function callAI(prompt) {
    const provider = getProvider();
    const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];

    if (!apiKey) return null;

    const config = AI_CONFIG[provider];
    const response = await api.fetch(config.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(provider === 'anthropic'
                ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
                : { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify(
            provider === 'anthropic'
                ? { model: config.model, max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }
                : { model: config.model, max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }
        )
    });

    const data = await response.json();
    return provider === 'anthropic'
        ? data.content?.[0]?.text
        : data.choices?.[0]?.message?.content;
}

function parseResponse(response) {
    try {
        const match = response?.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]).recommendations || [] : [];
    } catch { return []; }
}

function getFallbackRecommendations(context) {
    const recs = [];
    if (context.blockers?.length > 0) {
        recs.push({ title: 'Address Blockers', priority: 1 });
    }
    if (context.team?.overloadedCount > 0) {
        recs.push({ title: 'Rebalance Workload', priority: 2 });
    }
    return recs;
}

export default { generateRecommendations };
