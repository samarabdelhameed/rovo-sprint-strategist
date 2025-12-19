/**
 * 📡 Issue Created Trigger
 */

import { storage } from '@forge/api';

export async function handler(event, context) {
    const { issue } = event;

    try {
        const sprintField = issue.fields?.sprint;
        if (sprintField?.state === 'active') {
            await logEvent(sprintField.id, 'issue_created', {
                issueKey: issue.key,
                summary: issue.fields?.summary,
                storyPoints: issue.fields?.['customfield_10016'] || 0
            });
        }
    } catch (error) {
        console.error('Issue created trigger error:', error);
    }
}

async function logEvent(sprintId, eventType, data) {
    const key = `events_${sprintId}`;
    const events = await storage.get(key) || [];
    events.push({ type: eventType, data, timestamp: new Date().toISOString() });
    await storage.set(key, events.slice(-100));
}
