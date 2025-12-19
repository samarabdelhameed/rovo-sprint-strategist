-- =====================================================
-- 🏎️ ROVO SPRINT STRATEGIST - DATABASE SCHEMA
-- =====================================================
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TEAM MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'developer',
    avatar_url TEXT,
    capacity INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. SPRINTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    project_key VARCHAR(50) NOT NULL DEFAULT 'SPRINT',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    goal TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    velocity_committed INTEGER DEFAULT 0,
    velocity_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ISSUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    key VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
    assignee_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    story_points INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    issue_type VARCHAR(50) DEFAULT 'story' CHECK (issue_type IN ('story', 'bug', 'task', 'epic', 'subtask')),
    labels TEXT[],
    blocked_reason TEXT,
    blocked_since TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(sprint_id, key)
);

-- =====================================================
-- 4. SPRINT METRICS TABLE (Historical Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS sprint_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
    velocity INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    blockers_count INTEGER DEFAULT 0,
    team_load_average INTEGER DEFAULT 0,
    issues_total INTEGER DEFAULT 0,
    issues_completed INTEGER DEFAULT 0,
    issues_in_progress INTEGER DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TEAM ACTIVITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. STANDUP NOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS standup_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_number INTEGER DEFAULT 1,
    completed_items JSONB DEFAULT '[]',
    in_progress_items JSONB DEFAULT '[]',
    blockers JSONB DEFAULT '[]',
    health_score INTEGER,
    notes TEXT,
    generated_by VARCHAR(50) DEFAULT 'ai',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sprint_id, date)
);

-- =====================================================
-- 7. PIT STOP RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pit_stop_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('remove_scope', 'reassign', 'split_task', 'add_resource', 'escalate', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed', 'expired')),
    impact_score INTEGER DEFAULT 0,
    affected_issues TEXT[],
    ai_generated BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 8. ACHIEVEMENTS / BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(50),
    points INTEGER DEFAULT 0,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. USER SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES team_members(id) ON DELETE CASCADE UNIQUE,
    notifications_enabled BOOLEAN DEFAULT true,
    email_alerts BOOLEAN DEFAULT true,
    slack_alerts BOOLEAN DEFAULT false,
    alert_threshold INTEGER DEFAULT 60,
    theme VARCHAR(20) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_issues_sprint ON issues(sprint_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_metrics_sprint ON sprint_metrics(sprint_id);
CREATE INDEX IF NOT EXISTS idx_activities_sprint ON team_activities(sprint_id);
CREATE INDEX IF NOT EXISTS idx_activities_member ON team_activities(member_id);
CREATE INDEX IF NOT EXISTS idx_standup_sprint_date ON standup_notes(sprint_id, date);
CREATE INDEX IF NOT EXISTS idx_achievements_member ON achievements(member_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE standup_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pit_stop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all access (for demo purposes - configure properly for production)
CREATE POLICY "Allow all access to team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all access to sprints" ON sprints FOR ALL USING (true);
CREATE POLICY "Allow all access to issues" ON issues FOR ALL USING (true);
CREATE POLICY "Allow all access to sprint_metrics" ON sprint_metrics FOR ALL USING (true);
CREATE POLICY "Allow all access to team_activities" ON team_activities FOR ALL USING (true);
CREATE POLICY "Allow all access to standup_notes" ON standup_notes FOR ALL USING (true);
CREATE POLICY "Allow all access to pit_stop_recommendations" ON pit_stop_recommendations FOR ALL USING (true);
CREATE POLICY "Allow all access to achievements" ON achievements FOR ALL USING (true);
CREATE POLICY "Allow all access to user_settings" ON user_settings FOR ALL USING (true);

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
ALTER PUBLICATION supabase_realtime ADD TABLE sprint_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE team_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE standup_notes;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert Team Members
INSERT INTO team_members (name, email, role, avatar_url, capacity) VALUES
    ('Sarah Johnson', 'sarah@team.io', 'tech_lead', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 25),
    ('Mike Chen', 'mike@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 20),
    ('Lisa Anderson', 'lisa@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', 20),
    ('John Smith', 'john@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 20),
    ('Emma Wilson', 'emma@team.io', 'qa_lead', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', 15),
    ('David Brown', 'david@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', 20),
    ('Alex Turner', 'alex@team.io', 'scrum_master', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 10),
    ('Maria Garcia', 'maria@team.io', 'developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', 20);

-- Insert Active Sprint
INSERT INTO sprints (name, project_key, start_date, end_date, goal, status, velocity_committed) VALUES
    ('Sprint 42 - Payment Gateway', 'PROJ', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', 
     'Complete payment gateway integration and optimize checkout flow', 'active', 52);

-- Get sprint and member IDs for foreign keys
DO $$
DECLARE
    sprint_id UUID;
    sarah_id UUID;
    mike_id UUID;
    lisa_id UUID;
    john_id UUID;
    emma_id UUID;
    david_id UUID;
BEGIN
    SELECT id INTO sprint_id FROM sprints WHERE name LIKE 'Sprint 42%' LIMIT 1;
    SELECT id INTO sarah_id FROM team_members WHERE email = 'sarah@team.io';
    SELECT id INTO mike_id FROM team_members WHERE email = 'mike@team.io';
    SELECT id INTO lisa_id FROM team_members WHERE email = 'lisa@team.io';
    SELECT id INTO john_id FROM team_members WHERE email = 'john@team.io';
    SELECT id INTO emma_id FROM team_members WHERE email = 'emma@team.io';
    SELECT id INTO david_id FROM team_members WHERE email = 'david@team.io';

    -- Insert Issues
    INSERT INTO issues (sprint_id, key, title, description, status, assignee_id, story_points, priority, issue_type) VALUES
    -- Done Issues
    (sprint_id, 'PROJ-101', 'Setup Stripe SDK integration', 'Initial Stripe SDK setup and configuration', 'done', sarah_id, 5, 'high', 'story'),
    (sprint_id, 'PROJ-102', 'Create payment form component', 'Build reusable payment form with validation', 'done', lisa_id, 3, 'high', 'story'),
    (sprint_id, 'PROJ-103', 'Implement card validation', 'Add real-time card number validation', 'done', mike_id, 2, 'medium', 'task'),
    (sprint_id, 'PROJ-104', 'Design payment success page', 'Create beautiful success/confirmation page', 'done', lisa_id, 2, 'medium', 'story'),
    (sprint_id, 'PROJ-105', 'Unit tests for payment utils', 'Write comprehensive unit tests', 'done', emma_id, 3, 'medium', 'task'),
    
    -- In Progress Issues
    (sprint_id, 'PROJ-106', 'Payment processing API', 'Implement server-side payment processing', 'in_progress', sarah_id, 8, 'critical', 'story'),
    (sprint_id, 'PROJ-107', 'Webhook handler for Stripe', 'Handle Stripe webhooks for payment events', 'in_progress', mike_id, 5, 'high', 'story'),
    (sprint_id, 'PROJ-108', 'Error handling middleware', 'Add comprehensive error handling', 'in_progress', john_id, 3, 'high', 'task'),
    (sprint_id, 'PROJ-109', 'Invoice generation service', 'Auto-generate invoices after payment', 'review', david_id, 5, 'medium', 'story'),
    
    -- Blocked Issues
    (sprint_id, 'PROJ-110', 'Apple Pay integration', 'Add Apple Pay as payment method', 'blocked', john_id, 5, 'medium', 'story'),
    
    -- Todo Issues
    (sprint_id, 'PROJ-111', 'Google Pay integration', 'Add Google Pay as payment method', 'todo', david_id, 5, 'medium', 'story'),
    (sprint_id, 'PROJ-112', 'Payment analytics dashboard', 'Build analytics for payment metrics', 'todo', lisa_id, 8, 'low', 'story'),
    (sprint_id, 'PROJ-113', 'Refund processing', 'Implement refund workflow', 'todo', sarah_id, 5, 'high', 'story'),
    (sprint_id, 'PROJ-114', 'E2E payment tests', 'End-to-end tests for payment flow', 'todo', emma_id, 3, 'medium', 'task');

    -- Update blocked issue with reason
    UPDATE issues SET blocked_reason = 'Waiting for Apple Developer account approval', 
                      blocked_since = NOW() - INTERVAL '3 days' 
    WHERE key = 'PROJ-110';

    -- Insert historical metrics
    INSERT INTO sprint_metrics (sprint_id, health_score, velocity, completion_percentage, blockers_count, team_load_average, issues_total, issues_completed, issues_in_progress, recorded_at) VALUES
    (sprint_id, 65, 10, 20, 0, 75, 14, 2, 3, NOW() - INTERVAL '4 days'),
    (sprint_id, 68, 18, 35, 0, 78, 14, 3, 4, NOW() - INTERVAL '3 days'),
    (sprint_id, 72, 24, 45, 1, 80, 14, 4, 4, NOW() - INTERVAL '2 days'),
    (sprint_id, 75, 28, 55, 1, 82, 14, 5, 4, NOW() - INTERVAL '1 day'),
    (sprint_id, 78, 34, 65, 1, 82, 14, 5, 4, NOW());

    -- Insert team activities
    INSERT INTO team_activities (sprint_id, member_id, action, description, created_at) VALUES
    (sprint_id, sarah_id, 'completed', 'Completed PROJ-101: Setup Stripe SDK integration', NOW() - INTERVAL '4 days'),
    (sprint_id, lisa_id, 'completed', 'Completed PROJ-102: Create payment form component', NOW() - INTERVAL '3 days'),
    (sprint_id, mike_id, 'completed', 'Completed PROJ-103: Implement card validation', NOW() - INTERVAL '3 days'),
    (sprint_id, lisa_id, 'completed', 'Completed PROJ-104: Design payment success page', NOW() - INTERVAL '2 days'),
    (sprint_id, emma_id, 'completed', 'Completed PROJ-105: Unit tests for payment utils', NOW() - INTERVAL '1 day'),
    (sprint_id, sarah_id, 'started', 'Started working on PROJ-106: Payment processing API', NOW() - INTERVAL '2 days'),
    (sprint_id, mike_id, 'started', 'Started working on PROJ-107: Webhook handler', NOW() - INTERVAL '1 day'),
    (sprint_id, john_id, 'blocked', 'PROJ-110 blocked: Waiting for Apple Developer account', NOW() - INTERVAL '3 days'),
    (sprint_id, david_id, 'review', 'PROJ-109 ready for code review', NOW() - INTERVAL '6 hours');

    -- Insert achievements
    INSERT INTO achievements (member_id, sprint_id, badge_type, badge_name, badge_icon, points) VALUES
    (sarah_id, sprint_id, 'pole_position', 'Pole Position', '🏎️', 100),
    (lisa_id, sprint_id, 'fast_finisher', 'Fast Finisher', '⚡', 75),
    (mike_id, sprint_id, 'code_quality', 'Clean Code', '🧹', 50),
    (emma_id, sprint_id, 'test_champion', 'Test Champion', '🎯', 80);

    -- Insert pit stop recommendations
    INSERT INTO pit_stop_recommendations (sprint_id, recommendation_type, title, description, priority, impact_score, affected_issues) VALUES
    (sprint_id, 'remove_scope', 'Consider moving PROJ-112 to next sprint', 'Payment analytics dashboard has low priority and 8 points. Moving it would increase completion probability by 15%.', 1, 15, ARRAY['PROJ-112']),
    (sprint_id, 'reassign', 'Reassign PROJ-110 from John to David', 'John is overloaded. David has 40% capacity remaining.', 2, 10, ARRAY['PROJ-110']),
    (sprint_id, 'escalate', 'Escalate Apple Developer account approval', 'PROJ-110 has been blocked for 3 days. Consider escalating to management.', 3, 8, ARRAY['PROJ-110']);

END $$;

-- Success message
SELECT 'Database schema created and seeded successfully!' AS result;
