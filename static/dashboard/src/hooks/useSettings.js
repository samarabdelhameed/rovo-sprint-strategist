/**
 * ⚙️ useSettings Hook
 * Custom hook for managing user settings
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const DEFAULT_SETTINGS = {
    notifications_enabled: true,
    email_alerts: true,
    slack_alerts: false,
    alert_threshold: 60,
    theme: 'dark',
    language: 'en'
};

export function useSettings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            setError(null);
            const response = await api.getSettings();

            if (response.success && response.data) {
                setSettings(prev => ({ ...prev, ...response.data }));
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSetting = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
    }, []);

    const saveSettings = useCallback(async () => {
        try {
            setSaving(true);
            setError(null);
            const response = await api.updateSettings(settings);

            if (response.success) {
                setIsDirty(false);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to save settings:', err);
            setError(err.message);
            return false;
        } finally {
            setSaving(false);
        }
    }, [settings]);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        setIsDirty(true);
    }, []);

    return {
        settings,
        loading,
        saving,
        error,
        isDirty,
        updateSetting,
        saveSettings,
        resetSettings,
        refresh: fetchSettings
    };
}

export default useSettings;
