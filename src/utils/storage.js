/**
 * 💾 Forge Storage Helpers
 */

import { storage } from '@forge/api';

// Sprint data operations
export async function getSprintMetrics(sprintId) {
    return await storage.get(`sprint_metrics_${sprintId}`);
}

export async function saveSprintMetrics(sprintId, metrics) {
    await storage.set(`sprint_metrics_${sprintId}`, {
        ...metrics,
        updatedAt: new Date().toISOString()
    });
}

// User data operations
export async function getUserData(userId) {
    return await storage.get(`user_${userId}`) || { points: 0, badges: [] };
}

export async function saveUserData(userId, data) {
    await storage.set(`user_${userId}`, data);
}

// Alert operations
export async function getAlerts(sprintId) {
    return await storage.get(`alerts_${sprintId}`) || { alerts: [] };
}

export async function saveAlerts(sprintId, alerts) {
    await storage.set(`alerts_${sprintId}`, { alerts, updatedAt: new Date().toISOString() });
}

// Event log operations
export async function logEvent(sprintId, event) {
    const key = `events_${sprintId}`;
    const events = await storage.get(key) || [];
    events.push({ ...event, timestamp: new Date().toISOString() });
    await storage.set(key, events.slice(-500)); // Keep last 500
}

export async function getEvents(sprintId) {
    return await storage.get(`events_${sprintId}`) || [];
}

// Settings operations
export async function getSettings() {
    return await storage.get('app_settings') || getDefaultSettings();
}

export async function saveSettings(settings) {
    await storage.set('app_settings', settings);
}

function getDefaultSettings() {
    return {
        alertThreshold: 60,
        stuckTaskDays: 2,
        enableGamification: true,
        enableNotifications: true
    };
}

export default {
    getSprintMetrics,
    saveSprintMetrics,
    getUserData,
    saveUserData,
    getAlerts,
    saveAlerts,
    logEvent,
    getEvents,
    getSettings,
    saveSettings
};
