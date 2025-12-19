/**
 * 🏆 Gamification Service
 */

import { storage } from '@forge/api';

const POINTS = {
    taskComplete: parseInt(process.env.POINTS_PER_STORY_POINT) || 10,
    estimationBonus: parseInt(process.env.ESTIMATION_BONUS) || 50,
    unblockBonus: 25,
    streakBonus: 15
};

const BADGES = [
    { id: 'pole_position', name: '🏎️ Pole Position', desc: 'First to complete a task', requirement: 'first_complete' },
    { id: 'champion', name: '🏆 Champion', desc: 'Highest velocity in sprint', requirement: 'highest_velocity' },
    { id: 'bullseye', name: '🎯 Bullseye', desc: '100% estimation accuracy', requirement: 'perfect_estimate' },
    { id: 'on_fire', name: '🔥 On Fire', desc: '5 tasks in one day', requirement: 'five_daily' },
    { id: 'team_player', name: '🤝 Team Player', desc: 'Helped unblock 3+ teammates', requirement: 'unblock_three' },
    { id: 'clean_code', name: '🧹 Clean Code', desc: 'Zero bugs in sprint', requirement: 'zero_bugs' }
];

export async function awardPoints(userId, action, context = {}) {
    const userData = await getUserData(userId);
    let pointsEarned = 0;

    switch (action) {
        case 'task_complete':
            pointsEarned = (context.storyPoints || 1) * POINTS.taskComplete;
            break;
        case 'accurate_estimate':
            pointsEarned = POINTS.estimationBonus;
            break;
        case 'unblock_teammate':
            pointsEarned = POINTS.unblockBonus;
            break;
        case 'daily_streak':
            pointsEarned = POINTS.streakBonus * (context.streakDays || 1);
            break;
    }

    userData.points = (userData.points || 0) + pointsEarned;
    userData.history = userData.history || [];
    userData.history.push({ action, points: pointsEarned, date: new Date().toISOString() });

    await saveUserData(userId, userData);
    await checkBadges(userId, userData);

    return { pointsEarned, totalPoints: userData.points };
}

async function checkBadges(userId, userData) {
    // Check badge requirements based on user activity
    for (const badge of BADGES) {
        if (!userData.badges?.includes(badge.id)) {
            if (await checkBadgeRequirement(badge.requirement, userData)) {
                userData.badges = userData.badges || [];
                userData.badges.push(badge.id);
                await saveUserData(userId, userData);
            }
        }
    }
}

async function checkBadgeRequirement(requirement, userData) {
    // Simplified badge checking logic
    return false; // Implement actual logic
}

export async function getLeaderboard(sprintId) {
    const leaderboardKey = `leaderboard_${sprintId}`;
    const data = await storage.get(leaderboardKey);
    return data?.rankings || [];
}

async function getUserData(userId) {
    return await storage.get(`user_${userId}`) || { points: 0, badges: [], history: [] };
}

async function saveUserData(userId, data) {
    await storage.set(`user_${userId}`, data);
}

export default { awardPoints, getLeaderboard, BADGES };
