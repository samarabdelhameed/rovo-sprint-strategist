/**
 * 📋 Generate Standup Action
 */

import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { getCurrentSprint } from '../services/sprintAnalyzer';

const resolver = new Resolver();

resolver.define('generateStandupAction', async ({ payload, context }) => {
    const { cloudId } = context;
    const { sprintId } = payload || {};

    try {
        const sprint = sprintId ? { id: sprintId } : await getCurrentSprint(cloudId);
        if (!sprint) {
            return { success: false, error: 'No active sprint found' };
        }

        const issuesResponse = await api.asApp().requestJira(
            route`/rest/agile/1.0/sprint/${sprint.id}/issue?maxResults=200`,
            { method: 'GET' }
        );
        const data = await issuesResponse.json();
        const issues = data.issues || [];

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const completed = issues.filter(i => {
            const updated = new Date(i.fields.updated);
            return i.fields.status?.statusCategory?.key === 'done' &&
                updated >= yesterday;
        });

        const inProgress = issues.filter(i =>
            i.fields.status?.statusCategory?.key === 'indeterminate'
        );

        const blockers = issues.filter(i => {
            const daysSince = (new Date() - new Date(i.fields.updated)) / (1000 * 60 * 60 * 24);
            return daysSince >= 2 && i.fields.status?.statusCategory?.key !== 'done';
        });

        return {
            success: true,
            date: new Date().toISOString().split('T')[0],
            sprint: sprint.name,
            completed: completed.map(i => ({ key: i.key, summary: i.fields.summary })),
            inProgress: inProgress.map(i => ({
                key: i.key,
                summary: i.fields.summary,
                assignee: i.fields.assignee?.displayName
            })),
            blockers: blockers.map(i => ({ key: i.key, summary: i.fields.summary })),
            stats: {
                completedCount: completed.length,
                inProgressCount: inProgress.length,
                blockerCount: blockers.length
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

export const handler = resolver.getDefinitions();
