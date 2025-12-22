/**
 * 🔗 Real Jira Integration Service
 * Connects to actual Jira instance and fetches live data
 */
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../data/sprint_strategist.db');
const db = new Database(dbPath);

class JiraService {
  constructor() {
    this.config = null;
    this.loadConfig();
  }

  /**
   * Load Jira configuration from database or environment variables
   */
  loadConfig() {
    try {
      // First try to load from environment variables
      if (process.env.JIRA_URL && process.env.JIRA_USERNAME && process.env.JIRA_API_TOKEN) {
        this.config = {
          baseUrl: process.env.JIRA_URL,
          username: process.env.JIRA_USERNAME,
          apiToken: process.env.JIRA_API_TOKEN,
          projectKey: process.env.JIRA_PROJECT_KEY,
          boardId: process.env.JIRA_BOARD_ID
        };
        console.log('✅ Jira config loaded from environment variables');
        return;
      }

      // Fallback to database settings
      const settings = db.prepare(`
        SELECT * FROM project_settings 
        WHERE user_id = 'default'
        ORDER BY created_at DESC
        LIMIT 1
      `).get();

      if (settings) {
        this.config = {
          baseUrl: settings.jira_url,
          username: settings.jira_username,
          apiToken: settings.jira_api_token,
          projectKey: settings.project_key,
          boardId: settings.board_id
        };
        console.log('✅ Jira config loaded from database');
      }
    } catch (error) {
      console.log('⚠️ No Jira configuration found. Please configure in Project Setup.');
    }
  }

  /**
   * Check if Jira is configured
   */
  isConfigured() {
    return this.config && 
           this.config.baseUrl && 
           this.config.username && 
           this.config.apiToken && 
           this.config.projectKey;
  }

  /**
   * Get authentication headers for Jira API
   */
  getAuthHeaders() {
    if (!this.isConfigured()) {
      throw new Error('Jira not configured. Please set up connection in Project Setup.');
    }

    const auth = Buffer.from(`${this.config.username}:${this.config.apiToken}`).toString('base64');
    
    return {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make authenticated request to Jira API
   */
  async makeJiraRequest(endpoint, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Jira not configured');
    }

    const url = `${this.config.baseUrl}/rest/api/3/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jira API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Test Jira connection
   */
  async testConnection() {
    try {
      // Check if we're in demo mode (when Jira is not accessible)
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Jira not configured. Please set up connection in Project Setup.'
        };
      }

      // Try to connect to Jira with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const serverInfo = await this.makeJiraRequest('serverInfo', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        return {
          success: true,
          message: 'Connection successful',
          serverInfo: {
            version: serverInfo.version,
            serverTitle: serverInfo.serverTitle,
            baseUrl: serverInfo.baseUrl
          }
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Jira connection test failed:', error);
      
      // Provide specific error messages and suggestions
      if (error.message.includes('Site temporarily unavailable') || 
          error.message.includes('404')) {
        return {
          success: false,
          error: 'Jira instance not accessible',
          details: 'The Jira URL appears to be incorrect or the instance may not exist.',
          suggestion: 'You can either:\n1. Create a new Jira instance at https://www.atlassian.com/software/jira/free\n2. Update the URL in your configuration\n3. Use Demo Mode to test the application with sample data',
          demoModeAvailable: true
        };
      }
      
      if (error.message.includes('401') || error.message.includes('403')) {
        return {
          success: false,
          error: 'Authentication failed',
          details: 'Invalid credentials or insufficient permissions.',
          suggestion: 'Please check:\n1. Your email address is correct\n2. Your API token is valid\n3. You have access to the Jira instance'
        };
      }
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return {
          success: false,
          error: 'Connection timeout',
          details: 'The Jira instance is not responding.',
          suggestion: 'Please check your internet connection and try again, or use Demo Mode.'
        };
      }
      
      return {
        success: false,
        error: error.message,
        suggestion: 'Please check your Jira configuration or use Demo Mode to test the application.'
      };
    }
  }

  /**
   * Get all projects accessible to user
   */
  async getProjects() {
    try {
      const projects = await this.makeJiraRequest('project');
      return projects.map(project => ({
        key: project.key,
        name: project.name,
        description: project.description,
        projectTypeKey: project.projectTypeKey,
        lead: project.lead?.displayName
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get boards for a specific project
   */
  async getProjectBoards(projectKey) {
    try {
      const response = await this.makeJiraRequest(`project/${projectKey}/board`);
      return response.values.map(board => ({
        id: board.id,
        name: board.name,
        type: board.type,
        location: board.location
      }));
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  }

  /**
   * Get active sprint for configured board
   */
  async getActiveSprint() {
    try {
      if (!this.config.boardId) {
        throw new Error('Board ID not configured');
      }

      const response = await this.makeJiraRequest(`board/${this.config.boardId}/sprint?state=active`);
      
      if (response.values.length === 0) {
        throw new Error('No active sprint found');
      }

      const sprint = response.values[0];
      
      // Store sprint in database
      this.storeSprint(sprint);
      
      return {
        id: sprint.id.toString(),
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        goal: sprint.goal || 'No goal set'
      };
    } catch (error) {
      console.error('Error fetching active sprint:', error);
      throw error;
    }
  }

  /**
   * Get issues for active sprint
   */
  async getSprintIssues(sprintId) {
    try {
      const jql = `sprint = ${sprintId} ORDER BY priority DESC, created ASC`;
      const response = await this.makeJiraRequest(`search?jql=${encodeURIComponent(jql)}&expand=changelog`);
      
      const issues = response.issues.map(issue => ({
        id: issue.id,
        key: issue.key,
        title: issue.fields.summary,
        description: issue.fields.description?.content?.[0]?.content?.[0]?.text || '',
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'Medium',
        assignee_id: issue.fields.assignee?.accountId,
        assignee_name: issue.fields.assignee?.displayName,
        assignee_email: issue.fields.assignee?.emailAddress,
        story_points: issue.fields.customfield_10016 || 0, // Story Points field
        issue_type: issue.fields.issuetype.name,
        created_at: issue.fields.created,
        updated_at: issue.fields.updated,
        sprint_id: sprintId
      }));

      // Store issues in database
      this.storeIssues(issues);
      
      return issues;
    } catch (error) {
      console.error('Error fetching sprint issues:', error);
      throw error;
    }
  }

  /**
   * Get team members from project
   */
  async getProjectTeam() {
    try {
      const response = await this.makeJiraRequest(`project/${this.config.projectKey}/role`);
      const teamMembers = new Map();

      // Get users from different roles
      for (const [roleUrl, role] of Object.entries(response)) {
        const roleResponse = await fetch(roleUrl, {
          headers: this.getAuthHeaders()
        });
        
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          
          if (roleData.actors) {
            roleData.actors.forEach(actor => {
              if (actor.type === 'atlassian-user-role-actor') {
                teamMembers.set(actor.actorUser.accountId, {
                  id: actor.actorUser.accountId,
                  name: actor.actorUser.displayName,
                  email: actor.actorUser.emailAddress,
                  role: role.name.toLowerCase(),
                  avatar_url: actor.actorUser.avatarUrls?.['48x48'],
                  capacity: 40, // Default capacity
                  is_active: true
                });
              }
            });
          }
        }
      }

      const team = Array.from(teamMembers.values());
      
      // Store team in database
      this.storeTeamMembers(team);
      
      return team;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  /**
   * Store sprint data in local database
   */
  storeSprint(sprintData) {
    try {
      db.prepare(`
        INSERT OR REPLACE INTO sprints 
        (id, name, state, start_date, end_date, goal, project_key, board_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        sprintData.id.toString(),
        sprintData.name,
        sprintData.state,
        sprintData.startDate,
        sprintData.endDate,
        sprintData.goal || '',
        this.config.projectKey,
        this.config.boardId
      );
    } catch (error) {
      console.error('Error storing sprint:', error);
    }
  }

  /**
   * Store issues in local database
   */
  storeIssues(issues) {
    try {
      const insertIssue = db.prepare(`
        INSERT OR REPLACE INTO issues 
        (id, key, title, description, status, priority, assignee_id, assignee_name, 
         assignee_email, story_points, issue_type, created_at, updated_at, sprint_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      issues.forEach(issue => {
        insertIssue.run(
          issue.id,
          issue.key,
          issue.title,
          issue.description,
          issue.status,
          issue.priority,
          issue.assignee_id,
          issue.assignee_name,
          issue.assignee_email,
          issue.story_points,
          issue.issue_type,
          issue.created_at,
          issue.updated_at,
          issue.sprint_id
        );
      });
    } catch (error) {
      console.error('Error storing issues:', error);
    }
  }

  /**
   * Store team members in local database
   */
  storeTeamMembers(teamMembers) {
    try {
      const insertMember = db.prepare(`
        INSERT OR REPLACE INTO team_members 
        (id, name, email, role, avatar_url, capacity, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      teamMembers.forEach(member => {
        insertMember.run(
          member.id,
          member.name,
          member.email,
          member.role,
          member.avatar_url,
          member.capacity,
          member.is_active ? 1 : 0
        );
      });
    } catch (error) {
      console.error('Error storing team members:', error);
    }
  }

  /**
   * Sync all data from Jira
   */
  async syncAllData() {
    try {
      console.log('🔄 Starting Jira data sync...');
      
      // First test the connection
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        console.log('⚠️ Jira connection failed, checking for cached data...');
        
        // Try to get cached data first
        const cachedData = this.getCachedData();
        if (cachedData.hasData) {
          console.log('📦 Using cached data as fallback');
          return cachedData;
        }
        
        // If no cached data, initialize demo data
        console.log('🎭 No cached data found, initializing demo data...');
        return this.initializeDemoData();
      }
      
      // Get active sprint
      const sprint = await this.getActiveSprint();
      console.log(`📊 Found active sprint: ${sprint.name}`);
      
      // Get sprint issues
      const issues = await this.getSprintIssues(sprint.id);
      console.log(`📋 Loaded ${issues.length} issues`);
      
      // Get team members
      const team = await this.getProjectTeam();
      console.log(`👥 Loaded ${team.length} team members`);
      
      console.log('✅ Jira sync completed successfully');
      
      return {
        sprint,
        issues,
        team
      };
    } catch (error) {
      console.error('❌ Jira sync failed:', error);
      
      // Check if we have cached data to fall back to
      const cachedData = this.getCachedData();
      if (cachedData.hasData) {
        console.log('📦 Using cached data as fallback');
        return cachedData;
      }
      
      // If no cached data, initialize demo data
      console.log('🎭 Initializing demo data as final fallback...');
      return this.initializeDemoData();
    }
  }

  /**
   * Get cached data from local database
   */
  getCachedData() {
    try {
      // Get latest sprint
      const sprint = db.prepare(`
        SELECT * FROM sprints 
        ORDER BY created_at DESC 
        LIMIT 1
      `).get();

      if (!sprint) {
        return { hasData: false };
      }

      // Get issues for this sprint
      const issues = db.prepare(`
        SELECT * FROM issues 
        WHERE sprint_id = ?
        ORDER BY created_at DESC
      `).all(sprint.id);

      // Get team members
      const team = db.prepare(`
        SELECT * FROM team_members 
        WHERE is_active = 1
        ORDER BY name
      `).all();

      return {
        hasData: true,
        sprint: {
          id: sprint.id,
          name: sprint.name,
          state: sprint.state,
          startDate: sprint.start_date,
          endDate: sprint.end_date,
          goal: sprint.goal
        },
        issues: issues,
        team: team
      };
    } catch (error) {
      console.error('Error getting cached data:', error);
      return { hasData: false };
    }
  }

  /**
   * Initialize demo data when Jira is not available
   */
  initializeDemoData() {
    try {
      console.log('🎭 Initializing demo data...');
      
      // Demo sprint data
      const demoSprint = {
        id: 'DEMO-SPRINT-1',
        name: 'Sprint 1 - Q1 2024 Demo',
        state: 'active',
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        goal: 'Complete user authentication and dashboard features',
        project_key: 'DEMO',
        board_id: '1'
      };

      // Demo team members
      const demoTeam = [
        {
          id: 'user-1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          role: 'developer',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          capacity: 40,
          is_active: 1
        },
        {
          id: 'user-2',
          name: 'Mike Chen',
          email: 'mike@example.com',
          role: 'developer',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
          capacity: 40,
          is_active: 1
        },
        {
          id: 'user-3',
          name: 'Lisa Rodriguez',
          email: 'lisa@example.com',
          role: 'designer',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
          capacity: 35,
          is_active: 1
        },
        {
          id: 'user-4',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'product owner',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          capacity: 30,
          is_active: 1
        }
      ];

      // Demo issues
      const demoIssues = [
        {
          id: 'issue-1',
          key: 'DEMO-1',
          title: 'User Authentication System',
          description: 'Implement login and registration functionality',
          status: 'Done',
          priority: 'High',
          assignee_id: 'user-1',
          assignee_name: 'Sarah Johnson',
          assignee_email: 'sarah@example.com',
          story_points: 8,
          issue_type: 'Story',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          sprint_id: 'DEMO-SPRINT-1'
        },
        {
          id: 'issue-2',
          key: 'DEMO-2',
          title: 'Dashboard UI Components',
          description: 'Create reusable dashboard components',
          status: 'Done',
          priority: 'High',
          assignee_id: 'user-3',
          assignee_name: 'Lisa Rodriguez',
          assignee_email: 'lisa@example.com',
          story_points: 5,
          issue_type: 'Story',
          created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          sprint_id: 'DEMO-SPRINT-1'
        },
        {
          id: 'issue-3',
          key: 'DEMO-3',
          title: 'API Integration Layer',
          description: 'Build API service layer for data fetching',
          status: 'In Progress',
          priority: 'High',
          assignee_id: 'user-2',
          assignee_name: 'Mike Chen',
          assignee_email: 'mike@example.com',
          story_points: 13,
          issue_type: 'Story',
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          sprint_id: 'DEMO-SPRINT-1'
        },
        {
          id: 'issue-4',
          key: 'DEMO-4',
          title: 'User Profile Management',
          description: 'Allow users to manage their profiles',
          status: 'In Progress',
          priority: 'Medium',
          assignee_id: 'user-1',
          assignee_name: 'Sarah Johnson',
          assignee_email: 'sarah@example.com',
          story_points: 5,
          issue_type: 'Story',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sprint_id: 'DEMO-SPRINT-1'
        },
        {
          id: 'issue-5',
          key: 'DEMO-5',
          title: 'Data Visualization Charts',
          description: 'Implement charts and graphs for analytics',
          status: 'To Do',
          priority: 'Medium',
          assignee_id: 'user-3',
          assignee_name: 'Lisa Rodriguez',
          assignee_email: 'lisa@example.com',
          story_points: 8,
          issue_type: 'Story',
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          sprint_id: 'DEMO-SPRINT-1'
        },
        {
          id: 'issue-6',
          key: 'DEMO-6',
          title: 'Mobile Responsiveness',
          description: 'Ensure application works on mobile devices',
          status: 'To Do',
          priority: 'Low',
          assignee_id: 'user-3',
          assignee_name: 'Lisa Rodriguez',
          assignee_email: 'lisa@example.com',
          story_points: 3,
          issue_type: 'Task',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          sprint_id: 'DEMO-SPRINT-1'
        },
        {
          id: 'issue-7',
          key: 'DEMO-7',
          title: 'Performance Optimization',
          description: 'Optimize application performance and loading times',
          status: 'Blocked',
          priority: 'Medium',
          assignee_id: 'user-2',
          assignee_name: 'Mike Chen',
          assignee_email: 'mike@example.com',
          story_points: 5,
          issue_type: 'Task',
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          sprint_id: 'DEMO-SPRINT-1'
        }
      ];

      // Store demo data
      this.storeSprint(demoSprint);
      this.storeTeamMembers(demoTeam);
      this.storeIssues(demoIssues);

      console.log('✅ Demo data initialized successfully');
      
      return {
        sprint: demoSprint,
        issues: demoIssues,
        team: demoTeam
      };
    } catch (error) {
      console.error('Error initializing demo data:', error);
      throw error;
    }
  }

  /**
   * Update issue status in Jira
   */
  async updateIssueStatus(issueKey, statusId) {
    try {
      await this.makeJiraRequest(`issue/${issueKey}/transitions`, {
        method: 'POST',
        body: JSON.stringify({
          transition: {
            id: statusId
          }
        })
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  }

  /**
   * Get available transitions for an issue
   */
  async getIssueTransitions(issueKey) {
    try {
      const response = await this.makeJiraRequest(`issue/${issueKey}/transitions`);
      return response.transitions.map(transition => ({
        id: transition.id,
        name: transition.name,
        to: {
          id: transition.to.id,
          name: transition.to.name
        }
      }));
    } catch (error) {
      console.error('Error fetching transitions:', error);
      throw error;
    }
  }
}

export default new JiraService();