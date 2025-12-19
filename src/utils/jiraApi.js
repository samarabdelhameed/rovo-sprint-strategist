/**
 * 🔧 Jira API Helpers
 */

import api, { route } from '@forge/api';

export async function getBoards() {
    const response = await api.asApp().requestJira(route`/rest/agile/1.0/board`, { method: 'GET' });
    const data = await response.json();
    return data.values || [];
}

export async function getActiveSprints(boardId) {
    const response = await api.asApp().requestJira(
        route`/rest/agile/1.0/board/${boardId}/sprint?state=active`,
        { method: 'GET' }
    );
    const data = await response.json();
    return data.values || [];
}

export async function getSprintIssues(sprintId, maxResults = 200) {
    const response = await api.asApp().requestJira(
        route`/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=${maxResults}`,
        { method: 'GET' }
    );
    const data = await response.json();
    return data.issues || [];
}

export async function getIssue(issueKey) {
    const response = await api.asApp().requestJira(
        route`/rest/api/3/issue/${issueKey}`,
        { method: 'GET' }
    );
    return response.json();
}

export async function updateIssue(issueKey, fields) {
    const response = await api.asApp().requestJira(
        route`/rest/api/3/issue/${issueKey}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields })
        }
    );
    return response.ok;
}

export async function transitionIssue(issueKey, transitionId) {
    const response = await api.asApp().requestJira(
        route`/rest/api/3/issue/${issueKey}/transitions`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transition: { id: transitionId } })
        }
    );
    return response.ok;
}

export async function getProjectUsers(projectKey) {
    const response = await api.asApp().requestJira(
        route`/rest/api/3/user/assignable/search?project=${projectKey}`,
        { method: 'GET' }
    );
    return response.json();
}

export default {
    getBoards,
    getActiveSprints,
    getSprintIssues,
    getIssue,
    updateIssue,
    transitionIssue,
    getProjectUsers
};
