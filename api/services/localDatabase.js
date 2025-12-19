/**
 * 🗄️ Local Database Service using SQLite
 * Real data storage for demo purposes
 */
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database file
const dbPath = join(__dirname, '../data/sprint_strategist.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema only - no mock data
 */
export function initializeDatabase() {
    console.log('🗄️ Initializing database schema...');
    
    // Create tables only
    createTables();
    
    console.log('✅ Database schema ready! Connect to Jira to load real data.');
}

function createTables() {
    // Team Members
    db.exec(`
        CREATE TABLE IF NOT EXISTS team_members (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'developer',
            avatar_url TEXT,
            capacity INTEGER DEFAULT 20,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Sprints
    db.exec(`
        CREATE TABLE IF NOT EXISTS sprints (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            project_key TEXT NOT NULL DEFAULT 'SPRINT',
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            goal TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
            velocity_committed INTEGER DEFAULT 0,
            velocity_completed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Issues
    db.exec(`
        CREATE TABLE IF NOT EXISTS issues (
            id TEXT PRIMARY KEY,
            sprint_id TEXT REFERENCES sprints(id) ON DELETE CASCADE,
            key TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
            assignee_id TEXT REFERENCES team_members(id) ON DELETE SET NULL,
            story_points INTEGER DEFAULT 0,
            priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
            issue_type TEXT DEFAULT 'story' CHECK (issue_type IN ('story', 'bug', 'task', 'epic', 'subtask')),
            blocked_reason TEXT,
            blocked_since DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            UNIQUE(sprint_id, key)
        )
    `);

    // Sprint Metrics
    db.exec(`
        CREATE TABLE IF NOT EXISTS sprint_metrics (
            id TEXT PRIMARY KEY,
            sprint_id TEXT REFERENCES sprints(id) ON DELETE CASCADE,
            health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
            velocity INTEGER DEFAULT 0,
            completion_percentage INTEGER DEFAULT 0,
            blockers_count INTEGER DEFAULT 0,
            team_load_average INTEGER DEFAULT 0,
            issues_total INTEGER DEFAULT 0,
            issues_completed INTEGER DEFAULT 0,
            issues_in_progress INTEGER DEFAULT 0,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Team Activities
    db.exec(`
        CREATE TABLE IF NOT EXISTS team_activities (
            id TEXT PRIMARY KEY,
            sprint_id TEXT REFERENCES sprints(id) ON DELETE CASCADE,
            member_id TEXT REFERENCES team_members(id) ON DELETE SET NULL,
            issue_id TEXT REFERENCES issues(id) ON DELETE SET NULL,
            action TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Standup Notes
    db.exec(`
        CREATE TABLE IF NOT EXISTS standup_notes (
            id TEXT PRIMARY KEY,
            sprint_id TEXT REFERENCES sprints(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            day_number INTEGER DEFAULT 1,
            completed_items TEXT DEFAULT '[]',
            in_progress_items TEXT DEFAULT '[]',
            blockers TEXT DEFAULT '[]',
            health_score INTEGER,
            notes TEXT,
            generated_by TEXT DEFAULT 'ai',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(sprint_id, date)
        )
    `);

    // Pit Stop Recommendations
    db.exec(`
        CREATE TABLE IF NOT EXISTS pit_stop_recommendations (
            id TEXT PRIMARY KEY,
            sprint_id TEXT REFERENCES sprints(id) ON DELETE CASCADE,
            recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('remove_scope', 'reassign', 'split_task', 'add_resource', 'escalate', 'other')),
            title TEXT NOT NULL,
            description TEXT,
            priority INTEGER DEFAULT 1,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed', 'expired')),
            impact_score INTEGER DEFAULT 0,
            affected_issues TEXT DEFAULT '[]',
            ai_generated BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            applied_at DATETIME
        )
    `);

    // Achievements
    db.exec(`
        CREATE TABLE IF NOT EXISTS achievements (
            id TEXT PRIMARY KEY,
            member_id TEXT REFERENCES team_members(id) ON DELETE CASCADE,
            sprint_id TEXT REFERENCES sprints(id) ON DELETE SET NULL,
            badge_type TEXT NOT NULL,
            badge_name TEXT NOT NULL,
            badge_icon TEXT,
            points INTEGER DEFAULT 0,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

function seedDatabase() {
    const generateId = () => Math.random().toString(36).substr(2, 9);
    
    // Insert team members
    const insertMember = db.prepare(`
        INSERT INTO team_members (id, name, email, role, avatar_url, capacity)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const teamMembers = [
        ['sarah-1', 'Sarah Johnson', 'sarah@team.io', 'tech_lead', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 25],
        ['mike-2', 'Mike Chen', 'mike@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 20],
        ['lisa-3', 'Lisa Anderson', 'lisa@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', 20],
        ['john-4', 'John Smith', 'john@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 20],
        ['emma-5', 'Emma Wilson', 'emma@team.io', 'qa_lead', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', 15],
        ['david-6', 'David Brown', 'david@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', 20],
        ['alex-7', 'Alex Turner', 'alex@team.io', 'scrum_master', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 10],
        ['maria-8', 'Maria Garcia', 'maria@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', 20]
    ];
    
    teamMembers.forEach(member => insertMember.run(...member));
    
    // Insert active sprint
    const sprintId = 'sprint-42-payment';
    const startDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    
    db.prepare(`
        INSERT INTO sprints (id, name, project_key, start_date, end_date, goal, status, velocity_committed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sprintId, 'Sprint 42 - Payment Gateway', 'PROJ', startDate, endDate, 
           'Complete payment gateway integration and optimize checkout flow', 'active', 52);
    
    // Insert issues
    const insertIssue = db.prepare(`
        INSERT INTO issues (id, sprint_id, key, title, description, status, assignee_id, story_points, priority, issue_type, blocked_reason, blocked_since, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const issues = [
        // Done Issues
        ['issue-1', sprintId, 'PROJ-101', 'Setup Stripe SDK integration', 'Initial Stripe SDK setup and configuration', 'done', 'sarah-1', 5, 'high', 'story', null, null, new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()],
        ['issue-2', sprintId, 'PROJ-102', 'Create payment form component', 'Build reusable payment form with validation', 'done', 'lisa-3', 3, 'high', 'story', null, null, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()],
        ['issue-3', sprintId, 'PROJ-103', 'Implement card validation', 'Add real-time card number validation', 'done', 'mike-2', 2, 'medium', 'task', null, null, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()],
        ['issue-4', sprintId, 'PROJ-104', 'Design payment success page', 'Create beautiful success/confirmation page', 'done', 'lisa-3', 2, 'medium', 'story', null, null, new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()],
        ['issue-5', sprintId, 'PROJ-105', 'Unit tests for payment utils', 'Write comprehensive unit tests', 'done', 'emma-5', 3, 'medium', 'task', null, null, new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()],
        
        // In Progress Issues
        ['issue-6', sprintId, 'PROJ-106', 'Payment processing API', 'Implement server-side payment processing', 'in_progress', 'sarah-1', 8, 'critical', 'story', null, null, null],
        ['issue-7', sprintId, 'PROJ-107', 'Webhook handler for Stripe', 'Handle Stripe webhooks for payment events', 'in_progress', 'mike-2', 5, 'high', 'story', null, null, null],
        ['issue-8', sprintId, 'PROJ-108', 'Error handling middleware', 'Add comprehensive error handling', 'in_progress', 'john-4', 3, 'high', 'task', null, null, null],
        ['issue-9', sprintId, 'PROJ-109', 'Invoice generation service', 'Auto-generate invoices after payment', 'review', 'david-6', 5, 'medium', 'story', null, null, null],
        
        // Blocked Issues
        ['issue-10', sprintId, 'PROJ-110', 'Apple Pay integration', 'Add Apple Pay as payment method', 'blocked', 'john-4', 5, 'medium', 'story', 'Waiting for Apple Developer account approval', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), null],
        
        // Todo Issues
        ['issue-11', sprintId, 'PROJ-111', 'Google Pay integration', 'Add Google Pay as payment method', 'todo', 'david-6', 5, 'medium', 'story', null, null, null],
        ['issue-12', sprintId, 'PROJ-112', 'Payment analytics dashboard', 'Build analytics for payment metrics', 'todo', 'lisa-3', 8, 'low', 'story', null, null, null],
        ['issue-13', sprintId, 'PROJ-113', 'Refund processing', 'Implement refund workflow', 'todo', 'sarah-1', 5, 'high', 'story', null, null, null],
        ['issue-14', sprintId, 'PROJ-114', 'E2E payment tests', 'End-to-end tests for payment flow', 'todo', 'emma-5', 3, 'medium', 'task', null, null, null]
    ];
    
    issues.forEach(issue => insertIssue.run(...issue));
    
    // Insert historical metrics
    const insertMetric = db.prepare(`
        INSERT INTO sprint_metrics (id, sprint_id, health_score, velocity, completion_percentage, blockers_count, team_load_average, issues_total, issues_completed, issues_in_progress, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const metrics = [
        [generateId(), sprintId, 65, 10, 20, 0, 75, 14, 2, 3, new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 68, 18, 35, 0, 78, 14, 3, 4, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 72, 24, 45, 1, 80, 14, 4, 4, new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 75, 28, 55, 1, 82, 14, 5, 4, new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 78, 34, 65, 1, 82, 14, 5, 4, new Date().toISOString()]
    ];
    
    metrics.forEach(metric => insertMetric.run(...metric));
    
    // Insert team activities
    const insertActivity = db.prepare(`
        INSERT INTO team_activities (id, sprint_id, member_id, action, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const activities = [
        [generateId(), sprintId, 'sarah-1', 'completed', 'Completed PROJ-101: Setup Stripe SDK integration', new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 'lisa-3', 'completed', 'Completed PROJ-102: Create payment form component', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 'mike-2', 'completed', 'Completed PROJ-103: Implement card validation', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 'lisa-3', 'completed', 'Completed PROJ-104: Design payment success page', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 'emma-5', 'completed', 'Completed PROJ-105: Unit tests for payment utils', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 'sarah-1', 'started', 'Started working on PROJ-106: Payment processing API', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 'mike-2', 'started', 'Started working on PROJ-107: Webhook handler', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 'john-4', 'blocked', 'PROJ-110 blocked: Waiting for Apple Developer account', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()],
        [generateId(), sprintId, 'david-6', 'review', 'PROJ-109 ready for code review', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()]
    ];
    
    activities.forEach(activity => insertActivity.run(...activity));
    
    // Insert achievements
    const insertAchievement = db.prepare(`
        INSERT INTO achievements (id, member_id, sprint_id, badge_type, badge_name, badge_icon, points)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const achievements = [
        [generateId(), 'sarah-1', sprintId, 'pole_position', 'Pole Position', '🏎️', 100],
        [generateId(), 'lisa-3', sprintId, 'fast_finisher', 'Fast Finisher', '⚡', 75],
        [generateId(), 'mike-2', sprintId, 'code_quality', 'Clean Code', '🧹', 50],
        [generateId(), 'emma-5', sprintId, 'test_champion', 'Test Champion', '🎯', 80]
    ];
    
    achievements.forEach(achievement => insertAchievement.run(...achievement));
    
    // Insert pit stop recommendations
    const insertRecommendation = db.prepare(`
        INSERT INTO pit_stop_recommendations (id, sprint_id, recommendation_type, title, description, priority, impact_score, affected_issues)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const recommendations = [
        [generateId(), sprintId, 'remove_scope', 'Consider moving PROJ-112 to next sprint', 'Payment analytics dashboard has low priority and 8 points. Moving it would increase completion probability by 15%.', 1, 15, '["PROJ-112"]'],
        [generateId(), sprintId, 'reassign', 'Reassign PROJ-110 from John to David', 'John is overloaded. David has 40% capacity remaining.', 2, 10, '["PROJ-110"]'],
        [generateId(), sprintId, 'escalate', 'Escalate Apple Developer account approval', 'PROJ-110 has been blocked for 3 days. Consider escalating to management.', 3, 8, '["PROJ-110"]']
    ];
    
    recommendations.forEach(rec => insertRecommendation.run(...rec));
}

// Initialize database on import
let initialized = false;
let preparedQueries = null;

function ensureInitialized() {
    if (!initialized) {
        initializeDatabase();
        initialized = true;
        
        // Prepare all queries after initialization
        preparedQueries = {
            getActiveSprint: db.prepare('SELECT * FROM sprints WHERE status = ? LIMIT 1'),
            
            getSprintIssues: db.prepare(`
                SELECT i.*, tm.name as assignee_name, tm.email as assignee_email, tm.avatar_url as assignee_avatar
                FROM issues i
                LEFT JOIN team_members tm ON i.assignee_id = tm.id
                WHERE i.sprint_id = ?
            `),
            
            getTeamMembers: db.prepare('SELECT * FROM team_members WHERE is_active = 1'),
            
            getSprintMetrics: db.prepare('SELECT * FROM sprint_metrics WHERE sprint_id = ? ORDER BY recorded_at DESC LIMIT 10'),
            
            getTeamActivities: db.prepare(`
                SELECT ta.*, tm.name as member_name, tm.avatar_url as member_avatar
                FROM team_activities ta
                LEFT JOIN team_members tm ON ta.member_id = tm.id
                WHERE ta.sprint_id = ?
                ORDER BY ta.created_at DESC
                LIMIT 20
            `),
            
            getAchievements: db.prepare(`
                SELECT a.*, tm.name as member_name
                FROM achievements a
                LEFT JOIN team_members tm ON a.member_id = tm.id
                WHERE a.sprint_id = ?
                ORDER BY a.earned_at DESC
            `),
            
            getPitStopRecommendations: db.prepare(`
                SELECT * FROM pit_stop_recommendations 
                WHERE sprint_id = ? AND status = 'pending'
                ORDER BY priority
            `),
            
            updateIssue: db.prepare(`
                UPDATE issues 
                SET status = ?, updated_at = CURRENT_TIMESTAMP, completed_at = ?
                WHERE id = ?
            `),
            
            applyRecommendation: db.prepare(`
                UPDATE pit_stop_recommendations 
                SET status = 'applied', applied_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `),
            
            insertMetric: db.prepare(`
                INSERT INTO sprint_metrics (id, sprint_id, health_score, velocity, completion_percentage, blockers_count, team_load_average, issues_total, issues_completed, issues_in_progress)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
        };
    }
    return preparedQueries;
}

// Database query functions
export const queries = {
    get getActiveSprint() { return ensureInitialized().getActiveSprint; },
    get getSprintIssues() { return ensureInitialized().getSprintIssues; },
    get getTeamMembers() { return ensureInitialized().getTeamMembers; },
    get getSprintMetrics() { return ensureInitialized().getSprintMetrics; },
    get getTeamActivities() { return ensureInitialized().getTeamActivities; },
    get getAchievements() { return ensureInitialized().getAchievements; },
    get getPitStopRecommendations() { return ensureInitialized().getPitStopRecommendations; },
    get updateIssue() { return ensureInitialized().updateIssue; },
    get applyRecommendation() { return ensureInitialized().applyRecommendation; },
    get insertMetric() { return ensureInitialized().insertMetric; }
};

export { db };
export default { initializeDatabase, queries, db };