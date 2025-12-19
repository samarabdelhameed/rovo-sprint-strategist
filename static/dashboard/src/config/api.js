/**
 * API Configuration
 */

// API Base URL
export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  // Health
  health: '/api/health',

  // AI Chat
  aiChat: '/api/ai-chat',
  aiChatStatus: '/api/ai-chat/status',

  // Sprint
  sprintCurrent: '/api/sprint',
  sprintGoals: '/api/sprint-goals',

  // Recommendations
  recommendations: '/api/recommendations',
  recommendationsRisks: '/api/recommendations/risks',
  applyRecommendation: '/api/recommendations/apply',

  // Team
  team: '/api/team',
  teamMembers: '/api/team',

  // Project Setup
  projectSetup: '/api/project-setup',
  projectSetupTest: '/api/project-setup/test-connection',
  projectSetupDemo: '/api/project-setup/enable-demo',

  // Alert Settings
  alertSettings: '/api/alert-settings',
  testAlert: '/api/alert-settings/test',

  // Analytics
  analytics: '/api/analytics'
};

/**
 * Create full API URL
 */
export function createApiUrl(endpoint) {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * API fetch wrapper with error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = createApiUrl(endpoint);

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  createApiUrl,
  apiRequest
};