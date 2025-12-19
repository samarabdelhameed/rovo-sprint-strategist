/**
 * 🏃 Sprint Started Trigger
 */

import { storage } from '@forge/api';

export async function handler(event, context) {
    const { sprint } = event;

    try {
        // Initialize sprint tracking
        await storage.set(`sprint_${sprint.id}_started`, {
            id: sprint.id,
            name: sprint.name,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            timestamp: new Date().toISOString()
        });

        // Reset metrics
        await storage.set(`sprint_metrics_latest_${sprint.id}`, null);

        console.log(`Sprint started: ${sprint.name}`);
    } catch (error) {
        console.error('Sprint started trigger error:', error);
    }
}
