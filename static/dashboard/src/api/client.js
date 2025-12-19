/**
 * 🌐 API Client for Sprint Strategist
 * Handles all API calls to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Base fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// =====================================================
// HEALTH CHECK
// =====================================================

export async function checkHealth() {
    return fetchAPI('/api/health');
}

// =====================================================
// SPRINT ENDPOINTS
// =====================================================

export async function getActiveSprint() {
    return fetchAPI('/api/sprint');
}

export async function getSprintById(id) {
    return fetchAPI(`/api/sprint/${id}`);
}

export async function getBurndownData(sprintId) {
    return fetchAPI(`/api/sprint/${sprintId}/burndown`);
}

// =====================================================
// ISSUES ENDPOINTS
// =====================================================

export async function getAllIssues(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return fetchAPI(`/api/issues${params ? `?${params}` : ''}`);
}

export async function updateIssue(id, updates) {
    return fetchAPI(`/api/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
    });
}

// =====================================================
// TEAM ENDPOINTS
// =====================================================

export async function getTeamMembers() {
    return fetchAPI('/api/team');
}

export async function getTeamWorkload() {
    return fetchAPI('/api/team/workload');
}

// =====================================================
// METRICS ENDPOINTS
// =====================================================

export async function getCurrentMetrics() {
    return fetchAPI('/api/metrics');
}

export async function getMetricsHistory() {
    return fetchAPI('/api/metrics/history');
}

// =====================================================
// STANDUP ENDPOINTS
// =====================================================

export async function getTodayStandup() {
    return fetchAPI('/api/standup');
}

export async function getStandupHistory() {
    return fetchAPI('/api/standup/history');
}

// =====================================================
// PIT-STOP ENDPOINTS
// =====================================================

export async function getPitStopRecommendations() {
    return fetchAPI('/api/pitstop');
}

export async function applyPitStopRecommendation(id) {
    return fetchAPI(`/api/pitstop/${id}/apply`, {
        method: 'POST'
    });
}

// =====================================================
// LEADERBOARD ENDPOINTS
// =====================================================

export async function getLeaderboard() {
    return fetchAPI('/api/leaderboard');
}

// =====================================================
// ANALYTICS ENDPOINTS
// =====================================================

export async function getAnalytics() {
    return fetchAPI('/api/analytics');
}

// =====================================================
// ACTIVITIES ENDPOINTS
// =====================================================

export async function getRecentActivities() {
    return fetchAPI('/api/activities');
}

// =====================================================
// AI ENDPOINTS
// =====================================================

export async function getAIAnalysis() {
    return fetchAPI('/api/ai/analyze', {
        method: 'POST'
    });
}

export async function askRovoAI(question) {
    return fetchAPI('/api/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question })
    });
}

// =====================================================
// SETTINGS ENDPOINTS
// =====================================================

export async function getSettings() {
    return fetchAPI('/api/settings');
}

export async function updateSettings(settings) {
    return fetchAPI('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
    });
}

// =====================================================
// EXPORT DEFAULT CLIENT
// =====================================================

const api = {
    checkHealth,
    getActiveSprint,
    getSprintById,
    getBurndownData,
    getAllIssues,
    updateIssue,
    getTeamMembers,
    getTeamWorkload,
    getCurrentMetrics,
    getMetricsHistory,
    getTodayStandup,
    getStandupHistory,
    getPitStopRecommendations,
    applyPitStopRecommendation,
    getLeaderboard,
    getAnalytics,
    getRecentActivities,
    getAIAnalysis,
    askRovoAI,
    getSettings,
    updateSettings
};

export default api;
