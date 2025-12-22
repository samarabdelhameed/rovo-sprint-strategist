/**
 * 🔔 Alert Manager Service
 */

import api, { route, storage } from '@forge/api';

const ALERT_THRESHOLDS = {
    stuckDays: parseInt(process.env.STUCK_TASK_DAYS) || 2,
    healthScore: parseInt(process.env.ALERT_THRESHOLD) || 60,
    overloadPercent: parseInt(process.env.OVERLOAD_THRESHOLD) || 100
};

export async function checkAlerts(sprintData) {
    const alerts = [];

    // Health score alert
    if (sprintData.healthScore < ALERT_THRESHOLDS.healthScore) {
        alerts.push({
            type: 'sprint_risk',
            severity: sprintData.healthScore < 40 ? 'critical' : 'warning',
            title: 'Sprint Health Critical',
            message: `Health score dropped to ${sprintData.healthScore}/100`,
            actionRequired: true
        });
    }

    // Stuck tasks alert
    const stuckTasks = await getStuckTasks(sprintData.sprintId);
    if (stuckTasks.length > 0) {
        alerts.push({
            type: 'stuck_task',
            severity: 'warning',
            title: `${stuckTasks.length} Task(s) Stuck`,
            message: `Tasks unchanged for ${ALERT_THRESHOLDS.stuckDays}+ days`,
            items: stuckTasks.map(t => t.key)
        });
    }

    // Overload alert
    const overloaded = sprintData.teamMetrics?.members?.filter(
        m => m.load > ALERT_THRESHOLDS.overloadPercent
    ) || [];
    if (overloaded.length > 0) {
        alerts.push({
            type: 'overload',
            severity: 'warning',
            title: 'Team Members Overloaded',
            message: `${overloaded.length} member(s) at >100% capacity`,
            items: overloaded.map(m => m.name)
        });
    }

    await storeAlerts(sprintData.sprintId, alerts);
    return alerts;
}

async function getStuckTasks(sprintId) {
    const response = await api.asApp().requestJira(
        route`/rest/agile/1.0/sprint/${sprintId}/issue`,
        { method: 'GET' }
    );
    const data = await response.json();
    const issues = data.issues || [];

    const now = new Date();
    return issues.filter(issue => {
        const updated = new Date(issue.fields.updated);
        const daysSince = (now - updated) / (1000 * 60 * 60 * 24);
        return daysSince >= ALERT_THRESHOLDS.stuckDays &&
            issue.fields.status?.statusCategory?.key !== 'done';
    }).map(i => ({ key: i.key, summary: i.fields.summary }));
}

async function storeAlerts(sprintId, alerts) {
    await storage.set(`alerts_${sprintId}`, { alerts, timestamp: new Date().toISOString() });
}

export async function getActiveAlerts(sprintId) {
    return await storage.get(`alerts_${sprintId}`);
}

export default { checkAlerts, getActiveAlerts };
