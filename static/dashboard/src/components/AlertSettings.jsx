import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Mail,
  MessageCircle,
  Users,
  Save,
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  Ban,
  Activity,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import { apiRequest, API_ENDPOINTS } from '../config/api';

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

  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
    try {
      const result = await apiRequest(API_ENDPOINTS.alertSettings, {
        method: 'POST',
        body: JSON.stringify({
          settings,
          integrations: {
            slack: slackConfig,
            teams: teamsConfig
          }
        })
      });

      if (result.success) {
        // Success feedback
      }
    } catch (error) {
      console.error('Error saving alert settings:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  const testAlert = async (alertType) => {
    try {
      const result = await apiRequest(API_ENDPOINTS.testAlert, {
        method: 'POST',
        body: JSON.stringify({ alertType, settings: settings[alertType] })
      });

      if (result.success) {
        alert('Test alert sent!');
      }
    } catch (error) {
      console.error('Error testing alert:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold gradient-text">Alert Settings</h2>
          <p className="text-text-muted mt-2">Customize alerts to get instant notifications when sprint issues occur</p>
        </div>
        <motion.button
          className="btn-glow flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sprint Risk Alert */}
        <motion.div variants={itemVariants} className="glass-card p-6 border-l-4 border-l-danger">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-danger/10 rounded-xl text-danger">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Sprint Risk Alert</h3>
                <p className="text-text-muted text-sm">Health score drops below threshold</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.sprintRisk.enabled}
                onChange={(e) => handleSettingChange('sprintRisk', 'enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className={`space-y-6 ${!settings.sprintRisk.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">Risk Threshold: {settings.sprintRisk.threshold}%</label>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={settings.sprintRisk.threshold}
                onChange={(e) => handleSettingChange('sprintRisk', 'threshold', parseInt(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary">Notification Channels</label>
              <div className="flex flex-wrap gap-2">
                {['email', 'slack', 'teams'].map(channel => (
                  <button
                    key={channel}
                    onClick={() => handleChannelToggle('sprintRisk', channel)}
                    className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all border ${settings.sprintRisk.channels.includes(channel)
                      ? 'bg-accent/10 border-accent/50 text-accent font-semibold'
                      : 'bg-dark-700 border-dark-600 text-text-muted hover:border-accent/30'
                      }`}
                  >
                    {channel === 'email' && <Mail className="w-4 h-4" />}
                    {channel === 'slack' && <MessageCircle className="w-4 h-4" />}
                    {channel === 'teams' && <Users className="w-4 h-4" />}
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="w-full btn-secondary text-sm py-2"
              onClick={() => testAlert('sprintRisk')}
            >
              Send Test Notification
            </button>
          </div>
        </motion.div>

        {/* Velocity Drop Alert */}
        <motion.div variants={itemVariants} className="glass-card p-6 border-l-4 border-l-warning">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-xl text-warning">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Velocity Drop</h3>
                <p className="text-text-muted text-sm">Large drop in team velocity</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.velocityDrop.enabled}
                onChange={(e) => handleSettingChange('velocityDrop', 'enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className={`space-y-6 ${!settings.velocityDrop.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">Drop Percentage: {settings.velocityDrop.threshold}%</label>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={settings.velocityDrop.threshold}
                onChange={(e) => handleSettingChange('velocityDrop', 'threshold', parseInt(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary">Notification Channels</label>
              <div className="flex flex-wrap gap-2">
                {['email', 'slack', 'teams'].map(channel => (
                  <button
                    key={channel}
                    onClick={() => handleChannelToggle('velocityDrop', channel)}
                    className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all border ${settings.velocityDrop.channels.includes(channel)
                      ? 'bg-accent/10 border-accent/50 text-accent font-semibold'
                      : 'bg-dark-700 border-dark-600 text-text-muted hover:border-accent/30'
                      }`}
                  >
                    {channel === 'email' && <Mail className="w-4 h-4" />}
                    {channel === 'slack' && <MessageCircle className="w-4 h-4" />}
                    {channel === 'teams' && <Users className="w-4 h-4" />}
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="w-full btn-secondary text-sm py-2"
              onClick={() => testAlert('velocityDrop')}
            >
              Send Test Notification
            </button>
          </div>
        </motion.div>

        {/* Blocked Tasks Alert */}
        <motion.div variants={itemVariants} className="glass-card p-6 border-l-4 border-l-info">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/10 rounded-xl text-info">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Blocked Items</h3>
                <p className="text-text-muted text-sm">Unresolved blockers notification</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.blockedTasks.enabled}
                onChange={(e) => handleSettingChange('blockedTasks', 'enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className={`space-y-6 ${!settings.blockedTasks.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">Min Blocked Tasks: {settings.blockedTasks.threshold}</label>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.blockedTasks.threshold}
                onChange={(e) => handleSettingChange('blockedTasks', 'threshold', parseInt(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary">Notification Channels</label>
              <div className="flex flex-wrap gap-2">
                {['email', 'slack', 'teams'].map(channel => (
                  <button
                    key={channel}
                    onClick={() => handleChannelToggle('blockedTasks', channel)}
                    className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all border ${settings.blockedTasks.channels.includes(channel)
                      ? 'bg-accent/10 border-accent/50 text-accent font-semibold'
                      : 'bg-dark-700 border-dark-600 text-text-muted hover:border-accent/30'
                      }`}
                  >
                    {channel === 'email' && <Mail className="w-4 h-4" />}
                    {channel === 'slack' && <MessageCircle className="w-4 h-4" />}
                    {channel === 'teams' && <Users className="w-4 h-4" />}
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="w-full btn-secondary text-sm py-2"
              onClick={() => testAlert('blockedTasks')}
            >
              Send Test Notification
            </button>
          </div>
        </motion.div>

        {/* Burndown Progress */}
        <motion.div variants={itemVariants} className="glass-card p-6 border-l-4 border-l-accent">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-xl text-accent">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Sprint Delay</h3>
                <p className="text-text-muted text-sm">Burndown deviations alert</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.burndownAlert.enabled}
                onChange={(e) => handleSettingChange('burndownAlert', 'enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className={`space-y-6 ${!settings.burndownAlert.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">Delay Percentage: {settings.burndownAlert.threshold}%</label>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={settings.burndownAlert.threshold}
                onChange={(e) => handleSettingChange('burndownAlert', 'threshold', parseInt(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary">Notification Channels</label>
              <div className="flex flex-wrap gap-2">
                {['email', 'slack', 'teams'].map(channel => (
                  <button
                    key={channel}
                    onClick={() => handleChannelToggle('burndownAlert', channel)}
                    className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all border ${settings.burndownAlert.channels.includes(channel)
                      ? 'bg-accent/10 border-accent/50 text-accent font-semibold'
                      : 'bg-dark-700 border-dark-600 text-text-muted hover:border-accent/30'
                      }`}
                  >
                    {channel === 'email' && <Mail className="w-4 h-4" />}
                    {channel === 'slack' && <MessageCircle className="w-4 h-4" />}
                    {channel === 'teams' && <Users className="w-4 h-4" />}
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="w-full btn-secondary text-sm py-2"
              onClick={() => testAlert('burndownAlert')}
            >
              Send Test Notification
            </button>
          </div>
        </motion.div>
      </div>

      {/* Integrations */}
      <motion.div variants={itemVariants} className="glass-card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-accent/20 rounded-xl text-accent">
            <LinkIcon className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-display font-bold">Integration Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-6 h-6 text-[#4A154B]" />
              <h4 className="font-semibold text-lg">Slack Integration</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-2 font-medium">Webhook URL</label>
                <input
                  type="password"
                  value={slackConfig.webhook}
                  onChange={(e) => setSlackConfig(prev => ({ ...prev, webhook: e.target.value }))}
                  placeholder="https://hooks.slack.com/services/..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2 font-medium">Channel Name</label>
                <input
                  type="text"
                  value={slackConfig.channel}
                  onChange={(e) => setSlackConfig(prev => ({ ...prev, channel: e.target.value }))}
                  placeholder="#sprint-alerts"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-[#6264A7]" />
              <h4 className="font-semibold text-lg">MS Teams Integration</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-2 font-medium">Webhook URL</label>
                <input
                  type="password"
                  value={teamsConfig.webhook}
                  onChange={(e) => setTeamsConfig(prev => ({ ...prev, webhook: e.target.value }))}
                  placeholder="https://outlook.office.com/webhook/..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2 font-medium">Channel Name</label>
                <input
                  type="text"
                  value={teamsConfig.channel}
                  onChange={(e) => setTeamsConfig(prev => ({ ...prev, channel: e.target.value }))}
                  placeholder="Sprint Updates"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-center pt-4">
        <motion.button
          className="btn-glow px-12 py-4 text-lg flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
          {isSaving ? 'Processing...' : 'Save Configuration'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AlertSettings;