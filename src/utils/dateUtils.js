/**
 * 📅 Date Utilities
 */

export function getDaysRemaining(endDate) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function getDaysElapsed(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export function formatDate(date, format = 'short') {
    const d = new Date(date);
    if (format === 'short') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function isSprintActive(sprint) {
    const now = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    return now >= start && now <= end;
}

export function getSprintProgress(sprint) {
    const total = getDaysBetween(sprint.startDate, sprint.endDate);
    const elapsed = getDaysElapsed(sprint.startDate);
    return Math.min(100, Math.round((elapsed / total) * 100));
}

export default {
    getDaysRemaining,
    getDaysBetween,
    getDaysElapsed,
    formatDate,
    isSprintActive,
    getSprintProgress
};
