import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const db = new Database(path.join(__dirname, '../data/sprint_strategist.db'));

// Initialize alert settings table
db.exec(`
  CREATE TABLE IF NOT EXISTS alert_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'default',
    alert_type TEXT NOT NULL,
    enabled BOOLEAN DEFAULT 1,
    threshold INTEGER,
    channels TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS integration_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'default',
    integration_type TEXT NOT NULL,
    webhook_url TEXT,
    channel_name TEXT,
    config TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get alert settings
router.get('/', (req, res) => {
  try {
    const settings = db.prepare(`
      SELECT * FROM alert_settings 
      WHERE user_id = ?
    `).all('default');

    const integrations = db.prepare(`
      SELECT * FROM integration_settings 
      WHERE user_id = ?
    `).all('default');

    res.json({
      success: true,
      settings: settings.reduce((acc, setting) => {
        acc[setting.alert_type] = {
          enabled: Boolean(setting.enabled),
          threshold: setting.threshold,
          channels: JSON.parse(setting.channels || '[]')
        };
        return acc;
      }, {}),
      integrations: integrations.reduce((acc, integration) => {
        acc[integration.integration_type] = {
          webhook: integration.webhook_url,
          channel: integration.channel_name,
          config: JSON.parse(integration.config || '{}')
        };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching alert settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save alert settings
router.post('/', (req, res) => {
  try {
    const { settings, integrations } = req.body;

    // Save alert settings
    const insertSetting = db.prepare(`
      INSERT OR REPLACE INTO alert_settings 
      (user_id, alert_type, enabled, threshold, channels, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const deleteExisting = db.prepare(`
      DELETE FROM alert_settings WHERE user_id = ?
    `);

    deleteExisting.run('default');

    for (const [alertType, config] of Object.entries(settings)) {
      insertSetting.run(
        'default',
        alertType,
        config.enabled ? 1 : 0,
        config.threshold,
        JSON.stringify(config.channels)
      );
    }

    // Save integration settings
    const insertIntegration = db.prepare(`
      INSERT OR REPLACE INTO integration_settings 
      (user_id, integration_type, webhook_url, channel_name, config, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const deleteIntegrations = db.prepare(`
      DELETE FROM integration_settings WHERE user_id = ?
    `);

    deleteIntegrations.run('default');

    for (const [integrationType, config] of Object.entries(integrations)) {
      insertIntegration.run(
        'default',
        integrationType,
        config.webhook,
        config.channel,
        JSON.stringify(config)
      );
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving alert settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test alert
router.post('/test', async (req, res) => {
  try {
    const { alertType, settings } = req.body;

    // Get integration settings
    const integrations = db.prepare(`
      SELECT * FROM integration_settings 
      WHERE user_id = ?
    `).all('default');

    const testMessage = {
      sprintRisk: '🚨 تنبيه تجريبي: مخاطر السبرينت مرتفعة (85%)',
      velocityDrop: '📉 تنبيه تجريبي: انخفاض في سرعة الفريق (25%)',
      blockedTasks: '🚫 تنبيه تجريبي: 5 مهام محجوبة تحتاج تدخل',
      burndownAlert: '📊 تنبيه تجريبي: السبرينت متأخر عن الجدول (80%)'
    };

    const message = testMessage[alertType] || 'تنبيه تجريبي من Sprint Strategist';

    // Send to configured channels
    const promises = [];

    if (settings.channels.includes('slack')) {
      const slackIntegration = integrations.find(i => i.integration_type === 'slack');
      if (slackIntegration && slackIntegration.webhook_url) {
        promises.push(sendSlackMessage(slackIntegration.webhook_url, message));
      }
    }

    if (settings.channels.includes('teams')) {
      const teamsIntegration = integrations.find(i => i.integration_type === 'teams');
      if (teamsIntegration && teamsIntegration.webhook_url) {
        promises.push(sendTeamsMessage(teamsIntegration.webhook_url, message));
      }
    }

    if (settings.channels.includes('email')) {
      // Email notification would go here
      console.log('Email notification:', message);
    }

    await Promise.all(promises);

    res.json({ success: true, message: 'Test alert sent successfully' });
  } catch (error) {
    console.error('Error sending test alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions for sending notifications
async function sendSlackMessage(webhookUrl, message) {
  try {
    const fetch = (await import('node-fetch')).default;
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        username: 'Sprint Strategist',
        icon_emoji: ':racing_car:'
      })
    });
  } catch (error) {
    console.error('Error sending Slack message:', error);
  }
}

async function sendTeamsMessage(webhookUrl, message) {
  try {
    const fetch = (await import('node-fetch')).default;
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        title: 'Sprint Strategist Alert'
      })
    });
  } catch (error) {
    console.error('Error sending Teams message:', error);
  }
}

export default router;