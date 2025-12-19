/**
 * 📡 Issue Updated Trigger
 */

import { getSprintData } from '../services/sprintAnalyzer';
import { checkAlerts } from '../services/alertManager';
import { awardPoints } from '../services/gamificationService';
import { storage } from '@forge/api';

export async function handler(event, context) {
    const { issue, changelog } = event;

    try {
        // Check if issue is in active sprint
        const sprintField = issue.fields?.sprint;
        if (!sprintField || sprintField.state !== 'active') {
            return;
        }

        const sprintId = sprintField.id;

        // Check for status change
        const statusChange = changelog?.items?.find(c => c.field === 'status');
        if (statusChange) {
            await handleStatusChange(issue, statusChange, sprintId);
        }

        // Update sprint metrics
        const sprintData = await getSprintData(sprintId);

        // Check for alerts
        await checkAlerts({ ...sprintData, sprintId });

        // Log event
        await logEvent(sprintId, 'issue_updated', {
            issueKey: issue.key,
            changes: changelog?.items?.map(i => i.field)
        });

    } catch (error) {
        console.error('Issue updated trigger error:', error);
    }
}

async function handleStatusChange(issue, statusChange, sprintId) {
    const newStatus = statusChange.toString;
    const assignee = issue.fields?.assignee?.accountId;

    // Award points for completed task
    if (statusChange.to === 'done' || newStatus?.toLowerCase().includes('done')) {
        if (assignee) {
            const storyPoints = issue.fields?.['customfield_10016'] || 1;
            await awardPoints(assignee, 'task_complete', { storyPoints, sprintId });
        }
    }
}

async function logEvent(sprintId, eventType, data) {
    const key = `events_${sprintId}`;
    const events = await storage.get(key) || [];
    events.push({
        type: eventType,
        data,
        timestamp: new Date().toISOString()
    });
    // Keep last 100 events
    await storage.set(key, events.slice(-100));
}
