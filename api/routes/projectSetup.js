import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import jiraService from '../services/jiraService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const db = new Database(path.join(__dirname, '../data/sprint_strategist.db'));

// Initialize project settings table
db.exec(`
  CREATE TABLE IF NOT EXISTS project_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'default',
    jira_url TEXT,
    jira_username TEXT,
    jira_api_token TEXT,
    project_key TEXT,
    board_id TEXT,
    sprint_length INTEGER DEFAULT 14,
    team_capacity INTEGER DEFAULT 40,
    working_hours_start TEXT DEFAULT '09:00',
    working_hours_end TEXT DEFAULT '17:00',
    timezone TEXT DEFAULT 'UTC',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get project settings
router.get('/', (req, res) => {
  try {
    const settings = db.prepare(`
      SELECT * FROM project_settings 
      WHERE user_id = 'default'
      ORDER BY created_at DESC
      LIMIT 1
    `).get();

    res.json({
      success: true,
      settings: settings || {}
    });
  } catch (error) {
    console.error('Error fetching project settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save project settings
router.post('/', (req, res) => {
  try {
    const {
      jiraUrl,
      jiraUsername,
      jiraApiToken,
      projectKey,
      boardId,
      sprintLength,
      teamCapacity,
      workingHoursStart,
      workingHoursEnd,
      timezone
    } = req.body;

    // Check if settings exist
    const existing = db.prepare(`
      SELECT id FROM project_settings WHERE user_id = 'default'
    `).get();

    if (existing) {
      // Update existing settings
      db.prepare(`
        UPDATE project_settings 
        SET jira_url = ?, jira_username = ?, jira_api_token = ?, 
            project_key = ?, board_id = ?, sprint_length = ?,
            team_capacity = ?, working_hours_start = ?, working_hours_end = ?,
            timezone = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = 'default'
      `).run(
        jiraUrl, jiraUsername, jiraApiToken, projectKey, boardId,
        sprintLength, teamCapacity, workingHoursStart, workingHoursEnd, timezone
      );
    } else {
      // Insert new settings
      db.prepare(`
        INSERT INTO project_settings 
        (jira_url, jira_username, jira_api_token, project_key, board_id,
         sprint_length, team_capacity, working_hours_start, working_hours_end, timezone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        jiraUrl, jiraUsername, jiraApiToken, projectKey, boardId,
        sprintLength, teamCapacity, workingHoursStart, workingHoursEnd, timezone
      );
    }

    res.json({
      success: true,
      message: 'Project settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving project settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync data from Jira
router.post('/sync', async (req, res) => {
  try {
    // Reload config to get latest settings
    jiraService.loadConfig();
    
    if (!jiraService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Jira not configured. Please configure connection first.'
      });
    }

    // Sync all data from Jira
    const syncResult = await jiraService.syncAllData();
    
    // Determine if we're using real Jira data or fallback data
    const isRealData = syncResult.sprint.id !== 'DEMO-SPRINT-1';
    
    res.json({
      success: true,
      message: isRealData 
        ? 'Data synced successfully from Jira'
        : 'Failed to sync from Jira, using cached data',
      dataSource: isRealData ? 'jira' : 'cached',
      data: {
        sprint: syncResult.sprint.name,
        issuesCount: syncResult.issues.length,
        teamCount: syncResult.team.length
      }
    });
  } catch (error) {
    console.error('Error syncing from Jira:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to sync from Jira: ${error.message}`,
      suggestion: 'You can:\n1. Check your Jira configuration\n2. Enable Demo Mode to test with sample data\n3. Try again later'
    });
  }
});

// Test Jira connection
router.post('/test-connection', async (req, res) => {
  try {
    const { jiraUrl, jiraUsername, jiraApiToken } = req.body;

    if (!jiraUrl || !jiraUsername || !jiraApiToken) {
      return res.json({
        success: false,
        error: 'Missing required fields: URL, username, and API token are required'
      });
    }

    // Create temporary auth headers
    const auth = Buffer.from(`${jiraUsername}:${jiraApiToken}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // Test connection by calling serverInfo endpoint
    const url = `${jiraUrl}/rest/api/3/serverInfo`;
    
    console.log(`Testing connection to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Jira API Error: ${response.status} - ${errorText}`);
      
      let errorMessage = `HTTP ${response.status}`;
      let suggestion = '';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.errorMessage || errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      // Provide helpful suggestions based on error type
      if (response.status === 404) {
        suggestion = 'The Jira instance URL appears to be incorrect or the instance doesn\'t exist. You can:\n\n1. Create a new free Jira instance at https://www.atlassian.com/software/jira/free\n2. Verify the correct URL for your existing instance\n3. Use "Simulation Mode (Demo)" below to test the application with sample data';
      } else if (response.status === 401 || response.status === 403) {
        suggestion = 'Authentication failed. Please check:\n\n1. Your email address is correct\n2. Your API token is valid and hasn\'t expired\n3. You have access to the Jira instance\n4. Or use "Simulation Mode (Demo)" to test with sample data';
      }
      
      return res.json({
        success: false,
        error: `Connection failed: ${errorMessage}`,
        suggestion: suggestion
      });
    }

    const serverInfo = await response.json();
    
    res.json({
      success: true,
      message: 'Connection successful',
      serverInfo: {
        version: serverInfo.version,
        serverTitle: serverInfo.serverTitle,
        baseUrl: serverInfo.baseUrl
      }
    });
  } catch (error) {
    console.error('Error testing Jira connection:', error);
    
    let suggestion = '';
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      suggestion = 'Cannot reach the Jira server. You can:\n\n1. Check your internet connection\n2. Verify the Jira URL is correct\n3. Create a new Jira instance if needed\n4. Use "Simulation Mode (Demo)" to test with sample data';
    } else {
      suggestion = 'Connection failed. You can:\n\n1. Check your Jira credentials\n2. Verify the instance URL\n3. Use "Simulation Mode (Demo)" to test the application';
    }
    
    res.json({ 
      success: false, 
      error: `Connection failed: ${error.message}`,
      suggestion: suggestion
    });
  }
});

// Get available projects
router.get('/projects', async (req, res) => {
  try {
    // Reload config to get latest settings
    jiraService.loadConfig();
    
    if (!jiraService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Jira not configured. Please save connection settings first.'
      });
    }

    const projects = await jiraService.getProjects();
    
    res.json({
      success: true,
      projects: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available boards for a project
router.get('/projects/:projectKey/boards', async (req, res) => {
  try {
    const { projectKey } = req.params;

    // Reload config to get latest settings
    jiraService.loadConfig();
    
    if (!jiraService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Jira not configured. Please save connection settings first.'
      });
    }

    const boards = await jiraService.getProjectBoards(projectKey);

    res.json({
      success: true,
      boards: boards
    });
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enable Demo Mode
router.post('/enable-demo', async (req, res) => {
  try {
    // Save demo mode settings
    const demoSettings = {
      jiraUrl: 'https://demo.atlassian.net',
      jiraUsername: 'demo@example.com',
      jiraApiToken: 'demo-token',
      projectKey: 'DEMO',
      boardId: '1',
      sprintLength: 14,
      teamCapacity: 40,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      timezone: 'UTC',
      demoMode: true
    };

    // Check if settings exist
    const existing = db.prepare(`
      SELECT id FROM project_settings WHERE user_id = 'default'
    `).get();

    if (existing) {
      // Update existing settings
      db.prepare(`
        UPDATE project_settings 
        SET jira_url = ?, jira_username = ?, jira_api_token = ?, 
            project_key = ?, board_id = ?, sprint_length = ?,
            team_capacity = ?, working_hours_start = ?, working_hours_end = ?,
            timezone = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = 'default'
      `).run(
        demoSettings.jiraUrl, demoSettings.jiraUsername, demoSettings.jiraApiToken, 
        demoSettings.projectKey, demoSettings.boardId, demoSettings.sprintLength,
        demoSettings.teamCapacity, demoSettings.workingHoursStart, 
        demoSettings.workingHoursEnd, demoSettings.timezone
      );
    } else {
      // Insert new settings
      db.prepare(`
        INSERT INTO project_settings 
        (jira_url, jira_username, jira_api_token, project_key, board_id,
         sprint_length, team_capacity, working_hours_start, working_hours_end, timezone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        demoSettings.jiraUrl, demoSettings.jiraUsername, demoSettings.jiraApiToken, 
        demoSettings.projectKey, demoSettings.boardId, demoSettings.sprintLength,
        demoSettings.teamCapacity, demoSettings.workingHoursStart, 
        demoSettings.workingHoursEnd, demoSettings.timezone
      );
    }

    res.json({
      success: true,
      message: 'Demo mode enabled successfully! The application will now use sample data.',
      demoMode: true
    });
  } catch (error) {
    console.error('Error enabling demo mode:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;