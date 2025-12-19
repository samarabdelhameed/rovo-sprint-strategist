/**
 * ⏰ Scheduled Analysis Trigger
 */

import api, { route } from '@forge/api';
import { getSprintData, getCurrentSprint } from '../services/sprintAnalyzer';
import { checkAlerts } from '../services/alertManager';
import { storage } from '@forge/api';

export async function dailyHandler(event, context) {
    try {
        console.log('Running daily analysis...');

        // Get all boards
        const boardsResponse = await api.asApp().requestJira(
            route`/rest/agile/1.0/board`,
            { method: 'GET' }
        );
        const boards = await boardsResponse.json();

        for (const board of boards.values || []) {
            if (board.type !== 'scrum') continue;

            // Get active sprint
            const sprintResponse = await api.asApp().requestJira(
                route`/rest/agile/1.0/board/${board.id}/sprint?state=active`,
                { method: 'GET' }
            );
            const sprints = await sprintResponse.json();

            for (const sprint of sprints.values || []) {
                const data = await getSprintData(sprint.id);
                await checkAlerts({ ...data, sprintId: sprint.id });

                await storage.set(`daily_analysis_${sprint.id}_${Date.now()}`, {
                    healthScore: data.healthScore,
                    progress: data.progressPercentage,
                    timestamp: new Date().toISOString()
                });
            }
        }

        console.log('Daily analysis complete');
    } catch (error) {
        console.error('Daily analysis error:', error);
    }
}

export async function healthCheckHandler(event, context) {
    try {
        const sprint = await getCurrentSprint();
        if (!sprint) return;

        const data = await getSprintData(sprint.id);

        if (data.healthScore < 40) {
            console.log(`CRITICAL: Sprint ${sprint.name} health at ${data.healthScore}`);
        }

        await checkAlerts({ ...data, sprintId: sprint.id });
    } catch (error) {
        console.error('Health check error:', error);
    }
}
