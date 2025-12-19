/**
 * 🏆 Gamification Service
 * Handles achievements, badges, and leaderboard calculations
 */

// Badge Types
export const BADGE_TYPES = {
    POLE_POSITION: {
        type: 'pole_position',
        name: 'Pole Position',
        icon: '🏎️',
        description: 'First to complete all assigned tasks',
        points: 100
    },
    FAST_FINISHER: {
        type: 'fast_finisher',
        name: 'Fast Finisher',
        icon: '⚡',
        description: 'Completed tasks ahead of schedule',
        points: 75
    },
    CLEAN_CODE: {
        type: 'clean_code',
        name: 'Clean Code',
        icon: '🧹',
        description: 'Zero bugs reported in code reviews',
        points: 50
    },
    TEST_CHAMPION: {
        type: 'test_champion',
        name: 'Test Champion',
        icon: '🎯',
        description: 'Highest test coverage',
        points: 80
    },
    PIT_CREW: {
        type: 'pit_crew',
        name: 'Pit Crew',
        icon: '🔧',
        description: 'Helped unblock team members',
        points: 60
    },
    STREAK_MASTER: {
        type: 'streak_master',
        name: 'Streak Master',
        icon: '🔥',
        description: 'Completed tasks for 5 consecutive days',
        points: 90
    },
    BLOCKER_BUSTER: {
        type: 'blocker_buster',
        name: 'Blocker Buster',
        icon: '💥',
        description: 'Resolved a critical blocker',
        points: 85
    },
    TEAM_PLAYER: {
        type: 'team_player',
        name: 'Team Player',
        icon: '🤝',
        description: 'Most helpful in code reviews',
        points: 70
    }
};

/**
 * Calculate member score based on sprint performance
 */
export function calculateMemberScore(member, issues = []) {
    let score = 0;

    // Points for completed issues
    const memberIssues = issues.filter(i => i.assignee_id === member.id);
    const completedIssues = memberIssues.filter(i => i.status === 'done');

    // Story points completed
    const pointsCompleted = completedIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);
    score += pointsCompleted * 10;

    // Bonus for completing ahead of time (if completed_at exists)
    completedIssues.forEach(issue => {
        if (issue.completed_at) {
            const completedDate = new Date(issue.completed_at);
            const now = new Date();
            const daysEarly = Math.floor((now - completedDate) / (1000 * 60 * 60 * 24));
            if (daysEarly > 0) {
                score += daysEarly * 5;
            }
        }
    });

    // Completion rate bonus
    if (memberIssues.length > 0) {
        const completionRate = completedIssues.length / memberIssues.length;
        if (completionRate >= 0.8) score += 50;
        else if (completionRate >= 0.6) score += 30;
        else if (completionRate >= 0.4) score += 10;
    }

    return score;
}

/**
 * Determine earned badges for a member
 */
export function determineEarnedBadges(member, issues = [], allMembers = []) {
    const badges = [];
    const memberIssues = issues.filter(i => i.assignee_id === member.id);
    const completedIssues = memberIssues.filter(i => i.status === 'done');

    // Check for Fast Finisher (all tasks completed)
    if (memberIssues.length > 0 && completedIssues.length === memberIssues.length) {
        badges.push(BADGE_TYPES.FAST_FINISHER);
    }

    // Check for Pole Position (first to complete all tasks)
    const isFirstComplete = allMembers.every(m => {
        if (m.id === member.id) return true;
        const otherIssues = issues.filter(i => i.assignee_id === m.id);
        const otherCompleted = otherIssues.filter(i => i.status === 'done');
        return otherIssues.length === 0 || otherCompleted.length < otherIssues.length;
    });

    if (isFirstComplete && completedIssues.length > 0 && memberIssues.length === completedIssues.length) {
        badges.push(BADGE_TYPES.POLE_POSITION);
    }

    // Check for Blocker Buster (resolved blocked issues)
    const resolvedBlockers = completedIssues.filter(i =>
        i.priority === 'critical' || i.blocked_reason
    );
    if (resolvedBlockers.length > 0) {
        badges.push(BADGE_TYPES.BLOCKER_BUSTER);
    }

    // Test Champion for QA roles
    if (member.role === 'qa_lead' && completedIssues.length >= 2) {
        badges.push(BADGE_TYPES.TEST_CHAMPION);
    }

    return badges;
}

/**
 * Generate leaderboard from team metrics
 */
export function generateLeaderboard(teamMetrics = [], issues = []) {
    return teamMetrics
        .map(member => {
            const score = calculateMemberScore(member, issues);
            const badges = determineEarnedBadges(member, issues, teamMetrics);

            return {
                id: member.id,
                name: member.name,
                role: member.role,
                avatar: member.avatar_url,
                score,
                badges: badges.map(b => b.icon),
                completedPoints: member.completedPoints || 0,
                totalPoints: member.points || 0,
                completionRate: member.completionRate || 0
            };
        })
        .sort((a, b) => b.score - a.score);
}

/**
 * Get achievement details for saving to database
 */
export function createAchievementRecord(memberId, sprintId, badgeType) {
    const badge = Object.values(BADGE_TYPES).find(b => b.type === badgeType);
    if (!badge) return null;

    return {
        member_id: memberId,
        sprint_id: sprintId,
        badge_type: badge.type,
        badge_name: badge.name,
        badge_icon: badge.icon,
        points: badge.points
    };
}

export default {
    BADGE_TYPES,
    calculateMemberScore,
    determineEarnedBadges,
    generateLeaderboard,
    createAchievementRecord
};
