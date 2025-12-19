import React, { useState, useEffect } from 'react';
import './AlertSettings.css';

const AlertSettings = () => {
  const [settings, setSettings] = useState({
    sprintRisk: {
      enabled: true,
      threshold: 70,
      channels: ['email', 'slack']
    },
    velocityDrop: {
      enabled: true,
      threshold: 20,
      channels: ['email']
    },
    blockedTasks: {
      enabled: true,
      threshold: 3,
      channels: ['slack', 'teams']
    },
    burndownAlert: {
      enabled: true,
      threshold: 80,
      channels: ['email', 'slack']
    }
  });

  const [slackConfig, setSlackConfig] = useState({
    webhook: '',
    channel: '#sprint-alerts'
  });

  const [teamsConfig, setTeamsConfig] = useState({
    webhook: '',
    channel: 'Sprint Updates'
  });

  const handleSettingChange = (alertType, field, value) => {
    setSettings(prev => ({
      ...prev,
      [alertType]: {
        ...prev[alertType],
        [field]: value
      }
    }));
  };

  const handleChannelToggle = (alertType, channel) => {
    setSettings(prev => {
      const currentChannels = prev[alertType].channels;
      const newChannels = currentChannels.includes(channel)
        ? currentChannels.filter(c => c !== channel)
        : [...currentChannels, channel];
      
      return {
        ...prev,
        [alertType]: {
          ...prev[alertType],
          channels: newChannels
        }
      };
    });
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/alert-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          settings,
          integrations: {
            slack: slackConfig,
            teams: teamsConfig
          }
        })
      });

      if (response.ok) {
        alert('Alert settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving alert settings:', error);
      alert('Error saving settings');
    }
  };

  const testAlert = async (alertType) => {
    try {
      const response = await fetch('/api/test-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alertType, settings: settings[alertType] })
      });

      if (response.ok) {
        alert('Test alert sent!');
      }
    } catch (error) {
      console.error('Error testing alert:', error);
    }
  };

  return (
    <div className="alert-settings">
      <div className="settings-header">
        <h2>⚠️ Alert Settings</h2>
        <p>Customize alerts to get instant notifications when sprint issues occur</p>
      </div>

      <div className="settings-grid">
        {/* Sprint Risk Alert */}
        <div className="alert-card">
          <div className="alert-header">
            <h3>🚨 Sprint Risk Alert</h3>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.sprintRisk.enabled}
                onChange={(e) => handleSettingChange('sprintRisk', 'enabled', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="alert-config">
            <div className="threshold-setting">
              <label>Alert Threshold: {settings.sprintRisk.threshold}%</label>
              <input
                type="range"
                min="50"
                max="90"
                value={settings.sprintRisk.threshold}
                onChange={(e) => handleSettingChange('sprintRisk', 'threshold', parseInt(e.target.value))}
              />
            </div>
            
            <div className="channels">
              <label>Alert Channels:</label>
              <div className="channel-options">
                {['email', 'slack', 'teams'].map(channel => (
                  <label key={channel} className="channel-option">
                    <input
                      type="checkbox"
                      checked={settings.sprintRisk.channels.includes(channel)}
                      onChange={() => handleChannelToggle('sprintRisk', channel)}
                    />
                    {channel === 'email' ? '📧 Email' : 
                     channel === 'slack' ? '💬 Slack' : '👥 Teams'}
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              className="test-btn"
              onClick={() => testAlert('sprintRisk')}
            >
              Test Alert
            </button>
          </div>
        </div>

        {/* Velocity Drop Alert */}
        <div className="alert-card">
          <div className="alert-header">
            <h3>📉 Velocity Drop Alert</h3>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.velocityDrop.enabled}
                onChange={(e) => handleSettingChange('velocityDrop', 'enabled', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="alert-config">
            <div className="threshold-setting">
              <label>Drop Percentage: {settings.velocityDrop.threshold}%</label>
              <input
                type="range"
                min="10"
                max="50"
                value={settings.velocityDrop.threshold}
                onChange={(e) => handleSettingChange('velocityDrop', 'threshold', parseInt(e.target.value))}
              />
            </div>
            
            <div className="channels">
              <label>Alert Channels:</label>
              <div className="channel-options">
                {['email', 'slack', 'teams'].map(channel => (
                  <label key={channel} className="channel-option">
                    <input
                      type="checkbox"
                      checked={settings.velocityDrop.channels.includes(channel)}
                      onChange={() => handleChannelToggle('velocityDrop', channel)}
                    />
                    {channel === 'email' ? '📧 Email' : 
                     channel === 'slack' ? '💬 Slack' : '👥 Teams'}
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              className="test-btn"
              onClick={() => testAlert('velocityDrop')}
            >
              Test Alert
            </button>
          </div>
        </div>

        {/* Blocked Tasks Alert */}
        <div className="alert-card">
          <div className="alert-header">
            <h3>🚫 Blocked Tasks Alert</h3>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.blockedTasks.enabled}
                onChange={(e) => handleSettingChange('blockedTasks', 'enabled', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="alert-config">
            <div className="threshold-setting">
              <label>Blocked Tasks Count: {settings.blockedTasks.threshold}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.blockedTasks.threshold}
                onChange={(e) => handleSettingChange('blockedTasks', 'threshold', parseInt(e.target.value))}
              />
            </div>
            
            <div className="channels">
              <label>Alert Channels:</label>
              <div className="channel-options">
                {['email', 'slack', 'teams'].map(channel => (
                  <label key={channel} className="channel-option">
                    <input
                      type="checkbox"
                      checked={settings.blockedTasks.channels.includes(channel)}
                      onChange={() => handleChannelToggle('blockedTasks', channel)}
                    />
                    {channel === 'email' ? '📧 Email' : 
                     channel === 'slack' ? '💬 Slack' : '👥 Teams'}
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              className="test-btn"
              onClick={() => testAlert('blockedTasks')}
            >
              Test Alert
            </button>
          </div>
        </div>

        {/* Burndown Alert */}
        <div className="alert-card">
          <div className="alert-header">
            <h3>📊 Burndown Alert</h3>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.burndownAlert.enabled}
                onChange={(e) => handleSettingChange('burndownAlert', 'enabled', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="alert-config">
            <div className="threshold-setting">
              <label>Delay Percentage: {settings.burndownAlert.threshold}%</label>
              <input
                type="range"
                min="60"
                max="95"
                value={settings.burndownAlert.threshold}
                onChange={(e) => handleSettingChange('burndownAlert', 'threshold', parseInt(e.target.value))}
              />
            </div>
            
            <div className="channels">
              <label>Alert Channels:</label>
              <div className="channel-options">
                {['email', 'slack', 'teams'].map(channel => (
                  <label key={channel} className="channel-option">
                    <input
                      type="checkbox"
                      checked={settings.burndownAlert.channels.includes(channel)}
                      onChange={() => handleChannelToggle('burndownAlert', channel)}
                    />
                    {channel === 'email' ? '📧 Email' : 
                     channel === 'slack' ? '💬 Slack' : '👥 Teams'}
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              className="test-btn"
              onClick={() => testAlert('burndownAlert')}
            >
              Test Alert
            </button>
          </div>
        </div>
      </div>

      {/* Integration Settings */}
      <div className="integration-settings">
        <h3>🔗 Integration Settings</h3>
        
        <div className="integration-grid">
          <div className="integration-card">
            <h4>💬 Slack Integration</h4>
            <div className="form-group">
              <label>Webhook URL:</label>
              <input
                type="url"
                value={slackConfig.webhook}
                onChange={(e) => setSlackConfig(prev => ({...prev, webhook: e.target.value}))}
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div className="form-group">
              <label>Channel:</label>
              <input
                type="text"
                value={slackConfig.channel}
                onChange={(e) => setSlackConfig(prev => ({...prev, channel: e.target.value}))}
                placeholder="#sprint-alerts"
              />
            </div>
          </div>

          <div className="integration-card">
            <h4>👥 Teams Integration</h4>
            <div className="form-group">
              <label>Webhook URL:</label>
              <input
                type="url"
                value={teamsConfig.webhook}
                onChange={(e) => setTeamsConfig(prev => ({...prev, webhook: e.target.value}))}
                placeholder="https://outlook.office.com/webhook/..."
              />
            </div>
            <div className="form-group">
              <label>Channel:</label>
              <input
                type="text"
                value={teamsConfig.channel}
                onChange={(e) => setTeamsConfig(prev => ({...prev, channel: e.target.value}))}
                placeholder="Sprint Updates"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-btn" onClick={saveSettings}>
          💾 Save Settings
        </button>
        <button className="reset-btn" onClick={() => window.location.reload()}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default AlertSettings;